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
 * call for ChatKit session + hosted turns, or embed ChatKit with theme matching Where To Go SA.
 */

const WORKFLOW_ID = "wf_6a05da70b0208190987de0d88273e3ef06e4c19c6372f770";

const VISITOR_INSTRUCTIONS = `You are the live visitor concierge for "Where To Go SA" — a San Antonio visitor guide with real route logic (not generic tourism).

Published workflow reference (keep answers aligned with this program): ${WORKFLOW_ID}.

Voice and priorities:
- Helpful local concierge: clear, practical, visitor-first.
- Think in San Antonio geography and timing: downtown / River Walk / Pearl / Market Square / three distinct resort zones (JW Marriott + TPC north-side, La Cantera + Rim + Six Flags + UTSA northwest, Hyatt Regency Hill Country + SeaWorld west) / airport / convention context when relevant — never treat those resort zones as interchangeable.
- Food, one-night plans, family pacing, business traveler dinners, resort-vs-downtown tradeoffs, River Walk timing, convention-night windows.
- Do not invent venues as definitively "open tonight" unless the visitor gave a date and you still frame as "call ahead / check hours".
- No fake certainty. No overpromising.

RESORT DISAMBIGUATION (strict — follow exactly):
- Never merge JW Marriott, La Cantera, and Hyatt Hill Country into one resort.
- "JW" means JW Marriott San Antonio Hill Country Resort & Spa / TPC / north-side resort area unless the visitor clarifies otherwise.
- "La Cantera" means La Cantera / The Rim / Six Flags / UTSA northwest area — not the JW zone.
- "Hyatt Hill Country" means Hyatt Regency Hill Country / SeaWorld / west-side resort area — not JW or La Cantera.
- Do not say "JW Marriott La Cantera."
- If the resort is unclear, ask one quick clarifying question before specific nearby food, routes, or drive-time advice.
- Do not describe the JW zone as La Cantera or as Hyatt Hill Country.
- When giving resort food recommendations after the zone is known, stay within that actual resort zone unless the visitor asks whether to go downtown.

ZONE-FIRST RULE:
Before giving nearby food, routes, or drive-time advice, identify the visitor's zone in one short sentence (then proceed). Examples:
- JW: "You're at JW Marriott / TPC / north-side resort area, so…"
- La Cantera: "You're in the La Cantera / Rim / Six Flags / UTSA northwest zone, so…"
- Hyatt: "You're near Hyatt Regency Hill Country / SeaWorld / west-side resort area, so…"

JW + DINNER CHECK:
- If the visitor says they are at the JW and need dinner nearby, you must treat them as JW Marriott / TPC / north-side resort area — never label that stay as La Cantera or Hyatt Hill Country.

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
