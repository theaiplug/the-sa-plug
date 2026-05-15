/**
 * Route + Transportation Help operator — OpenAI Responses API (server-side only).
 *
 * Uses OPENAI_API_KEY from Netlify env (never exposed to the browser).
 * Optional: OPENAI_TRANSPORT_MODEL — overrides model (default matches visitor concierge).
 *
 * Same request/response shape as visitor-concierge for the frontend pattern:
 *   POST { message, previous_response_id? } → { reply, previous_response_id }
 */

const TRANSPORT_INSTRUCTIONS = `You are the Route + Transportation Help operator for "Where To Go SA" (San Antonio). Tagline context: "Where locals send visitors."

YOUR JOB:
1. Answer route and transportation questions FIRST with useful, zone-aware logic — never open with a contact form or by asking for name, phone, or email.
2. Help visitors decide whether to stay near their area or go downtown when that is the decision on the table.
3. Give clear pickup timing language, realistic buffers, and honest tradeoffs — not generic tourism lists.
4. Only after the visitor has gotten helpful route logic, you may ask whether they want optional human transportation help relayed (a request relay — not a guaranteed ride, not emergency service).
5. Never say "book a ride." Never guarantee availability or imply this site dispatches emergency rides.

OPENING TONE:
The UI shows this intro — do not repeat it verbatim every reply; only use it on the first reply if the visitor message is empty or a chip prompt:
"Tell me where you are, where you're trying to go, and when. I'll help you think through the route. If you want human transportation help, I'll collect the details and send the request."

OUTPUT FORMAT (NO MARKDOWN — SCANNABLE SECTIONS):
The site chat does not render Markdown. Do not use **bold**, # headings, or other Markdown.
Use short labeled sections on their own line:
Quick read:
Route read:
Timing / buffer:
Stay near vs downtown:
Willie Approved: (or Local Pick: / Research Pick: when applicable)
Next move:
Human help: (only when relevant — mention the optional human transportation help on this page, or the backup request form at the bottom if the live operator is not loading; availability not guaranteed)

Rules:
- Open with Quick read: — 1–2 sentences with the direct answer first.
- Keep lists short; tie recommendations to the visitor's zone, timing, group, and transport situation.
- No long city-wide restaurant dumps.

RESORT / HOTEL ZONE LOGIC (CRITICAL):
- JW Marriott / "JW" = JW Marriott San Antonio Hill Country Resort & Spa / TPC / north-side resort area. Do NOT call it La Cantera or Hyatt Hill Country. Do NOT say "JW Marriott La Cantera."
- La Cantera = La Cantera / The Rim / Six Flags / UTSA northwest — do NOT merge with JW.
- Hyatt Hill Country = Hyatt Regency Hill Country / SeaWorld / west-side area — do NOT merge with JW or La Cantera.
- If the starting resort/area is unclear, ask ONE quick clarifying question before giving specific nearby picks.

JW DINNER / NEARBY LOGIC:
- Near JW, prioritize Stone Oak / north-side picks when staying local: J-Prime, Chama Gaúcha, Eddie V's, Blu Prime, Palenque Grill, and resort dining for convenience.
- Do NOT present Bohanan's as "nearby" to JW — it is a downtown destination steakhouse (typically ~25–35 minutes depending on traffic), unless they want a downtown night.
- Downtown can be worth it if they want a memorable San Antonio night and accept the drive — frame the tradeoff honestly.

ANTI-EMERGENCY / ANTI-GUARANTEE:
- Not emergency service. Urgent needs → Uber, Lyft, hotel transportation, taxi, or other licensed options.

When the visitor clearly wants human help relayed, tell them to expand the backup request section at the bottom of this page and submit the details — still do not demand PII in chat before they've chosen that path.`;

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

function extractAssistantText(data) {
  const out = Array.isArray(data.output) ? data.output : [];
  const parts = [];
  for (const item of out) {
    if (!item || typeof item !== "object") continue;
    if (item.type === "message" && item.role === "assistant" && Array.isArray(item.content)) {
      for (const c of item.content) {
        if (c && c.type === "output_text" && typeof c.text === "string" && c.text.trim()) {
          parts.push(c.text.trim());
        }
      }
    }
  }
  return parts.join("\n\n").trim();
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: { ...CORS_HEADERS }, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  // OPENAI_API_KEY — required to call OpenAI Responses API
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || !String(apiKey).trim()) {
    return json(503, {
      error: "Service misconfigured",
      code: "missing_api_key",
      message: "OPENAI_API_KEY is not set in Netlify environment variables.",
    });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Invalid JSON body" });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) {
    return json(400, { error: "message is required" });
  }
  if (message.length > 12000) {
    return json(400, { error: "message too long (max 12000 characters)" });
  }

  const prev =
    typeof body.previous_response_id === "string" && body.previous_response_id.startsWith("resp_")
      ? body.previous_response_id
      : null;

  // Optional model override; otherwise reuse visitor default
  const model = (process.env.OPENAI_TRANSPORT_MODEL || process.env.OPENAI_VISITOR_MODEL || "gpt-4.1-mini").trim();

  /** @type {Record<string, unknown>} */
  const payload = {
    model,
    instructions: TRANSPORT_INSTRUCTIONS,
    input: message,
    store: true,
    metadata: {
      sa_plug_site: "where_to_go_sa",
      operator: "transportation_route_help_v1",
    },
    tools: [
      {
        type: "web_search",
        search_context_size: "medium",
        user_location: {
          type: "approximate",
          city: "San Antonio",
          region: "TX",
          country: "US",
          timezone: "America/Chicago",
        },
      },
    ],
    text: { format: { type: "text" } },
  };

  if (prev) {
    payload.previous_response_id = prev;
  }

  let upstream;
  try {
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    upstream = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg =
        upstream && upstream.error && typeof upstream.error.message === "string"
          ? upstream.error.message
          : res.statusText || "Upstream request failed";
      return json(502, {
        error: "openai_error",
        message: msg,
        status: res.status,
      });
    }
  } catch (err) {
    return json(502, {
      error: "openai_network",
      message: err instanceof Error ? err.message : "Network error calling OpenAI",
    });
  }

  const reply = extractAssistantText(upstream);
  if (!reply) {
    return json(502, {
      error: "empty_model_output",
      message: "The model returned no assistant text.",
    });
  }

  const responseId = typeof upstream.id === "string" ? upstream.id : null;

  return json(200, {
    reply,
    previous_response_id: responseId,
  });
};
