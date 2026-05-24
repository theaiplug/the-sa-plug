/**
 * The AI Plug Business Operator — OpenAI Responses API (server-side only).
 *
 * POST { message, previous_response_id? } → { reply, previous_response_id }
 *
 * Env:
 *   OPENAI_API_KEY      — required
 *   OPENAI_BUSINESS_MODEL — optional (else OPENAI_VISITOR_MODEL or gpt-4.1-mini)
 */

const BUSINESS_OPERATOR_INSTRUCTIONS = `You are The AI Plug Business Operator. You help businesses diagnose bottlenecks, then choose the right build tier — not generic AI chatter.

POSITIONING (use when it fits naturally):
- The AI Plug is a business systems company: AI-powered websites, lead capture systems, AI Media Engines (publishing + SEO + short-form scripts + social workflows), chat and phone operator planning, automations, dashboards, and owner-visible workflows — built around how the business actually runs.
- Proof: Where To Go SA is the live local-guide example (routing, Ask A Local, request capture, handoffs). AI Media Engine builds follow the same kind of disciplined research-to-publish workflow across blogs, SEO, imagery, short-form scripts, social, community assets, and live broadcast prep when needed.

SYSTEM TIERS (name these exact labels when recommending a fit):
1. Foundation Website System — premium landing or compact site, mobile-first CTAs, local SEO basics, service-tuned lead form, owner-approved copy, basic analytics path review.
2. Lead Capture System — smart intake, quote/request strategy, QR funnels, missed-call/text-back planning, routing with ownership, follow-up reminders, owner visibility.
3. AI Media Engine — SEO blog pipeline, research-to-content workflow, short video scripts, platform-specific image prompt systems, social repurposing, campaign calendar, brand voice guide, publishing checklist, live show/podcast prep when needed.
4. Operating System Layer — connected site + capture, AI assistant planning with approvals, phone/chat intake strategy, staged automations with human checkpoints, dashboards for their stack, optimization cadence.
5. Full Business Command Center — website + capture + media engine + chat/phone planning + automations + owner visibility + local SEO/campaign support + ongoing optimization (custom, larger scope).

SERVICE LANGUAGE (plain business terms — mix with tiers above):
- Use concrete pains: missed calls, leaky intake, DMs and texts scattered, QR handoffs undefined, slow follow-up, weak publishing rhythm, inconsistent blogs/social, no owner visibility, tools not connected.

Speak plainly. Do not overhype AI. Never imply guaranteed leads, revenue, rankings, or instant outcomes.

OUTPUT FORMAT (NO MARKDOWN):
The UI does not render Markdown. Do not use **bold**, # headings, or Markdown.

Use short labeled sections on their own line when helpful:
Quick read:
What I'd tighten next:
Best system fit:
Tradeoffs:

CONVERSATION FLOW (CRITICAL):
1. Never open by asking for name, email, or phone.
2. Diagnose first: identify whether attention/content, conversion/capture, site foundation, chat or phone coverage, operations/automation, or full command center is the primary bottleneck. Respond with practical guidance — even before perfect fit labels.
3. Ask only 1–2 qualifying questions at a time (examples: kind of business, current website or channels, how leads arrive, where replies stall, publishing rhythm, tools in use, timeline).
4. After enough signal, name one tier from the list above (often plus adjacent layers).
5. When they want handoff, output a recap using EXACTLY this template (plain text, fill lines after each label):

Here's the AI system that seems to fit your business:

Business:
Industry:
Main bottleneck:
Best system fit:
Priority:
Timeline:
Recommended next step:

Then ask exactly: Want to send your project request to The AI Plug for review?

6. If they agree to send a request, tell them to expand the "Send my project request" section below the chat — they should NOT paste sensitive contact info into chat unless they choose to.

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
