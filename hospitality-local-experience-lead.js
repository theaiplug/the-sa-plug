(function () {
  var LEAD_URL = "/.netlify/functions/business-lead";
  var FALLBACK_EMAIL = "aibusinessplug@gmail.com";
  var PAGE_PATH = "/business-services/hospitality-local-experience/";

  var form = document.getElementById("hospitality-lead-form");
  var submitBtn = document.getElementById("hospitality-lead-submit");
  var errorEl = document.getElementById("hospitality-lead-error");
  var confirmEl = document.getElementById("hospitality-lead-confirm");
  var businessTypeSelect = document.getElementById("hosp-business-type");

  if (!form || !submitBtn) return;

  var VERTICAL_QUERY_MAP = {
    restaurant: "Restaurant",
    bar: "Bar / nightlife",
    nightlife: "Bar / nightlife",
    rooftop: "Rooftop / lounge",
    lounge: "Rooftop / lounge",
    "event-venue": "Event venue",
    venue: "Event venue",
    attraction: "Attraction / tour",
    tour: "Attraction / tour",
    resort: "Resort-area business",
    "local-brand": "Visitor-facing local brand",
    "food-truck": "Food truck / pop-up",
    entertainment: "Entertainment venue",
    other: "Other hospitality / local experience business",
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
    if (!businessTypeSelect) return;
    var params = new URLSearchParams(typeof location !== "undefined" ? location.search : "");
    var key = (params.get("vertical") || "").toLowerCase().trim();
    var label = VERTICAL_QUERY_MAP[key];
    if (!label) return;
    var opts = businessTypeSelect.options;
    for (var i = 0; i < opts.length; i++) {
      if (opts[i].value === label) {
        businessTypeSelect.value = label;
        break;
      }
    }
  }

  function scrollToForm() {
    var target = document.getElementById("hospitality-inquiry");
    if (target && typeof target.scrollIntoView === "function") {
      try {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch (e) {
        target.scrollIntoView(true);
      }
    }
  }

  document.querySelectorAll("[data-hosp-vertical]").forEach(function (el) {
    el.addEventListener("click", function () {
      var key = (el.getAttribute("data-hosp-vertical") || "").toLowerCase();
      var label = VERTICAL_QUERY_MAP[key];
      if (label && businessTypeSelect) businessTypeSelect.value = label;
    });
  });

  applyVerticalFromQuery();
  if (typeof location !== "undefined" && location.hash === "#hospitality-inquiry") {
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
    var businessType = String(fd.get("business_type") || "").trim();
    var businessDescription = String(fd.get("business_description") || "").trim();
    var messyWhere = String(fd.get("messy_where") || "").trim();
    var needHelp = String(fd.get("need_help") || "").trim();
    var message = String(fd.get("message") || "").trim();
    var website = String(fd.get("business_website") || "").trim();

    var preferred =
      String(fd.get("preferred_contact_method") || "").trim() ||
      (emailOk ? "email" : "phone");

    var problemParts = [];
    if (messyWhere) problemParts.push("Where inquiries get messy: " + messyWhere);
    if (needHelp) problemParts.push("Help wanted: " + needHelp);
    if (businessDescription) problemParts.push("Business description: " + businessDescription);
    if (message) problemParts.push(message);

    var ownerNotesLines = [
      "AI Plug vertical: Hospitality + Local Experience",
      "Hospitality business type: " + (businessType || "Not specified"),
      "Where inquiries get messy: " + (messyWhere || "Not specified"),
      "Hospitality need: " + (needHelp || "Not specified"),
      "Source page: " + PAGE_PATH,
      "Lead source: hospitality_local_experience_page",
      "Lead type: hospitality_local_experience_inquiry",
    ];
    if (businessDescription) ownerNotesLines.push("Business description: " + businessDescription);

    var notesParts = [
      "Inbound hospitality + local experience inquiry from " + PAGE_PATH,
      "Vertical category: Hospitality + Local Experience",
      "Business type: " + (businessType || "Not specified"),
      "Messy area: " + (messyWhere || "Not specified"),
      "Help needed: " + (needHelp || "Not specified"),
    ];
    if (businessDescription) notesParts.push("Business description: " + businessDescription);
    if (message) notesParts.push(message);
    notesParts.push(
      "Submit consent: By submitting, the contact agreed The AI Plug / Where To Go SA may contact them by email or SMS about this request."
    );

    var recommended = needHelp || "Hospitality request path review";

    var body = {
      contact_name: contactName,
      contact_email: email,
      contact_phone: phone,
      preferred_contact_method: preferred,
      business_name: businessName || null,
      business_website: website || null,
      business_industry: businessType || "Hospitality + Local Experience",
      business_location: null,
      current_problem: problemParts.join("\n\n") || null,
      services_interested: needHelp || null,
      recommended_system: recommended,
      notes: notesParts.filter(Boolean).join("\n\n"),
      owner_notes: ownerNotesLines.join("\n"),
      ai_summary:
        "Hospitality inbound: " +
        (businessName || "Unnamed business") +
        (businessType ? " · " + businessType : "") +
        (messyWhere ? " · Messy: " + messyWhere : "") +
        (needHelp ? " · Help: " + needHelp : ""),
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      page_path: PAGE_PATH,
      source: "hospitality_local_experience_page",
      lead_type: "hospitality_local_experience_inquiry",
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
            ? "Request received. The AI Plug will review your business type, current inquiry path, and best starting point."
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
