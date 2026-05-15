(function () {
  var CONCIERGE_URL = "/.netlify/functions/visitor-concierge";
  var FALLBACK =
    "The live concierge is having trouble loading right now. You can still use the popular moves below or send a request for help.";

  var root = document.getElementById("live-concierge");
  if (!root) return;

  var logEl = document.getElementById("live-concierge-log");
  var form = document.getElementById("live-concierge-form");
  var input = document.getElementById("live-concierge-input");
  var sendBtn = document.getElementById("live-concierge-send");
  var statusEl = document.getElementById("live-concierge-status");
  var errorBanner = document.getElementById("live-concierge-error");
  var chips = root.querySelectorAll("[data-concierge-chip]");
  var transcriptEl = document.getElementById("live-concierge-transcript");
  var threadEl = document.getElementById("live-concierge-thread");
  var conversationEl = document.getElementById("live-concierge-conversation");
  var composerStackEl = document.getElementById("live-concierge-composer");
  var composerKickerEl = document.getElementById("live-concierge-composer-kicker");
  var starterEl = document.getElementById("live-concierge-starter");

  var previousResponseId = null;
  var busy = false;

  function syncTranscriptVisibility() {
    if (!logEl) return;
    var has = logEl.childElementCount > 0;
    if (transcriptEl) {
      transcriptEl.hidden = !has;
    }
    if (conversationEl) {
      conversationEl.classList.toggle("live-concierge__conversation--started", has);
    }
    if (starterEl) {
      starterEl.hidden = true;
    }
    if (composerKickerEl) {
      composerKickerEl.hidden = true;
    }
  }

  function setStatus(text, live) {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.classList.toggle("live-concierge__status--live", !!live);
  }

  function showError(show) {
    if (!errorBanner) return;
    errorBanner.hidden = !show;
    errorBanner.textContent = show ? FALLBACK : "";
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  var SECTION_LABELS =
    /^(Quick read|Best for|Timing|Cost(?:\s*\/\s*parking)?|Parking|Willie Approved|Local Pick|Research Pick|Needs Visit|Pair it with|Next move|Go \/ skip|Hours|Transportation)\s*:\s*(.*)$/i;

  function inlineFormat(text) {
    return escapeHtml(text).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  }

  function formatAssistantHtml(raw) {
    var lines = String(raw)
      .trim()
      .split(/\r?\n/)
      .map(function (line) {
        return line.trim();
      })
      .filter(function (line, idx, arr) {
        return line.length || (idx > 0 && arr[idx - 1].length);
      });

    if (!lines.length) {
      return '<div class="live-concierge__rich"><p class="live-concierge__rich-lead"></p></div>';
    }

    var blocks = [];
    var lead = [];
    var listItems = null;
    var current = null;

    function flushList() {
      if (!listItems || !listItems.length) return;
      var listHtml =
        '<ul class="live-concierge__rich-list">' +
        listItems
          .map(function (item) {
            return "<li>" + inlineFormat(item) + "</li>";
          })
          .join("") +
        "</ul>";
      if (current) {
        current.body = (current.body ? current.body + listHtml : listHtml);
      } else {
        lead.push(listHtml);
      }
      listItems = null;
    }

    function flushCurrent() {
      flushList();
      if (!current) return;
      blocks.push(current);
      current = null;
    }

    lines.forEach(function (line) {
      var bullet = line.match(/^[-•*]\s+(.+)$/);
      if (bullet) {
        if (!listItems) listItems = [];
        listItems.push(bullet[1]);
        return;
      }

      flushList();
      var section = line.match(SECTION_LABELS);
      if (section) {
        flushCurrent();
        current = {
          label: section[1].replace(/\s*\/\s*/g, " / "),
          body: inlineFormat(section[2] || ""),
        };
        return;
      }

      if (current) {
        current.body += (current.body ? "<br>" : "") + inlineFormat(line);
        return;
      }

      if (!blocks.length) {
        lead.push(inlineFormat(line));
      } else {
        var last = blocks[blocks.length - 1];
        last.body += (last.body ? "<br>" : "") + inlineFormat(line);
      }
    });

    flushCurrent();
    flushList();

    var html = "";
    if (lead.length) {
      html += '<p class="live-concierge__rich-lead">' + lead.join("<br>") + "</p>";
    }

    blocks.forEach(function (block) {
      html +=
        '<div class="live-concierge__rich-block">' +
        '<span class="live-concierge__rich-label">' +
        escapeHtml(block.label) +
        "</span>" +
        '<p class="live-concierge__rich-body">' +
        block.body +
        "</p>" +
        "</div>";
    });

    if (!html) {
      html = '<p class="live-concierge__rich-lead">' + inlineFormat(String(raw).trim()) + "</p>";
    }

    return '<div class="live-concierge__rich">' + html + "</div>";
  }

  function nudgeConversationIntoView() {
    var target = composerStackEl || threadEl;
    if (!target || typeof target.scrollIntoView !== "function") return;
    try {
      target.scrollIntoView({ block: "nearest", behavior: "smooth" });
    } catch (e) {
      target.scrollIntoView(false);
    }
  }

  function appendBubble(role, text) {
    if (!logEl) return;
    var wrap = document.createElement("div");
    wrap.className = "live-concierge__msg live-concierge__msg--" + role;
    var inner = document.createElement("div");
    inner.className = "live-concierge__bubble";
    if (role === "assistant") {
      inner.classList.add("live-concierge__bubble--rich");
      inner.innerHTML = formatAssistantHtml(text);
    } else {
      inner.textContent = text;
    }
    wrap.appendChild(inner);
    logEl.appendChild(wrap);
    logEl.scrollTop = logEl.scrollHeight;
    syncTranscriptVisibility();
    nudgeConversationIntoView();
  }

  function removeThinking() {
    var t = logEl && logEl.querySelector(".live-concierge__thinking");
    if (t) t.remove();
    syncTranscriptVisibility();
  }

  function addThinking() {
    if (!logEl) return;
    var wrap = document.createElement("div");
    wrap.className = "live-concierge__msg live-concierge__msg--assistant live-concierge__thinking";
    var inner = document.createElement("div");
    inner.className = "live-concierge__bubble live-concierge__bubble--thinking";
    inner.setAttribute("role", "status");
    inner.setAttribute("aria-live", "polite");
    inner.textContent = "Thinking…";
    wrap.appendChild(inner);
    logEl.appendChild(wrap);
    logEl.scrollTop = logEl.scrollHeight;
    syncTranscriptVisibility();
    nudgeConversationIntoView();
  }

  function sendMessage(text) {
    var trimmed = (text || "").trim();
    if (!trimmed || busy) return;

    busy = true;
    showError(false);
    setStatus("Connecting…", false);
    if (sendBtn) sendBtn.disabled = true;
    if (input) input.disabled = true;

    appendBubble("user", trimmed);
    addThinking();

    var payload = {
      message: trimmed,
      previous_response_id: previousResponseId,
    };

    fetch(CONCIERGE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, status: res.status, data: data };
        });
      })
      .then(function (result) {
        removeThinking();
        if (!result.ok || !result.data || typeof result.data.reply !== "string" || !result.data.reply.trim()) {
          appendBubble("assistant", FALLBACK);
          showError(true);
          setStatus("Reconnecting soon", false);
          return;
        }
        previousResponseId =
          typeof result.data.previous_response_id === "string"
            ? result.data.previous_response_id
            : previousResponseId;
        appendBubble("assistant", result.data.reply.trim());
        setStatus("Live · ready", true);
      })
      .catch(function () {
        removeThinking();
        appendBubble("assistant", FALLBACK);
        showError(true);
        setStatus("Offline", false);
      })
      .finally(function () {
        busy = false;
        if (sendBtn) sendBtn.disabled = false;
        if (input) {
          input.disabled = false;
          input.focus();
        }
        nudgeConversationIntoView();
      });
  }

  if (form && input) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      sendMessage(input.value);
      input.value = "";
    });
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var t = chip.getAttribute("data-chip-text") || chip.textContent || "";
      sendMessage(t);
      if (input) input.value = "";
    });
  });

  setStatus("Live · ready", true);
  syncTranscriptVisibility();
})();
