-- PatternRecall Row Level Security (RLS) Policies
-- Enforces complete tenant isolation for single-user and multi-tenant security.

-- Enable and force RLS on all tables
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings FORCE ROW LEVEL SECURITY;

ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems FORCE ROW LEVEL SECURITY;

ALTER TABLE public.patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patterns FORCE ROW LEVEL SECURITY;

ALTER TABLE public.problem_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_patterns FORCE ROW LEVEL SECURITY;

ALTER TABLE public.pattern_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pattern_relations FORCE ROW LEVEL SECURITY;

ALTER TABLE public.revision_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_logs FORCE ROW LEVEL SECURITY;

-- 1. user_settings policies
CREATE POLICY user_settings_select ON public.user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY user_settings_insert ON public.user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_settings_update ON public.user_settings
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_settings_delete ON public.user_settings
    FOR DELETE USING (auth.uid() = user_id);

-- 2. problems policies
CREATE POLICY problems_select ON public.problems
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY problems_insert ON public.problems
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY problems_update ON public.problems
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY problems_delete ON public.problems
    FOR DELETE USING (auth.uid() = user_id);

-- 3. patterns policies
CREATE POLICY patterns_select ON public.patterns
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY patterns_insert ON public.patterns
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY patterns_update ON public.patterns
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY patterns_delete ON public.patterns
    FOR DELETE USING (auth.uid() = user_id);

-- 4. problem_patterns policies (Join table with subquery ownership checks)
CREATE POLICY problem_patterns_select ON public.problem_patterns
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY problem_patterns_insert ON public.problem_patterns
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (SELECT 1 FROM public.problems p WHERE p.id = problem_id AND p.user_id = auth.uid()) AND
        EXISTS (SELECT 1 FROM public.patterns pat WHERE pat.id = pattern_id AND pat.user_id = auth.uid())
    );

CREATE POLICY problem_patterns_delete ON public.problem_patterns
    FOR DELETE USING (auth.uid() = user_id);

-- 5. pattern_relations policies
CREATE POLICY pattern_relations_select ON public.pattern_relations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY pattern_relations_insert ON public.pattern_relations
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (SELECT 1 FROM public.patterns p1 WHERE p1.id = pattern_id AND p1.user_id = auth.uid()) AND
        EXISTS (SELECT 1 FROM public.patterns p2 WHERE p2.id = related_pattern_id AND p2.user_id = auth.uid())
    );

CREATE POLICY pattern_relations_delete ON public.pattern_relations
    FOR DELETE USING (auth.uid() = user_id);

-- 6. revision_logs policies (Insert & Select only, immutable audit log)
CREATE POLICY revision_logs_select ON public.revision_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY revision_logs_insert ON public.revision_logs
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        (
            (target_type = 'problem' AND EXISTS (SELECT 1 FROM public.problems p WHERE p.id = problem_id AND p.user_id = auth.uid()))
            OR
            (target_type = 'pattern' AND EXISTS (SELECT 1 FROM public.patterns pat WHERE pat.id = pattern_id AND pat.user_id = auth.uid()))
        )
    );

CREATE POLICY revision_logs_delete ON public.revision_logs
    FOR DELETE USING (auth.uid() = user_id);

