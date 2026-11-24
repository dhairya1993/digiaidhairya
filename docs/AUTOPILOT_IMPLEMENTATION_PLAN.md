# DigiAi Dhairya AutoPilot — Implementation Plan

## Current repository baseline

Repository: `dhairya1993/digiaidhairya`  
Production branch: `main`  
Working branch: `feature/social-autopilot-foundation`

The inspected repository snapshot is a static website built around `index.html`, `script.js`, styles/assets and a web manifest. No `package.json`, application server, durable database client, or existing social publishing backend was found in the inspected root files. The newsletter handler in `script.js` is a simulated client-side submission, not a production backend.

## Architecture decision

Preserve the existing static frontend and add a server-side automation layer on Vercel:

- Static website remains the public frontend.
- Vercel Node.js Functions under `/api/*` provide authenticated server endpoints.
- The user's existing Supabase Postgres project is the intended durable store. The additive migration in `supabase/migrations/202611240001_autopilot_foundation.sql` creates only `autopilot_*` tables and does not replace existing application tables. It must be applied to the existing project before enabling the worker.
- Vercel Cron invokes a protected worker endpoint. The current schedule is once daily (`0 3 * * *`, UTC) as a zero-additional-cost baseline compatible with Vercel Hobby cron limits. The worker checks the Asia/Kolkata daily campaign cap. Increase frequency only after confirming the Vercel plan supports it.
- Media files are stored in an object-storage bucket with public, time-limited or stable URLs suitable for Meta's media fetch requirements.
- AI generation and media rendering are separate pipeline stages. Never generate or publish inside a request that can time out.
- Platform adapters isolate YouTube, Instagram, and Facebook API differences.

## Balanced automatic publishing defaults

- Fully automatic after account authorization and platform readiness checks.
- Asia/Kolkata timezone.
- Maximum two content campaigns per day by default; each campaign may publish platform-specific variants to all connected channels.
- Queue overflow is deferred to the next eligible slot.
- High-priority security advisories may be expedited only when marked urgent by the content classifier and validated against a source.
- Generate both vertical video (9:16) and image creative (4:5 or 1:1 as appropriate); choose the suitable format per platform and content type.
- Do not publish duplicate events; use stable event IDs and per-platform idempotency keys.
- Default YouTube visibility should be private/unlisted during initial testing; public auto-publishing is enabled only after a successful end-to-end test and explicit account setup.
- Include a global kill switch, per-platform pause, retry/backoff, dead-letter status, and an audit log.

## Pipeline

1. **Content event registration** — add a structured event whenever an AI tool, article, deal, tutorial, prompt, category, or site feature is added/meaningfully updated. Ignore cosmetic changes.
2. **Validation and deduplication** — require canonical URL, title, summary, category, source/evidence, event type, and content hash.
3. **AI package generation** — create a factual script, platform-specific captions, titles, tags, CTA, thumbnail/image brief, and video storyboard. Reject unsupported claims and expired deals.
4. **Asset rendering** — generate image/video assets, captions/subtitles, brand mark and final public media URLs.
5. **Scheduling** — place campaign in the Asia/Kolkata queue with daily caps and spacing.
6. **Publishing** — call platform-specific APIs with refreshable OAuth tokens and resumable/retry-safe uploads.
7. **Verification and analytics** — store remote post IDs, URLs, status, errors, and available metrics.

## Suggested data model

- `content_events`: source type, source URL, title, summary, category, content hash, created/updated time, priority, validation state.
- `campaigns`: event ID, generated script/captions, selected format, asset references, scheduled time, status.
- `platform_accounts`: platform, account/page/channel IDs, encrypted refresh/access token material, scopes, expiry, connection status.
- `publish_jobs`: campaign ID, platform, status, scheduled time, attempts, idempotency key, remote post ID/URL, last error.
- `publish_logs`: immutable attempt and moderation/audit trail.
- `autopilot_settings`: global enabled flag, platform toggles, daily cap, quiet hours, timezone, kill switch.

Never expose platform tokens or AI provider keys to browser JavaScript. Encrypt tokens at rest and keep secrets in server-only environment variables or a managed secrets store.

## Implementation phases

### Phase 0 — Readiness and accounts
- Confirm the Vercel project connected to this repository and production domain.
- Use the user's existing Supabase project; do not create a duplicate project. Apply the additive migration in `supabase/migrations/202611240001_autopilot_foundation.sql`.
- Create Google Cloud OAuth app and enable YouTube Data API.
- Create Meta developer app; connect the Instagram Professional account and Facebook Page; request/configure required permissions and app review where required.
- Select AI provider, text-to-speech/video rendering provider, and storage provider; establish spending limits.

### Phase 1 — Backend foundation (initial scaffold committed)
- Added Node.js Vercel Functions under `api/autopilot/`.
- Added Supabase REST helper, event ingestion endpoint, Gemini content-generation worker and database health endpoint.
- Added additive Supabase migration with RLS enabled and no anon/authenticated table policies.
- Added `.env.example` and secret exclusions in `.gitignore`.
- Added Vercel Cron configuration; worker remains disabled by default until database setup is verified.
- Remaining: admin authentication/dashboard, safe event producers from the actual site content workflows, and stronger queue claiming/locking before production volume.

