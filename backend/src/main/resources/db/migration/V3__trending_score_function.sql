-- Recomputes projects.trending_score.
--
-- Vercel Web Analytics is not enabled on the deployed projects, so "trending" means
-- engagement with THIS site: which cards get opened and clicked through.
--
--   score = sum(weight(event) * 0.85^days_ago)   over a 14-day window
--         + 5.0 * 0.9^days_since_release          recency bootstrap
--
-- The bootstrap is what puts a brand-new project on the shelf with zero clicks —
-- without it the row would sit empty until traffic arrives.
--
-- Lives in SQL rather than only in Spring Boot so it still works when the backend
-- is asleep on the free tier. Spring Boot's @Scheduled job just calls it.
create or replace function public.recompute_trending_scores()
returns void language sql security definer set search_path = '' as $$
  with engagement as (
    select e.project_id,
      sum(
        case e.event_type
          when 'CLICK_LIVE' then 3.0
          when 'CLICK_REPO' then 2.0
          when 'OPEN'       then 1.0
          when 'VIEW'       then 0.2
          else 0.0
        end
        * power(0.85, greatest(0, extract(epoch from (now() - e.occurred_at)) / 86400.0))
      ) as pts
    from public.project_events e
    where e.occurred_at >= now() - interval '14 days'
    group by e.project_id
  )
  update public.projects p
  set trending_score = round((
        coalesce(en.pts, 0)
        + case when p.released_at is null then 0
               else 5.0 * power(0.9, greatest(0, (current_date - p.released_at))) end
      )::numeric, 4)
  from (select id from public.projects) ids
  left join engagement en on en.project_id = ids.id
  where p.id = ids.id;
$$;

-- Rolls yesterday's raw events into project_daily_stats so trending never has to
-- scan the full event log as it grows.
create or replace function public.rollup_daily_stats(target_day date default (current_date - 1))
returns void language sql security definer set search_path = '' as $$
  insert into public.project_daily_stats (project_id, day, views, opens, clicks)
  select e.project_id, target_day,
    count(*) filter (where e.event_type = 'VIEW'),
    count(*) filter (where e.event_type = 'OPEN'),
    count(*) filter (where e.event_type in ('CLICK_LIVE','CLICK_REPO'))
  from public.project_events e
  where e.occurred_at >= target_day and e.occurred_at < target_day + 1
  group by e.project_id
  on conflict (project_id, day) do update set
    views = excluded.views, opens = excluded.opens, clicks = excluded.clicks;
$$;

insert into public.profile (name, headline, bio, email, location, socials)
values (
  'Amartya Panigrahi',
  'Software Development Engineer · Freelancer',
  'I build systems across AI, security, graphics and infrastructure — and the interfaces that make them legible.',
  'amartyapanigrahi@gmail.com',
  'India',
  '{"github":"https://github.com/XSoloLevelerX"}'::jsonb
)
on conflict do nothing;
