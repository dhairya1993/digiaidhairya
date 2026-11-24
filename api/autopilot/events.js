const { json, requireMethod, requireBearer, supabase } = require("./_lib");

module.exports = async function handler(req, res) {
  if (!requireMethod(req, res, "POST")) return;
  if (!requireBearer(req, process.env.AUTOPILOT_INGEST_SECRET)) {
    return json(res, 401, { ok: false, error: "UNAUTHORIZED" });
  }

  const body = req.body || {};
  const allowedTypes = ["tool","blog","deal","tutorial","prompt","category","feature","security_advisory","manual"];
  const sourceType = String(body.source_type || "");
  const sourceId = String(body.source_id || "").trim();
  const title = String(body.title || "").trim();
  const summary = String(body.summary || "").trim();
  const contentHash = String(body.content_hash || "").trim();

  if (!allowedTypes.includes(sourceType) || !sourceId || !title || !summary || !contentHash) {
    return json(res, 400, {
      ok: false,
      error: "INVALID_EVENT",
      required: ["source_type","source_id","title","summary","content_hash"],
    });
  }
  if (title.length > 180 || summary.length > 5000 || sourceId.length > 240 || contentHash.length > 128) {
    return json(res, 413, { ok: false, error: "FIELD_TOO_LARGE" });
  }

  try {
    const rows = await supabase("autopilot_content_events?on_conflict=source_type,source_id,content_hash", {
      method: "POST",
      headers: { Prefer: "resolution=ignore-duplicates,return=representation" },
      body: JSON.stringify([{
        source_type: sourceType,
        source_id: sourceId,
        canonical_url: body.canonical_url ? String(body.canonical_url).slice(0, 2048) : null,
        title,
        summary,
        category: body.category ? String(body.category).slice(0, 100) : null,
        source_evidence: body.source_evidence && typeof body.source_evidence === "object" ? body.source_evidence : {},
        content_hash: contentHash,
        priority: ["normal","high","urgent"].includes(body.priority) ? body.priority : "normal",
      }]),
    });
    return json(res, 202, { ok: true, accepted: Array.isArray(rows) && rows.length > 0, event: rows?.[0] || null });
  } catch (error) {
    return json(res, 500, { ok: false, error: "EVENT_INGEST_FAILED", detail: error.message });
  }
};
