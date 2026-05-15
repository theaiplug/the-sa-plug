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

function digitsOnlyCompare(a, b) {
  const d1 = String(a || "").replace(/\D/g, "");
  const d2 = String(b || "").replace(/\D/g, "");
  return d1.length > 0 && d2.length > 0 && d1 === d2;
}

function capabilityBool(capabilities, key) {
  if (!capabilities || typeof capabilities !== "object") return null;
  if (!Object.prototype.hasOwnProperty.call(capabilities, key)) return null;
  const v = capabilities[key];
  if (v === true || v === "true") return true;
  if (v === false || v === "false") return false;
  return null;
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

  /** @type {Set<string>} */
  const ownedLast4Set = new Set();
  let ownedNumbersFullMatch = false;
  /** @type {boolean | null} */
  let smsCapableMatch = null;
  /** @type {boolean | null} */
  let voiceCapableMatch = null;
  /** @type {string | null} */
  let diagnosticError = null;
  /** @type {boolean} */
  let completedListOk = false;

  const respondList = () => ({
    ok: diagnosticError === null && completedListOk,
    accountSidPrefix: accountSidPrefix(twilioSid),
    configuredFromNumber: configuredFromNumber || null,
    ownedNumbersLast4: Array.from(ownedLast4Set).sort(),
    ownedNumbersFullMatch,
    smsCapableMatch,
    voiceCapableMatch,
    diagnosticError,
  });

  if (!twilioSid || !String(twilioSid).trim() || !twilioToken || !String(twilioToken).trim()) {
    diagnosticError = "Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN.";
    const body = respondList();
    console.log(JSON.stringify(body));
    return json(503, body);
  }

  const sidTrimmed = String(twilioSid).trim();
  const auth = Buffer.from(`${sidTrimmed}:${String(twilioToken).trim()}`).toString("base64");

  let listUrl = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(
    sidTrimmed
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
        diagnosticError = safeTwilioErrorFromBody(text);
        const body = respondList();
        console.log(JSON.stringify(body));
        return json(200, body);
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        diagnosticError = "Twilio list response was not valid JSON.";
        const body = respondList();
        console.log(JSON.stringify(body));
        return json(200, body);
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

        if (configuredFromNumber && digitsOnlyCompare(pn, configuredFromNumber)) {
          ownedNumbersFullMatch = true;
          smsCapableMatch = capabilityBool(row.capabilities, "sms");
          voiceCapableMatch = capabilityBool(row.capabilities, "voice");
        }
      }

      listUrl = resolveTwilioNextUrl(data.next_page_uri);
    }
    completedListOk = true;
  } catch (e) {
    diagnosticError =
      e instanceof Error ? e.message.slice(0, SAFE_ERR_LEN) : "Incoming phone numbers request failed.";
    const body = respondList();
    console.log(JSON.stringify(body));
    return json(200, body);
  }

  const body = respondList();
  console.log(JSON.stringify(body));
  return json(200, body);
};
