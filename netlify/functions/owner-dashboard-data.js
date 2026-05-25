/**
 * Owner Command Dashboard data — read-only Supabase fetch (server-side only).
 *
 * Env:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — required
 *   OWNER_DASHBOARD_KEY                     — required shared secret (query/body key)
 *
 * GET or POST with `key` matching OWNER_DASHBOARD_KEY.
 * Returns latest 25 business_leads + restaurant inquiries + transportation_requests and summary counts.
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const ROW_LIMIT = 25;

const BUSINESS_SELECT_ENHANCED =
  "id,created_at,status,owner_notes,last_contacted_at,updated_at,priority,lead_temperature,lead_quality,contact_name,contact_email,contact_phone,preferred_contact_method,business_name,business_website,business_industry,business_location,current_problem,customer_flow_issue,services_interested,recommended_system,urgency,timeline,ai_summary,alert_email_sent,alert_sms_sent,page_path";

const BUSINESS_SELECT_FULL =
  "id,created_at,status,owner_notes,last_contacted_at,updated_at,lead_quality,contact_name,contact_email,contact_phone,preferred_contact_method,business_name,business_website,business_industry,business_location,current_problem,customer_flow_issue,services_interested,recommended_system,urgency,timeline,ai_summary,alert_email_sent,alert_sms_sent,page_path";

const BUSINESS_SELECT_STATUS =
  "id,created_at,status,lead_quality,contact_name,contact_email,contact_phone,preferred_contact_method,business_name,business_website,business_industry,business_location,current_problem,customer_flow_issue,services_interested,recommended_system,urgency,timeline,ai_summary,alert_email_sent,alert_sms_sent,page_path";

const BUSINESS_SELECT_CORE =
  "id,created_at,lead_quality,contact_name,contact_email,contact_phone,preferred_contact_method,business_name,business_website,business_industry,business_location,current_problem,services_interested,recommended_system,urgency,timeline,ai_summary,alert_email_sent,page_path";

const BUSINESS_SELECT_MINIMAL =
  "id,created_at,contact_name,contact_email,contact_phone,business_name,business_website,business_industry,business_location,current_problem,services_interested,recommended_system,urgency,timeline,ai_summary";

const TRANSPORT_SELECT_FULL =
  "id,created_at,status,owner_notes,last_contacted_at,updated_at,source,lead_type,next_action,visitor_name,visitor_phone,visitor_email,preferred_contact_method,pickup_area,destination,requested_date,time_window,requested_time,party_size,luggage,request_type,trip_type,transportation_need,flight_number,hotel_or_resort,accessibility_needs,child_seats_needed,conversation_excerpt,notes,alert_email_sent,alert_sms_sent,page_path";

const TRANSPORT_SELECT_CORE =
  "id,created_at,status,visitor_name,visitor_phone,visitor_email,pickup_area,destination,requested_time,party_size,request_type,conversation_excerpt,notes,alert_email_sent,alert_sms_sent,page_path";

const TRANSPORT_SELECT_MINIMAL =
  "id,created_at,visitor_name,visitor_phone,visitor_email,pickup_area,destination,requested_time,party_size,request_type,conversation_excerpt,notes";

const RESTAURANT_SELECT_FULL =
  "id,created_at,status,owner_notes,last_contacted_at,updated_at,contact_name,contact_email,contact_phone,preferred_contact_method,business_name,business_website,business_industry,business_location,current_problem,services_interested,recommended_system,ai_summary,alert_email_sent,alert_sms_sent,page_path";

const RESTAURANT_SELECT_CORE =
  "id,created_at,status,owner_notes,last_contacted_at,updated_at,contact_name,contact_email,contact_phone,preferred_contact_method,business_name,business_website,business_industry,business_location,current_problem,services_interested,recommended_system,ai_summary,alert_email_sent,alert_sms_sent,page_path";

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

function sanitizeErrorMessage(err) {
  const raw = err instanceof Error ? err.message : String(err || "unknown error");
  return raw.replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, "[redacted]").slice(0, 240);
}

async function fetchRecentRows(url, serviceKey, table, selectCols, filter = "") {
  const res = await fetch(
    `${url}/rest/v1/${table}?select=${encodeURIComponent(selectCols)}${filter}&order=created_at.desc&limit=${ROW_LIMIT}`,
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

async function fetchWithSelectFallbacks(url, serviceKey, table, selects, filter = "") {
  let lastErr = null;
  for (const cols of selects) {
    try {
      return await fetchRecentRows(url, serviceKey, table, cols, filter);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr || new Error(`${table}: fetch failed`);
}

async function safeLoadSection(sectionName, loader) {
  try {
    const rows = await loader();
    return { rows: Array.isArray(rows) ? rows : [], error: null };
  } catch (err) {
    const message = sanitizeErrorMessage(err);
    console.warn("owner-dashboard-data section failed", {
      section: sectionName,
      message,
    });
    return { rows: [], error: message };
  }
}

async function safeCount(label, counter) {
  try {
    const value = await counter();
    return typeof value === "number" && !Number.isNaN(value) ? value : 0;
  } catch (err) {
    console.warn("owner-dashboard-data count failed", {
      count: label,
      message: sanitizeErrorMessage(err),
    });
    return 0;
  }
}

const BUSINESS_SELECT_CHAIN = [
  BUSINESS_SELECT_ENHANCED,
  BUSINESS_SELECT_FULL,
  BUSINESS_SELECT_STATUS,
  BUSINESS_SELECT_CORE,
  BUSINESS_SELECT_MINIMAL,
];

const TRANSPORT_SELECT_CHAIN = [
  TRANSPORT_SELECT_FULL,
  TRANSPORT_SELECT_CORE,
  TRANSPORT_SELECT_MINIMAL,
];

const RESTAURANT_SELECT_CHAIN = [RESTAURANT_SELECT_FULL, RESTAURANT_SELECT_CORE];

async function fetchBusinessLeads(url, serviceKey) {
  return fetchWithSelectFallbacks(url, serviceKey, "business_leads", BUSINESS_SELECT_CHAIN);
}

async function fetchTransportRequests(url, serviceKey) {
  return fetchWithSelectFallbacks(url, serviceKey, "transportation_requests", TRANSPORT_SELECT_CHAIN);
}

function restaurantPageFilter() {
  return `&page_path=eq.${encodeURIComponent("/restaurants/")}`;
}

function isRestaurantLeadRow(row) {
  const path = String((row && row.page_path) || "").toLowerCase();
  if (path.indexOf("/restaurant") !== -1) return true;
  const industry = String((row && row.business_industry) || "").toLowerCase();
  if (industry === "restaurant") return true;
  const text = restaurantLeadText(row || {});
  return /restaurant partner program|\/restaurants\//i.test(text);
}

async function fetchRestaurantLeads(url, serviceKey) {
  const filter = restaurantPageFilter();
  try {
    return await fetchWithSelectFallbacks(url, serviceKey, "business_leads", RESTAURANT_SELECT_CHAIN, filter);
  } catch (filteredErr) {
    try {
      const rows = await fetchWithSelectFallbacks(url, serviceKey, "business_leads", RESTAURANT_SELECT_CHAIN, "");
      return rows.filter(isRestaurantLeadRow);
    } catch {
      throw filteredErr;
    }
  }
}

async function supabaseCountByStatusIlike(url, serviceKey, table, statusValue) {
  const filter = `&status=ilike.${encodeURIComponent(statusValue)}`;
  return supabaseCountWithHeaders(url, serviceKey, table, filter);
}

async function supabaseCountRestaurantStatus(url, serviceKey, statusValue) {
  const filter = `${restaurantPageFilter()}&status=ilike.${encodeURIComponent(statusValue)}`;
  return supabaseCountWithHeaders(url, serviceKey, "business_leads", filter);
}

function restaurantLeadText(row) {
  return [
    row.owner_notes,
    row.services_interested,
    row.recommended_system,
    row.current_problem,
    row.ai_summary,
    row.notes,
  ]
    .filter(Boolean)
    .join("\n")
    .toLowerCase();
}

function restaurantLeadInterest(row) {
  const text = restaurantLeadText(row);
  const partner = /partner program interest:\s*yes|restaurant partner program|visitor visibility|partner placement/.test(text);
  const ai = /ai systems interest:\s*yes|ai restaurant growth|ai systems|growth systems|restaurant growth systems/.test(text);
  if (partner && ai) return "Both";
  if (partner) return "Restaurant Partner Program";
  if (ai) return "AI Restaurant Growth Systems";
  return "Not specified";
}

function extractRestaurantOptionalMessage(row) {
  const notesSource =
    row.notes != null && String(row.notes).trim()
      ? String(row.notes).trim()
      : row.owner_notes != null
        ? String(row.owner_notes).trim()
        : "";
  if (!notesSource) return null;
  const marker = notesSource.search(/inbound restaurant inquiry from\s+\/restaurants\//i);
  const message = marker >= 0 ? notesSource.slice(0, marker).trim() : notesSource;
  return message || null;
}

function ownerNoteMarkerValue(row, marker) {
  const notes = row && row.owner_notes != null ? String(row.owner_notes).trim() : "";
  if (!notes) return null;
  const escaped = String(marker || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = notes.match(new RegExp("^\\s*" + escaped + "\\s*([^\\r\\n]*)", "im"));
  if (!match) return null;
  const value = String(match[1] || "").replace(/\s*\.\s*$/, "").trim();
  return value || null;
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
    customer_flow_issue: row.customer_flow_issue ?? null,
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

function mapRestaurantLead(row) {
  const text = restaurantLeadText(row);
  const interestPartner = /partner program interest:\s*yes|restaurant partner program|visitor visibility|partner placement/.test(text);
  const interestAi = /ai systems interest:\s*yes|ai restaurant growth|ai systems|growth systems|restaurant growth systems/.test(text);
  const fitLabel = ownerNoteMarkerValue(row, "Fit label:");
  const leadPriority = ownerNoteMarkerValue(row, "Lead priority:");
  const nextAction = ownerNoteMarkerValue(row, "Next action:");
  const nextFollowUpDate = ownerNoteMarkerValue(row, "Next follow-up date:");
  const proposalSentAt = ownerNoteMarkerValue(row, "Proposal sent date:");
  const wonAt = ownerNoteMarkerValue(row, "Won date:");
  return {
    id: row.id,
    created_at: row.created_at,
    status: row.status ?? null,
    owner_notes: row.owner_notes ?? null,
    last_contacted_at: row.last_contacted_at ?? null,
    updated_at: row.updated_at ?? null,
    restaurant_name: row.business_name ?? null,
    contact_name: row.contact_name ?? null,
    email: row.contact_email ?? null,
    phone: row.contact_phone ?? null,
    preferred_contact_method: row.preferred_contact_method ?? null,
    website_or_social: row.business_website ?? null,
    area_neighborhood: row.business_location ?? null,
    help_needed: row.current_problem ?? null,
    interest_partner_program: interestPartner,
    interest_ai_systems: interestAi,
    interest_type: restaurantLeadInterest(row),
    optional_message: extractRestaurantOptionalMessage(row),
    source: row.page_path || "/restaurants/",
    notes: row.owner_notes ?? null,
    fit_label: fitLabel,
    lead_priority: leadPriority,
    next_action: nextAction,
    next_follow_up_date: nextFollowUpDate,
    proposal_sent_at: proposalSentAt,
    won_at: wonAt,
    services_interested: row.services_interested ?? null,
    recommended_system: row.recommended_system ?? null,
    ai_summary: row.ai_summary ?? null,
    alert_email_sent: Boolean(row.alert_email_sent),
    alert_sms_sent: Boolean(row.alert_sms_sent),
    page_path: row.page_path ?? null,
  };
}

function mapTransportRequest(row) {
  const tripType = row.trip_type ?? row.request_type ?? null;
  return {
    id: row.id,
    created_at: row.created_at,
    status: row.status ?? null,
    owner_notes: row.owner_notes ?? null,
    last_contacted_at: row.last_contacted_at ?? null,
    updated_at: row.updated_at ?? null,
    source: row.source ?? null,
    lead_type: row.lead_type ?? null,
    next_action: row.next_action ?? null,
    name: row.visitor_name ?? null,
    phone: row.visitor_phone ?? null,
    email: row.visitor_email ?? null,
    preferred_contact_method: row.preferred_contact_method ?? null,
    pickup_area: row.pickup_area ?? null,
    destination: row.destination ?? null,
    requested_date: row.requested_date ?? null,
    time_window: row.time_window ?? null,
    date_time: row.requested_time ?? null,
    group_size: row.party_size ?? null,
    party_size: row.party_size ?? null,
    luggage: row.luggage ?? null,
    request_type: tripType,
    trip_type: tripType,
    transportation_need: row.transportation_need ?? null,
    flight_number: row.flight_number ?? null,
    hotel_or_resort: row.hotel_or_resort ?? null,
    accessibility_needs: row.accessibility_needs ?? null,
    child_seats_needed: row.child_seats_needed ?? null,
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

  console.log("owner-dashboard-data started", {
    method: event.httpMethod,
    env: {
      OWNER_DASHBOARD_KEY: Boolean(expectedKey),
      SUPABASE_URL: Boolean(supabaseUrl),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(serviceKey && String(serviceKey).trim()),
    },
    tables: ["business_leads", "transportation_requests"],
  });

  if (!supabaseUrl || !serviceKey || !String(serviceKey).trim()) {
    console.error("owner-dashboard-data misconfigured", { status: 503 });
    return json(503, {
      ok: false,
      error: "Service misconfigured",
    });
  }

  const [businessSection, restaurantSection, transportSection] = await Promise.all([
    safeLoadSection("business_leads", () => fetchBusinessLeads(supabaseUrl, serviceKey)),
    safeLoadSection("restaurant_leads", () => fetchRestaurantLeads(supabaseUrl, serviceKey)),
    safeLoadSection("transportation_requests", () => fetchTransportRequests(supabaseUrl, serviceKey)),
  ]);

  const sectionErrors = {};
  if (businessSection.error) sectionErrors.business_leads = businessSection.error;
  if (restaurantSection.error) sectionErrors.restaurant_leads = restaurantSection.error;
  if (transportSection.error) sectionErrors.transportation_requests = transportSection.error;

  const errors = Object.keys(sectionErrors).map(function (key) {
    return key + ": " + sectionErrors[key];
  });

  const [
    totalBusiness,
    totalRestaurant,
    totalTransportation,
    businessNew,
    restaurantNew,
    restaurantContacted,
    restaurantQualified,
    restaurantProposalSent,
    restaurantWon,
    restaurantNotFit,
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
    safeCount("total_business", () => supabaseCountWithHeaders(supabaseUrl, serviceKey, "business_leads", "")),
    safeCount("total_restaurant", () =>
      supabaseCountWithHeaders(supabaseUrl, serviceKey, "business_leads", restaurantPageFilter())
    ),
    safeCount("total_transportation", () =>
      supabaseCountWithHeaders(supabaseUrl, serviceKey, "transportation_requests", "")
    ),
    safeCount("business_new", () =>
      supabaseCountByStatusIlike(supabaseUrl, serviceKey, "business_leads", "new")
    ),
    safeCount("restaurant_new", () => supabaseCountRestaurantStatus(supabaseUrl, serviceKey, "new")),
    safeCount("restaurant_contacted", () =>
      supabaseCountRestaurantStatus(supabaseUrl, serviceKey, "contacted")
    ),
    safeCount("restaurant_qualified", () =>
      supabaseCountRestaurantStatus(supabaseUrl, serviceKey, "qualified")
    ),
    safeCount("restaurant_proposal_sent", () =>
      supabaseCountRestaurantStatus(supabaseUrl, serviceKey, "proposal sent")
    ),
    safeCount("restaurant_won", () => supabaseCountRestaurantStatus(supabaseUrl, serviceKey, "won")),
    safeCount("restaurant_not_fit", () =>
      supabaseCountRestaurantStatus(supabaseUrl, serviceKey, "not a fit")
    ),
    safeCount("transportation_new", () =>
      supabaseCountByStatusIlike(supabaseUrl, serviceKey, "transportation_requests", "new")
    ),
    safeCount("business_needs_follow_up", () =>
      supabaseCountByStatusIlike(supabaseUrl, serviceKey, "business_leads", "needs follow-up")
    ),
    safeCount("transport_needs_follow_up", () =>
      supabaseCountByStatusIlike(supabaseUrl, serviceKey, "transportation_requests", "needs follow-up")
    ),
    safeCount("business_contacted", () =>
      supabaseCountByStatusIlike(supabaseUrl, serviceKey, "business_leads", "contacted")
    ),
    safeCount("transport_contacted", () =>
      supabaseCountByStatusIlike(supabaseUrl, serviceKey, "transportation_requests", "contacted")
    ),
    safeCount("business_won", () => supabaseCountByStatusIlike(supabaseUrl, serviceKey, "business_leads", "won")),
    safeCount("transport_won", () =>
      supabaseCountByStatusIlike(supabaseUrl, serviceKey, "transportation_requests", "won")
    ),
    safeCount("business_email_alerts", () =>
      supabaseCountWithHeaders(supabaseUrl, serviceKey, "business_leads", "&alert_email_sent=eq.true")
    ),
    safeCount("transport_email_alerts", () =>
      supabaseCountWithHeaders(supabaseUrl, serviceKey, "transportation_requests", "&alert_email_sent=eq.true")
    ),
    safeCount("business_sms_alerts", () =>
      supabaseCountWithHeaders(supabaseUrl, serviceKey, "business_leads", "&alert_sms_sent=eq.true")
    ),
    safeCount("transport_sms_alerts", () =>
      supabaseCountWithHeaders(supabaseUrl, serviceKey, "transportation_requests", "&alert_sms_sent=eq.true")
    ),
  ]);

  let businessLeads = [];
  let restaurantLeads = [];
  let transportRows = [];

  try {
    businessLeads = businessSection.rows.map(mapBusinessLead);
  } catch (err) {
    const message = sanitizeErrorMessage(err);
    sectionErrors.business_leads = sectionErrors.business_leads || "map: " + message;
    errors.push("business_leads map: " + message);
    console.warn("owner-dashboard-data map failed", { section: "business_leads", message });
  }

  try {
    restaurantLeads = restaurantSection.rows.map(mapRestaurantLead);
  } catch (err) {
    const message = sanitizeErrorMessage(err);
    sectionErrors.restaurant_leads = sectionErrors.restaurant_leads || "map: " + message;
    errors.push("restaurant_leads map: " + message);
    console.warn("owner-dashboard-data map failed", { section: "restaurant_leads", message });
  }

  try {
    transportRows = transportSection.rows.map(mapTransportRequest);
  } catch (err) {
    const message = sanitizeErrorMessage(err);
    sectionErrors.transportation_requests = sectionErrors.transportation_requests || "map: " + message;
    errors.push("transportation_requests map: " + message);
    console.warn("owner-dashboard-data map failed", { section: "transportation_requests", message });
  }

  const allSectionsFailed =
    Boolean(businessSection.error) &&
    Boolean(restaurantSection.error) &&
    Boolean(transportSection.error);
  const hasSectionErrors = Object.keys(sectionErrors).length > 0;

  if (allSectionsFailed) {
    console.error("owner-dashboard-data all sections failed", {
      status: 502,
      sectionErrors,
    });
    return json(502, {
      ok: false,
      error: "fetch_failed",
      message: errors[0] || "Could not load dashboard data.",
      sectionErrors,
      errors,
      business_leads: [],
      restaurant_leads: [],
      transportation_requests: [],
    });
  }

  console.log("owner-dashboard-data response", {
    status: 200,
    business_leads: businessLeads.length,
    restaurant_leads: restaurantLeads.length,
    transportation_requests: transportRows.length,
    sectionErrors: Object.keys(sectionErrors),
  });

  return json(200, {
    ok: true,
    business_leads: businessLeads,
    restaurant_leads: restaurantLeads,
    transportation_requests: transportRows,
    counts: {
      business_new: businessNew,
      restaurant_new: restaurantNew,
      restaurant_contacted: restaurantContacted,
      restaurant_qualified: restaurantQualified,
      restaurant_proposal_sent: restaurantProposalSent,
      restaurant_won: restaurantWon,
      restaurant_not_fit: restaurantNotFit,
      transportation_new: transportationNew,
      needs_follow_up: businessNeedsFollowUp + transportNeedsFollowUp,
      contacted: businessContacted + transportContacted,
      won: businessWon + transportWon,
      total_business: totalBusiness,
      total_restaurant: totalRestaurant,
      total_transportation: totalTransportation,
      email_alerts_sent: businessEmailAlerts + transportEmailAlerts,
      sms_alerts_sent: businessSmsAlerts + transportSmsAlerts,
    },
    sectionErrors: hasSectionErrors ? sectionErrors : undefined,
    errors: errors.length ? errors : undefined,
  });
};
