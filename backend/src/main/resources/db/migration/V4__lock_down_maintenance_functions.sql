-- The database linter flagged these as callable by anon/authenticated through
-- PostgREST (/rest/v1/rpc/...). They are maintenance routines, not API surface:
-- anyone could have hammered them to burn CPU on the free tier, and
-- rollup_daily_stats takes a parameter and writes rows.
--
-- Only service_role (i.e. Spring Boot's scheduled job) should run them.

revoke all on function public.recompute_trending_scores() from public, anon, authenticated;
revoke all on function public.rollup_daily_stats(date)    from public, anon, authenticated;
revoke all on function public.touch_updated_at()          from public, anon, authenticated;

grant execute on function public.recompute_trending_scores() to service_role;
grant execute on function public.rollup_daily_stats(date)    to service_role;

-- touch_updated_at is a trigger function; triggers run as the table owner, so it
-- needs no direct EXECUTE grant at all.

comment on function public.recompute_trending_scores() is
  'Maintenance only. service_role. Called nightly by TrendingService.';
comment on function public.rollup_daily_stats(date) is
  'Maintenance only. service_role. Rolls raw events into project_daily_stats.';
comment on table public.project_daily_stats is
  'RLS enabled with no policy by design — deny-all to anon. Read via service_role.';
