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
- Supabase Postgres is the recommended durable store for content events, queue state, platform connections, publish attempts, and audit history. This is a proposed dependency and must be provisioned/approved before enabling it.
- Vercel Cron invokes a protected worker endpoint to discover eligible events, prepare jobs, and publish due content. Every invocation is authenticated with a server-only cron secret.
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
- Provision Supabase project and run migrations.
- Create Google Cloud OAuth app and enable YouTube Data API.
- Create Meta developer app; connect the Instagram Professional account and Facebook Page; request/configure required permissions and app review where required.
- Select AI provider, text-to-speech/video rendering provider, and storage provider; establish spending limits.

### Phase 1 — Backend foundation
- Add TypeScript/Node Vercel Functions and server-only configuration.
- Add Supabase schema, row-level security, service-role-only server access, and migrations.
- Implement admin authentication, signed webhook/cron validation, event ingestion, deduplication, queue and audit log.
- Add a dry-run mode that generates preview packages but cannot publish.

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
