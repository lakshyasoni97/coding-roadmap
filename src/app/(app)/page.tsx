import Link from 'next/link';
import { cookies } from 'next/headers';
import {
  CheckCircle2,
  Clock,
  Lock,
  ChevronRight,
} from 'lucide-react';
import {
  TOPIC_BY_SLUG,
  TRACKS,
  TRACK_BY_ID,
  TRACK_COOKIE,
  parseTrack,
  problemsForTrack,
  type TrackId,
} from '@/content/neetcode150';
import { createClient } from '@/lib/supabase/server';
import { recommendNext, todayString, topicStats, type ProgressRow } from '@/lib/recommend';
import { RoadmapTrackSwitcher } from '@/components/RoadmapTrackSwitcher';
import { DifficultyBadge, StatusBadge } from '@/components/ui';

export const metadata = { title: 'Curriculum · PatternRecall' };

const CURRICULUM_TIERS: {
  stage: string;
  title: string;
  description: string;
  slugs: string[];
}[] = [
  {
    stage: 'Stage 1',
    title: 'Array & pointer foundations',
    description: 'Linear scans, hash lookups, and shrinking/growing index windows.',
    slugs: ['arrays-hashing', 'two-pointers', 'sliding-window', 'stack'],
  },
  {
    stage: 'Stage 2',
    title: 'Logarithmic search & pointer structures',
    description: 'Halving monotonic search spaces, pointer rewiring, and recursive tree traversals.',
    slugs: ['binary-search', 'linked-list', 'trees'],
  },
  {
    stage: 'Stage 3',
    title: 'Priority queues, search trees & graphs',
    description: 'Top-k streaming, prefix trees, exhaustive state-space search, and graph connectivity.',
    slugs: ['heap', 'tries', 'backtracking', 'graphs', 'advanced-graphs'],
  },
  {
    stage: 'Stage 4',
    title: 'Dynamic programming, greedy & bit logic',
    description: 'Overlapping subproblems, interval sweeps, locally optimal choices, and bitwise invariants.',
    slugs: ['1d-dp', '2d-dp', 'greedy', 'intervals', 'math-geometry', 'bit-manipulation'],
  },
];

