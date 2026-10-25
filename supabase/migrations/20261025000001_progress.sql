-- Simplified schema: the curriculum lives in code (src/content/neetcode150.ts);
-- the database only stores per-user progress.
CREATE TABLE IF NOT EXISTS public.progress (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    problem_slug TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'solved', 'hint', 'stuck')),
    hints_used SMALLINT NOT NULL DEFAULT 0,
    attempts SMALLINT NOT NULL DEFAULT 0,
    notes TEXT,
    last_analysis TEXT,
    last_attempt_on DATE,
    next_review_on DATE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, problem_slug)
);

ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own progress" ON public.progress;
CREATE POLICY "own progress" ON public.progress
    FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