### Phase 2 — Content generation and media
- Build platform-specific prompt templates and factual validation.
- Render one image and one 9:16 video per campaign.
- Upload assets to storage and validate public media URLs, dimensions, duration, file type and caption/subtitle presence.

### Phase 3 — Platform connections and publishing
- Implement OAuth connect/callback, token refresh and disconnect.
- Implement YouTube upload, Instagram media container + publish flow, and Facebook Page publishing.
- Add retries, per-platform rate-limit handling, and remote post verification.
- Start with private/unlisted or test content; enable public automatic publishing only after tests.

### Phase 4 — Admin dashboard and rollout
- Add `/admin/social-autopilot` with queue, preview, status, history, connected accounts, usage/costs, per-platform switches and emergency stop.
- Run in dry-run for 3–7 days, then limited live pilot, then enable balanced automatic mode.
- Monitor failures, duplicate rate, publish latency, cost per campaign and engagement.

## Initial environment variable names

Names only — values must be added privately in Vercel and must never be committed:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`
- `AUTOPILOT_ADMIN_SECRET` (or an established admin auth provider)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `META_APP_ID`
- `META_APP_SECRET`
- `TOKEN_ENCRYPTION_KEY`
- `AI_PROVIDER_API_KEY`
- `MEDIA_STORAGE_URL`
- `MEDIA_STORAGE_KEY`

Use the least-privilege scopes required for publishing. Do not paste secrets into chat, GitHub files, frontend code, or screenshots.

## Acceptance criteria

- A meaningful new website content event creates exactly one campaign.
- Cosmetic website edits do not create campaigns.
- A campaign generates both image and video assets and platform-specific copy.
- Daily cap and Asia/Kolkata schedule are enforced server-side.
- Duplicate jobs cannot publish twice, including after retries.
- Disconnected/expired accounts fail safely and raise a dashboard alert.
- Global and per-platform pause stop future publishing immediately.
- Every attempt is auditable and failures can be retried safely.
- Existing public website pages and SEO URLs remain unchanged.


## Implemented scaffold — setup checklist

The current branch is `feature/social-autopilot-foundation`. The following files are present:

- `supabase/migrations/202611240001_autopilot_foundation.sql`
- `api/autopilot/_lib.js`
- `api/autopilot/health.js`
- `api/autopilot/events.js`
- `api/autopilot/worker.js`
- `vercel.json`
- `.env.example`

### Apply to the existing Supabase project

1. Open the existing Supabase project (do not create another).
2. Open SQL Editor and run the complete migration file above from this branch.
3. Confirm the four `autopilot_*` tables appear: `autopilot_content_events`, `autopilot_campaigns`, `autopilot_publish_jobs`, and `autopilot_settings`.
4. Keep `autopilot_settings.enabled=false` until Vercel environment variables and a test event are ready.

### Configure Vercel environment variables

Add these as server-only variables in the `digiaidhairya` Vercel project, for Preview and Production as appropriate:

- `SUPABASE_URL` — existing project's Project URL.
- `SUPABASE_SERVICE_ROLE_KEY` — existing project's service-role secret; never use the anon key here.
- `AUTOPILOT_INGEST_SECRET` — long random secret for authenticated event ingestion.
- `CRON_SECRET` — long random secret used by Vercel Cron.
- `GEMINI_API_KEY` — Google AI Studio API key, if an eligible free quota is available.
- `GEMINI_MODEL` — optional; default is `gemini-2.5-flash`.

Do not commit real values, paste them into chat, or place them in browser JavaScript.

### Initial endpoint checks

- `GET /api/autopilot/health` — confirms server can query the new Supabase settings table.
- `POST /api/autopilot/events` — accepts a JSON event only with `Authorization: Bearer <AUTOPILOT_INGEST_SECRET>`.
- Vercel Cron calls `GET /api/autopilot/worker` with `Authorization: Bearer <CRON_SECRET>`.

Example event body:

```json
{
  "source_type": "tool",
  "source_id": "sample-tool-slug",
  "title": "New AI tool added",
  "summary": "A short factual description based on the tool's verified listing.",
  "canonical_url": "https://digiaidhairya.in/ai-tools/",
  "category": "Productivity",
  "content_hash": "replace-with-a-stable-sha256-hash",
  "source_evidence": {
    "source": "verified website content record"
  }
}
```

### Current limitations — do not enable public publishing yet

- Existing database credentials have not been supplied to Vercel; database connectivity has not yet been verified.
- The current static site content workflows have not yet been wired to emit events automatically. Event ingestion is available, but website-side event detection still needs implementation.
- The Gemini worker creates text packages and storyboards only. It does not yet render image/video assets.
- YouTube, Instagram and Facebook OAuth/publishing adapters are not implemented. No posts will be published by this scaffold.
- Admin dashboard and token encryption/account storage are still pending.
- Worker concurrency/atomic job claiming must be hardened before processing multiple concurrent events.
