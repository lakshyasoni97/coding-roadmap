import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, ExternalLink, Calendar, RotateCcw } from 'lucide-react';
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
      <div className="flex items-center justify-between">
        <Link
          href={`/topics/${topic.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-400 transition hover:text-white focus-visible:outline-none focus-visible:underline"
        >
          <ChevronLeft className="h-4 w-4" /> {topic.name}
        </Link>
        <span className="text-xs text-zinc-500 font-mono">NeetCode 150</span>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-white">{problem.title}</h1>
              <DifficultyBadge d={problem.difficulty} />
              {currentStatus !== 'todo' && <StatusBadge status={currentStatus} />}
            </div>
            <p className="text-xs text-zinc-400">
              Topic: <span className="text-zinc-300 font-medium">{topic.name}</span>
            </p>
          </div>

          <a
            href={problem.url}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${problem.title} on LeetCode`}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <span>Solve on LeetCode</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* History Strip */}
        {attempts > 0 && (
          <div className="flex flex-wrap items-center gap-4 border-t border-zinc-800/60 pt-3 text-xs text-zinc-400">
            <span className="inline-flex items-center gap-1">
              <RotateCcw className="h-3.5 w-3.5 text-zinc-500" />
              Attempts: <strong className="text-white">{attempts}</strong>
            </span>
            {lastAttempt && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                Last attempt: <span className="text-zinc-300">{lastAttempt}</span>
              </span>
            )}
            {nextReview && (
              <span
                className={`inline-flex items-center gap-1 font-medium ${
                  isDue ? 'text-amber-400' : 'text-zinc-400'
                }`}
              >
                Next review: {isDue ? `Due today (${nextReview})` : nextReview}
              </span>
            )}
          </div>
        )}
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
