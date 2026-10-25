import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { TOPIC_BY_SLUG, problemsOf } from '@/content/neetcode150';
import { createClient } from '@/lib/supabase/server';
import { todayString, type Status } from '@/lib/recommend';
import { ProblemTable } from '@/components/ProblemTable';
import { TopicTemplateCard } from '@/components/TopicTemplateCard';

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = TOPIC_BY_SLUG.get(slug);
  if (!topic) notFound();

  const problems = problemsOf(slug);
  const supabase = await createClient();
  const { data } = await supabase
    .from('progress')
    .select('problem_slug, status, next_review_on')
    .in('problem_slug', problems.map((p) => p.slug));

  const today = todayString();
  const statuses: Record<string, Status> = Object.fromEntries(
    (data ?? []).map((r) => [r.problem_slug, r.status as Status])
  );

  const dueSlugs = (data ?? [])
    .filter((r) => r.status !== 'todo' && r.next_review_on && r.next_review_on <= today)
    .map((r) => r.problem_slug);

  const solvedCount = problems.filter((p) => statuses[p.slug] === 'solved').length;
  const hintCount = problems.filter((p) => statuses[p.slug] === 'hint').length;
  const stuckCount = problems.filter((p) => statuses[p.slug] === 'stuck').length;
  const total = problems.length;
  const pctSolved = total ? Math.round((solvedCount / total) * 100) : 0;

  // Next unsolved problem in this topic
  const nextProblem = problems.find((p) => (statuses[p.slug] ?? 'todo') === 'todo');

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-400 transition hover:text-white focus-visible:outline-none focus-visible:underline"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Roadmap
      </Link>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">{topic.name}</h1>
              {pctSolved === 100 && (
                <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Topic Mastered
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-zinc-400 max-w-2xl leading-relaxed">{topic.summary}</p>
          </div>

          {nextProblem && (
            <Link
              href={`/problems/${nextProblem.slug}`}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <span>Continue: {nextProblem.title}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {/* Progress Bar & breakdown */}
        <div className="space-y-2 pt-2 border-t border-zinc-800/60">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>
              <strong className="text-white font-semibold">{solvedCount}</strong> / {total} solved alone
              {hintCount > 0 && <span className="text-amber-400"> · {hintCount} with hints</span>}
              {stuckCount > 0 && <span className="text-red-400"> · {stuckCount} stuck</span>}
            </span>
            <span className="font-mono text-zinc-300 font-medium">{pctSolved}% complete</span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800 flex">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${(solvedCount / total) * 100}%` }}
              title={`${solvedCount} solved alone`}
            />
            <div
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${(hintCount / total) * 100}%` }}
              title={`${hintCount} solved with hints`}
            />
            <div
              className="h-full bg-red-500 transition-all duration-300"
              style={{ width: `${(stuckCount / total) * 100}%` }}
              title={`${stuckCount} stuck`}
            />
          </div>
        </div>
      </div>

      <TopicTemplateCard template={topic.template} topicName={topic.name} />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Problems ({problems.length})</h2>
          {dueSlugs.length > 0 && (
            <span className="text-xs text-amber-400 font-medium">
              {dueSlugs.length} review{dueSlugs.length > 1 ? 's' : ''} scheduled for today
            </span>
          )}
        </div>
        <ProblemTable problems={problems} initial={statuses} dueSlugs={dueSlugs} />
      </div>
    </div>
  );
}
