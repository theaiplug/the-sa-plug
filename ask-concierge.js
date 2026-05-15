(function () {
  var CONCIERGE_URL = "/.netlify/functions/visitor-concierge";
  var FALLBACK =
    "The live concierge is having trouble loading right now. You can still use the route cards below or send a request for help.";

  var root = document.getElementById("live-concierge");
  if (!root) return;

  var logEl = document.getElementById("live-concierge-log");
  var form = document.getElementById("live-concierge-form");
  var input = document.getElementById("live-concierge-input");
  var sendBtn = document.getElementById("live-concierge-send");
  var statusEl = document.getElementById("live-concierge-status");
  var errorBanner = document.getElementById("live-concierge-error");
  var chips = root.querySelectorAll("[data-concierge-chip]");
  var threadEl = document.getElementById("live-concierge-thread");

  var previousResponseId = null;
  var busy = false;

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

  function formatAssistantHtml(raw) {
    var esc = escapeHtml(String(raw).trim());
    esc = esc.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    var paras = esc.split(/\n\n+/);
    var html = paras
      .filter(function (p) {
        return p.length;
      })
      .map(function (p) {
        return "<p>" + p.replace(/\n/g, "<br>") + "</p>";
      })
      .join("");
    return '<div class="live-concierge__rich">' + (html || "<p></p>") + "</div>";
  }

  function nudgeThreadIntoView() {
    if (!threadEl || typeof threadEl.scrollIntoView !== "function") return;
    try {
      threadEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
    } catch (e) {
      threadEl.scrollIntoView(false);
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
    nudgeThreadIntoView();
  }

  function removeThinking() {
    var t = logEl && logEl.querySelector(".live-concierge__thinking");
    if (t) t.remove();
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
    nudgeThreadIntoView();
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
        nudgeThreadIntoView();
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
})();
