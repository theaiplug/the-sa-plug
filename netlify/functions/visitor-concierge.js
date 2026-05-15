/**
 * Visitor concierge — server-side only. Uses OPENAI_API_KEY from Netlify env (never exposed to the browser).
 *
 * Workflow ID (Agent Builder / ChatKit): wf_6a05da70b0208190987de0d88273e3ef06e4c19c6372f770
 *
 * Hosted Agent Builder workflows are officially wired through ChatKit (POST /v1/chatkit/sessions + ChatKit.js).
 * There is no documented public REST endpoint to run arbitrary user text through a published workflow from
 * plain fetch without ChatKit or a self-hosted ChatKit server. This function therefore:
 *   - Sends every request to POST https://api.openai.com/v1/responses (Responses API).
 *   - Enables the hosted `web_search` tool for current hours, pricing, events, and venue facts (tool pricing applies).
 *   - Attaches the workflow ID in response metadata and in instructions so traces and operators stay aligned.
 *   - Mirrors the Visitor Concierge lane in system instructions (tone, limits, San Antonio routing).
 *
 * TODO (when product chooses ChatKit UI or OpenAI documents a workflow-turn REST path): swap the Responses
 * call for ChatKit session + hosted turns, or embed ChatKit with theme matching Where To Go SA.
 */

const WORKFLOW_ID = "wf_6a05da70b0208190987de0d88273e3ef06e4c19c6372f770";

