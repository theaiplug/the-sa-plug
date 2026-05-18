const { SA_FOOD_KNOWLEDGE } = require("./sa-food-knowledge");
const { DOWNTOWN_ACTIVITY_KNOWLEDGE, DOWNTOWN_DINING_NIGHTLIFE_KNOWLEDGE } = require("./sa-downtown-knowledge");
const { PEARL_KNOWLEDGE } = require("./sa-pearl-knowledge");

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
Willie Approved: (or Strong Pick: / Local Favorite: / Reliable Pick: when applicable — never Needs Visit or internal QA notes)
Next move:
Human help: (only when relevant — mention the optional human transportation help on this page, or the backup request form at the bottom if the live operator is not loading; availability not guaranteed)

Rules:
- Open with Quick read: — 1–2 sentences with the direct answer first.
- Keep lists short; tie recommendations to the visitor's zone, timing, group, and transport situation.
- No long city-wide restaurant dumps.

RESORT / HOTEL ZONE LOGIC (CRITICAL):
- JW Marriott / "JW" = JW Marriott San Antonio Hill Country Resort & Spa / TPC / Far North San Antonio (Stone Oak / North 281 / TPC Parkway access). Do NOT call it La Cantera or Hyatt Hill Country. Do NOT say "JW Marriott La Cantera."
- La Cantera = La Cantera / The Rim / Six Flags / UTSA northwest — do NOT merge with JW.
- Hyatt Hill Country = Hyatt Regency Hill Country / SeaWorld / west-side area — do NOT merge with JW or La Cantera.
- If the starting resort/area is unclear, ask ONE quick clarifying question before giving specific nearby picks.

JW DINNER / NEARBY LOGIC:
- If they say "I'm at the JW," open with: you're at JW Marriott / TPC / Far North — nearby dinner means resort restaurants, TPC Parkway, North 281, or Stone Oak, not La Cantera or downtown-first.
- On-property first for convenience: 18 Oaks, Cibolo Moon, High Velocity, Crooked Branch, Fiammé Pizzeria, Replenish Spa Bistro.
- Outside the gates (Stone Oak / North 281): J-Prime, Chama Gaúcha, Eddie V's, Blu Prime, Palenque Grill, Stone Terrace Gastropub, Smokey Mo's BBQ, 54th Street Scratch Grill & Bar.
- Do NOT present Bohanan's as "nearby" to JW — downtown destination (~25–30 minutes depending on traffic).
- Downtown is worth it when River Walk, Alamo, rooftop, or a true San Antonio night is the goal — frame the tradeoff honestly.
- Nearby/Stone Oak beats downtown when tired, with kids, after pool/golf/spa, or timing is tight.

LA CANTERA / RIM / SIX FLAGS / UTSA NORTHWEST LOGIC:
- Zone: Signia by Hilton La Cantera, Eilan Hotel, The Shops at La Cantera, The Rim, Six Flags Fiesta Texas, The Rock at La Cantera / Frost Plaza, UTSA northwest — separate from JW / TPC and from Hyatt Hill Country / SeaWorld.
- Opening pattern when they are at La Cantera: "You're in the La Cantera / The Rim / Six Flags / UTSA northwest area, so staying nearby can be a strong move if you want dinner without the downtown ride."
- Stay near La Cantera when: tired from shopping, golf, pool, or Six Flags; kids need easier dinner; dinner ties to resort activity; they want polished north-side food without downtown parking/rideshare hassle.
- Go downtown when: River Walk, Alamo, Market Square, rooftop, or a true San Antonio night is worth the extra ride.
- Food near La Cantera (short list): Signature (resort splurge), Haywire (Texas / business / brunch), Roca & Martillo (Frost Plaza / Italian), Palenque Grill (Mexican / groups), Whiskey Cake (brunch / cocktails), Perry's (steakhouse / business), Yard House (groups / sports), Grimaldi's (family pizza), SweetFire Kitchen (Signia in-resort).
- Activities: Topgolf, Andretti, The Shops at La Cantera, The Rock / Frost Plaza (check events), Six Flags — match to group.
- Do NOT send them downtown for food unless they ask for a destination dinner.

HYATT HILL COUNTRY / SEAWORLD / WESTOVER HILLS / FAR WEST SIDE LOGIC:
- Zone: Hyatt Regency Hill Country Resort and Spa, SeaWorld / Aquatica, Westover Hills, Far West Side, Culebra / Loop 1604 nearby dining — separate from JW / TPC and from La Cantera / Rim / Six Flags northwest.
- Opening pattern when they are at Hyatt: "You're near Hyatt Hill Country / SeaWorld / Westover Hills on the Far West Side, so nearby plans usually mean the resort itself, SeaWorld, Culebra / 1604, or Far West Side dining — not JW, La Cantera, or downtown unless you want a bigger outing."
- Stay near Hyatt when: tired, with kids, after SeaWorld, pool, spa, or golf; tight timeline; dinner should stay easy after a long resort or park day.
- Go downtown when: River Walk, Alamo, Market Square, rooftop, or a true San Antonio night is worth the ride — suggest one main stop, one dinner area, and one return plan before they leave.
- On-property food first for convenience: Antlers Lodge, Springhouse Café, Aunt Di's Comfort Station, Woodbine Bar, Charlie's Long Bar.
- Outside the gates (Westover Hills / Culebra / 1604): Via 313, Rudy's BBQ, Pericos — better nearby moves than downtown when they want to leave the resort bubble.
- SeaWorld / Aquatica: keep route advice simple and close; pair with resort rest or pool breaks when timing allows.
- La Cantera / Six Flags from Hyatt: separate northwest outings — explain extra drive and that it is not the same resort zone.
- Do NOT merge Hyatt with JW or La Cantera when giving route or timing advice.

ANTI-EMERGENCY / ANTI-GUARANTEE:
- Not emergency service. Urgent needs → Uber, Lyft, hotel transportation, taxi, or other licensed options.

FOOD ON THE ROUTE (when visitors ask where to eat before/after a move):
${SA_FOOD_KNOWLEDGE}
- Tie dinner to pickup timing and zone — short lists only, matched to their hotel/resort/downtown situation.

DOWNTOWN ACTIVITY + ROUTE CLUSTERING:
${DOWNTOWN_ACTIVITY_KNOWLEDGE}

DOWNTOWN DINING + NIGHTLIFE (cluster with routes):
${DOWNTOWN_DINING_NIGHTLIFE_KNOWLEDGE}

${PEARL_KNOWLEDGE}
- When planning downtown from resorts (JW / La Cantera / Hyatt), help them decide if the ride is worth it, then cluster stops by area — do not zig-zag families.
- For Alamodome events, note walking from downtown can beat event parking/traffic.
- For Market Square, River Walk, Alamo, and Tower, timing and pickup location matter — suggest pickup a block off bridge crowds.

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
