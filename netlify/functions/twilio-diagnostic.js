/**
 * Temporary Twilio diagnostic — lists Incoming Phone Numbers for the same credentials
 * as transportation SMS (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER).
 *
 * Remove or protect this function after debugging (response includes last-4 digits of owned numbers).
 *
 * GET /.netlify/functions/twilio-diagnostic
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const SAFE_ERR_LEN = 500;

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...CORS_HEADERS,
    },
    body: JSON.stringify(body),
  };
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

function accountSidPrefix(sid) {
  const s = String(sid || "");
  return s.length >= 6 ? s.slice(0, 6) : s;
}

function digitsLast4(phoneE164) {
  const d = String(phoneE164 || "").replace(/\D/g, "");
  if (d.length === 0) return "—";
  return d.length <= 4 ? d : d.slice(-4);
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

  if (event.httpMethod !== "GET") {
    return json(405, { error: "Method not allowed" });
  }

  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const configuredFromNumber =
    process.env.TWILIO_FROM_NUMBER != null ? String(process.env.TWILIO_FROM_NUMBER).trim() : "";

  const basePayload = {
    accountSidPrefix: accountSidPrefix(twilioSid),
    configuredFromNumber: configuredFromNumber || null,
    ownedNumbersLast4: [],
    ownedNumbersFullMatch: false,
    smsCapableMatch: null,
    diagnosticError: null,
  };

  if (!twilioSid || !String(twilioSid).trim() || !twilioToken || !String(twilioToken).trim()) {
    basePayload.diagnosticError = "Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN.";
    console.log("twilio-diagnostic", basePayload);
    return json(503, basePayload);
  }

  const auth = Buffer.from(`${String(twilioSid).trim()}:${String(twilioToken).trim()}`).toString(
    "base64"
  );

  const ownedLast4Set = new Set();
  let ownedNumbersFullMatch = false;
  /** @type {boolean | null} */
  let smsCapableMatch = null;

  let listUrl = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(
    String(twilioSid).trim()
  )}/IncomingPhoneNumbers.json?PageSize=1000`;

  try {
    while (listUrl) {
      const res = await fetch(listUrl, {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: "application/json",
        },
      });

      const text = await res.text();
      if (!res.ok) {
        basePayload.diagnosticError = safeTwilioErrorFromBody(text);
        basePayload.ownedNumbersLast4 = Array.from(ownedLast4Set).sort();
        basePayload.ownedNumbersFullMatch = ownedNumbersFullMatch;
        basePayload.smsCapableMatch = smsCapableMatch;
        console.log("twilio-diagnostic", basePayload);
        return json(200, basePayload);
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        basePayload.diagnosticError = "Twilio list response was not valid JSON.";
        basePayload.ownedNumbersLast4 = Array.from(ownedLast4Set).sort();
        basePayload.ownedNumbersFullMatch = ownedNumbersFullMatch;
        basePayload.smsCapableMatch = smsCapableMatch;
        console.log("twilio-diagnostic", basePayload);
        return json(200, basePayload);
      }

      const items = Array.isArray(data.incoming_phone_numbers) ? data.incoming_phone_numbers : [];

      for (const row of items) {
        const pn =
          row && row.phone_number != null
            ? String(row.phone_number).trim()
            : row && row.phoneNumber != null
              ? String(row.phoneNumber).trim()
              : "";
        if (!pn) continue;

        ownedLast4Set.add(digitsLast4(pn));

        if (configuredFromNumber && pn === configuredFromNumber) {
          ownedNumbersFullMatch = true;
          const cap = row.capabilities;
          if (cap && typeof cap === "object" && Object.prototype.hasOwnProperty.call(cap, "sms")) {
            const v = cap.sms;
            if (v === true || v === "true") smsCapableMatch = true;
            else if (v === false || v === "false") smsCapableMatch = false;
            else smsCapableMatch = null;
          } else {
            smsCapableMatch = null;
          }
        }
      }

      listUrl = resolveTwilioNextUrl(data.next_page_uri);
    }
  } catch (e) {
    basePayload.diagnosticError =
      e instanceof Error ? e.message.slice(0, SAFE_ERR_LEN) : "Incoming phone numbers request failed.";
    basePayload.ownedNumbersLast4 = Array.from(ownedLast4Set).sort();
    basePayload.ownedNumbersFullMatch = ownedNumbersFullMatch;
    basePayload.smsCapableMatch = smsCapableMatch;
    console.log("twilio-diagnostic", basePayload);
    return json(200, basePayload);
  }

  basePayload.ownedNumbersLast4 = Array.from(ownedLast4Set).sort();
  basePayload.ownedNumbersFullMatch = ownedNumbersFullMatch;
  basePayload.smsCapableMatch = smsCapableMatch;

  console.log("twilio-diagnostic", basePayload);
  return json(200, basePayload);
};
