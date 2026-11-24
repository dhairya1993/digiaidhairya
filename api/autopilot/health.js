const { json, requireMethod, supabase } = require("./_lib");

module.exports = async function handler(req, res) {
  if (!requireMethod(req, res, "GET")) return;
  try {
    await supabase("autopilot_settings?select=id&limit=1");
    return json(res, 200, {
      ok: true,
      service: "digiai-dhairya-autopilot",
      databaseConnected: true,
      generationConfigured: Boolean(process.env.GEMINI_API_KEY),
      publishingEnabled: false,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    return json(res, 503, {
      ok: false,
      service: "digiai-dhairya-autopilot",
      databaseConnected: false,
      error: error.message,
      checkedAt: new Date().toISOString(),
    });
  }
};
