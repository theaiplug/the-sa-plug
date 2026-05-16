(function () {
  var OP_URL = "/.netlify/functions/business-operator";
  var LEAD_URL = "/.netlify/functions/business-lead";
  var FALLBACK =
    "The business operator is temporarily unavailable. You can still send a project request by email at aibusinessplug@gmail.com.";

  var root = document.getElementById("business-operator-module");
  if (!root) return;

  var logEl = document.getElementById("business-op-log");
  var form = document.getElementById("business-op-form");
  var input = document.getElementById("business-op-input");
  var sendBtn = document.getElementById("business-op-send");
  var statusEl = document.getElementById("business-op-status");
  var errorBanner = document.getElementById("business-op-error");
  var chips = root.querySelectorAll("[data-business-chip]");
  var transcriptEl = document.getElementById("business-op-transcript");
  var threadEl = document.getElementById("business-op-thread");
  var conversationEl = document.getElementById("business-op-conversation");
  var composerStackEl = document.getElementById("business-op-composer");
  var previewEl = document.getElementById("business-op-preview");
  var showIntakeBtn = document.getElementById("business-operator-show-intake");
  var intakeWrap = document.getElementById("business-operator-intake");
  var intakeForm = document.getElementById("business-lead-form");
  var intakeSubmit = document.getElementById("business-lead-submit");
  var confirmEl = document.getElementById("business-op-confirmation");
  var intakeError = document.getElementById("business-lead-intake-error");

  var previousResponseId = null;
  var busy = false;
  var transcriptLines = [];
  var lastAssistantReply = "";

  function syncTranscriptVisibility() {
    if (!logEl) return;
    var has = logEl.childElementCount > 0;
    if (transcriptEl) transcriptEl.hidden = !has;
    if (previewEl) previewEl.hidden = has;
    if (conversationEl) {
      conversationEl.classList.toggle("live-concierge__conversation--started", has);
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
    /^(Quick read|What I'd tighten next|Best system fit|Tradeoffs|Business|Industry|Main problem|Priority|Timeline|Recommended next step|Customer flow|Lead capture|Booking|Follow-up|Services fit)\s*:\s*(.*)$/i;

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
    if (transcriptLines.length > 48) transcriptLines = transcriptLines.slice(-48);
  }

  function buildConversationExcerpt() {
    var parts = transcriptLines.map(function (m) {
      var label = m.role === "user" ? "Business owner" : "AI Plug operator";
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

  function getLatestRecapSummary() {
    var t = String(lastAssistantReply || "").trim();
    if (t && /Here's the AI system/i.test(t)) {
      return t.slice(0, 4000);
    }
    return "";
  }

  function syncHiddenLeadFields(includeCtx) {
    var hidAi = document.getElementById("business-ai-summary");
    var hidEx = document.getElementById("business-conversation-excerpt");
    var hidInc = document.getElementById("business-include-operator-context-sent");
    var excerptVal = "";
    var summaryVal = "";
    if (includeCtx) {
      excerptVal = buildConversationExcerpt().trim();
      if (!excerptVal) {
        excerptVal = "No operator summary was available.";
      }
      summaryVal = getLatestRecapSummary();
    }
    if (hidAi) hidAi.value = summaryVal;
    if (hidEx) hidEx.value = excerptVal;
    if (hidInc) hidInc.value = includeCtx ? "yes" : "";
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
        appendBubble("assistant", rep);
        pushTranscript("assistant", rep);
        lastAssistantReply = rep;
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
      var t = chip.getAttribute("data-business-chip-text") || chip.textContent || "";
      sendMessage(t);
      if (input) input.value = "";
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

  function checkboxYes(name, fd) {
    var v = fd.get(name);
    return v === "yes" ? "Yes" : null;
  }

  if (intakeForm && intakeSubmit) {
    intakeForm.addEventListener("submit", function (e) {
      e.preventDefault();
      showIntakeMessage("", false);
      intakeSubmit.disabled = true;

      var includeCtxEl = document.getElementById("business-include-operator-context");
      var includeCtx = !!(includeCtxEl && includeCtxEl.checked);
      syncHiddenLeadFields(includeCtx);

      var fd = new FormData(intakeForm);
      var email = String(fd.get("contact_email") || "").trim();
      var phone = String(fd.get("contact_phone") || "").trim();
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      var phoneDigits = phone.replace(/\D/g, "");
      var phoneOk = phoneDigits.length >= 10;
      if (!emailOk && !phoneOk) {
        showIntakeMessage("Enter a valid email or a phone number with at least 10 digits.", true);
        intakeSubmit.disabled = false;
        return;
      }

      var body = {
        contact_name: String(fd.get("contact_name") || "").trim(),
        contact_email: email,
        contact_phone: phone,
        preferred_contact_method: String(fd.get("preferred_contact_method") || "").trim(),
        business_name: String(fd.get("business_name") || "").trim() || null,
        business_website: String(fd.get("business_website") || "").trim() || null,
        business_industry: String(fd.get("business_industry") || "").trim() || null,
        business_location: String(fd.get("business_location") || "").trim() || null,
        decision_maker_role: String(fd.get("decision_maker_role") || "").trim() || null,
        current_problem: String(fd.get("current_problem") || "").trim() || null,
        customer_flow_issue: String(fd.get("customer_flow_issue") || "").trim() || null,
        missed_calls_issue: checkboxYes("missed_calls_issue", fd),
        lead_capture_issue: checkboxYes("lead_capture_issue", fd),
        booking_issue: checkboxYes("booking_issue", fd),
        follow_up_issue: checkboxYes("follow_up_issue", fd),
        services_interested: String(fd.get("services_interested") || "").trim() || null,
        recommended_system: String(fd.get("recommended_system") || "").trim() || null,
        urgency: String(fd.get("urgency") || "").trim() || null,
        budget_readiness: String(fd.get("budget_readiness") || "").trim() || null,
        timeline: String(fd.get("timeline") || "").trim() || null,
        ai_summary: String(fd.get("ai_summary") || "").trim() || null,
        notes: String(fd.get("notes") || "").trim() || null,
        conversation_excerpt: String(fd.get("conversation_excerpt") || "").trim() || null,
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        page_path: typeof location !== "undefined" ? location.pathname + location.search : "",
      };

      fetch(LEAD_URL, {
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
          var d = result.data || {};
          var leadId = d.lead_id || d.request_id;
          if (!result.ok || !d.supabase_inserted || !leadId) {
            var errMsg =
              d.message ||
              "We could not save your lead. Please try again or email aibusinessplug@gmail.com.";
            showIntakeMessage(errMsg, true);
            return;
          }
          intakeForm.reset();
          if (confirmEl) {
            confirmEl.hidden = false;
            confirmEl.textContent = d.email_sent
              ? "Lead saved. The AI Plug received your project summary and an email alert was sent. If it looks like a fit, Willie will follow up using the contact method you provided."
              : "Lead saved, but email alert did not send. Your details are on file. You can also email aibusinessplug@gmail.com.";
            confirmEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
          showIntakeMessage("", false);
        })
        .catch(function () {
          showIntakeMessage(
            "We could not send your request. Check your connection or email aibusinessplug@gmail.com.",
            true
          );
        })
        .finally(function () {
          intakeSubmit.disabled = false;
        });
    });
  }

  setStatus("Live · ready", true);
  syncTranscriptVisibility();
})();
