/**
 * Owner Command Dashboard data — read-only Supabase fetch (server-side only).
 *
 * Env:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — required
 *   OWNER_DASHBOARD_KEY                     — required shared secret (query/body key)
 *
 * GET or POST with `key` matching OWNER_DASHBOARD_KEY.
 * Returns latest 25 business_leads + transportation_requests and summary counts.
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const ROW_LIMIT = 25;

const BUSINESS_SELECT_ENHANCED =
  "id,created_at,status,owner_notes,last_contacted_at,updated_at,priority,lead_temperature,lead_quality,contact_name,contact_email,contact_phone,preferred_contact_method,business_name,business_website,business_industry,business_location,current_problem,services_interested,recommended_system,urgency,timeline,ai_summary,alert_email_sent,alert_sms_sent,page_path";

const BUSINESS_SELECT_FULL =
  "id,created_at,status,owner_notes,last_contacted_at,updated_at,lead_quality,contact_name,contact_email,contact_phone,preferred_contact_method,business_name,business_website,business_industry,business_location,current_problem,services_interested,recommended_system,urgency,timeline,ai_summary,alert_email_sent,alert_sms_sent,page_path";

const BUSINESS_SELECT_STATUS =
  "id,created_at,status,lead_quality,contact_name,contact_email,contact_phone,preferred_contact_method,business_name,business_website,business_industry,business_location,current_problem,services_interested,recommended_system,urgency,timeline,ai_summary,alert_email_sent,alert_sms_sent,page_path";

const BUSINESS_SELECT_CORE =
  "id,created_at,lead_quality,contact_name,contact_email,contact_phone,preferred_contact_method,business_name,business_website,business_industry,business_location,current_problem,services_interested,recommended_system,urgency,timeline,ai_summary,alert_email_sent,page_path";

const TRANSPORT_SELECT_FULL =
  "id,created_at,status,owner_notes,last_contacted_at,updated_at,visitor_name,visitor_phone,visitor_email,pickup_area,destination,requested_time,party_size,request_type,conversation_excerpt,notes,alert_email_sent,alert_sms_sent,page_path";

const TRANSPORT_SELECT_CORE =
  "id,created_at,status,visitor_name,visitor_phone,visitor_email,pickup_area,destination,requested_time,party_size,request_type,conversation_excerpt,notes,alert_email_sent,alert_sms_sent,page_path";

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

function readKey(event) {
  const qs = event.queryStringParameters || {};
  if (qs.key && String(qs.key).trim()) return String(qs.key).trim();

  if (event.body) {
    try {
      const body = JSON.parse(event.body);
      if (body && body.key && String(body.key).trim()) return String(body.key).trim();
    } catch {
      /* ignore */
    }
  }
  return "";
}

function parseCountFromRange(res) {
  const range = res.headers.get("content-range") || res.headers.get("Content-Range") || "";
  const parts = String(range).split("/");
  if (parts.length === 2) {
    const n = parseInt(parts[1], 10);
    if (!Number.isNaN(n)) return n;
  }
  return 0;
}

async function supabaseCountWithHeaders(url, serviceKey, table, filter) {
  const res = await fetch(`${url}/rest/v1/${table}?select=id${filter}&limit=1`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "count=exact",
      Range: "0-0",
    },
  });
  if (!res.ok) return 0;
  return parseCountFromRange(res);
}

async function fetchRecentRows(url, serviceKey, table, selectCols) {
  const res = await fetch(
    `${url}/rest/v1/${table}?select=${encodeURIComponent(selectCols)}&order=created_at.desc&limit=${ROW_LIMIT}`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
    }
  );
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg =
      data && (data.message || data.error_description || data.hint)
        ? String(data.message || data.error_description || data.hint)
        : res.statusText;
    throw new Error(`${table}: ${msg}`);
  }
  return Array.isArray(data) ? data : [];
}

async function fetchBusinessLeads(url, serviceKey) {
  try {
    return await fetchRecentRows(url, serviceKey, "business_leads", BUSINESS_SELECT_ENHANCED);
  } catch (firstErr) {
    try {
      return await fetchRecentRows(url, serviceKey, "business_leads", BUSINESS_SELECT_FULL);
    } catch {
      try {
        return await fetchRecentRows(url, serviceKey, "business_leads", BUSINESS_SELECT_STATUS);
      } catch {
        try {
          return await fetchRecentRows(url, serviceKey, "business_leads", BUSINESS_SELECT_CORE);
        } catch {
          throw firstErr;
        }
      }
    }
  }
}

async function fetchTransportRequests(url, serviceKey) {
  try {
    return await fetchRecentRows(url, serviceKey, "transportation_requests", TRANSPORT_SELECT_FULL);
  } catch (firstErr) {
    try {
      return await fetchRecentRows(url, serviceKey, "transportation_requests", TRANSPORT_SELECT_CORE);
    } catch {
      throw firstErr;
    }
  }
}

