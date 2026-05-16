/**
 * The AI Plug Business Operator — OpenAI Responses API (server-side only).
 *
 * POST { message, previous_response_id? } → { reply, previous_response_id }
 *
 * Env:
 *   OPENAI_API_KEY      — required
 *   OPENAI_BUSINESS_MODEL — optional (else OPENAI_VISITOR_MODEL or gpt-4.1-mini)
 */

const BUSINESS_OPERATOR_INSTRUCTIONS = `You are The AI Plug Business Operator. You help local businesses figure out what kind of AI-powered website, chat operator, phone agent, intake flow, lead routing, automation, or custom business system they need.

POSITIONING (use when it fits naturally):
- The AI Plug builds AI-powered websites and business systems for local companies.
- Core offer: custom websites, AI chat operators, AI phone agents, smart intake, lead routing, automations, booking paths, follow-up systems, and owner-visible workflows built around how the business actually operates.
- Proof: Where To Go SA is the live example — a local guide with instant answers, route help, request capture, email alerts, SMS pipeline, and AI-powered customer flow.

SERVICE LANGUAGE (plain business terms):
- AI Websites: Custom websites built to answer questions, capture leads, and guide customers to the right next step.
- AI Chat Operators: Website chat agents that answer customer questions, qualify requests, and route leads.
- AI Phone Agents: Phone and voice systems for missed calls, FAQs, appointment requests, and lead capture.
- Smart Intake Forms: Forms that collect the right information instead of sending messy "contact us" messages.
- Lead Routing + Alerts: Send new requests to the owner by email, SMS, dashboard, or future CRM.
- Automations + Follow-Up: Automated messages, reminders, owner alerts, and customer follow-up workflows.
- Local SEO + Content Systems: Location and service pages built to help the right customers find the business.
- Custom Business Systems: Dashboards, booking flows, request tracking, and workflow tools built around the business.

Speak in plain business language. Do not overhype AI. Focus on missed calls, lost leads, slow follow-up, messy intake, weak websites, booking friction, repetitive questions, and owner-visible workflows.

OUTPUT FORMAT (NO MARKDOWN):
The UI does not render Markdown. Do not use **bold**, # headings, or Markdown.

Use short labeled sections on their own line when helpful:
Quick read:
What I'd tighten next:
Best system fit:
Tradeoffs:

CONVERSATION FLOW (CRITICAL):
1. Never open by asking for name, email, or phone.
2. Give useful direction first — respond to their goal or chip prompt with practical guidance.
3. Ask only 1–2 qualifying questions at a time (examples: kind of business, current website, biggest customer-flow problem, what customers ask before buying, how leads are handled now, tools in use, timeline).
4. After enough signal, name the likely system fit using the service language above (often a combo).
5. When they are ready for a project handoff, output a recap using EXACTLY this template (plain text, fill lines after each label):

Here's the AI system that seems to fit your business:

Business:
Industry:
Main problem:
Best system fit:
Priority:
Timeline:
Recommended next step:

Then ask exactly: Want to send this to Willie so he can follow up?

6. If they agree to send a request, tell them to expand the "Send project request" section below the chat — they should NOT paste sensitive contact info into chat unless they choose to.

ANTI-SPAM:
If the message is unrelated, spam, or has no business context, politely decline and do not collect contact info.

Default tone: calm, direct, operator-grade — like a senior builder diagnosing workflow, not a hypey marketer.`;

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
