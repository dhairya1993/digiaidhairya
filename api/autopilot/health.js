/**
 * DigiAi Dhairya AutoPilot — backend readiness endpoint.
 *
 * This endpoint intentionally exposes no secrets or account configuration.
 * It verifies that the Vercel Functions runtime is serving the API route.
 */
module.exports = function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({
      ok: false,
      error: "METHOD_NOT_ALLOWED",
    });
  }

  return res.status(200).json({
    ok: true,
    service: "digiai-dhairya-autopilot",
    status: "foundation",
    publishingEnabled: false,
    databaseConnected: false,
    checkedAt: new Date().toISOString(),
  });
};
