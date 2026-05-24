/**
 * Transportation request intake — stores in Supabase, alerts via Twilio + Resend.
 *
 * Environment variables (Netlify → Site configuration → Environment variables):
 *   SUPABASE_URL                  — Supabase project URL (used for REST API base URL)
 *   SUPABASE_SERVICE_ROLE_KEY     — service role key for insert/PATCH (never exposed to frontend)
 *   TWILIO_ACCOUNT_SID            — Twilio Account SID for SMS
 *   TWILIO_AUTH_TOKEN             — Twilio auth token
 *   TWILIO_FROM_NUMBER            — Twilio sender (must be permitted for your account)
 *   TRANSPORT_ALERT_PHONE         — Owner phone to SMS (E.164, e.g. +1...)
 *   RESEND_API_KEY                — Resend API key for email
 *   TRANSPORT_ALERT_EMAIL         — Owner inbox for email alerts
 *   RESEND_FROM_EMAIL             — optional "From" for Resend; defaults to Resend testing sender until domain is verified
 *
 * Voice-ready: POST the same JSON body from a future voice operator; set source: "voice_operator".
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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

function listFromBody(v, maxItems = 20, maxLen = 200) {
  const raw = Array.isArray(v) ? v : v == null || v === "" ? [] : [v];
  return raw
    .map((item) => trimStr(item, maxLen))
    .filter(Boolean)
    .slice(0, maxItems);
}

function joinList(values) {
  return values && values.length ? values.join(", ") : "";
}

function line(label, value) {
  const s = Array.isArray(value) ? joinList(value) : trimStr(value, 1200);
  return `${label}: ${s || "—"}`;
}

/** Max length for safe error strings returned to clients and logs (no secrets). */
const SAFE_ERR_LEN = 500;

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

function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}

function toE164FromDigits(digits) {
  if (!digits) return "";
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (String(digits).startsWith("+")) return digits;
  return `+${digits}`;
}

