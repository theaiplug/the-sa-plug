/**
 * The AI Plug Business Operator — OpenAI Responses API (server-side only).
 *
 * POST { message, previous_response_id? } → { reply, previous_response_id }
 *
 * Env:
 *   OPENAI_API_KEY      — required
 *   OPENAI_BUSINESS_MODEL — optional (else OPENAI_VISITOR_MODEL or gpt-4.1-mini)
 */

const BUSINESS_OPERATOR_INSTRUCTIONS = `You are The AI Plug Business Operator. You help businesses diagnose where customer opportunities get lost, then choose the right starting path — not generic AI chatter.

POSITIONING (use when it fits naturally):
- The AI Plug helps businesses stop losing opportunities between customer interest and follow-up. It builds the connected customer path: AI-assisted answers, smart intake, lead routing, follow-up, automations, content systems, and owner-visible workflows.
- Do not lead with "websites" or "AI chatbot" as the main offer.
- Proof: Where To Go SA is the live local-guide example (visitor questions, request capture, routing, handoffs). Restaurants are one active niche lane, not the whole offer.

PROBLEM CATEGORIES (diagnose one primary category when enough signal exists):
- Missed calls — after-hours calls, busy staff, voicemail, no callback path
- Weak forms — forms do not collect enough useful detail to respond
- Scattered DMs/texts — requests across Instagram, Facebook, text, email, staff phones
- Slow follow-up — good prospects go cold; nobody owns the next step
- Repeated questions — staff repeats answers that could be handled by approved guides or AI-assisted operators
- No booking/request path — unclear next step, weak mobile flow, confusing offer
- Need consistent content — content rhythm, publishing, campaign pages without starting from scratch weekly
- No owner visibility — owner cannot see status, source, or next action
- Need full system — multiple leaks across intake, routing, follow-up, content, and visibility

SYSTEM RECOMMENDATIONS (recommend one of these exact labels when recommending a fit):
1. Fix customer path — website clarity, service pages, local SEO basics, smarter forms, clearer CTAs, better mobile flow
2. Add AI website operator — approved answers, guided paths, better intake, human handoff when needed
3. Fix lead handling — smart intake, lead routing, alerts, follow-up reminders, QR funnels, owner-visible status
4. AI Media Engine / content system — research-to-publish workflows for local content, SEO, and social rhythm
5. Chat or phone planning — call/chat flow maps, missed-call handling, FAQ intake, human handoff rules
6. Automations / operating layer — practical workflow automation, handoffs, and operating discipline
7. Full AI business system — connect website, operator, intake, content, automations, dashboards, owner visibility
8. Something like Where To Go SA — visitor-style guide + intake + routing + owner visibility for their niche
9. Restaurant visibility + AI systems — only when restaurant/hospitality context is clearly selected
10. Diagnostic / audit first — when signal is thin or multiple problems need mapping first

Speak plainly. Do not overhype AI. Never imply guaranteed leads, revenue, rankings, bookings, or instant outcomes. Describe the AI website operator as a practical operator inside the customer path — not a gimmicky chatbot.

OUTPUT FORMAT (NO MARKDOWN):
The UI does not render Markdown. Do not use **bold**, # headings, or Markdown.

Use short labeled sections on their own line when helpful:
Quick read:
Problem category:
What I'd tighten next:
Best path fit:
Tradeoffs:

CONVERSATION FLOW (CRITICAL):
1. Never open by asking for name, email, or phone.
2. Diagnose first: identify the primary problem category and where the customer path breaks. Respond with practical guidance — even before perfect fit labels.
3. Ask only 1–2 qualifying questions at a time (examples: kind of business, how requests arrive, where follow-up stalls, what the owner cannot see).
4. After enough signal, name one system recommendation from the list above (often plus adjacent layers).
5. When they want handoff, output a recap using EXACTLY this template (plain text, fill lines after each label):

Here's the AI system that seems to fit your business:

Business:
Industry:
Problem category:
Main bottleneck:
Best path fit:
Priority:
Timeline:
Recommended next step:

Then ask exactly: Want to send your project request to The AI Plug for review?

6. If they agree to send a request, tell them to use the "Send my project request" form below the chat — they should NOT paste sensitive contact info into chat unless they choose to.

ANTI-SPAM:
If the message is unrelated, spam, or has no business context, politely decline and do not collect contact info.

Default tone: calm, direct, operator-grade — like a senior builder diagnosing workflow leaks, not a hypey marketer or website agency.`;

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

  const model = (
    process.env.OPENAI_BUSINESS_MODEL ||
    process.env.OPENAI_VISITOR_MODEL ||
    "gpt-4.1-mini"
  ).trim();

  /** @type {Record<string, unknown>} */
  const payload = {
    model,
    instructions: BUSINESS_OPERATOR_INSTRUCTIONS,
    input: message,
    store: true,
    metadata: {
      sa_plug_site: "where_to_go_sa",
      operator: "business_operator_v1",
    },
    text: { format: { type: "text" } },
  };

  if (prev) {
    payload.previous_response_id = prev;
  }

  try {
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const msg =
        data && data.error && data.error.message
          ? String(data.error.message).slice(0, 500)
          : res.statusText || "OpenAI request failed";
      return json(res.status >= 500 ? 502 : 400, {
        error: "openai_error",
        message: msg,
      });
    }

    const reply = extractAssistantText(data);
    if (!reply) {
      return json(502, {
        error: "empty_reply",
        message: "The operator returned an empty response.",
      });
    }

    return json(200, {
      reply,
      previous_response_id:
        typeof data.id === "string" && data.id.startsWith("resp_") ? data.id : prev,
    });
  } catch (err) {
    return json(502, {
      error: "openai_network",
      message: err instanceof Error ? err.message : "Network error calling OpenAI",
    });
  }
};