async function supabaseCountByStatusIlike(url, serviceKey, table, statusValue) {
  const filter = `&status=ilike.${encodeURIComponent(statusValue)}`;
  return supabaseCountWithHeaders(url, serviceKey, table, filter);
}

function mapBusinessLead(row) {
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

function mapTransportRequest(row) {
  return {
    id: row.id,
    created_at: row.created_at,
    status: row.status ?? null,
    owner_notes: row.owner_notes ?? null,
    last_contacted_at: row.last_contacted_at ?? null,
    updated_at: row.updated_at ?? null,
    name: row.visitor_name ?? null,
    phone: row.visitor_phone ?? null,
    email: row.visitor_email ?? null,
    pickup_area: row.pickup_area ?? null,
    destination: row.destination ?? null,
    date_time: row.requested_time ?? null,
    group_size: row.party_size ?? null,
    request_type: row.request_type ?? null,
    conversation_excerpt: row.conversation_excerpt ?? null,
    notes: row.notes ?? null,
    alert_email_sent: Boolean(row.alert_email_sent),
    alert_sms_sent: Boolean(row.alert_sms_sent),
    page_path: row.page_path ?? null,
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: { ...CORS_HEADERS }, body: "" };
  }

  if (event.httpMethod !== "GET" && event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "Method not allowed" });
  }

  const expectedKey = process.env.OWNER_DASHBOARD_KEY && String(process.env.OWNER_DASHBOARD_KEY).trim();
  const providedKey = readKey(event);

  if (!expectedKey || providedKey !== expectedKey) {
    return json(401, { ok: false, error: "Unauthorized" });
  }

  const supabaseUrl = process.env.SUPABASE_URL && String(process.env.SUPABASE_URL).replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey || !String(serviceKey).trim()) {
    return json(503, {
      ok: false,
      error: "Service misconfigured",
    });
  }

  try {
    const [
      businessRows,
      transportRows,
      totalBusiness,
      totalTransportation,
      businessNew,
      transportationNew,
      businessNeedsFollowUp,
      transportNeedsFollowUp,
      businessContacted,
      transportContacted,
      businessWon,
      transportWon,
      businessEmailAlerts,
      transportEmailAlerts,
      businessSmsAlerts,
      transportSmsAlerts,
    ] = await Promise.all([
      fetchBusinessLeads(supabaseUrl, serviceKey),
      fetchTransportRequests(supabaseUrl, serviceKey),
      supabaseCountWithHeaders(supabaseUrl, serviceKey, "business_leads", ""),
      supabaseCountWithHeaders(supabaseUrl, serviceKey, "transportation_requests", ""),
      supabaseCountByStatusIlike(supabaseUrl, serviceKey, "business_leads", "new"),
      supabaseCountByStatusIlike(supabaseUrl, serviceKey, "transportation_requests", "new"),
      supabaseCountByStatusIlike(supabaseUrl, serviceKey, "business_leads", "needs follow-up"),
      supabaseCountByStatusIlike(supabaseUrl, serviceKey, "transportation_requests", "needs follow-up"),
      supabaseCountByStatusIlike(supabaseUrl, serviceKey, "business_leads", "contacted"),
      supabaseCountByStatusIlike(supabaseUrl, serviceKey, "transportation_requests", "contacted"),
      supabaseCountByStatusIlike(supabaseUrl, serviceKey, "business_leads", "won"),
      supabaseCountByStatusIlike(supabaseUrl, serviceKey, "transportation_requests", "won"),
      supabaseCountWithHeaders(supabaseUrl, serviceKey, "business_leads", "&alert_email_sent=eq.true"),
      supabaseCountWithHeaders(
        supabaseUrl,
        serviceKey,
        "transportation_requests",
        "&alert_email_sent=eq.true"
      ),
      supabaseCountWithHeaders(supabaseUrl, serviceKey, "business_leads", "&alert_sms_sent=eq.true"),
      supabaseCountWithHeaders(
        supabaseUrl,
        serviceKey,
        "transportation_requests",
        "&alert_sms_sent=eq.true"
      ),
    ]);

    return json(200, {
      ok: true,
      business_leads: businessRows.map(mapBusinessLead),
      transportation_requests: transportRows.map(mapTransportRequest),
      counts: {
        business_new: businessNew,
        transportation_new: transportationNew,
        needs_follow_up: businessNeedsFollowUp + transportNeedsFollowUp,
        contacted: businessContacted + transportContacted,
        won: businessWon + transportWon,
        total_business: totalBusiness,
        total_transportation: totalTransportation,
        email_alerts_sent: businessEmailAlerts + transportEmailAlerts,
        sms_alerts_sent: businessSmsAlerts + transportSmsAlerts,
      },
    });
  } catch (err) {
    console.error("owner-dashboard-data", err instanceof Error ? err.message : err);
    return json(502, {
      ok: false,
      error: "fetch_failed",
      message: err instanceof Error ? err.message : "Could not load dashboard data.",
    });
  }
};
