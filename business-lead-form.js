(function () {
  var LEAD_URL = "/.netlify/functions/business-lead";
  var FALLBACK_EMAIL = "aibusinessplug@gmail.com";
  var PAGE_PATH = "/business-services.html";

  var form = document.getElementById("business-lead-form");
  var submitBtn = document.getElementById("business-lead-submit");
  var errorEl = document.getElementById("business-lead-intake-error");
  var confirmEl = document.getElementById("business-lead-confirm");

  if (!form || !submitBtn) return;

  var needHelpEl = document.getElementById("business-need-help");
  var messyWhereEl = document.getElementById("business-messy-where");
  var industryEl = document.getElementById("business-industry");

  var INDUSTRY_ALIASES = {
    "Transportation / concierge": "Transportation / concierge",
    "Local brand": "Local brand / retail",
  };

  function scrollToForm() {
    var target = document.getElementById("start-conversation");
    if (target && target.scrollIntoView) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function preselectFromLink(el) {
    if (!el) return;
    var businessType = el.getAttribute("data-bs-business-type");
    var promptMessy = el.getAttribute("data-bs-prompt-messy");
    var promptNeed = el.getAttribute("data-bs-prompt-need");

    if (businessType && industryEl) {
      industryEl.value = INDUSTRY_ALIASES[businessType] || businessType;
    }
    if (promptMessy && messyWhereEl && !String(messyWhereEl.value || "").trim()) {
      messyWhereEl.value = promptMessy;
    }
    if (promptNeed && needHelpEl && !String(needHelpEl.value || "").trim()) {
      needHelpEl.value = promptNeed;
    }
    scrollToForm();
  }

  document.querySelectorAll("[data-bs-business-type], [data-bs-prompt-messy], [data-bs-prompt-need]").forEach(function (el) {
    el.addEventListener("click", function () {
      window.setTimeout(function () {
        preselectFromLink(el);
      }, 80);
    });
  });

  function showError(text) {
    if (!errorEl) return;
    errorEl.hidden = !text;
    errorEl.textContent = text || "";
    if (text && confirmEl) {
      confirmEl.hidden = true;
      confirmEl.textContent = "";
    }
  }

  function showConfirm(text) {
    if (!confirmEl) return;
    confirmEl.hidden = !text;
    confirmEl.textContent = text || "";
    if (text && errorEl) {
      errorEl.hidden = true;
      errorEl.textContent = "";
    }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    showError("");
    showConfirm("");
    submitBtn.disabled = true;

    var fd = new FormData(form);
    var email = String(fd.get("contact_email") || "").trim();
    var phone = String(fd.get("contact_phone") || "").trim();
    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    var phoneOk = phone.replace(/\D/g, "").length >= 10;
    var consent = fd.get("contact_consent") === "yes";

    if (!String(fd.get("contact_name") || "").trim()) {
      showError("Enter your contact name.");
      submitBtn.disabled = false;
      return;
    }

    if (!emailOk && !phoneOk) {
      showError("Enter a valid email or a phone number with at least 10 digits.");
      submitBtn.disabled = false;
      return;
    }

    if (!String(fd.get("preferred_contact_method") || "").trim()) {
      showError("Choose a preferred contact method.");
      submitBtn.disabled = false;
      return;
    }

    if (!String(fd.get("business_industry") || "").trim()) {
      showError("Choose a business type.");
      submitBtn.disabled = false;
      return;
    }

    if (!String(fd.get("need_help") || "").trim()) {
      showError("Tell us what you want help with.");
      submitBtn.disabled = false;
      return;
    }

    if (!String(fd.get("messy_where") || "").trim()) {
      showError("Tell us where opportunities are getting lost.");
      submitBtn.disabled = false;
      return;
    }

    if (!consent) {
      showError("Please agree to the contact consent before submitting.");
      submitBtn.disabled = false;
      return;
    }

    var needHelp = String(fd.get("need_help") || "").trim();
    var messyWhere = String(fd.get("messy_where") || "").trim();
    var message = String(fd.get("notes") || "").trim();
    var consentNote =
      "Contact consent: Yes — agreed Where To Go SA / The AI Plug may contact about this request.";

    var notesParts = [];
    if (message) notesParts.push(message);
    notesParts.push(consentNote);

    var body = {
      contact_name: String(fd.get("contact_name") || "").trim(),
      contact_email: email,
      contact_phone: phone,
      preferred_contact_method: String(fd.get("preferred_contact_method") || "").trim(),
      business_name: String(fd.get("business_name") || "").trim() || null,
      business_website: String(fd.get("business_website") || "").trim() || null,
      business_industry: String(fd.get("business_industry") || "").trim() || null,
      current_problem: messyWhere,
      leak_category: messyWhere,
      customer_flow_issue: messyWhere,
      services_interested: needHelp,
      notes: notesParts.join("\n\n"),
      source: "business_services_page",
      lead_type: "ai_plug_business_request",
      status: "New",
      next_action: "review request",
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      page_path: PAGE_PATH,
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
          showError(
            d.message ||
              "We could not save your request. Please try again or email " + FALLBACK_EMAIL + "."
          );
          return;
        }
        form.reset();
        showConfirm(
          "Request received. We'll review your business type, current situation, and best starting point before following up."
        );
        if (confirmEl && confirmEl.scrollIntoView) {
          confirmEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      })
      .catch(function () {
        showError(
          "We could not send your request. Check your connection or email " + FALLBACK_EMAIL + "."
        );
      })
      .finally(function () {
        submitBtn.disabled = false;
      });
  });
})();
