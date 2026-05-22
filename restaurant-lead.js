(function () {
  var LEAD_URL = "/.netlify/functions/business-lead";
  var FALLBACK_EMAIL = "aibusinessplug@gmail.com";

  var form = document.getElementById("restaurant-lead-form");
  var submitBtn = document.getElementById("restaurant-lead-submit");
  var errorEl = document.getElementById("restaurant-lead-error");
  var confirmEl = document.getElementById("restaurant-lead-confirm");
  var partnerCheck = document.getElementById("rest-interest-partner");
  var aiCheck = document.getElementById("rest-interest-ai");

  if (!form || !submitBtn) return;

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

  function applyInterestFromQuery() {
    var params = new URLSearchParams(typeof location !== "undefined" ? location.search : "");
    var interest = (params.get("interest") || "").toLowerCase();
    if (interest === "partner" || interest === "visibility") {
      if (partnerCheck) partnerCheck.checked = true;
    } else if (interest === "ai" || interest === "systems") {
      if (aiCheck) aiCheck.checked = true;
    }
  }

  function applyInterestFromTrigger(el) {
    if (!el) return;
    var interest = el.getAttribute("data-rest-interest");
    if (interest === "partner" && partnerCheck) partnerCheck.checked = true;
    if (interest === "ai" && aiCheck) aiCheck.checked = true;
  }

  document.querySelectorAll("[data-rest-interest]").forEach(function (el) {
    el.addEventListener("click", function () {
      applyInterestFromTrigger(el);
    });
  });

  applyInterestFromQuery();

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

    var partnerInterest = fd.get("interest_partner") === "yes";
    var aiInterest = fd.get("interest_ai") === "yes";
    if (!partnerInterest && !aiInterest) {
      showError("Select at least one interest: Partner Program or AI Growth Systems.");
      submitBtn.disabled = false;
      return;
    }

    var helpWith = String(fd.get("help_with") || "").trim();
    var message = String(fd.get("message") || "").trim();
    var restaurantName = String(fd.get("restaurant_name") || "").trim();
    var restaurantArea = String(fd.get("restaurant_area") || "").trim();

    var services = [];
    if (partnerInterest) services.push("Restaurant Partner Program — visitor visibility / partner consideration");
    if (aiInterest) services.push("AI Restaurant Growth Systems — intake, QR, events, follow-up");

    var recommended = partnerInterest && !aiInterest
      ? "Restaurant Partner Program — visitor visibility"
      : aiInterest && !partnerInterest
        ? "AI Restaurant Growth Systems — restaurant growth infrastructure"
        : "Restaurant Partner Program + AI Restaurant Growth Systems";

    var ownerNotesLines = [
      "Restaurant lead source: wheretogosa.com/restaurants/",
      "Restaurant lead type: inbound",
      "Partner program interest: " + (partnerInterest ? "yes" : "no"),
      "AI systems interest: " + (aiInterest ? "yes" : "no"),
    ];
    if (restaurantArea) ownerNotesLines.push("Restaurant area: " + restaurantArea);

    var notesParts = [];
    if (message) notesParts.push(message);
    notesParts.push(
      "Inbound restaurant inquiry from /restaurants/",
      "Partner program: " + (partnerInterest ? "yes" : "no"),
      "AI systems: " + (aiInterest ? "yes" : "no")
    );

    var body = {
      contact_name: String(fd.get("contact_name") || "").trim(),
      contact_email: email,
      contact_phone: phone,
      preferred_contact_method: String(fd.get("preferred_contact_method") || "").trim(),
      business_name: restaurantName || null,
      business_website: String(fd.get("restaurant_website") || "").trim() || null,
      business_industry: "Restaurant",
      business_location: restaurantArea || null,
      current_problem: helpWith || null,
      services_interested: services.join("\n"),
      recommended_system: recommended,
      notes: notesParts.filter(Boolean).join("\n\n"),
      owner_notes: ownerNotesLines.join("\n"),
      ai_summary:
        "Restaurant inbound lead: " +
        (restaurantName || "Unnamed restaurant") +
        ". Interests: " +
        services.join("; ") +
        (helpWith ? ". Help with: " + helpWith : ""),
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      page_path: "/restaurants/",
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
              "We could not save your inquiry. Please try again or email " + FALLBACK_EMAIL + "."
          );
          return;
        }
        form.reset();
        showConfirm(
          d.email_sent
            ? "Inquiry received. Where To Go SA will follow up about your restaurant request."
            : "Inquiry saved. If you do not hear back soon, email " + FALLBACK_EMAIL + "."
        );
        if (confirmEl) confirmEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
      })
      .catch(function () {
        showError(
          "We could not send your inquiry. Check your connection or email " + FALLBACK_EMAIL + "."
        );
      })
      .finally(function () {
        submitBtn.disabled = false;
      });
  });
})();
