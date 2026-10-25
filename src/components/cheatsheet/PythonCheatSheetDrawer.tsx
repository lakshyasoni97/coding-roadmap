'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { X, FileCode2, Maximize2 } from 'lucide-react';
import { PythonCheatSheetContent } from './PythonCheatSheetContent';

const subscribe = () => () => {};

export function PythonCheatSheetDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const isMounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Lock background scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus close button on open
    closeButtonRef.current?.focus();

    // Close on Escape key
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !isMounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cheatsheet-drawer-title"
      className="fixed inset-0 z-[100] flex justify-end bg-black/80 backdrop-blur-sm transition-opacity"
    >
      {/* Click outside to close backdrop */}
      <div
        className="fixed inset-0 cursor-default"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className="relative z-10 flex h-full w-full max-w-xl sm:max-w-2xl flex-col border-l border-zinc-800 bg-zinc-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3.5 bg-zinc-950 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30">
              <FileCode2 className="h-4 w-4" />
            </div>
            <div>
              <h2 id="cheatsheet-drawer-title" className="text-sm font-bold text-white">
                Python, Pandas & DSA Cheat Sheet
              </h2>
              <p className="text-[11px] text-zinc-400">
                Simple side-by-side syntax & explanations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/cheatsheet"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <Maximize2 className="h-3 w-3" />
              <span>Full Page</span>
            </Link>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close cheat sheet (Esc)"
              className="rounded-lg border border-zinc-800 bg-zinc-900 p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <PythonCheatSheetContent compact />
        </div>
      </aside>
    </div>,
    document.body
  );
}