function resolveTwilioNextUrl(nextPageUri) {
  if (!nextPageUri) return null;
  const u = String(nextPageUri);
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  return `https://api.twilio.com${u.startsWith("/") ? u : `/${u}`}`;
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: { ...CORS_HEADERS }, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  console.log("transportation-request env present", {
    SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    RESEND_API_KEY: Boolean(process.env.RESEND_API_KEY),
    TRANSPORT_ALERT_EMAIL: Boolean(process.env.TRANSPORT_ALERT_EMAIL),
    TWILIO_ACCOUNT_SID: Boolean(process.env.TWILIO_ACCOUNT_SID),
    TWILIO_AUTH_TOKEN: Boolean(process.env.TWILIO_AUTH_TOKEN),
    TWILIO_FROM_NUMBER: Boolean(process.env.TWILIO_FROM_NUMBER),
    TRANSPORT_ALERT_PHONE: Boolean(process.env.TRANSPORT_ALERT_PHONE),
  });

  // SUPABASE_URL — required for Supabase REST
  const supabaseUrl = process.env.SUPABASE_URL && String(process.env.SUPABASE_URL).replace(/\/$/, "");
  // SUPABASE_SERVICE_ROLE_KEY — required for server-side insert/update
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey || !String(serviceKey).trim()) {
    return json(503, {
      error: "Service misconfigured",
      code: "missing_supabase",
      message: "Supabase environment variables are not configured.",
    });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Invalid JSON body" });
  }

  const visitor_name = trimStr(body.visitor_name, 200);
  const visitor_phone = trimStr(body.visitor_phone, 80);
  const visitor_email = trimStr(body.visitor_email, 200) || null;
  const preferred_contact_method = trimStr(body.preferred_contact_method, 120) || null;
  const pickup_area = trimStr(body.pickup_area, 500);
  const pickup_lat =
    body.pickup_lat != null && body.pickup_lat !== "" ? Number(body.pickup_lat) : null;
  const pickup_lng =
    body.pickup_lng != null && body.pickup_lng !== "" ? Number(body.pickup_lng) : null;
  const pickup_permission_given = body.pickup_permission_given === true || body.pickup_permission_given === "true";
  const destination = trimStr(body.destination, 500);
  const requested_date = trimStr(body.requested_date, 120) || null;
  const time_window = trimStr(body.time_window, 200) || null;
  const requested_time = trimStr(body.requested_time, 200) || [requested_date, time_window].filter(Boolean).join(" ");
  const party_size = trimStr(body.party_size, 80);
  const luggage = trimStr(body.luggage, 500) || null;
  const trip_type = trimStr(body.trip_type || body.request_type, 200);
  const request_type = trip_type;
  const transportation_need = listFromBody(body.transportation_need, 20, 200);
  const transportation_need_text = joinList(transportation_need);
  const flight_number = trimStr(body.flight_number, 120) || null;
  const hotel_or_resort = trimStr(body.hotel_or_resort, 240) || null;
  const accessibility_needs = trimStr(body.accessibility_needs, 500) || null;
  const child_seats_needed = trimStr(body.child_seats_needed, 500) || null;
  const notes = trimStr(body.notes, 4000) || null;
  const ai_summary = trimStr(body.ai_summary, 4000) || null;
  const conversation_excerpt = trimStr(body.conversation_excerpt, 12000) || null;
  const user_agent = trimStr(body.user_agent, 512) || null;
  const page_path = trimStr(body.page_path, 512) || null;
  const source = trimStr(body.source, 120) || "transportation_page";
  const lead_type = trimStr(body.lead_type, 120) || "transportation_request";
  const next_action = trimStr(body.next_action, 160) || "review route request";

  if (
    !visitor_name ||
    (!visitor_phone && !visitor_email) ||
    !pickup_area ||
    !destination ||
    !requested_time ||
    !party_size ||
    !request_type ||
    !transportation_need_text
  ) {
    return json(400, {
      error: "validation_error",
      message: "Missing required fields.",
      fields: [
        "visitor_name",
        "visitor_phone_or_email",
        "pickup_area",
        "destination",
        "requested_time",
        "party_size",
        "request_type",
        "transportation_need",
      ],
    });
  }

  const phoneOk = !visitor_phone || /^\+?[\d\s().-]{10,}$/.test(visitor_phone);
  if (!phoneOk) {
    return json(400, { error: "validation_error", message: "Please enter a valid phone number." });
  }

  const timingText = [requested_date, time_window].filter(Boolean).join(" ") || requested_time;
  const owner_notes = [
    line("Trip type", trip_type),
    line("Pickup area", pickup_area),
    line("Destination", destination),
    line("Timing", timingText),
    line("Party size", party_size),
    line("Luggage", luggage),
    line("What help they need", transportation_need),
    line("Preferred contact method", preferred_contact_method),
    line("Hotel / resort", hotel_or_resort),
    line("Flight number", flight_number),
    line("Accessibility needs", accessibility_needs),
    line("Child seats needed", child_seats_needed),
    line("Notes", notes),
    "Source: Transportation page",
    "Lead type: transportation_request",
    "Next action: Review route request",
  ].join("\n");

  const legacyRow = {
    brand: "Where To Go SA",
    status: "New",
    source,
    visitor_name,
    visitor_phone,
    visitor_email,
    pickup_area,
    pickup_lat: pickup_lat != null && !Number.isNaN(pickup_lat) ? pickup_lat : null,
    pickup_lng: pickup_lng != null && !Number.isNaN(pickup_lng) ? pickup_lng : null,
    pickup_permission_given,
    destination,
    requested_time,
    party_size,
    luggage,
    request_type,
    notes,
    owner_notes,
    ai_summary,
    conversation_excerpt,
    alert_sms_sent: false,
    alert_email_sent: false,
    user_agent,
    page_path,
  };

  const fullRow = {
    ...legacyRow,
    lead_type,
    next_action,
    preferred_contact_method,
    requested_date,
    time_window,
    trip_type,
    transportation_need: transportation_need_text,
    flight_number,
    hotel_or_resort,
    accessibility_needs,
    child_seats_needed,
  };

  const restHeaders = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };

  let inserted;
  try {
    let ins = await fetch(`${supabaseUrl}/rest/v1/transportation_requests`, {
      method: "POST",
      headers: restHeaders,
      body: JSON.stringify(fullRow),
    });
    const data = await ins.json().catch(() => null);
    if (!ins.ok) {
      console.warn("transportation full insert failed; retrying legacy shape", {
        status: ins.status,
        message: data && (data.message || data.error_description || data.hint),
      });
      ins = await fetch(`${supabaseUrl}/rest/v1/transportation_requests`, {
        method: "POST",
        headers: restHeaders,
        body: JSON.stringify(legacyRow),
      });
      const fallbackData = await ins.json().catch(() => null);
      if (!ins.ok) {
        return json(502, {
          error: "supabase_insert_failed",
          message: "Could not save your request. Please try again.",
        });
      }
      inserted = Array.isArray(fallbackData) ? fallbackData[0] : fallbackData;
    } else {
      inserted = Array.isArray(data) ? data[0] : data;
    }
  } catch (err) {
    return json(502, {
      error: "supabase_network",
      message: err instanceof Error ? err.message : "Database request failed.",
    });
  }

  const requestId = inserted && inserted.id != null ? String(inserted.id) : null;
  if (!requestId) {
    return json(502, {
      error: "supabase_missing_id",
      message: "Request saved but confirmation failed. Please contact support if you need help.",
    });
  }

  console.log("transportation request inserted", { requestId: inserted.id });

  // --- SMS (TWILIO_*, TRANSPORT_ALERT_PHONE) ---
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_FROM_NUMBER;
  const alertPhone = process.env.TRANSPORT_ALERT_PHONE;

  // --- Email (RESEND_API_KEY, TRANSPORT_ALERT_EMAIL); default From for testing until domain verified ---
  const resendKey = process.env.RESEND_API_KEY;
  const alertEmail = process.env.TRANSPORT_ALERT_EMAIL;
  const resendFrom =
    (process.env.RESEND_FROM_EMAIL && String(process.env.RESEND_FROM_EMAIL).trim()) ||
    "Where To Go SA <onboarding@resend.dev>";

  const smsBody = `New Where To Go SA transportation request: ${trip_type}: ${pickup_area} → ${destination}, ${timingText}, ${party_size}. Need: ${transportation_need_text}. Phone: ${visitor_phone || "—"}.`;

  let smsSent = false;
  let smsErrorCode = null;
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
        /** @type {string | null} */
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
          for (const row of listItems) {
            const pn =
              row && row.phone_number != null
                ? String(row.phone_number).trim()
                : row && row.phoneNumber != null
                  ? String(row.phoneNumber).trim()
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
            try {
              const j = JSON.parse(errText);
              smsErrorCode = j.code != null ? String(j.code) : null;
            } catch {
              smsErrorCode = null;
            }
          }
        }
      } catch (e) {
        smsErrorMessage =
          e instanceof Error ? e.message.slice(0, SAFE_ERR_LEN) : "SMS request failed";
      }
    }
  }

  console.log("twilio send result", {
    smsSent,
    smsErrorCode,
    smsErrorMessage,
  });

  let emailSent = false;
  let emailErrorMessage = null;
  const emailHtml = `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#0b1d3a">
<h2>New Where To Go SA transportation request</h2>
<p><strong>Supabase request ID:</strong> ${escapeHtml(requestId)}</p>
<ul>
<li><strong>Name:</strong> ${escapeHtml(visitor_name)}</li>
<li><strong>Phone:</strong> ${escapeHtml(visitor_phone)}</li>
<li><strong>Email:</strong> ${visitor_email ? escapeHtml(visitor_email) : "—"}</li>
<li><strong>Preferred contact:</strong> ${preferred_contact_method ? escapeHtml(preferred_contact_method) : "—"}</li>
<li><strong>Trip type:</strong> ${escapeHtml(trip_type)}</li>
<li><strong>Pickup:</strong> ${escapeHtml(pickup_area)}</li>
<li><strong>Destination:</strong> ${escapeHtml(destination)}</li>
<li><strong>Date:</strong> ${requested_date ? escapeHtml(requested_date) : "—"}</li>
<li><strong>Time window:</strong> ${time_window ? escapeHtml(time_window) : "—"}</li>
<li><strong>Requested time:</strong> ${escapeHtml(timingText)}</li>
<li><strong>Party size:</strong> ${escapeHtml(party_size)}</li>
<li><strong>Luggage / gear:</strong> ${luggage ? escapeHtml(luggage) : "—"}</li>
<li><strong>What they need:</strong> ${escapeHtml(transportation_need_text)}</li>
<li><strong>Hotel / resort:</strong> ${hotel_or_resort ? escapeHtml(hotel_or_resort) : "—"}</li>
<li><strong>Flight number:</strong> ${flight_number ? escapeHtml(flight_number) : "—"}</li>
<li><strong>Accessibility needs:</strong> ${accessibility_needs ? escapeHtml(accessibility_needs) : "—"}</li>
<li><strong>Child seats:</strong> ${child_seats_needed ? escapeHtml(child_seats_needed) : "—"}</li>
<li><strong>Source:</strong> ${escapeHtml(source)}</li>
<li><strong>Lead type:</strong> ${escapeHtml(lead_type)}</li>
<li><strong>Next action:</strong> Review route request</li>
</ul>
<h3>Owner notes</h3>
<pre style="white-space:pre-wrap;font-size:14px;background:#f6f8fb;padding:12px;border-radius:8px">${escapeHtml(
    owner_notes
  )}</pre>
<h3>Notes</h3>
<pre style="white-space:pre-wrap;font-size:14px;background:#f6f8fb;padding:12px;border-radius:8px">${escapeHtml(
    notes || "—"
  )}</pre>
<h3>AI summary</h3>
<pre style="white-space:pre-wrap;font-size:14px;background:#f6f8fb;padding:12px;border-radius:8px">${escapeHtml(
    ai_summary || "—"
  )}</pre>
<h3>Conversation excerpt</h3>
<pre style="white-space:pre-wrap;font-size:14px;background:#f6f8fb;padding:12px;border-radius:8px">${escapeHtml(
    conversation_excerpt || "—"
  )}</pre>
</body></html>`;

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
          subject: `Where To Go SA transport request ${requestId}`,
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
  }

  console.log("resend send result", {
    emailSent,
    emailErrorMessage,
  });

  // PATCH alert flags only when Twilio / Resend actually succeed
  const patch = {};
  if (smsSent) patch.alert_sms_sent = true;
  if (emailSent) patch.alert_email_sent = true;

  if (Object.keys(patch).length) {
    try {
      await fetch(
        `${supabaseUrl}/rest/v1/transportation_requests?id=eq.${encodeURIComponent(requestId)}`,
        {
          method: "PATCH",
          headers: restHeaders,
          body: JSON.stringify(patch),
        }
      );
    } catch {
      /* row still exists; PATCH optional */
    }
  }

  return json(200, {
    ok: true,
    supabase_inserted: true,
    request_id: requestId,
    sms_sent: smsSent,
    email_sent: emailSent,
    sms_error: smsSent ? null : smsErrorMessage,
    email_error: emailSent ? null : emailErrorMessage,
  });
};

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
