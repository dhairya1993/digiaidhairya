const { json, requireMethod, requireBearer, supabase } = require("./_lib");

async function generateWithGemini(event) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY_MISSING");
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const prompt = `You are the editorial engine for DigiAi Dhairya, an AI tools and technology education brand.
Create accurate social content using only the supplied facts. Do not invent pricing, free-plan claims, features, statistics, or guarantees. If a claim is uncertain, mark it for verification.
Return valid JSON only with keys: hook, short_script_hinglish, youtube_title, youtube_description, instagram_caption, facebook_caption, hashtags (array of max 5), image_post_text, video_storyboard (array of scene objects with visual and voiceover), fact_check_notes (array).
Brand website: https://digiaidhairya.in
Event:
Title: ${event.title}
Type: ${event.source_type}
Summary: ${event.summary}
Category: ${event.category || "General"}
Canonical URL: ${event.canonical_url || "Not provided"}
Evidence: ${JSON.stringify(event.source_evidence || {})}
Use natural Hinglish. Keep the script suitable for a 25–40 second vertical video. `;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, responseMimeType: "application/json" },
    }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(`GEMINI_${response.status}: ${JSON.stringify(payload).slice(0, 500)}`);
  const text = payload.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "";
  if (!text) throw new Error("GEMINI_EMPTY_RESPONSE");
  return JSON.parse(text.replace(/^\`\`\`json\s*/i, "").replace(/\`\`\`$/, ""));
}

module.exports = async function handler(req, res) {
  if (!requireMethod(req, res, "POST")) return;
  if (!requireBearer(req, process.env.CRON_SECRET)) {
    return json(res, 401, { ok: false, error: "UNAUTHORIZED" });
  }
  try {
    const settingsRows = await supabase("autopilot_settings?id=eq.true&select=*");
    const settings = settingsRows?.[0];
    if (!settings || !settings.enabled) {
      return json(res, 200, { ok: true, skipped: true, reason: "AUTOPILOT_DISABLED" });
    }
    const events = await supabase("autopilot_content_events?status=eq.queued&select=*&order=priority.desc,discovered_at.asc&limit=2");
    const results = [];
    for (const event of events || []) {
      try {
        await supabase(`autopilot_content_events?id=eq.${event.id}`, {
          method: "PATCH",
          body: JSON.stringify({ status: "processing", updated_at: new Date().toISOString() }),
        });
        const generated = await generateWithGemini(event);
        const campaigns = await supabase("autopilot_campaigns?on_conflict=event_id", {
          method: "POST",
          headers: { Prefer: "resolution=ignore-duplicates,return=representation" },
          body: JSON.stringify([{
            event_id: event.id,
            status: "generated",
            generated_content: generated,
            media_plan: {
              create_image: true,
              create_vertical_video: true,
              rendering_status: "not_configured",
              note: "No paid media-rendering service is configured. Use branded templates or connect an approved free renderer.",
            },
          }]),
        });
        await supabase(`autopilot_content_events?id=eq.${event.id}`, {
          method: "PATCH",
          body: JSON.stringify({ status: "generated", processed_at: new Date().toISOString(), updated_at: new Date().toISOString() }),
        });
        results.push({ event_id: event.id, status: "generated", campaign_id: campaigns?.[0]?.id || null });
      } catch (error) {
        await supabase(`autopilot_content_events?id=eq.${event.id}`, {
          method: "PATCH",
          body: JSON.stringify({ status: "failed", last_error: error.message.slice(0, 1000), updated_at: new Date().toISOString() }),
        });
        results.push({ event_id: event.id, status: "failed", error: error.message });
      }
    }
    return json(res, 200, { ok: true, processed: results.length, results, publishing: "disabled_until_oauth_and_media_pipeline_are_configured" });
  } catch (error) {
    return json(res, 500, { ok: false, error: "WORKER_FAILED", detail: error.message });
  }
};
