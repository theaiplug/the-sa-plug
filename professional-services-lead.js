(function () {
  var LEAD_URL = "/.netlify/functions/business-lead";
  var FALLBACK_EMAIL = "aibusinessplug@gmail.com";
  var PAGE_PATH = "/business-services/professional-services/";

  var form = document.getElementById("professional-services-lead-form");
  var submitBtn = document.getElementById("professional-services-lead-submit");
  var errorEl = document.getElementById("professional-services-lead-error");
  var confirmEl = document.getElementById("professional-services-lead-confirm");
  var serviceTypeSelect = document.getElementById("ps-service-type");

  if (!form || !submitBtn) return;

  var VERTICAL_QUERY_MAP = {
    "real-estate": "Real estate",
    insurance: "Insurance",
    legal: "Legal services",
    medical: "Medical / wellness",
    accounting: "Accounting / tax / bookkeeping",
    consultant: "Consultant / B2B services",
    financial: "Financial-style local service",
    recruiting: "Recruiting / staffing",
    coaching: "Coaching / training",
    other: "Other professional service",
  };

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

  function applyVerticalFromQuery() {
    if (!serviceTypeSelect) return;
    var params = new URLSearchParams(typeof location !== "undefined" ? location.search : "");
    var key = (params.get("vertical") || "").toLowerCase().trim();
    var label = VERTICAL_QUERY_MAP[key];
    if (!label) return;
    var opts = serviceTypeSelect.options;
    for (var i = 0; i < opts.length; i++) {
      if (opts[i].value === label) {
        serviceTypeSelect.value = label;
        break;
      }
    }
  }

  function scrollToForm() {
    var target = document.getElementById("professional-services-inquiry");
    if (target && typeof target.scrollIntoView === "function") {
      try {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch (e) {
        target.scrollIntoView(true);
      }
    }
  }

  document.querySelectorAll("[data-ps-vertical]").forEach(function (el) {
    el.addEventListener("click", function () {
      var key = (el.getAttribute("data-ps-vertical") || "").toLowerCase();
      var label = VERTICAL_QUERY_MAP[key];
      if (label && serviceTypeSelect) serviceTypeSelect.value = label;
    });
  });

  applyVerticalFromQuery();
  if (typeof location !== "undefined" && location.hash === "#professional-services-inquiry") {
    applyVerticalFromQuery();
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

    if (!emailOk && !phoneOk) {
      showError("Enter a valid email or a phone number with at least 10 digits.");
      submitBtn.disabled = false;
      return;
    }

    var businessName = String(fd.get("business_name") || "").trim();
    var contactName = String(fd.get("contact_name") || "").trim();
    var serviceType = String(fd.get("service_type") || "").trim();
    var serviceDescription = String(fd.get("service_description") || "").trim();
    var messyWhere = String(fd.get("messy_where") || "").trim();
    var needHelp = String(fd.get("need_help") || "").trim();
    var message = String(fd.get("message") || "").trim();
    var website = String(fd.get("business_website") || "").trim();

    var preferred =
      String(fd.get("preferred_contact_method") || "").trim() ||
      (emailOk ? "email" : "phone");

    var problemParts = [];
    if (messyWhere) problemParts.push("Where requests get messy: " + messyWhere);
    if (needHelp) problemParts.push("Help wanted: " + needHelp);
    if (serviceDescription) problemParts.push("Service description: " + serviceDescription);
    if (message) problemParts.push(message);

    var ownerNotesLines = [
      "AI Plug vertical: Professional Services",
      "Professional service type: " + (serviceType || "Not specified"),
      "Where requests get messy: " + (messyWhere || "Not specified"),
      "Professional services need: " + (needHelp || "Not specified"),
      "Source page: " + PAGE_PATH,
      "Lead source: professional_services_page",
      "Lead type: professional_services_inquiry",
    ];
    if (serviceDescription) ownerNotesLines.push("Service description: " + serviceDescription);

    var notesParts = [
      "Inbound professional services inquiry from " + PAGE_PATH,
      "Vertical category: Professional Services",
      "Service type: " + (serviceType || "Not specified"),
      "Messy area: " + (messyWhere || "Not specified"),
      "Help needed: " + (needHelp || "Not specified"),
    ];
    if (serviceDescription) notesParts.push("Service description: " + serviceDescription);
    if (message) notesParts.push(message);
    notesParts.push(
      "Submit consent: By submitting, the contact agreed The AI Plug / Where To Go SA may contact them by email or SMS about this request."
    );

    var recommended = needHelp || "Professional services request path review";

    var body = {
      contact_name: contactName,
      contact_email: email,
      contact_phone: phone,
      preferred_contact_method: preferred,
      business_name: businessName || null,
      business_website: website || null,
      business_industry: serviceType || "Professional Services",
      business_location: null,
      current_problem: problemParts.join("\n\n") || null,
      services_interested: needHelp || null,
      recommended_system: recommended,
      notes: notesParts.filter(Boolean).join("\n\n"),
      owner_notes: ownerNotesLines.join("\n"),
      ai_summary:
        "Professional services inbound: " +
        (businessName || "Unnamed business") +
        (serviceType ? " · " + serviceType : "") +
        (messyWhere ? " · Messy: " + messyWhere : "") +
        (needHelp ? " · Help: " + needHelp : ""),
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      page_path: PAGE_PATH,
      source: "professional_services_page",
      lead_type: "professional_services_inquiry",
      status: "New",
      next_action: "review request",
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
        if (!result.ok || !d.supabase_inserted || !d.lead_id) {
          showError(
            d.message ||
              "We could not save your request. Please try again or email " + FALLBACK_EMAIL + "."
          );
          return;
        }
        form.reset();
        applyVerticalFromQuery();
        showConfirm(
          d.email_sent
            ? "Request received. The AI Plug will review your business type, current request path, and best starting point."
            : "Request saved. If you do not hear back soon, email " + FALLBACK_EMAIL + "."
        );
        if (confirmEl) confirmEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
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

  if (typeof location !== "undefined" && /vertical=/.test(location.search)) {
    scrollToForm();
  }
})();
