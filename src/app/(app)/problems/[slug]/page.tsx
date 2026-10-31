import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, ExternalLink } from 'lucide-react';
import { PROBLEM_BY_SLUG, TOPIC_BY_SLUG } from '@/content/neetcode150';
import { createClient } from '@/lib/supabase/server';
import { todayString, type Status } from '@/lib/recommend';
import { DifficultyBadge, StatusBadge } from '@/components/ui';
import { ProblemWorkspace } from '@/components/ProblemWorkspace';

export default async function ProblemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const problem = PROBLEM_BY_SLUG.get(slug);
  if (!problem) notFound();
  const topic = TOPIC_BY_SLUG.get(problem.topic)!;

  const supabase = await createClient();
  const { data } = await supabase
    .from('progress')
    .select('status, notes, last_analysis, attempts, last_attempt_on, next_review_on')
    .eq('problem_slug', slug)
    .maybeSingle();

  const currentStatus = (data?.status as Status) ?? 'todo';
  const attempts = data?.attempts ?? 0;
  const lastAttempt = data?.last_attempt_on;
  const nextReview = data?.next_review_on;
  const isDue = Boolean(nextReview && nextReview <= todayString());

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Optimal Target Complexity */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href={`/topics/${topic.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-pewter transition hover:text-white focus-visible:outline-none focus-visible:underline"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> {topic.name}
        </Link>
        <span className="font-mono text-xs text-pewter">
          Target: <strong className="text-ink font-normal">{problem.time}</strong> time,{' '}
          <strong className="text-ink font-normal">{problem.space}</strong> space
        </span>
      </div>

      {/* Problem Header Ledger */}
      <div className="border-b border-hairline pb-5 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-serif text-3xl font-medium tracking-tight text-white">
                {problem.title}
              </h1>
              <DifficultyBadge d={problem.difficulty} />
              {problem.isCore && (
                <span className="rounded border border-cobalt/30 bg-cobalt/10 px-2 py-0.5 font-mono text-[11px] text-blue-300">
                  Core 50
                </span>
              )}
              {!problem.isCore && problem.isBlind75 && (
                <span className="rounded border border-hairline bg-surface px-2 py-0.5 font-mono text-[11px] text-pewter">
                  Blind 75
                </span>
              )}
              {currentStatus !== 'todo' && <StatusBadge status={currentStatus} />}
            </div>

            {attempts > 0 ? (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-pewter">
                <span>Attempts: {attempts}</span>
                {lastAttempt && <span>Last practiced: {lastAttempt}</span>}
                {nextReview && (
                  <span className={isDue ? 'text-amber-300 font-medium' : 'text-pewter'}>
                    Next review: {isDue ? `Due today (${nextReview})` : nextReview}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-xs text-pewter">
                Pattern: <span className="text-ink">{topic.name}</span> — {topic.summary}
              </p>
            )}
          </div>

          <a
            href={problem.url}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${problem.title} on LeetCode`}
            className="inline-flex items-center gap-2 rounded-lg border border-hairline bg-surface px-3.5 py-2 text-xs font-medium text-ink transition hover:border-pewter/50 hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt"
          >
            <span>Open prompt on LeetCode</span>
            <ExternalLink className="h-3.5 w-3.5 text-pewter" />
          </a>
        </div>
      </div>

      <ProblemWorkspace
        slug={slug}
        hint1={problem.hint}
        initialStatus={currentStatus}
        initialNotes={data?.notes ?? ''}
        initialAnalysis={data?.last_analysis ?? ''}
      />
    </div>
  );
}
