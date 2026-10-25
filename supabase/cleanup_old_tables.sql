-- OPTIONAL, DESTRUCTIVE. Not part of the migrations folder on purpose.
-- Run manually in the Supabase SQL editor once you're happy with the new app
-- and no longer need the old data.
DROP TABLE IF EXISTS public.revision_logs CASCADE;
DROP TABLE IF EXISTS public.problem_patterns CASCADE;
DROP TABLE IF EXISTS public.pattern_relations CASCADE;
DROP TABLE IF EXISTS public.problems CASCADE;
DROP TABLE IF EXISTS public.patterns CASCADE;
DROP TABLE IF EXISTS public.user_settings CASCADE;
