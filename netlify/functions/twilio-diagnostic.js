/**
 * Temporary Twilio diagnostic — lists Incoming Phone Numbers for the same credentials
 * as transportation SMS (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER).
 *
 * Response uses masked numbers and metadata only (no full SIDs/tokens/unmasked PN).
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

function digitsLast6(digitsString) {
  const d = String(digitsString || "");
  if (d.length === 0) return null;
  return d.length <= 6 ? d : d.slice(-6);
}

function digitsLast4(phoneE164) {
  const d = digitsOnly(phoneE164);
  if (d.length === 0) return "—";
  return d.length <= 4 ? d : d.slice(-4);
}

/**
 * Mask for safe comparison shape, e.g. NANP "+1830***3353" (+1 + area + *** + last4).
 */
function maskPhoneForDiagnostic(pn) {
  const d = digitsOnly(pn);
  if (d.length === 0) return "—";
  if (d.length < 4) {
    return `+${"*".repeat(d.length)}`;
  }
  const last4 = d.slice(-4);
  if (d.length === 11 && d.startsWith("1")) {
    return `+1${d.slice(1, 4)}***${last4}`;
  }
  const minStars = 3;
  const maxPrefix = 4;
  const prefixLen = Math.min(maxPrefix, Math.max(0, d.length - 4 - minStars));
  const stars = Math.max(minStars, d.length - 4 - prefixLen);
  return `+${d.slice(0, prefixLen)}${"*".repeat(stars)}${last4}`;
}

/** Coarse safe country buckets only (avoid guessing ambiguous prefixes). */
function countryPrefixSafe(digits) {
  const d = String(digits || "");
  if (d.length < 4) return null;
  if (d.length === 11 && d[0] === "1") return "+1";
  if (d.startsWith("44")) return "+44";
  if (d.startsWith("49")) return "+49";
  if (d.startsWith("61")) return "+61";
  if (d.startsWith("353")) return "+353";
  if (d.startsWith("27")) return "+27";
  return null;
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
  const configuredFromDigits = configuredFromNumber ? digitsOnly(configuredFromNumber) : "";

  /** @type {Set<string>} */
  const ownedLast4Set = new Set();
  /** @type {Array<{ masked: string, digitLength: number, country: string | null, digitsTail: string | null }>} */
  const ownedEntries = [];
  let ownedNumbersFullMatch = false;
  let matchCandidateCount = 0;
  /** @type {boolean | null} */
  let smsCapableMatch = null;
  /** @type {boolean | null} */
  let voiceCapableMatch = null;
  /** @type {string | null} */
  let diagnosticError = null;
  /** @type {boolean} */
  let completedListOk = false;

  const respondList = () => {
    const cfgDigits = configuredFromNumber ? digitsOnly(configuredFromNumber) : "";
    const configuredFromDigitsLength = cfgDigits.length > 0 ? cfgDigits.length : null;
    const configuredFromDigitsTail = cfgDigits ? digitsLast6(cfgDigits) : null;
    const configuredFromLast4 =
      cfgDigits.length === 0
        ? null
        : cfgDigits.length <= 4
          ? cfgDigits
          : cfgDigits.slice(-4);

    ownedEntries.sort((a, b) => a.masked.localeCompare(b.masked));
    const ownedNumbersMasked = ownedEntries.map((e) => e.masked);
    const ownedNumberDigitLengths = ownedEntries.map((e) => e.digitLength);
    const ownedNumbersDigitsTail = ownedEntries.map((e) => e.digitsTail);
    const countrySet = new Set();
    for (const e of ownedEntries) {
      if (e.country) countrySet.add(e.country);
    }
    const ownedNumbersCountryPrefixes = Array.from(countrySet).sort();

    const configuredFromMasked =
      configuredFromNumber && String(configuredFromNumber).trim()
        ? maskPhoneForDiagnostic(configuredFromNumber)
        : null;

    return {
      ok: diagnosticError === null && completedListOk,
      accountSidPrefix: accountSidPrefix(twilioSid),
      configuredFromNumber: configuredFromMasked,
      configuredFromLast4,
      configuredFromDigitsLength,
      configuredFromDigitsTail,
      fullMatchMethod: "digitsOnly",
      matchCandidateCount,
      ownedNumbersLast4: Array.from(ownedLast4Set).sort(),
      ownedNumbersMasked,
      ownedNumberDigitLengths,
      ownedNumbersDigitsTail,
      ownedNumbersCountryPrefixes,
      ownedNumbersFullMatch,
      smsCapableMatch,
      voiceCapableMatch,
      diagnosticError,
    };
  };

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

        const pnDigits = digitsOnly(pn);
        ownedLast4Set.add(digitsLast4(pn));
        ownedEntries.push({
          masked: maskPhoneForDiagnostic(pn),
          digitLength: pnDigits.length,
          country: countryPrefixSafe(pnDigits),
          digitsTail: digitsLast6(pnDigits),
        });

        if (
          configuredFromDigits.length > 0 &&
          pnDigits.length > 0 &&
          configuredFromDigits === pnDigits
        ) {
          matchCandidateCount += 1;
          if (!ownedNumbersFullMatch) {
            ownedNumbersFullMatch = true;
            smsCapableMatch = capabilityBool(row.capabilities, "sms");
            voiceCapableMatch = capabilityBool(row.capabilities, "voice");
          }
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
