/**
 * Business lead intake — inserts into Supabase `business_leads`, emails via Resend.
 * Optional SMS via Twilio when configured (failure never fails the lead save).
 *
 * Env:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  — required
 *   RESEND_API_KEY                           — required for email alerts
 *   BUSINESS_ALERT_EMAIL                     — preferred inbox
 *   TRANSPORT_ALERT_EMAIL                    — fallback inbox if BUSINESS_ALERT_EMAIL unset
 *   BUSINESS_ALERT_PHONE                     — optional SMS destination (E.164); else TRANSPORT_ALERT_PHONE
 *   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER — optional SMS
 *
 * Inserts into public.business_leads — columns expected:
 * contact_name, contact_email, contact_phone, preferred_contact_method,
 * business_name, business_website, business_industry, business_location,
 * decision_maker_role, current_problem, customer_flow_issue,
 * missed_calls_issue, lead_capture_issue, booking_issue, follow_up_issue,
 * services_interested, recommended_system, urgency, budget_readiness, timeline,
 * ai_summary, lead_quality, conversation_excerpt, notes, user_agent, page_path,
 * alert_email_sent (boolean; set false on insert, true after a successful Resend send)
 *
 * From address: defaults to "The AI Plug <onboarding@resend.dev>" unless
 * BUSINESS_RESEND_FROM_EMAIL is set.
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SAFE_ERR_LEN = 500;

function json(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...CORS_HEADERS,
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  };
}

function trimStr(v, max = 8000) {
  if (v == null) return "";
  const s = String(v).trim();
  if (s.length <= max) return s;
  return s.slice(0, max) + "…";
}

function safeResendErrorFromBody(text) {
  const slice = String(text || "").slice(0, SAFE_ERR_LEN);
  try {
    const j = JSON.parse(slice);
    if (j && j.message && typeof j.message === "string") return j.message.slice(0, SAFE_ERR_LEN);
    if (Array.isArray(j.errors) && j.errors[0] && typeof j.errors[0].message === "string") {
      return j.errors[0].message.slice(0, SAFE_ERR_LEN);
    }
  } catch {
    /* use slice */
  }
  return slice || "Resend request failed";
}

function safeTwilioErrorFromBody(text) {
  const slice = String(text || "").slice(0, SAFE_ERR_LEN);
  try {
    const j = JSON.parse(slice);
    const code = j.code != null ? String(j.code) : "";
    const msg = typeof j.message === "string" ? j.message.slice(0, SAFE_ERR_LEN) : "";
    if (code && msg) return `${code}: ${msg}`;
    if (msg) return msg;
    if (code) return code;
  } catch {
    /* use slice */
  }
  return slice || "Twilio request failed";
}

function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}