export default async function RoadmapPage() {
  const cookieStore = await cookies();
  const activeTrack: TrackId = parseTrack(cookieStore.get(TRACK_COOKIE)?.value);
  const trackMeta = TRACK_BY_ID.get(activeTrack)!;

  const supabase = await createClient();
  const { data } = await supabase
    .from('progress')
    .select('problem_slug, status, hints_used, attempts, next_review_on');
  const progress = new Map<string, ProgressRow>((data ?? []).map((r) => [r.problem_slug, r as ProgressRow]));

  const trackProblems = problemsForTrack(activeTrack);
  const bySlug = new Map(trackProblems.map((p) => [p.slug, p]));

  const rowsInTrack = trackProblems
    .map((p) => progress.get(p.slug))
    .filter((r): r is ProgressRow => Boolean(r));

  const solvedAlone = rowsInTrack.filter((r) => r.status === 'solved').length;
  const neededHints = rowsInTrack.filter((r) => r.status === 'hint').length;
  const stuckCount = rowsInTrack.filter((r) => r.status === 'stuck').length;
  const totalCompleted = solvedAlone + neededHints;
  const totalProblems = trackProblems.length;

  const countsByTrack = Object.fromEntries(
    TRACKS.map((t) => {
      const list = problemsForTrack(t.id);
      const completed = list.filter((p) => {
        const st = progress.get(p.slug)?.status;
        return st === 'solved' || st === 'hint';
      }).length;
      return [t.id, { completed, total: list.length }];
    })
  ) as Record<TrackId, { completed: number; total: number }>;

  const today = todayString();

  const dueReviews = rowsInTrack
    .filter((r) => r.status !== 'todo' && r.next_review_on && r.next_review_on <= today && bySlug.has(r.problem_slug))
    .map((r) => ({
      row: r,
      problem: bySlug.get(r.problem_slug)!,
    }));

  const rec = recommendNext(progress, today, activeTrack);
  const recTopic = rec ? TOPIC_BY_SLUG.get(rec.problem.topic) : null;
  const recRow = rec ? progress.get(rec.problem.slug) : null;

  return (
    <div className="space-y-10">
      {/* Header & Compact Retention Ledger */}
      <div className="border-b border-hairline pb-5 space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-medium tracking-tight text-white">
              Algorithmic curriculum
            </h1>
            <p className="mt-1 text-sm text-pewter max-w-xl">
              {trackMeta.tagline}
            </p>
          </div>

          <RoadmapTrackSwitcher currentTrack={activeTrack} countsByTrack={countsByTrack} />
        </div>

        {/* Segmented Retention Bar & Inline Counts */}
        <div className="space-y-2 pt-1">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-pewter">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <strong className="font-mono font-medium text-white">{solvedAlone}</strong> retained (7–21d)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <strong className="font-mono font-medium text-white">{neededHints}</strong> assisted (2d)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-400" />
                <strong className="font-mono font-medium text-white">{stuckCount}</strong> needs recall (1d)
              </span>
              {dueReviews.length > 0 && (
                <span className="inline-flex items-center gap-1.5 text-amber-300 font-medium">
                  <Clock className="h-3.5 w-3.5" />
                  <strong className="font-mono">{dueReviews.length}</strong> due today
                </span>
              )}
            </div>

            <div className="font-mono text-xs text-pewter">
              <strong className="text-white">{totalCompleted}</strong> / {totalProblems} in {trackMeta.shortName}
            </div>
          </div>

          <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-surface border border-hairline/60">
            <div
              className="h-full bg-emerald-400 transition-all duration-300"
              style={{ width: `${totalProblems ? (solvedAlone / totalProblems) * 100 : 0}%` }}
            />
            <div
              className="h-full bg-amber-400 transition-all duration-300"
              style={{ width: `${totalProblems ? (neededHints / totalProblems) * 100 : 0}%` }}
            />
            <div
              className="h-full bg-rose-400 transition-all duration-300"
              style={{ width: `${totalProblems ? (stuckCount / totalProblems) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* HERO: Active Recall Index Card */}
      {rec ? (
        <section aria-label="Next recall prompt" className="grid gap-4 lg:grid-cols-12 items-stretch">
          <div
            className={`flex flex-col justify-between rounded-xl border border-hairline bg-surface p-6 sm:p-7 shadow-sm ${
              dueReviews.length > 1 ? 'lg:col-span-8' : 'lg:col-span-12'
            }`}
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline/80 pb-3 text-xs text-pewter">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-cobalt">Up next in your queue</span>
                  <span>/</span>
                  <Link
                    href={`/topics/${rec.problem.topic}`}
                    className="text-ink hover:underline"
                  >
                    {recTopic?.name}
                  </Link>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span>Target: {rec.problem.time} time, {rec.problem.space} space</span>
                  {recRow?.attempts ? <span>({recRow.attempts} prev. attempts)</span> : null}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-baseline gap-3">
                  <h2 className="font-serif text-2xl sm:text-3xl font-medium text-white tracking-tight">
                    {rec.problem.title}
                  </h2>
                  <DifficultyBadge d={rec.problem.difficulty} />
                  {recRow && recRow.status !== 'todo' && <StatusBadge status={recRow.status} />}
                </div>
                <p className="text-sm text-pewter max-w-2xl leading-relaxed">
                  {rec.reason}. {recTopic?.summary}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-hairline/60">
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/problems/${rec.problem.slug}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-cobalt px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt"
                >
                  Open problem workbench
                </Link>
                <a
                  href={rec.problem.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-canvas px-3.5 py-2.5 text-xs font-medium text-pewter transition hover:border-pewter/50 hover:text-white"
                >
                  Read prompt on LeetCode
                </a>
              </div>

              <span className="font-mono text-[11px] text-pewter">
                Recall hint available inside workbench
              </span>
            </div>
          </div>

          {/* Side Queue if multiple due reviews exist */}
          {dueReviews.length > 1 && (
            <div className="lg:col-span-4 flex flex-col justify-between rounded-xl border border-hairline bg-surface/60 p-5 space-y-4">
              <div className="space-y-1 border-b border-hairline pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Due for recall today ({dueReviews.length})
                  </h3>
                </div>
                <p className="text-xs text-pewter">
                  Scheduled by your prior self-ratings
                </p>
              </div>

              <ul className="divide-y divide-hairline/70 flex-1">
                {dueReviews.slice(0, 4).map(({ row, problem }) => (
                  <li key={problem.slug}>
                    <Link
                      href={`/problems/${problem.slug}`}
                      className="group flex items-center justify-between py-2.5 text-xs transition hover:text-white"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="truncate font-medium text-ink group-hover:text-cobalt transition">
                          {problem.title}
                        </p>
                        <p className="text-[11px] text-pewter">
                          Last rated: {row.status === 'hint' ? 'assisted' : row.status}
                        </p>
                      </div>
                      <DifficultyBadge d={problem.difficulty} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      ) : (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 space-y-1">
          <h2 className="font-serif text-xl font-medium text-white">
            All {totalProblems} problems in {trackMeta.shortName} completed
          </h2>
          <p className="text-xs text-pewter">
            Return when spaced-repetition reviews come due, or switch to a broader curriculum scope above.
          </p>
        </div>
      )}

      {/* Curriculum Ledger by Prerequisite Stage */}
      <div className="space-y-8">
        {CURRICULUM_TIERS.map((tier) => (
          <section key={tier.stage} className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-hairline pb-2">
              <div className="flex flex-wrap items-baseline gap-2.5">
                <span className="font-mono text-xs text-cobalt font-medium">{tier.stage}</span>
                <h2 className="font-serif text-xl font-medium text-white">{tier.title}</h2>
              </div>
              <p className="text-xs text-pewter">{tier.description}</p>
            </div>

            <div className="divide-y divide-hairline rounded-xl border border-hairline bg-surface/50 overflow-hidden">
              {tier.slugs.map((slug) => {
                const t = TOPIC_BY_SLUG.get(slug);
                if (!t) return null;

                const { solved: s, total } = topicStats(progress, t.slug, activeTrack);
                const pct = total ? Math.round((s / total) * 100) : 0;
                const isMastered = total > 0 && s === total;

                const unmetPrereqs = t.prereqs.filter((prSlug) => {
                  const st = topicStats(progress, prSlug, activeTrack);
                  return st.total > 0 && st.solved < Math.ceil(st.total / 2);
                });
                const isUnlocked = unmetPrereqs.length === 0;

                const topicDueCount = dueReviews.filter((d) => d.problem.topic === t.slug).length;

                return (
                  <Link
                    key={t.slug}
                    href={`/topics/${t.slug}`}
                    className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-3.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt ${
                      isUnlocked
                        ? 'hover:bg-elevated/70'
                        : 'bg-canvas/40 opacity-75 hover:opacity-100 hover:bg-surface'
                    }`}
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-white group-hover:text-cobalt transition">
                          {t.name}
                        </h3>
                        {isMastered ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        ) : !isUnlocked ? (
                          <span className="inline-flex items-center gap-1 rounded bg-canvas px-1.5 py-0.5 font-mono text-[10px] text-pewter border border-hairline">
                            <Lock className="h-2.5 w-2.5" />
                            After 50% in {unmetPrereqs.map((pr) => TOPIC_BY_SLUG.get(pr)?.name).join(', ')}
                          </span>
                        ) : null}

                        {topicDueCount > 0 && (
                          <span className="inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[10px] text-amber-300">
                            {topicDueCount} due
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-pewter line-clamp-1">{t.summary}</p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="w-24 sm:w-32 h-1.5 overflow-hidden rounded-full bg-canvas border border-hairline/70">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isMastered ? 'bg-emerald-400' : 'bg-cobalt'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <span className="w-12 text-right font-mono text-xs text-pewter">
                        <strong className="text-white">{s}</strong>/{total}
                      </span>

                      <ChevronRight className="h-4 w-4 text-pewter transition group-hover:translate-x-0.5 group-hover:text-white" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
