-- RLS on every table. Default posture: the public can read published content and can
-- append (but never read) contact messages and engagement events. Everything else is
-- service_role only, which bypasses RLS and is what Spring Boot uses.

alter table public.projects            enable row level security;
alter table public.project_events      enable row level security;
alter table public.project_daily_stats enable row level security;
alter table public.skills              enable row level security;
alter table public.certifications      enable row level security;
alter table public.blog_posts          enable row level security;
alter table public.profile             enable row level security;
alter table public.contact_messages    enable row level security;

create policy "public reads projects" on public.projects
  for select to anon, authenticated using (status <> 'ARCHIVED');

create policy "public reads skills" on public.skills
  for select to anon, authenticated using (true);

create policy "public reads certifications" on public.certifications
  for select to anon, authenticated using (true);

-- Drafts stay invisible.
create policy "public reads published posts" on public.blog_posts
  for select to anon, authenticated
  using (status = 'PUBLISHED' and published_at is not null and published_at <= now());

create policy "public reads profile" on public.profile
  for select to anon, authenticated using (true);

-- Append-only public writes. The site keeps working when the backend is asleep,
-- which is the whole point of the static-first design. Length caps blunt the
-- obvious abuse; the backend rate-limits properly when it is awake.
create policy "public appends contact messages" on public.contact_messages
  for insert to anon, authenticated
  with check (
    length(name)    between 1 and 120
    and length(email)   between 3 and 200
    and length(message) between 1 and 5000
    and handled = false
  );

create policy "public appends engagement events" on public.project_events
  for insert to anon, authenticated
  with check (
    event_type in ('VIEW','OPEN','CLICK_LIVE','CLICK_REPO')
    and (referrer is null or length(referrer) <= 500)
    and (session_hash is null or length(session_hash) <= 128)
  );

-- No SELECT policy on contact_messages, project_events, or project_daily_stats:
-- with RLS enabled and no policy, anon reads return nothing. The raw event log and
-- the inbox are readable only through service_role.
