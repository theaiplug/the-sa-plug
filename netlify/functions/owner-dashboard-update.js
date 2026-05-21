/**
 * Owner Command Dashboard — update lead/request status and owner notes (server-side only).
 *
 * Env:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — required
 *   OWNER_DASHBOARD_KEY                     — required shared secret (body key)
 *
 * POST only. Updates safe workflow fields on business_leads or transportation_requests.
 * Also supports private owner-only manual restaurant prospect creation without alerts.
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ALLOWED_TABLES = new Set(["business_leads", "transportation_requests"]);

const BUSINESS_STATUSES = new Set([
  "New",
  "Reviewed",
  "Contacted",
  "Qualified",
  "Not a fit",
  "Needs follow-up",
  "Won",
  "Lost",
  "Archived",
]);

const TRANSPORT_EXTRA_STATUSES = new Set(["Needs follow-up", "Handled", "Cancelled"]);

const RETURN_SELECT = "id,status,owner_notes,last_contacted_at,updated_at";

const RESTAURANT_LANES = new Set([
  "Business dinner",
  "River Walk dinner",
  "Resort food",
  "Date night",
  "Group dining",
  "Brunch",
  "Private dining / catering",
  "Bar / nightlife",
  "Visitor favorite",
  "Local SEO / discovery",
  "Unknown",
]);

const RESTAURANT_TYPES = new Set([
  "Mexican / Tex-Mex",
  "Steakhouse",
  "Seafood",
  "Italian",
  "BBQ",
  "Brunch",
  "Bar / lounge",
  "Rooftop",
  "Bakery / cafe",
  "Pizza",
  "Fine dining",
  "Casual dining",
  "Private dining / catering",
  "Other",
]);

const RESTAURANT_OPPORTUNITIES = new Set([
  "Visitor visibility",
  "Better reservation path",
  "QR funnel",
  "Private dining leads",
  "Catering / group inquiries",
  "AI guest answers",
  "Website + local SEO",
  "Reviews + repeat guests",
  "Reporting + alerts",
  "Full growth system",
  "Unknown",
]);

const RESTAURANT_OFFERS = new Set([
  "Starter Visibility",
  "Featured Visitor Placement",
  "Route Partner",
  "Website + Local SEO Upgrade",
  "Lead + Inquiry System",
  "AI Restaurant Concierge",
  "QR Funnel System",
  "Review + Repeat Guest System",
  "Full AI Restaurant Growth System",
  "Monthly Growth Management",
  "Restaurant Founding Growth Bundle",
  "Not sure yet",
]);

const RESTAURANT_PRIORITIES = new Set(["Hot", "Warm", "Low", "Not a fit"]);

const RESTAURANT_NEXT_ACTIONS = new Set([
  "Research restaurant",
  "Make first contact",
  "Send partner program pitch",
  "Ask discovery questions",
  "Send pricing",
  "Build proposal",
  "Request intake details",
  "Follow up",
  "Archive for later",
]);

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

function trimStr(v, max = 8000) {
  if (v == null) return null;
  const s = String(v).trim();
  if (!s) return null;
  if (s.length <= max) return s;
  return s.slice(0, max) + "…";
}

function parseIsoTimestamp(v) {
  if (v == null || v === "") return null;
  const d = new Date(String(v));
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function pickAllowed(value, allowed, fallback) {
  const s = trimStr(value, 200);
  if (s && allowed.has(s)) return s;
  return fallback;
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function allowedStatusesForTable(table) {
  const set = new Set(BUSINESS_STATUSES);
  if (table === "transportation_requests") {
    TRANSPORT_EXTRA_STATUSES.forEach((s) => set.add(s));
  }
  return set;
}

function normalizeIncomingStatus(status) {
  if (status == null) return null;
  const s = String(status).trim();
  if (!s) return null;
  const lower = s.toLowerCase();
  for (const allowed of BUSINESS_STATUSES) {
    if (allowed.toLowerCase() === lower) return allowed;
  }
  for (const allowed of TRANSPORT_EXTRA_STATUSES) {
    if (allowed.toLowerCase() === lower) return allowed;
  }
  return s;
}

async function recordExists(url, serviceKey, table, id) {
  const res = await fetch(`${url}/rest/v1/${table}?select=id&id=eq.${encodeURIComponent(id)}&limit=1`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) return false;
  const data = await res.json().catch(() => []);
  return Array.isArray(data) && data.length > 0;
}

function mapCreatedBusinessLead(row) {
  return {
    id: row.id,
    created_at: row.created_at,
    status: row.status ?? null,
    owner_notes: row.owner_notes ?? null,
    last_contacted_at: row.last_contacted_at ?? null,
    updated_at: row.updated_at ?? null,
    priority: row.priority ?? null,
    lead_temperature: row.lead_temperature ?? null,
    lead_quality: row.lead_quality ?? null,
    contact_name: row.contact_name ?? null,
    contact_email: row.contact_email ?? null,
    contact_phone: row.contact_phone ?? null,
    preferred_contact_method: row.preferred_contact_method ?? null,
    business_name: row.business_name ?? null,
    business_website: row.business_website ?? null,
    business_industry: row.business_industry ?? null,
    business_location: row.business_location ?? null,
    current_problem: row.current_problem ?? null,
    services_interested: row.services_interested ?? null,
    recommended_system: row.recommended_system ?? null,
    urgency: row.urgency ?? null,
    timeline: row.timeline ?? null,
    ai_summary: row.ai_summary ?? null,
    alert_email_sent: Boolean(row.alert_email_sent),
    alert_sms_sent: Boolean(row.alert_sms_sent),
    page_path: row.page_path ?? null,
  };
}

function restaurantProspectOwnerNotes(input, includePriorityInNotes) {
  const lines = [
    "Restaurant: prospect.",
    `Restaurant lane: ${input.visitor_lane}.`,
    `Restaurant type: ${input.restaurant_type}.`,
    `Restaurant opportunity: ${input.main_opportunity}.`,
    `Recommended restaurant offer: ${input.recommended_offer}.`,
    `Restaurant next action: ${input.next_action}.`,
  ];
  if (includePriorityInNotes && input.priority) {
    lines.push(`Restaurant priority: ${input.priority}.`);
  }
  lines.push("Restaurant source: manual owner dashboard entry.");
  lines.push(`Internal notes: ${input.internal_notes || "None."}`);
  return lines.join("\n");
}

async function insertBusinessLeadWithFallbacks(url, serviceKey, baseRow, fallbackRow) {
  const attempts = [
    baseRow,
    { ...baseRow, preferred_contact_method: "Manual owner dashboard" },
    fallbackRow,
    { ...fallbackRow, preferred_contact_method: "Manual owner dashboard" },
    (() => {
      const row = { ...fallbackRow, preferred_contact_method: "Manual owner dashboard" };
      delete row.alert_email_sent;
      return row;
    })(),
  ];
  let lastMessage = "Insert failed.";

  for (const row of attempts) {
    const res = await fetch(`${url}/rest/v1/business_leads`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(row),
    });
    const data = await res.json().catch(() => null);
    if (res.ok) return Array.isArray(data) ? data[0] : data;
    lastMessage =
      data && (data.message || data.error_description || data.hint)
        ? String(data.message || data.error_description || data.hint)
        : res.statusText;
  }

  throw new Error(lastMessage);
}

async function createRestaurantProspect(url, serviceKey, body) {
  const raw = body && body.prospect && typeof body.prospect === "object" ? body.prospect : body;
  const restaurantName = trimStr(raw.restaurant_name || raw.business_name, 200);
  const contactName = trimStr(raw.contact_name, 200);
  const phone = trimStr(raw.phone || raw.contact_phone, 80);
  const email = trimStr(raw.email || raw.contact_email, 200);

  if (!restaurantName || !contactName || !phone || !email || !validEmail(email)) {
    return json(400, { ok: false, error: "validation_error" });
  }

  const input = {
    restaurant_name: restaurantName,
    contact_name: contactName,
    phone,
    email,
    website: trimStr(raw.website || raw.business_website, 500) || null,
    location_area: trimStr(raw.location_area || raw.business_location, 200) || null,
    restaurant_type: pickAllowed(raw.restaurant_type, RESTAURANT_TYPES, "Other"),
    visitor_lane: pickAllowed(raw.visitor_lane, RESTAURANT_LANES, "Unknown"),
    main_opportunity: pickAllowed(raw.main_opportunity, RESTAURANT_OPPORTUNITIES, "Unknown"),
    recommended_offer: pickAllowed(raw.recommended_offer, RESTAURANT_OFFERS, "Not sure yet"),
    priority: pickAllowed(raw.priority, RESTAURANT_PRIORITIES, ""),
    next_action: pickAllowed(raw.next_action, RESTAURANT_NEXT_ACTIONS, "Research restaurant"),
    internal_notes: trimStr(raw.internal_notes, 4000),
  };

  const now = new Date().toISOString();
  const baseNotes = restaurantProspectOwnerNotes(input, false);
  const fallbackNotes = restaurantProspectOwnerNotes(input, Boolean(input.priority));
  const fallbackRow = {
    contact_name: input.contact_name,
    contact_email: input.email,
    contact_phone: input.phone,
    preferred_contact_method: null,
    business_name: input.restaurant_name,
    business_website: input.website,
    business_industry: `Restaurant / ${input.restaurant_type}`,
    business_location: input.location_area,
    current_problem: input.main_opportunity,
    services_interested: input.recommended_offer,
    recommended_system: input.recommended_offer,
    owner_notes: fallbackNotes,
    status: "New",
    lead_quality: input.priority ? `${input.priority} lead` : "Restaurant prospect",
    ai_summary: "Manual restaurant prospect created from Owner Dashboard.",
    page_path: "/restaurant-partner-program/manual-prospect",
    updated_at: now,
    alert_email_sent: false,
  };
  const baseRow = {
    ...fallbackRow,
    owner_notes: baseNotes,
  };
  if (input.priority) baseRow.priority = input.priority;

  try {
    const inserted = await insertBusinessLeadWithFallbacks(url, serviceKey, baseRow, fallbackRow);
    if (!inserted || inserted.id == null) {
      return json(502, { ok: false, error: "insert_failed", message: "No row returned." });
    }
    return json(200, {
      ok: true,
      created: true,
      record: mapCreatedBusinessLead(inserted),
    });
  } catch (err) {
    console.error("owner-dashboard-create-restaurant-prospect", err instanceof Error ? err.message : err);
    return json(502, {
      ok: false,
      error: "insert_failed",
      message: err instanceof Error ? err.message : "Could not create restaurant prospect.",
    });
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: { ...CORS_HEADERS }, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "Method not allowed" });
  }

  const expectedKey = process.env.OWNER_DASHBOARD_KEY && String(process.env.OWNER_DASHBOARD_KEY).trim();
  let body;
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return json(400, { ok: false, error: "invalid_json" });
  }

  const providedKey = body && body.key != null ? String(body.key).trim() : "";
  if (!expectedKey || providedKey !== expectedKey) {
    return json(401, { ok: false, error: "Unauthorized" });
  }

  const supabaseUrl = process.env.SUPABASE_URL && String(process.env.SUPABASE_URL).replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey || !String(serviceKey).trim()) {
    return json(503, { ok: false, error: "Service misconfigured" });
  }

  if (body && body.action === "create_restaurant_prospect") {
    return createRestaurantProspect(supabaseUrl, serviceKey, body);
  }

  const table = body.table != null ? String(body.table).trim() : "";
  const id = body.id != null ? String(body.id).trim() : "";
  if (!ALLOWED_TABLES.has(table)) {
    return json(400, { ok: false, error: "invalid_table" });
  }
  if (!id) {
    return json(400, { ok: false, error: "missing_id" });
  }

  const patch = {};
  const allowed = allowedStatusesForTable(table);

  if (Object.prototype.hasOwnProperty.call(body, "status")) {
    const status = normalizeIncomingStatus(body.status);
    if (!status || !allowed.has(status)) {
      return json(400, { ok: false, error: "invalid_status" });
    }
    patch.status = status;
  }

  if (Object.prototype.hasOwnProperty.call(body, "owner_notes")) {
    patch.owner_notes = trimStr(body.owner_notes);
  }

  if (Object.prototype.hasOwnProperty.call(body, "last_contacted_at")) {
    const ts = parseIsoTimestamp(body.last_contacted_at);
    if (body.last_contacted_at != null && body.last_contacted_at !== "" && !ts) {
      return json(400, { ok: false, error: "invalid_last_contacted_at" });
    }
    patch.last_contacted_at = ts;
  }

  if (Object.keys(patch).length === 0) {
    return json(400, { ok: false, error: "no_fields_to_update" });
  }

  patch.updated_at = new Date().toISOString();

  try {
    const exists = await recordExists(supabaseUrl, serviceKey, table, id);
    if (!exists) {
      return json(404, { ok: false, error: "not_found" });
    }

    const res = await fetch(
      `${supabaseUrl}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}&select=${encodeURIComponent(RETURN_SELECT)}`,
      {
        method: "PATCH",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(patch),
      }
    );

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const msg =
        data && (data.message || data.error_description || data.hint)
          ? String(data.message || data.error_description || data.hint)
          : res.statusText;
      console.error("owner-dashboard-update", table, id, msg);
      return json(502, { ok: false, error: "update_failed", message: msg });
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) {
      return json(502, { ok: false, error: "update_failed", message: "No row returned." });
    }

    return json(200, {
      ok: true,
      updated: true,
      record: {
        id: row.id,
        status: row.status ?? null,
        owner_notes: row.owner_notes ?? null,
        last_contacted_at: row.last_contacted_at ?? null,
        updated_at: row.updated_at ?? null,
      },
    });
  } catch (err) {
    console.error("owner-dashboard-update", err instanceof Error ? err.message : err);
    return json(502, {
      ok: false,
      error: "update_failed",
      message: err instanceof Error ? err.message : "Could not update record.",
    });
  }
};
