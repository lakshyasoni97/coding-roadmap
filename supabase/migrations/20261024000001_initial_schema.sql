-- PatternRecall Initial Schema Migration
-- Creates all core tables, constraints, generated full-text search columns, and triggers.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. user_settings
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    daily_review_goal INTEGER NOT NULL DEFAULT 10 CHECK (daily_review_goal BETWEEN 1 AND 100),
    theme_preference TEXT NOT NULL DEFAULT 'system' CHECK (theme_preference IN ('light', 'dark', 'system')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. problems
CREATE TABLE IF NOT EXISTS public.problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (char_length(trim(title)) > 0),
    problem_url TEXT,
    platform TEXT NOT NULL DEFAULT 'LeetCode' CHECK (platform IN ('LeetCode', 'HackerRank', 'Codeforces', 'NeetCode', 'Interview', 'Custom assessment', 'Other')),
    difficulty TEXT DEFAULT 'Medium' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    topics TEXT[] NOT NULL DEFAULT '{}',
    summary TEXT,
    initial_approach TEXT NOT NULL DEFAULT '',
    final_approach TEXT,
    failure_analysis TEXT,
    failure_categories TEXT[] NOT NULL DEFAULT '{}',
    time_complexity TEXT,
    space_complexity TEXT,
    code_snippet TEXT,
    outcome TEXT NOT NULL CHECK (outcome IN ('not_started', 'independent', 'hint_needed', 'could_not_solve')),
    roadmap_link TEXT,
    next_action TEXT,
    last_rating SMALLINT NOT NULL DEFAULT 0 CHECK (last_rating IN (0, 1, 2)),
    review_count INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
    consecutive_successes INTEGER NOT NULL DEFAULT 0 CHECK (consecutive_successes >= 0),
    interval_days INTEGER NOT NULL DEFAULT 1 CHECK (interval_days >= 1),
    last_reviewed_on DATE,
    next_review_on DATE NOT NULL DEFAULT (CURRENT_DATE + 1),
    personal_notes TEXT,
    attempted_at DATE NOT NULL DEFAULT CURRENT_DATE,
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', 
            coalesce(title, '') || ' ' || 
            coalesce(summary, '') || ' ' || 
            coalesce(initial_approach, '') || ' ' || 
            coalesce(final_approach, '') || ' ' || 
            coalesce(personal_notes, '')
        )
    ) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_problems_updated_at
BEFORE UPDATE ON public.problems
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_problems_user_next_review ON public.problems (user_id, next_review_on);
CREATE INDEX IF NOT EXISTS idx_problems_search_vector ON public.problems USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_problems_topics ON public.problems USING GIN (topics);
CREATE INDEX IF NOT EXISTS idx_problems_failure_categories ON public.problems USING GIN (failure_categories);

-- 3. patterns
CREATE TABLE IF NOT EXISTS public.patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    recognition_clues TEXT NOT NULL DEFAULT '',
    core_intuition TEXT NOT NULL DEFAULT '',
    derivation TEXT,
    applicable_conditions TEXT,
    non_applicable_conditions TEXT,
    implementation_recipe TEXT,
    time_complexity TEXT,
    space_complexity TEXT,
    common_mistakes TEXT,
    edge_cases TEXT,
    representative_examples TEXT,
    primary_link TEXT,
    difficulty_range TEXT DEFAULT 'Medium',
    self_test_question TEXT,
    roadmap_order INTEGER DEFAULT 0,
    mastery_status TEXT NOT NULL DEFAULT 'untested' CHECK (mastery_status IN ('untested', 'learning', 'reviewing', 'mastered')),
    last_rating SMALLINT CHECK (last_rating IN (0, 1, 2)),
    review_count INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
    consecutive_successes INTEGER NOT NULL DEFAULT 0 CHECK (consecutive_successes >= 0),
    hint_dependent_count INTEGER NOT NULL DEFAULT 0 CHECK (hint_dependent_count >= 0),
    interval_days INTEGER NOT NULL DEFAULT 1 CHECK (interval_days >= 1),
    last_reviewed_on DATE,
    next_review_on DATE NOT NULL DEFAULT (CURRENT_DATE + 1),
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', 
            coalesce(name, '') || ' ' || 
            coalesce(category, '') || ' ' || 
            coalesce(recognition_clues, '') || ' ' || 
            coalesce(core_intuition, '')
        )
    ) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_patterns_user_lower_name ON public.patterns (user_id, lower(name));
CREATE INDEX IF NOT EXISTS idx_patterns_user_next_review ON public.patterns (user_id, next_review_on);
CREATE INDEX IF NOT EXISTS idx_patterns_search_vector ON public.patterns USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_patterns_category ON public.patterns (user_id, category);

CREATE TRIGGER update_patterns_updated_at
BEFORE UPDATE ON public.patterns
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. problem_patterns (Many-to-Many Join)
CREATE TABLE IF NOT EXISTS public.problem_patterns (
    problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
    pattern_id UUID NOT NULL REFERENCES public.patterns(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (problem_id, pattern_id)
);

CREATE INDEX IF NOT EXISTS idx_problem_patterns_pattern ON public.problem_patterns (pattern_id);
CREATE INDEX IF NOT EXISTS idx_problem_patterns_user ON public.problem_patterns (user_id);

-- 5. pattern_relations (Self-Referential Join)
CREATE TABLE IF NOT EXISTS public.pattern_relations (
    pattern_id UUID NOT NULL REFERENCES public.patterns(id) ON DELETE CASCADE,
    related_pattern_id UUID NOT NULL REFERENCES public.patterns(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    PRIMARY KEY (pattern_id, related_pattern_id),
    CHECK (pattern_id <> related_pattern_id)
);

CREATE INDEX IF NOT EXISTS idx_pattern_relations_related ON public.pattern_relations (related_pattern_id);
CREATE INDEX IF NOT EXISTS idx_pattern_relations_user ON public.pattern_relations (user_id);

-- 6. revision_logs (Immutable Audit Trail)
CREATE TABLE IF NOT EXISTS public.revision_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('problem', 'pattern')),
    problem_id UUID REFERENCES public.problems(id) ON DELETE CASCADE,
    pattern_id UUID REFERENCES public.patterns(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating IN (0, 1, 2)),
    recall_notes TEXT,
    previous_interval_days INTEGER NOT NULL,
    new_interval_days INTEGER NOT NULL,
    previous_next_review_on DATE,
    new_next_review_on DATE NOT NULL,
    reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (
        (target_type = 'problem' AND problem_id IS NOT NULL AND pattern_id IS NULL) OR
        (target_type = 'pattern' AND pattern_id IS NOT NULL AND problem_id IS NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_revision_logs_user_target ON public.revision_logs (user_id, target_type, reviewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_revision_logs_problem ON public.revision_logs (problem_id);
CREATE INDEX IF NOT EXISTS idx_revision_logs_pattern ON public.revision_logs (pattern_id);

