'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { ExternalLink, Clock, Check } from 'lucide-react';
import type { Problem } from '@/content/neetcode150';
import type { Status } from '@/lib/recommend';
import { rateProblemAction } from '@/lib/progress.actions';
import { DifficultyBadge, StatusBadge } from '@/components/ui';

export function ProblemTable({
  problems,
  initial,
  dueSlugs = [],
  showTrackBadges = true,
}: {
  problems: Problem[];
  initial: Record<string, Status>;
  dueSlugs?: string[];
  showTrackBadges?: boolean;
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
        setStatuses((s) => ({ ...s, [slug]: prev }));
      }
    });
  }

  return (
    <div className="overflow-hidden rounded-xl border border-hairline bg-surface/50">
      <ul className="divide-y divide-hairline">
        {problems.map((p) => {
          const status = statuses[p.slug] ?? 'todo';
          const isDue = dueSlugs.includes(p.slug);
          const isPending = pendingSlug === p.slug;

          return (
            <li
              key={p.slug}
              className="group flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 px-4 py-3 transition hover:bg-elevated/60"
            >
              <div className="flex min-w-0 items-center gap-3 flex-1">
                <button
                  type="button"
                  onClick={() => handleQuickToggle(p.slug, status)}
                  disabled={isPending}
                  title={status === 'solved' ? 'Mark as unseen' : 'Mark as solved alone'}
                  aria-label={`Toggle solved status for ${p.title}. Currently ${status}`}
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt ${
                    status === 'solved'
                      ? 'border-emerald-500 bg-emerald-500 text-canvas'
                      : status === 'hint'
                      ? 'border-amber-500/50 bg-amber-500/15 text-amber-400'
                      : status === 'stuck'
                      ? 'border-rose-500/50 bg-rose-500/15 text-rose-400'
                      : 'border-hairline bg-canvas hover:border-pewter text-transparent'
                  }`}
                >
                  <Check className="h-3 w-3 stroke-[2.5]" />
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/problems/${p.slug}`}
                      className="text-sm font-medium text-ink transition hover:text-cobalt focus-visible:outline-none focus-visible:underline"
                    >
                      {p.title}
                    </Link>

                    {showTrackBadges && p.isCore && (
                      <span
                        title="Core 50 canonical pattern problem"
                        className="rounded border border-cobalt/30 bg-cobalt/10 px-1.5 py-0.5 font-mono text-[10px] text-blue-300"
                      >
                        Core 50
                      </span>
                    )}

                    {showTrackBadges && !p.isCore && p.isBlind75 && (
                      <span
                        title="Part of the Blind 75 set"
                        className="rounded border border-hairline bg-canvas px-1.5 py-0.5 font-mono text-[10px] text-pewter"
                      >
                        Blind 75
                      </span>
                    )}

                    {isDue && (
                      <span className="inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[10px] text-amber-300">
                        <Clock className="h-2.5 w-2.5" />
                        Due today
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <span className="hidden md:inline-block font-mono text-[11px] text-pewter">
                  {p.time}
                </span>
                {status !== 'todo' && <StatusBadge status={status} />}
                <DifficultyBadge d={p.difficulty} />

                <a
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${p.title} on LeetCode`}
                  title="Open on LeetCode"
                  className="rounded-md p-1.5 text-pewter transition hover:bg-canvas hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
