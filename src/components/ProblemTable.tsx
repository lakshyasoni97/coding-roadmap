'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { ExternalLink, Clock, ChevronRight, Check } from 'lucide-react';
import type { Problem } from '@/content/neetcode150';
import type { Status } from '@/lib/recommend';
import { rateProblemAction } from '@/lib/progress.actions';
import { DifficultyBadge, StatusBadge } from '@/components/ui';

export function ProblemTable({
  problems,
  initial,
  dueSlugs = [],
}: {
  problems: Problem[];
  initial: Record<string, Status>;
  dueSlugs?: string[];
}) {
  const [statuses, setStatuses] = useState(initial);
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleQuickToggle(slug: string, current: Status) {
    const next: Status = current === 'solved' ? 'todo' : 'solved';
    const prev = statuses[slug] ?? 'todo';
    setStatuses((s) => ({ ...s, [slug]: next }));
    setPendingSlug(slug);

    startTransition(async () => {
      const res = await rateProblemAction(slug, next);
      setPendingSlug(null);
      if (res.error) {
        setStatuses((s) => ({ ...s, [slug]: prev })); // rollback
      }
    });
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/30">
      <ul className="divide-y divide-zinc-800/80">
        {problems.map((p) => {
          const status = statuses[p.slug] ?? 'todo';
          const isDue = dueSlugs.includes(p.slug);
          const isPending = pendingSlug === p.slug;

          return (
            <li
              key={p.slug}
              className="group flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 px-4 py-3.5 transition hover:bg-zinc-850/50"
            >
              <div className="flex min-w-0 items-center gap-3 flex-1">
                <button
                  type="button"
                  onClick={() => handleQuickToggle(p.slug, status)}
                  disabled={isPending}
                  title={status === 'solved' ? 'Mark as not completed' : 'Mark as solved alone'}
                  aria-label={`Toggle solved status for ${p.title}. Currently ${status}`}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                    status === 'solved'
                      ? 'border-emerald-500 bg-emerald-500 text-zinc-950'
                      : status === 'hint'
                      ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                      : status === 'stuck'
                      ? 'border-red-500/50 bg-red-500/10 text-red-400'
                      : 'border-zinc-700 bg-zinc-800/60 hover:border-zinc-500 text-transparent'
                  }`}
                >
                  <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/problems/${p.slug}`}
                      className="text-sm font-medium text-zinc-100 transition hover:text-emerald-400 focus-visible:outline-none focus-visible:underline"
                    >
                      {p.title}
                    </Link>

                    {isDue && (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 text-[11px] font-medium text-amber-300">
                        <Clock className="h-3 w-3" />
                        Due for review
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                <StatusBadge status={status} />
                <DifficultyBadge d={p.difficulty} />

                <a
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${p.title} problem description on LeetCode`}
                  title="Open on LeetCode"
                  className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>

                <Link
                  href={`/problems/${p.slug}`}
                  aria-label={`Practice ${p.title}`}
                  className="hidden sm:inline-flex items-center rounded-lg border border-zinc-800 bg-zinc-900/40 p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-white group-hover:border-zinc-700"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
