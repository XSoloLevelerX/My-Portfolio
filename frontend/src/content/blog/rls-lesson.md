---
title: The Supabase policy I got wrong
category: ENGINEERING
blurb: SECURITY DEFINER functions were reachable over the public REST API.
platform: SITE
date: 2026-08-19
tags: [Postgres, Security]
---
Row Level Security covered the tables, but the maintenance functions were SECURITY DEFINER and still granted to anon — reachable over PostgREST. The database linter caught it. Enabling RLS is not the same as being locked down.