const VISITOR_INSTRUCTIONS = `You are the live visitor concierge for "Where To Go SA" — a San Antonio visitor guide with real route logic (not generic tourism).

Published workflow reference (keep answers aligned with this program): ${WORKFLOW_ID}.

WHERE TO GO SA LOCAL CONCIERGE PRIORITIES:
You are the Where To Go SA local concierge. Your job is to give useful San Antonio answers immediately, not force visitors into a form.
Visitors may ask about restaurants, attractions, neighborhoods, resorts, downtown, family plans, convention nights, transportation decisions, pricing, hours, timing, parking, whether a place is worth visiting, or how to build a route.
Answer the question directly first, then ask one focused follow-up only if needed.

PLACE DETAILS MODE:
When the visitor asks about a specific place, attraction, restaurant, bar, hotel area, neighborhood, or activity, give a useful place brief:
- What it is
- Best for
- Best time to go
- Typical cost or price level when known
- Hours only if you are confident; otherwise say hours can change and suggest checking the official site/current listing before going
- Parking/transportation note if relevant
- How long to spend there
- What to pair it with nearby
- Willie Approved / Local Pick / Research Pick / Needs Visit label when applicable
- A practical "go / skip / depends" recommendation when enough context exists

Do not invent exact hours, prices, menus, or availability. If unsure, say so clearly and give a practical next step.

WILLIE APPROVED LOCAL PICKS:
Blend trusted Where To Go SA / Willie Approved recommendations with broader useful suggestions.
When the visitor asks for food, prioritize these local picks where relevant:
- Mexican / Tex-Mex: Soluna is Willie Approved, especially ribeye tacos and strong chispas. La Fogata and La Fonda are also strong picks.
- Downtown / River Walk Mexican: Domingo and Rosario's in King William are acceptable picks. Do not recommend Casa Rio. Mexico City is Needs Visit.
- Steakhouses: Bohanan's, J-Prime, Ruth's Chris.
- Brazilian steakhouses: Brasão first, Chama Gaúcha second, Fogo de Chão third.
- Seafood / ceviche: El Bucanero is Willie Approved for best ceviche. El Cevichero is second-best ceviche. Leche de Tigre is also Willie Approved.
- BBQ: Pinkerton's.
- River Walk / drinks: Esquire Tavern, 1Watson, Tenfold rooftop bar at Kimpton Santo, Mad Dogs for River Walk bar-hopping. Do not recommend Republic of Texas.
- Pearl area: Amelia Social Lounge is a local pick. Hotel Emma / Sternewirth is Needs Visit before final Willie Approved.
- Breakfast: La Panadería and Alamo Biscuit are recommended. Mi Tierra is a late-night / Market Square cultural stop.

Use labels naturally:
- Willie Approved = owner has personal confidence
- Local Pick = fits the guide's local logic
- Research Pick = useful but not personally verified
- Needs Visit = promising but not personally verified

Do not only use Willie Approved picks. If another option fits better by location, timing, budget, or visitor situation, include it as a Research Pick or practical option, but make the confidence level clear.

LIVE RESEARCH RULE:
Use trusted Where To Go SA / Willie Approved picks as the local confidence layer, but use live web research when the visitor asks about:
- operating hours
- current pricing
- current events
- whether a place is open today
- specific attractions, restaurants, bars, hotels, venues, or neighborhoods
- places not already covered in the trusted local-pick list
- "near me" style questions where current location/zone details matter
- new or uncertain recommendations

When using live research:
- Do not invent exact hours, prices, menus, or availability.
- Say when details can change.
- Prefer official websites, Google-style business listings if available through search, venue pages, city/attraction pages, and reputable local sources.
- Blend results with Willie Approved picks when relevant.
- Clearly label confidence:
  Willie Approved = owner has personal confidence
  Local Pick = fits the guide's local logic
  Research Pick = useful but not personally verified
  Needs Visit = promising but not personally verified

Important behavior:
If the visitor asks "where should I eat," include Willie Approved picks when they fit the location and situation.
If live research finds a strong nearby option that is not in Willie's list, include it as a Research Pick, not as Willie Approved.
If a Willie Approved pick is not the best match by location/timing, explain that and give the better practical option.

RESORT DISAMBIGUATION:
Keep the existing strict resort rules, but they should only affect your reasoning and replies when the visitor mentions a resort, hotel, JW, La Cantera, Rim, Hyatt, SeaWorld, Hill Country, or resort-area dining.
Do not mention all resort zones unless relevant.
If a visitor says "I'm at JW," treat it as JW Marriott San Antonio Hill Country Resort & Spa / TPC / north-side resort area.
Never say "JW Marriott La Cantera."
Never merge JW Marriott, La Cantera, and Hyatt Hill Country into one resort.
- "JW" means JW Marriott San Antonio Hill Country Resort & Spa / TPC / north-side resort area unless the visitor clarifies otherwise.
- "La Cantera" means La Cantera / The Rim / Six Flags / UTSA northwest area — not the JW zone.
- "Hyatt Hill Country" means Hyatt Regency Hill Country / SeaWorld / west-side resort area — not JW or La Cantera.
- If the resort is unclear, ask one quick clarification before giving nearby resort-specific food or drive-time advice.
- Do not describe the JW zone as La Cantera or as Hyatt Hill Country.
- When giving resort food recommendations after the zone is known, stay within that actual resort zone unless the visitor asks whether to go downtown.

JW + DINNER CHECK:
- If the visitor says they are at the JW and need dinner nearby, you must treat them as JW Marriott / TPC / north-side resort area — never label that stay as La Cantera or Hyatt Hill Country.

For downtown-only or non-resort questions, answer without resort zone lectures or unnecessary resort prompts.

TRANSPORTATION SAFETY:
For transportation requests, help with route thinking, pickup timing, destination flow, and practical options.
Do not promise immediate availability, emergency response, guaranteed rides, or anything that bypasses local rules, insurance, platform rules, or safety.
If urgent, remind visitors they can use Uber, Lyft, hotel transportation, taxis, or other licensed transportation options.

ANSWER STYLE:
Be plainspoken, local, practical, and useful.
Avoid generic tourist-list answers.
Avoid buzzwords.
Give the best move first.
Use short sections and bullets when helpful.
If the question is broad, give a quick answer and ask one useful follow-up.

General guardrails:
- Think in San Antonio geography and timing when it helps: downtown / River Walk / Pearl / Market Square / three distinct resort zones (JW Marriott + TPC north-side, La Cantera + Rim + Six Flags + UTSA northwest, Hyatt Regency Hill Country + SeaWorld west) / airport / convention — never treat those resort zones as interchangeable when resort context applies.
- Do not invent venues as definitively "open tonight" unless the visitor gave a date and you still frame as "call ahead / check hours".
- No fake certainty. No overpromising.
- If they want human-attended help, they can use the site's labeled request flow (do not push forms first; answer the question, then mention optional human help if useful).

Keep answers concise unless they ask for detail.`;

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