function resolveTwilioNextUrl(nextPageUri) {
  if (!nextPageUri) return null;
  const u = String(nextPageUri);
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  return `https://api.twilio.com${u.startsWith("/") ? u : `/${u}`}`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isRestaurantInquiry(payload) {
  const text = [
    payload.page_path,
    payload.business_industry,
    payload.owner_notes,
    payload.notes,
    payload.services_interested,
    payload.recommended_system,
  ]
    .filter(Boolean)
    .join("\n")
    .toLowerCase();
  return (
    text.indexOf("/restaurants/") !== -1 ||
    text.indexOf("restaurant lead source") !== -1 ||
    text.indexOf("inbound restaurant inquiry") !== -1
  );
}

function restaurantInterestType(payload) {
  const text = [
    payload.owner_notes,
    payload.notes,
    payload.services_interested,
    payload.recommended_system,
    payload.current_problem,
  ]
    .filter(Boolean)
    .join("\n")
    .toLowerCase();
  const partner =
    /partner program interest:\s*yes|restaurant partner program|visitor visibility|partner placement/.test(text);
  const ai =
    /ai systems interest:\s*yes|ai restaurant growth|ai systems|growth systems|restaurant growth systems/.test(text);
  if (partner && ai) return "Both";
  if (partner) return "Restaurant Partner Program";
  if (ai) return "AI Restaurant Growth Systems";
  return "Not specified";
}

function restaurantOptionalMessage(notes) {
  const text = String(notes || "").trim();
  if (!text) return "";
  const marker = text.search(/inbound restaurant inquiry from\s+\/restaurants\//i);
  return (marker >= 0 ? text.slice(0, marker) : text).trim();
}

function classifyLeadQuality(payload) {
  const prob =
    `${payload.current_problem || ""} ${payload.customer_flow_issue || ""} ${payload.notes || ""}`.trim();
  const excerpt = String(payload.conversation_excerpt || "").toLowerCase();
  const spamHints =
    /seo\s+audit\s+free|click\s+here\s+now|crypto|nft|viagra|loan\s+approval|guest\s+post/i.test(
      prob + excerpt
    );
  if (spamHints || prob.length < 8) {
    return prob.length < 2 ? "Research lead" : "Not a fit";
  }

  const urgent =
    /asap|urgent|this week|today|ready to buy|ready to start|need it now|within\s+\d+\s*(day|week)|immediately/i.test(
      `${payload.urgency || ""} ${payload.timeline || ""} ${prob}`
    );
  const budgetSignal =
    payload.budget_readiness &&
    !/^not sure|^unknown|^tbd$/i.test(String(payload.budget_readiness).trim());
  const businessSignal =
    (payload.business_name && payload.business_name.length > 2) ||
    (payload.business_industry && payload.business_industry.length > 2);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(payload.contact_email || ""));
  const phoneDigits = digitsOnly(payload.contact_phone);
  const phoneOk = phoneDigits.length >= 10;

  const ownerSignal =
    /owner|founder|gm|president|partner|director|operations|manager|i run|we run/i.test(
      `${payload.decision_maker_role || ""} ${prob}`
    );

  if (
    businessSignal &&
    prob.length > 35 &&
    urgent &&
    (emailOk || phoneOk) &&
    (ownerSignal || budgetSignal)
  ) {
    return "Hot lead";
  }
  if ((businessSignal || prob.length > 25) && (emailOk || phoneOk)) {
    return "Warm lead";
  }
  if (prob.length > 15 || excerpt.length > 80) {
    return "Warm lead";
  }
  return "Research lead";
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: { ...CORS_HEADERS }, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return json(405, {
      ok: false,
      supabase_inserted: false,
      lead_id: null,
      email_sent: false,
      sms_sent: false,
      email_error: null,
      sms_error: null,
      error: "Method not allowed",
    });
  }

  console.log("business lead env present", {
    SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    RESEND_API_KEY: Boolean(process.env.RESEND_API_KEY),
    BUSINESS_ALERT_EMAIL: Boolean(process.env.BUSINESS_ALERT_EMAIL),
    TRANSPORT_ALERT_EMAIL: Boolean(process.env.TRANSPORT_ALERT_EMAIL),
  });

  const supabaseUrl = process.env.SUPABASE_URL && String(process.env.SUPABASE_URL).replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey || !String(serviceKey).trim()) {
    return json(503, {
      ok: false,
      supabase_inserted: false,
      lead_id: null,
      email_sent: false,
      sms_sent: false,
      email_error: null,
      sms_error: null,
      error: "Service misconfigured",
      message: "Supabase environment variables are not configured.",
    });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return json(400, {
      ok: false,
      supabase_inserted: false,
      lead_id: null,
      email_sent: false,
      sms_sent: false,
      email_error: null,
      sms_error: null,
      error: "Invalid JSON body",
    });
  }

  const contact_name = trimStr(body.contact_name, 200);
  const contact_email_raw = trimStr(body.contact_email, 200);
  const contact_phone = trimStr(body.contact_phone, 80);
  const preferred_contact_method = trimStr(body.preferred_contact_method, 80);

  const business_name = trimStr(body.business_name, 200) || null;
  const business_website = trimStr(body.business_website, 500) || null;
  const business_industry = trimStr(body.business_industry, 200) || null;
  const business_location = trimStr(body.business_location, 200) || null;
  const decision_maker_role = trimStr(body.decision_maker_role, 200) || null;

  const current_problem = trimStr(body.current_problem, 4000) || null;
  const customer_flow_issue = trimStr(body.customer_flow_issue, 4000) || null;
  const missed_calls_issue = trimStr(body.missed_calls_issue, 500) || null;
  const lead_capture_issue = trimStr(body.lead_capture_issue, 500) || null;
  const booking_issue = trimStr(body.booking_issue, 500) || null;
  const follow_up_issue = trimStr(body.follow_up_issue, 500) || null;

  const services_interested = trimStr(body.services_interested, 2000) || null;
  const recommended_system = trimStr(body.recommended_system, 2000) || null;
  const urgency = trimStr(body.urgency, 200) || null;
  const budget_readiness = trimStr(body.budget_readiness, 200) || null;
  const timeline = trimStr(body.timeline, 200) || null;

  let ai_summary = trimStr(body.ai_summary, 6000) || null;
  const conversation_excerpt = trimStr(body.conversation_excerpt, 12000) || null;
  const notes = trimStr(body.notes, 4000) || null;
  const owner_notes = trimStr(body.owner_notes, 8000) || null;

  const user_agent = trimStr(body.user_agent, 512) || null;
  const page_path = trimStr(body.page_path, 512) || null;

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact_email_raw);
  const phoneDigits = digitsOnly(contact_phone);
  const phoneOk = phoneDigits.length >= 10;

  if (!contact_name || !preferred_contact_method || (!emailOk && !phoneOk)) {
    return json(400, {
      ok: false,
      supabase_inserted: false,
      lead_id: null,
      email_sent: false,
      sms_sent: false,
      email_error: null,
      sms_error: null,
      error: "validation_error",
      message: "Name, preferred contact method, and a valid email or phone number are required.",
    });
  }

  const classifyPayload = {
    contact_email: contact_email_raw,
    contact_phone,
    business_name,
    business_industry,
    decision_maker_role,
    current_problem,
    customer_flow_issue,
    notes,
    urgency,
    timeline,
    budget_readiness,
    conversation_excerpt,
  };
  let lead_quality = trimStr(body.lead_quality, 80);
  if (!lead_quality || !/^Hot lead|Warm lead|Research lead|Not a fit$/.test(lead_quality)) {
    lead_quality = classifyLeadQuality(classifyPayload);
  }

  if (!ai_summary && conversation_excerpt) {
    ai_summary = conversation_excerpt.slice(0, 3000);
  }

  const row = {
    contact_name,
    contact_email: emailOk ? contact_email_raw : null,
    contact_phone: phoneOk ? contact_phone : null,
    preferred_contact_method,
    business_name,
    business_website,
    business_industry,
    business_location,
    decision_maker_role,
    current_problem,
    customer_flow_issue,
    missed_calls_issue,
    lead_capture_issue,
    booking_issue,
    follow_up_issue,
    services_interested,
    recommended_system,
    urgency,
    budget_readiness,
    timeline,
    ai_summary,
    lead_quality,
    conversation_excerpt,
    notes,
    owner_notes,
    user_agent,
    page_path,
    alert_email_sent: false,
  };

  const restHeaders = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };

  let inserted;
  try {
    const ins = await fetch(`${supabaseUrl}/rest/v1/business_leads`, {
      method: "POST",
      headers: restHeaders,
      body: JSON.stringify(row),
    });
    const data = await ins.json().catch(() => null);
    if (!ins.ok) {
      return json(502, {
        ok: false,
        supabase_inserted: false,
        lead_id: null,
        email_sent: false,
        sms_sent: false,
        email_error: null,
        sms_error: null,
        error: "supabase_insert_failed",
        message: "Could not save your request. Please try again.",
        details:
          data && (data.message || data.error_description || data.hint)
            ? JSON.stringify(data).slice(0, 1500)
            : ins.statusText,
      });
    }
    inserted = Array.isArray(data) ? data[0] : data;
  } catch (err) {
    return json(502, {
      ok: false,
      supabase_inserted: false,
      lead_id: null,
      email_sent: false,
      sms_sent: false,
      email_error: null,
      sms_error: null,
      error: "supabase_network",
      message: err instanceof Error ? err.message : "Database request failed.",
    });
  }

  console.log("business lead inserted", { leadId: inserted && inserted.id });

  const requestId = inserted && inserted.id != null ? String(inserted.id) : null;
  if (!requestId) {
    return json(502, {
      ok: false,
      supabase_inserted: true,
      lead_id: null,
      email_sent: false,
      sms_sent: false,
      email_error: null,
      sms_error: null,
      error: "supabase_missing_id",
      message: "Request saved but confirmation failed.",
    });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const alertEmail =
    (process.env.BUSINESS_ALERT_EMAIL && String(process.env.BUSINESS_ALERT_EMAIL).trim()) ||
    (process.env.TRANSPORT_ALERT_EMAIL && String(process.env.TRANSPORT_ALERT_EMAIL).trim()) ||
    "";

  /** Prefer BUSINESS_RESEND_FROM_EMAIL when domain verified; else onboarding sender. */
  const resendFrom =
    (process.env.BUSINESS_RESEND_FROM_EMAIL && String(process.env.BUSINESS_RESEND_FROM_EMAIL).trim()) ||
    "The AI Plug <onboarding@resend.dev>";

  const restaurantInquiry = isRestaurantInquiry({
    page_path,
    business_industry,
    owner_notes,
    notes,
    services_interested,
    recommended_system,
  });
  const restaurantInterest = restaurantInterestType({
    owner_notes,
    notes,
    services_interested,
    recommended_system,
    current_problem,
  });
  const restaurantMessage = restaurantOptionalMessage(notes);
  const emailSubject = restaurantInquiry
    ? `New restaurant inquiry — ${business_name || "Restaurant name not provided"}`
    : `The AI Plug business lead [${lead_quality}] · ${contact_name}`;

  const emailHtml = restaurantInquiry
    ? `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#0b1d3a">
<h2>New restaurant inquiry</h2>
<p><strong>Supabase lead ID:</strong> ${escapeHtml(requestId)}</p>
<ul>
<li><strong>Restaurant name:</strong> ${business_name ? escapeHtml(business_name) : "—"}</li>
<li><strong>Contact name:</strong> ${escapeHtml(contact_name)}</li>
<li><strong>Email:</strong> ${emailOk ? escapeHtml(contact_email_raw) : "—"}</li>
<li><strong>Phone:</strong> ${contact_phone ? escapeHtml(contact_phone) : "—"}</li>
<li><strong>Preferred contact method:</strong> ${escapeHtml(preferred_contact_method)}</li>
<li><strong>Website / social:</strong> ${business_website ? escapeHtml(business_website) : "—"}</li>
<li><strong>Area / neighborhood:</strong> ${business_location ? escapeHtml(business_location) : "—"}</li>
<li><strong>Interest type:</strong> ${escapeHtml(restaurantInterest)}</li>
<li><strong>Help needed:</strong> ${current_problem ? escapeHtml(current_problem) : "—"}</li>
<li><strong>Source:</strong> ${escapeHtml(page_path || "/restaurants/")}</li>
</ul>
<h3>Optional message</h3>
<pre style="white-space:pre-wrap;font-size:14px;background:#f6f8fb;padding:12px;border-radius:8px">${escapeHtml(
      restaurantMessage || "—"
    )}</pre>
<h3>Internal notes</h3>
<pre style="white-space:pre-wrap;font-size:14px;background:#f6f8fb;padding:12px;border-radius:8px">${escapeHtml(
      owner_notes || "—"
    )}</pre>
</body></html>`
    : `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#0b1d3a">
<h2>New The AI Plug business lead</h2>
<p><strong>Lead quality:</strong> ${escapeHtml(lead_quality)}</p>
<p><strong>Supabase lead ID:</strong> ${escapeHtml(requestId)}</p>
<ul>
<li><strong>Contact name:</strong> ${escapeHtml(contact_name)}</li>
<li><strong>Phone:</strong> ${contact_phone ? escapeHtml(contact_phone) : "—"}</li>
<li><strong>Email:</strong> ${emailOk ? escapeHtml(contact_email_raw) : "—"}</li>
<li><strong>Preferred contact:</strong> ${escapeHtml(preferred_contact_method)}</li>
<li><strong>Business:</strong> ${business_name ? escapeHtml(business_name) : "—"}</li>
<li><strong>Website:</strong> ${business_website ? escapeHtml(business_website) : "—"}</li>
<li><strong>Industry:</strong> ${business_industry ? escapeHtml(business_industry) : "—"}</li>
<li><strong>Location:</strong> ${business_location ? escapeHtml(business_location) : "—"}</li>
<li><strong>Role:</strong> ${decision_maker_role ? escapeHtml(decision_maker_role) : "—"}</li>
<li><strong>Main problem:</strong> ${current_problem ? escapeHtml(current_problem) : "—"}</li>
<li><strong>Recommended system:</strong> ${recommended_system ? escapeHtml(recommended_system) : "—"}</li>
<li><strong>Urgency:</strong> ${urgency ? escapeHtml(urgency) : "—"}</li>
<li><strong>Timeline:</strong> ${timeline ? escapeHtml(timeline) : "—"}</li>
<li><strong>Budget / readiness:</strong> ${budget_readiness ? escapeHtml(budget_readiness) : "—"}</li>
</ul>
<h3>AI summary</h3>
<pre style="white-space:pre-wrap;font-size:14px;background:#f6f8fb;padding:12px;border-radius:8px">${escapeHtml(
    ai_summary || "—"
  )}</pre>
<h3>Conversation excerpt</h3>
<pre style="white-space:pre-wrap;font-size:14px;background:#f6f8fb;padding:12px;border-radius:8px">${escapeHtml(
    conversation_excerpt || "—"
  )}</pre>
<h3>Notes</h3>
<pre style="white-space:pre-wrap;font-size:14px;background:#f6f8fb;padding:12px;border-radius:8px">${escapeHtml(
    notes || "—"
  )}</pre>
</body></html>`;

  let emailSent = false;
  let emailErrorMessage = null;
  if (resendKey && alertEmail) {
    try {
      const er = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: resendFrom,
          to: [alertEmail],
          subject: emailSubject,
          html: emailHtml,
        }),
      });
      emailSent = er.ok;
      if (!emailSent) {
        const errText = await er.text();
        emailErrorMessage = safeResendErrorFromBody(errText);
      }
    } catch (e) {
      emailErrorMessage =
        e instanceof Error ? e.message.slice(0, SAFE_ERR_LEN) : "Email request failed";
    }
  } else if (!resendKey) {
    emailErrorMessage = "RESEND_API_KEY not configured.";
  } else {
    emailErrorMessage =
      "No BUSINESS_ALERT_EMAIL or TRANSPORT_ALERT_EMAIL configured for business alerts.";
  }

  console.log("business_lead.alert", {
    emailSent,
    emailErrorMessage: emailSent ? null : emailErrorMessage,
  });

  if (emailSent) {
    try {
      await fetch(
        `${supabaseUrl}/rest/v1/business_leads?id=eq.${encodeURIComponent(requestId)}`,
        {
          method: "PATCH",
          headers: restHeaders,
          body: JSON.stringify({ alert_email_sent: true }),
        }
      );
    } catch {
      /* row still exists; PATCH best-effort */
    }
  }

  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_FROM_NUMBER;
  const alertPhone =
    (process.env.BUSINESS_ALERT_PHONE && String(process.env.BUSINESS_ALERT_PHONE).trim()) ||
    (process.env.TRANSPORT_ALERT_PHONE && String(process.env.TRANSPORT_ALERT_PHONE).trim()) ||
    "";

  const smsBody = restaurantInquiry
    ? `Restaurant inquiry: ${business_name || "Restaurant TBD"} · ${contact_name}. Check email for ID ${requestId}.`
    : `AI Plug lead (${lead_quality}): ${business_name || "Business TBD"} · ${contact_name}. Check email for ID ${requestId}.`;

  let smsSent = false;
  let smsErrorMessage = null;
  const noOwnedMatchMsg =
    "Configured TWILIO_FROM_NUMBER does not exactly match an owned Twilio number.";

  if (twilioSid && twilioToken && twilioFrom && alertPhone) {
    const sidTrimmed = String(twilioSid).trim();
    const configuredFromDigits = digitsOnly(twilioFrom);

    if (!configuredFromDigits) {
      smsErrorMessage = noOwnedMatchMsg;
    } else {
      try {
        const listAuth = Buffer.from(`${sidTrimmed}:${String(twilioToken).trim()}`).toString(
          "base64"
        );
        let listUrl = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(
          sidTrimmed
        )}/IncomingPhoneNumbers.json?PageSize=1000`;
        let canonicalOwnedTwilioNumber = null;
        let listError = null;

        while (listUrl && !listError) {
          const listRes = await fetch(listUrl, {
            method: "GET",
            headers: {
              Authorization: `Basic ${listAuth}`,
              Accept: "application/json",
            },
          });
          const listText = await listRes.text();
          if (!listRes.ok) {
            listError = safeTwilioErrorFromBody(listText);
            break;
          }
          let listData;
          try {
            listData = JSON.parse(listText);
          } catch {
            listError = "Twilio list response was not valid JSON.";
            break;
          }
          const listItems = Array.isArray(listData.incoming_phone_numbers)
            ? listData.incoming_phone_numbers
            : [];
          for (const r of listItems) {
            const pn =
              r && r.phone_number != null
                ? String(r.phone_number).trim()
                : r && r.phoneNumber != null
                  ? String(r.phoneNumber).trim()
                  : "";
            if (!pn) continue;
            const ownedDigits = digitsOnly(pn);
            if (ownedDigits.length > 0 && ownedDigits === configuredFromDigits) {
              canonicalOwnedTwilioNumber = pn;
              listUrl = null;
              break;
            }
          }
          if (canonicalOwnedTwilioNumber) break;
          listUrl = resolveTwilioNextUrl(listData.next_page_uri);
        }

        if (listError) {
          smsErrorMessage = listError;
        } else if (!canonicalOwnedTwilioNumber) {
          smsErrorMessage = noOwnedMatchMsg;
        } else {
          const auth = Buffer.from(`${sidTrimmed}:${String(twilioToken).trim()}`).toString(
            "base64"
          );
          const params = new URLSearchParams({
            To: String(alertPhone).trim(),
            From: canonicalOwnedTwilioNumber,
            Body: smsBody.slice(0, 1500),
          });
          const smsRes = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(
              sidTrimmed
            )}/Messages.json`,
            {
              method: "POST",
              headers: {
                Authorization: `Basic ${auth}`,
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: params.toString(),
            }
          );
          smsSent = smsRes.ok;
          if (!smsSent) {
            const errText = await smsRes.text();
            smsErrorMessage = safeTwilioErrorFromBody(errText);
          }
        }
      } catch (e) {
        smsErrorMessage =
          e instanceof Error ? e.message.slice(0, SAFE_ERR_LEN) : "SMS request failed";
      }
    }
  }

  return json(200, {
    ok: true,
    supabase_inserted: true,
    lead_id: requestId,
    email_sent: emailSent,
    sms_sent: smsSent,
    email_error: emailSent ? null : emailErrorMessage,
    sms_error: smsSent ? null : smsErrorMessage,
  });
};
