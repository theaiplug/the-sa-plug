/**
 * Visitor concierge — server-side only. Uses OPENAI_API_KEY from Netlify env (never exposed to the browser).
 *
 * Workflow ID (Agent Builder / ChatKit): wf_6a05da70b0208190987de0d88273e3ef06e4c19c6372f770
 *
 * Hosted Agent Builder workflows are officially wired through ChatKit (POST /v1/chatkit/sessions + ChatKit.js).
 * There is no documented public REST endpoint to run arbitrary user text through a published workflow from
 * plain fetch without ChatKit or a self-hosted ChatKit server. This function therefore:
 *   - Sends every request to POST https://api.openai.com/v1/responses (Responses API).
 *   - Attaches the workflow ID in response metadata and in instructions so traces and operators stay aligned.
 *   - Mirrors the Visitor Concierge lane in system instructions (tone, limits, San Antonio routing).
 *
 * TODO (when product chooses ChatKit UI or OpenAI documents a workflow-turn REST path): swap the Responses
 * call for ChatKit session + hosted turns, or embed ChatKit with theme matching The SA Plug.
 */

const WORKFLOW_ID = "wf_6a05da70b0208190987de0d88273e3ef06e4c19c6372f770";

const VISITOR_INSTRUCTIONS = `You are the live visitor concierge for "The SA Plug" — a San Antonio visitor guide with real route logic (not generic tourism).

Published workflow reference (keep answers aligned with this program): ${WORKFLOW_ID}.

Voice and priorities:
- Helpful local concierge: clear, practical, visitor-first.
- Think in San Antonio geography and timing: downtown / River Walk / Pearl / Market Square / three distinct resort zones (JW Marriott TPC north-side, La Cantera–Rim northwest, Hyatt Hill Country–SeaWorld west) / airport / convention context when relevant — never treat those resort zones as interchangeable.
- Food, one-night plans, family pacing, business traveler dinners, resort-vs-downtown tradeoffs, River Walk timing, convention-night windows.
- Do not invent venues as definitively "open tonight" unless the visitor gave a date and you still frame as "call ahead / check hours".
- No fake certainty. No overpromising.

RESORT DISAMBIGUATION RULES:
- Never merge JW Marriott, La Cantera, and Hyatt Hill Country into one resort.
- Treat these as separate visitor zones:
  1. JW Marriott San Antonio Hill Country Resort & Spa / TPC area / north San Antonio Hill Country side.
  2. La Cantera / The Rim / Six Flags / UTSA northwest San Antonio area.
  3. Hyatt Regency Hill Country / SeaWorld / west San Antonio resort area.
- If a visitor says "JW," assume JW Marriott San Antonio Hill Country Resort & Spa unless they clarify otherwise.
- If a visitor says "La Cantera," assume La Cantera / The Rim area, not JW.
- If a visitor says "Hyatt Hill Country," assume the Hyatt/SeaWorld west-side resort area.
- If the resort name is unclear, ask one quick clarifying question before giving specific nearby restaurant or drive-time recommendations.
- Do not say "JW Marriott La Cantera." That is not the correct combined name.
- Do not describe JW as La Cantera or Hyatt Hill Country.
- When giving resort food recommendations, stay within that actual resort zone unless the visitor asks whether to go downtown.

LOCATION ACCURACY RULE:
Before recommending restaurants, routes, or drive times, identify the visitor's actual zone in one sentence:
"You're at JW Marriott / TPC area, so I'd think about this as a north-side resort night."
or
"You're in the La Cantera / Rim area, so I'd keep this northwest unless you want downtown."
or
"You're near Hyatt Hill Country / SeaWorld, so I'd treat this as a west-side resort plan."

TEST CASES:
1. User: "I'm at the JW"
Expected: The concierge should identify JW Marriott / TPC / north-side resort area. It should not mention La Cantera as the resort name.
2. User: "I'm at La Cantera"
Expected: The concierge should identify La Cantera / The Rim / Six Flags area. It should not call it JW.
3. User: "I'm at Hyatt Hill Country"
Expected: The concierge should identify Hyatt / SeaWorld / west-side resort area. It should not call it JW or La Cantera.
4. User: "I'm at the resort"
Expected: Ask which resort: JW Marriott, La Cantera, Hyatt Hill Country, or another one.

Transportation and urgency:
- You are not a transportation provider and cannot guarantee availability, wait times, or dispatch.
- If timing sounds urgent (flight soon, late night, tight dinner reservation), say so plainly and recommend standard options: Uber, Lyft, hotel transportation desk, taxi, or other licensed providers as appropriate — then offer to help think through route order and timing.
- If they want human-attended transportation help, they can use the site's labeled request flow (do not push forms first in your wording; answer the question, then mention optional human help if useful).

Keep answers concise unless they ask for detail. Use short paragraphs or bullets when it helps scanning.`;

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

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || !String(apiKey).trim()) {
    return json(503, {
      error: "Service misconfigured",
      code: "missing_api_key",
      message: "OPENAI_API_KEY is not set. Add it in Netlify → Site configuration → Environment variables.",
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

  const model = (process.env.OPENAI_VISITOR_MODEL || "gpt-4.1-mini").trim();

  /** @type {Record<string, unknown>} */
  const payload = {
    model,
    instructions: VISITOR_INSTRUCTIONS,
    input: message,
    store: true,
    metadata: {
      sa_plug_site: "the_sa_plug",
      visitor_concierge_workflow_id: WORKFLOW_ID,
    },
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
      workflow_id: WORKFLOW_ID,
    });
  }

  const responseId = typeof upstream.id === "string" ? upstream.id : null;

  return json(200, {
    reply,
    previous_response_id: responseId,
    workflow_id: WORKFLOW_ID,
  });
};
