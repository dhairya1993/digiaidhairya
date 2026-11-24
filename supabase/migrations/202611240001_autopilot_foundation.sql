-- DigiAi Dhairya AutoPilot additive migration.
-- Does not modify or replace any existing application tables.
create extension if not exists pgcrypto;

create table if not exists public.autopilot_content_events (
  id uuid primary key default gen_random_uuid(),
  source_type text not null check (source_type in ('tool','blog','deal','tutorial','prompt','category','feature','security_advisory','manual')),
  source_id text not null,
  canonical_url text,
  title text not null,
  summary text not null,
  category text,
  source_evidence jsonb not null default '{}'::jsonb,
  content_hash text not null,
  priority text not null default 'normal' check (priority in ('normal','high','urgent')),
  status text not null default 'queued' check (status in ('queued','processing','generated','skipped','failed')),
  discovered_at timestamptz not null default now(),
  processed_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_type, source_id, content_hash)
);

create index if not exists autopilot_events_queue_idx
  on public.autopilot_content_events (status, priority, discovered_at);

create table if not exists public.autopilot_campaigns (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.autopilot_content_events(id) on delete cascade,
  status text not null default 'generated' check (status in ('generated','scheduled','publishing','published','partial','failed','cancelled')),
  generated_content jsonb not null,
  media_plan jsonb not null default '{}'::jsonb,
  scheduled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id)
);

create table if not exists public.autopilot_publish_jobs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.autopilot_campaigns(id) on delete cascade,
  platform text not null check (platform in ('youtube','instagram','facebook')),
  post_format text not null check (post_format in ('video','image')),
  status text not null default 'blocked' check (status in ('queued','publishing','published','failed','blocked')),
  scheduled_at timestamptz,
  remote_post_id text,
  remote_post_url text,
  attempts integer not null default 0,
  last_error text,
  idempotency_key text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campaign_id, platform, post_format)
);

create table if not exists public.autopilot_settings (
  id boolean primary key default true check (id),
  enabled boolean not null default false,
  dry_run boolean not null default true,
  timezone text not null default 'Asia/Kolkata',
  daily_campaign_limit integer not null default 2 check (daily_campaign_limit between 1 and 10),
  updated_at timestamptz not null default now()
);

insert into public.autopilot_settings (id, enabled, dry_run)
values (true, false, true)
on conflict (id) do nothing;

alter table public.autopilot_content_events enable row level security;
alter table public.autopilot_campaigns enable row level security;
alter table public.autopilot_publish_jobs enable row level security;
alter table public.autopilot_settings enable row level security;

-- Intentionally no anon/authenticated policies. Only server-side service-role
-- operations may access these tables until a separately authenticated admin UI exists.
