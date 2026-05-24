(function () {
  var OP_URL = "/.netlify/functions/transportation-operator";
  var REQ_URL = "/.netlify/functions/transportation-request";
  var FALLBACK =
    "Route help is having trouble loading right now. Try again in a moment, or use Uber, Lyft, hotel transportation, a taxi, or another licensed option if timing is tight.";

  var root = document.getElementById("transport-route-operator");
  if (!root) return;

  var logEl = document.getElementById("transport-route-log");
  var form = document.getElementById("transport-route-form");
  var input = document.getElementById("transport-route-input");
  var sendBtn = document.getElementById("transport-route-send");
  var statusEl = document.getElementById("transport-route-status");
  var errorBanner = document.getElementById("transport-route-error");
  var chips = root.querySelectorAll("[data-transport-chip]");
  var transcriptEl = document.getElementById("transport-route-transcript");
  var threadEl = document.getElementById("transport-route-thread");
  var conversationEl = document.getElementById("transport-route-conversation");
  var composerStackEl = document.getElementById("transport-route-composer");
  var composerKickerEl = document.getElementById("transport-route-composer-kicker");
  var previewEl = document.getElementById("transport-route-preview");
  var showIntakeBtn = document.getElementById("transport-show-human-intake");
  var intakeWrap = document.getElementById("transport-human-intake");
  var intakeForm = document.getElementById("transport-intake-form");
  var intakeSubmit = document.getElementById("transport-submit-intake");
  var confirmEl = document.getElementById("transport-route-confirmation");
  var intakeError = document.getElementById("transport-intake-error");

  var previousResponseId = null;
  var busy = false;
  var lastAssistantText = "";
  var transcriptLines = [];

  function syncTranscriptVisibility() {
    if (!logEl) return;
    var has = logEl.childElementCount > 0;
    if (transcriptEl) transcriptEl.hidden = !has;
    if (previewEl) previewEl.hidden = has;
    if (conversationEl) {
      conversationEl.classList.toggle("live-concierge__conversation--started", has);
    }
    if (composerKickerEl) composerKickerEl.hidden = true;
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
    /^(Quick read|Route read|Best for|Timing|Timing \/ buffer|Stay near vs downtown|Cost(?:\s*\/\s*parking)?|Parking|Strong Pick|Local Pick|Research Pick|Needs Visit|Next move|Human help|Request type|Transportation need|Transportation)\s*:\s*(.*)$/i;

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

  function pushTranscript(role, text) {
    transcriptLines.push({ role: role, text: String(text).trim() });
    if (transcriptLines.length > 40) transcriptLines = transcriptLines.slice(-40);
  }

  function buildConversationExcerpt() {
    var parts = transcriptLines.map(function (m) {
      var label = m.role === "user" ? "Visitor" : "Where To Go SA";
      return label + ": " + m.text;
    });
    var s = parts.join("\n\n");
    if (s.length > 10000) return "…" + s.slice(s.length - 10000);
    return s;
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
    pushTranscript("user", trimmed);
    addThinking();

    var payload = {
      message: trimmed,
      previous_response_id: previousResponseId,
    };

    fetch(OP_URL, {
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
        var rep = result.data.reply.trim();
        lastAssistantText = rep;
        appendBubble("assistant", rep);
        pushTranscript("assistant", rep);
        var sum = document.getElementById("transport-ai-summary");
        if (sum && !sum.value.trim()) sum.value = rep.slice(0, 2000);
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
      var t =
        chip.getAttribute("data-transport-chip-text") || chip.textContent || "";
      sendMessage(t);
      if (input) input.value = "";
    });
  });

  document.querySelectorAll("a[data-transport-route-prompt]").forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var prompt = anchor.getAttribute("data-transport-route-prompt") || "";
      if (!prompt || !input) return;
      e.preventDefault();
      input.value = prompt;
      var sec = document.getElementById("route-operator");
      if (sec && typeof sec.scrollIntoView === "function") {
        try {
          sec.scrollIntoView({ behavior: "smooth", block: "start" });
        } catch (err2) {
          sec.scrollIntoView(true);
        }
      } else {
        location.hash = "route-operator";
      }
      setTimeout(function () {
        try {
          if (input) input.focus();
        } catch (e3) {}
      }, 380);
    });
  });

  if (showIntakeBtn && intakeWrap) {
    showIntakeBtn.addEventListener("click", function () {
      intakeWrap.hidden = !intakeWrap.hidden;
      showIntakeBtn.setAttribute("aria-expanded", intakeWrap.hidden ? "false" : "true");
      if (!intakeWrap.hidden) {
        intakeWrap.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
  }

  function showIntakeMessage(text, isErr) {
    if (!intakeError) return;
    intakeError.hidden = !text;
    intakeError.textContent = text || "";
    intakeError.classList.toggle("transport-intake-error--ok", !!text && !isErr);
  }

  if (intakeForm && intakeSubmit) {
    intakeForm.addEventListener("submit", function (e) {
      e.preventDefault();
      showIntakeMessage("", false);
      if (intakeSubmit) intakeSubmit.disabled = true;

      var fd = new FormData(intakeForm);
      var transportNeeds = fd
        .getAll("transportation_need")
        .map(function (v) {
          return String(v || "").trim();
        })
        .filter(Boolean);
      var requestedDate = String(fd.get("requested_date") || "").trim();
      var timeWindow = String(fd.get("time_window") || "").trim();
      var requestedTime = [requestedDate, timeWindow].filter(Boolean).join(" ");
      var visitorEmail = String(fd.get("visitor_email") || "").trim();
      var visitorPhone = String(fd.get("visitor_phone") || "").trim();

      if (!visitorEmail && !visitorPhone) {
        showIntakeMessage("Please include an email or phone so Where To Go SA can follow up about your request.", true);
        if (intakeSubmit) intakeSubmit.disabled = false;
        return;
      }

      if (!transportNeeds.length) {
        showIntakeMessage("Please choose at least one transportation need.", true);
        if (intakeSubmit) intakeSubmit.disabled = false;
        return;
      }

      var body = {
        visitor_name: String(fd.get("visitor_name") || "").trim(),
        visitor_phone: visitorPhone,
        visitor_email: visitorEmail || null,
        preferred_contact_method: String(fd.get("preferred_contact_method") || "").trim() || null,
        pickup_area: String(fd.get("pickup_area") || "").trim(),
        pickup_lat: null,
        pickup_lng: null,
        pickup_permission_given: true,
        destination: String(fd.get("destination") || "").trim(),
        requested_date: requestedDate,
        time_window: timeWindow,
        requested_time: requestedTime,
        party_size: String(fd.get("party_size") || "").trim(),
        luggage: String(fd.get("luggage") || "").trim() || null,
        trip_type: String(fd.get("trip_type") || "").trim(),
        request_type: String(fd.get("trip_type") || "").trim(),
        transportation_need: transportNeeds,
        flight_number: String(fd.get("flight_number") || "").trim() || null,
        hotel_or_resort: String(fd.get("hotel_or_resort") || "").trim() || null,
        accessibility_needs: String(fd.get("accessibility_needs") || "").trim() || null,
        child_seats_needed: String(fd.get("child_seats_needed") || "").trim() || null,
        notes: String(fd.get("notes") || "").trim() || null,
        ai_summary: String(fd.get("ai_summary") || "").trim() || null,
        conversation_excerpt: buildConversationExcerpt(),
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        page_path: typeof location !== "undefined" ? location.pathname + location.search : "",
        source: "transportation_page",
        lead_type: "transportation_request",
        status: "New",
        next_action: "review route request",
      };

      fetch(REQ_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
        .then(function (res) {
          return res.json().then(function (data) {
            return { ok: res.ok, data: data };
          });
        })
        .then(function (result) {
          if (!result.ok || !result.data || !result.data.ok) {
            var msg =
              (result.data && result.data.message) || "We could not send your request. Please try again.";
            showIntakeMessage(msg, true);
            return;
          }
          intakeForm.reset();
          if (intakeWrap) intakeWrap.hidden = true;
          if (showIntakeBtn) showIntakeBtn.setAttribute("aria-expanded", "false");
          if (confirmEl) {
            confirmEl.hidden = false;
            confirmEl.textContent =
              "Request received. Where To Go SA will review your route details and best next step. Availability, pricing, and provider fit are not guaranteed.";
            confirmEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
          showIntakeMessage("", false);
        })
        .catch(function () {
          showIntakeMessage("We could not send your request. Check your connection and try again.", true);
        })
        .finally(function () {
          if (intakeSubmit) intakeSubmit.disabled = false;
        });
    });
  }

  setStatus("Live · ready", true);
  syncTranscriptVisibility();
})();
