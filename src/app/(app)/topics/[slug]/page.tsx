import Link from 'next/link';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { ChevronLeft, CheckCircle2, Layers } from 'lucide-react';
import {
  TOPIC_BY_SLUG,
  TRACK_BY_ID,
  TRACK_COOKIE,
  parseTrack,
  problemsOf,
  type TrackId,
} from '@/content/neetcode150';
import { createClient } from '@/lib/supabase/server';
import { todayString, type Status } from '@/lib/recommend';
import { ProblemTable } from '@/components/ProblemTable';
import { RoadmapTrackSwitcher } from '@/components/RoadmapTrackSwitcher';
import { TopicTemplateCard } from '@/components/TopicTemplateCard';

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = TOPIC_BY_SLUG.get(slug);
  if (!topic) notFound();

  const cookieStore = await cookies();
  const activeTrack: TrackId = parseTrack(cookieStore.get(TRACK_COOKIE)?.value);
  const trackMeta = TRACK_BY_ID.get(activeTrack)!;

  const allTopicProblems = problemsOf(slug, 'neetcode150');
  const trackProblems = problemsOf(slug, activeTrack);
  const trackSlugSet = new Set(trackProblems.map((p) => p.slug));
  const extraProblems = allTopicProblems.filter((p) => !trackSlugSet.has(p.slug));

  const supabase = await createClient();
  const { data } = await supabase
    .from('progress')
    .select('problem_slug, status, next_review_on')
    .in('problem_slug', allTopicProblems.map((p) => p.slug));

  const today = todayString();
  const statuses: Record<string, Status> = Object.fromEntries(
    (data ?? []).map((r) => [r.problem_slug, r.status as Status])
  );

  const dueSlugs = (data ?? [])
    .filter((r) => r.status !== 'todo' && r.next_review_on && r.next_review_on <= today)
    .map((r) => r.problem_slug);

  const solvedCount = trackProblems.filter((p) => statuses[p.slug] === 'solved').length;
  const hintCount = trackProblems.filter((p) => statuses[p.slug] === 'hint').length;
  const stuckCount = trackProblems.filter((p) => statuses[p.slug] === 'stuck').length;
  const total = trackProblems.length;
  const pctSolved = total ? Math.round((solvedCount / total) * 100) : 0;

  const nextProblem =
    trackProblems.find((p) => (statuses[p.slug] ?? 'todo') === 'todo') ??
    extraProblems.find((p) => (statuses[p.slug] ?? 'todo') === 'todo');

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-pewter transition hover:text-white focus-visible:outline-none focus-visible:underline"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Curriculum
        </Link>

        <RoadmapTrackSwitcher currentTrack={activeTrack} />
      </div>

      <div className="border-b border-hairline pb-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-serif text-3xl font-medium text-white tracking-tight">{topic.name}</h1>
              <span className="rounded border border-hairline bg-surface px-2 py-0.5 font-mono text-[11px] text-pewter">
                {trackMeta.shortName}
              </span>
              {pctSolved === 100 && (
                <span className="inline-flex items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Retained
                </span>
              )}
            </div>
            <p className="text-sm text-pewter max-w-2xl leading-relaxed">{topic.summary}</p>
          </div>

          {nextProblem && (
            <Link
              href={`/problems/${nextProblem.slug}`}
              className="inline-flex items-center gap-2 rounded-lg bg-cobalt px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt"
            >
              <span>Practice {nextProblem.title}</span>
            </Link>
          )}
        </div>

        {/* Progress Bar & breakdown */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-pewter">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>
                <strong className="font-mono text-white font-medium">{solvedCount}</strong>/{total} solved alone
              </span>
              {hintCount > 0 && <span className="text-amber-400 font-mono">{hintCount} assisted</span>}
              {stuckCount > 0 && <span className="text-rose-400 font-mono">{stuckCount} needs recall</span>}
            </div>
            <span className="font-mono text-ink">{pctSolved}%</span>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface border border-hairline/60 flex">
            <div
              className="h-full bg-emerald-400 transition-all duration-300"
              style={{ width: `${total ? (solvedCount / total) * 100 : 0}%` }}
              title={`${solvedCount} solved alone`}
            />
            <div
              className="h-full bg-amber-400 transition-all duration-300"
              style={{ width: `${total ? (hintCount / total) * 100 : 0}%` }}
              title={`${hintCount} assisted`}
            />
            <div
              className="h-full bg-rose-400 transition-all duration-300"
              style={{ width: `${total ? (stuckCount / total) * 100 : 0}%` }}
              title={`${stuckCount} needs recall`}
            />
          </div>
        </div>
      </div>

      <TopicTemplateCard template={topic.template} topicName={topic.name} />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-medium text-white">
            {activeTrack === 'neetcode150'
              ? `Problems (${trackProblems.length})`
              : `${trackMeta.shortName} problems (${trackProblems.length})`}
          </h2>
          {dueSlugs.length > 0 && (
            <span className="font-mono text-xs text-amber-300">
              {dueSlugs.length} due today
            </span>
          )}
        </div>
        <ProblemTable problems={trackProblems} initial={statuses} dueSlugs={dueSlugs} />
      </div>

      {extraProblems.length > 0 && (
        <details className="group rounded-xl border border-hairline bg-surface/40">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-xs font-medium text-pewter transition hover:text-white">
            <span className="flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-pewter" />
              <span>
                Additional NeetCode 150 problems ({extraProblems.length} outside {trackMeta.shortName})
              </span>
            </span>
            <span className="font-mono text-[11px] text-pewter group-open:hidden">Show +</span>
            <span className="font-mono text-[11px] text-pewter hidden group-open:inline">Hide −</span>
          </summary>
          <div className="border-t border-hairline p-3">
            <ProblemTable problems={extraProblems} initial={statuses} dueSlugs={dueSlugs} />
          </div>
        </details>
      )}
    </div>
  );
}
