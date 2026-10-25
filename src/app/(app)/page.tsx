import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Lock,
  Sparkles,
  HelpCircle,
  AlertCircle,
  Check,
} from 'lucide-react';
import { PROBLEMS, TOPICS, TOPIC_BY_SLUG } from '@/content/neetcode150';
import { createClient } from '@/lib/supabase/server';
import { recommendNext, todayString, topicStats, type ProgressRow } from '@/lib/recommend';
import { DifficultyBadge } from '@/components/ui';

export const metadata = { title: 'Roadmap · PatternRecall' };

export default async function RoadmapPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('progress')
    .select('problem_slug, status, hints_used, attempts, next_review_on');
  const progress = new Map<string, ProgressRow>((data ?? []).map((r) => [r.problem_slug, r as ProgressRow]));

  const rows = [...progress.values()];
  const solvedAlone = rows.filter((r) => r.status === 'solved').length;
  const neededHints = rows.filter((r) => r.status === 'hint').length;
  const stuckCount = rows.filter((r) => r.status === 'stuck').length;
  const totalCompleted = solvedAlone + neededHints;
  const totalProblems = PROBLEMS.length;
  const overallPct = Math.round((totalCompleted / totalProblems) * 100);

  const today = todayString();
  const bySlug = new Map(PROBLEMS.map((p) => [p.slug, p]));

  // All reviews currently due today
  const dueReviews = rows
    .filter((r) => r.status !== 'todo' && r.next_review_on && r.next_review_on <= today && bySlug.has(r.problem_slug))
    .map((r) => ({
      row: r,
      problem: bySlug.get(r.problem_slug)!,
    }));

  const rec = recommendNext(progress, today);

  return (
    <div className="space-y-8">
      {/* Header & Stats Strip */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Curriculum Roadmap</h1>
            <p className="text-xs text-zinc-400 mt-1">
              Active recall & spaced-repetition path across the NeetCode 150 patterns.
            </p>
          </div>
          <div className="text-right">
            <span className="font-mono text-sm font-semibold text-white">
              {totalCompleted} / {totalProblems}
            </span>
            <span className="ml-1 text-xs text-zinc-400">attempted ({overallPct}%)</span>
          </div>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3.5 space-y-1">
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
              <Check className="h-3.5 w-3.5" /> Solved Alone
            </span>
            <p className="text-xl font-bold text-white">{solvedAlone}</p>
            <p className="text-[11px] text-zinc-500">Scheduled for 7–21d</p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3.5 space-y-1">
            <span className="flex items-center gap-1.5 text-xs font-medium text-amber-400">
              <HelpCircle className="h-3.5 w-3.5" /> Needed Hints
            </span>
            <p className="text-xl font-bold text-white">{neededHints}</p>
            <p className="text-[11px] text-zinc-500">Scheduled for 2d</p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3.5 space-y-1">
            <span className="flex items-center gap-1.5 text-xs font-medium text-red-400">
              <AlertCircle className="h-3.5 w-3.5" /> Got Stuck
            </span>
            <p className="text-xl font-bold text-white">{stuckCount}</p>
            <p className="text-[11px] text-zinc-500">Scheduled for 1d</p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3.5 space-y-1">
            <span className="flex items-center gap-1.5 text-xs font-medium text-cyan-400">
              <Clock className="h-3.5 w-3.5" /> Reviews Due
            </span>
            <p className="text-xl font-bold text-white">{dueReviews.length}</p>
            <p className="text-[11px] text-zinc-500">Awaiting recall today</p>
          </div>
        </div>
      </div>

      {/* Up Next Recommended Problem */}
      {rec ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" /> Recommended Next Action
            </span>
          </div>

          <Link
            href={`/problems/${rec.problem.slug}`}
            className="group flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-500/10 via-zinc-900/80 to-zinc-900/40 p-5 shadow-lg shadow-emerald-950/20 transition hover:border-emerald-500/70 hover:from-emerald-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-bold text-white group-hover:text-emerald-300 transition">
                  {rec.problem.title}
                </span>
                <DifficultyBadge d={rec.problem.difficulty} />
                <span className="text-xs text-zinc-400">
                  in {TOPIC_BY_SLUG.get(rec.problem.topic)?.name}
                </span>
              </div>
              <p className="text-xs text-zinc-300 flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {rec.reason}
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-zinc-950 transition group-hover:bg-emerald-400">
              <span>Solve now</span>
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </div>
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center space-y-1">
          <p className="text-lg font-bold text-white">All 150 problems solved! 🎉</p>
          <p className="text-xs text-zinc-400">Keep checking back for spaced-repetition retention checkups.</p>
        </div>
      )}

      {/* Due Reviews Queue (if multiple reviews exist) */}
      {dueReviews.length > 0 && (
        <div className="space-y-3 rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Spaced Repetition Due Today ({dueReviews.length})
            </h2>
            <span className="text-[11px] text-zinc-400">Recall test before forgetting occurs</span>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {dueReviews.slice(0, 4).map(({ row, problem }) => (
              <Link
                key={problem.slug}
                href={`/problems/${problem.slug}`}
                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 transition hover:border-amber-500/40 hover:bg-zinc-900"
              >
                <div className="space-y-0.5 min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-xs font-semibold text-white">{problem.title}</span>
                    <DifficultyBadge d={problem.difficulty} />
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Previous: <span className="capitalize text-zinc-300">{row.status}</span>
                  </p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Roadmap Topics Grid with Prerequisite Status */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Pattern Roadmap by Topic</h2>
          <span className="text-xs text-zinc-400">18 Topic Categories</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {TOPICS.map((t) => {
            const { solved: s, total } = topicStats(progress, t.slug);
            const pct = total ? Math.round((s / total) * 100) : 0;
            const isMastered = s === total;

            // Prereq checking
            const unmetPrereqs = t.prereqs.filter((slug) => {
              const st = topicStats(progress, slug);
              return st.solved < Math.ceil(st.total / 2);
            });
            const isUnlocked = unmetPrereqs.length === 0;

            return (
              <Link
                key={t.slug}
                href={`/topics/${t.slug}`}
                className={`group relative rounded-2xl border p-4 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  isMastered
                    ? 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/60'
                    : isUnlocked
                    ? 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-650 hover:bg-zinc-900/70'
                    : 'border-zinc-850 bg-zinc-950/60 opacity-80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-white group-hover:text-emerald-300 transition">
                        {t.name}
                      </h3>
                      {isMastered ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      ) : !isUnlocked ? (
                        <Lock className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                      ) : null}
                    </div>

                    {!isUnlocked ? (
                      <p className="text-[11px] text-zinc-500">
                        Prereq: 50% in {unmetPrereqs.map((pr) => TOPIC_BY_SLUG.get(pr)?.name).join(', ')}
                      </p>
                    ) : (
                      <p className="text-[11px] text-zinc-400 line-clamp-1">{t.summary}</p>
                    )}
                  </div>

                  <span className="shrink-0 font-mono text-xs text-zinc-400">
                    <strong className="text-white">{s}</strong> / {total}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isMastered ? 'bg-emerald-400' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
