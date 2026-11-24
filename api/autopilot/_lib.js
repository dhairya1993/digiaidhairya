const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function json(res, status, body) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  return res.status(status).json(body);
}

function requireMethod(req, res, method) {
  if (req.method !== method) {
    res.setHeader("Allow", method);
    json(res, 405, { ok: false, error: "METHOD_NOT_ALLOWED" });
    return false;
  }
  return true;
}

function requireBearer(req, expected) {
  if (!expected) return false;
  const header = req.headers.authorization || "";
  return header === `Bearer ${expected}`;
}

async function supabase(path, options = {}) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVER_ENV_MISSING");
  }
  const response = await fetch(`${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`SUPABASE_${response.status}: ${text.slice(0, 500)}`);
  }
  return text ? JSON.parse(text) : null;
}

module.exports = { json, requireMethod, requireBearer, supabase };
