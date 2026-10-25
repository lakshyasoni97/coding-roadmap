-- PatternRecall Curriculum & Roadmap Schema Upgrade
-- Adds rich roadmap fields for canonical patterns and problem attempts.

ALTER TABLE public.patterns
  ADD COLUMN IF NOT EXISTS primary_link TEXT,
  ADD COLUMN IF NOT EXISTS difficulty_range TEXT DEFAULT 'Medium',
  ADD COLUMN IF NOT EXISTS self_test_question TEXT,
  ADD COLUMN IF NOT EXISTS roadmap_order INTEGER DEFAULT 0;

ALTER TABLE public.problems
  ADD COLUMN IF NOT EXISTS roadmap_link TEXT,
  ADD COLUMN IF NOT EXISTS next_action TEXT;

ALTER TABLE public.problems
  DROP CONSTRAINT IF EXISTS problems_outcome_check;

ALTER TABLE public.problems
  ADD CONSTRAINT problems_outcome_check
  CHECK (outcome IN ('not_started', 'independent', 'hint_needed', 'could_not_solve'));

ALTER TABLE public.problems
  DROP CONSTRAINT IF EXISTS problems_platform_check;

ALTER TABLE public.problems
  ADD CONSTRAINT problems_platform_check
  CHECK (platform IN ('LeetCode', 'HackerRank', 'Codeforces', 'NeetCode', 'Interview', 'Custom assessment', 'Other'));

