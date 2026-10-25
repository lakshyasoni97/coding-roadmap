# PatternRecall

A minimal NeetCode 150 tracker with hints, plain-English complexity coaching and "what should I do next" suggestions.

## Pages
- `/` roadmap: 18 topics with progress bars and an **Up next** suggestion
- `/topics/[slug]` pattern summary, template and problem checklist
- `/problems/[slug]` 3-level hints, paste-your-approach **Analyze complexity** (Gemini), rating, notes
- `⌘J` Python & Big-O cheat sheet drawer

## How it works
- The curriculum is static code: `src/content/neetcode150.ts`.
- The DB stores only progress: one `progress` table (`supabase/migrations/20261025000001_progress.sql`).
- `src/lib/recommend.ts` picks the next problem: due reviews → weak topics → roadmap order.
- `src/lib/ai.ts` has two Gemini actions: `getHintAction` and `analyzeApproachAction`.

## Setup
`.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GEMINI_API_KEY`, optional `GEMINI_MODEL`.

1. Run `supabase/migrations/20261025000001_progress.sql` in the Supabase SQL editor.
2. `npm install && npm run dev`
3. Tests: `npx vitest run`

The old tables are untouched. When you no longer need them, run `supabase/cleanup_old_tables.sql` manually.
