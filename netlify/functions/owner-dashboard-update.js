/**
 * Owner Command Dashboard — update lead/request status and owner notes (server-side only).
 *
 * Env:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — required
 *   OWNER_DASHBOARD_KEY                     — required shared secret (body key)
 *
 * POST only. Updates safe workflow fields on business_leads or transportation_requests.
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
  "Won",
  "Lost",
  "Archived",
]);

const TRANSPORT_EXTRA_STATUSES = new Set(["Needs follow-up", "Handled", "Cancelled"]);

const RETURN_SELECT = "id,status,owner_notes,last_contacted_at,updated_at";

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

  const supabaseUrl = process.env.SUPABASE_URL && String(process.env.SUPABASE_URL).replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey || !String(serviceKey).trim()) {
    return json(503, { ok: false, error: "Service misconfigured" });
  }

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
