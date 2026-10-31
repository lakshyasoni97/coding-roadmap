'use client';

import { useState, useTransition } from 'react';
import { TRACKS, type TrackId } from '@/content/neetcode150';
import { setRoadmapTrackAction } from '@/lib/progress.actions';

export function RoadmapTrackSwitcher({
  currentTrack,
  countsByTrack,
}: {
  currentTrack: TrackId;
  countsByTrack?: Record<TrackId, { completed: number; total: number }>;
}) {
  const [selected, setSelected] = useState<TrackId>(currentTrack);
  const [isPending, startTransition] = useTransition();

  function handleSelect(track: TrackId) {
    if (track === selected) return;
    setSelected(track);
    startTransition(async () => {
      await setRoadmapTrackAction(track);
    });
  }

  return (
    <div
      role="tablist"
      aria-label="Select curriculum scope"
      className={`inline-flex flex-wrap items-center gap-1 rounded-lg border border-hairline bg-surface p-1 transition ${
        isPending ? 'opacity-75' : ''
      }`}
    >
      {TRACKS.map((t) => {
        const active = selected === t.id;
        const stats = countsByTrack?.[t.id];

        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => handleSelect(t.id)}
            disabled={isPending}
            className={`group flex items-center gap-2 rounded-md px-2.5 py-1 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt ${
              active
                ? 'bg-cobalt text-white shadow-sm'
                : 'text-pewter hover:bg-elevated hover:text-ink'
            }`}
          >
            <span>{t.shortName}</span>
            <span
              className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${
                active
                  ? 'bg-black/20 text-white'
                  : 'bg-canvas text-pewter group-hover:text-ink'
              }`}
            >
              {stats ? `${stats.completed}/${stats.total}` : t.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
