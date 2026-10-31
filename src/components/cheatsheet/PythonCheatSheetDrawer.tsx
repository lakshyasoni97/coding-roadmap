'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { X, Maximize2 } from 'lucide-react';
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

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    closeButtonRef.current?.focus();

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
      className="fixed inset-0 z-[100] flex justify-end bg-black/75 backdrop-blur-sm transition-opacity"
    >
      <div
        className="fixed inset-0 cursor-default"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className="relative z-10 flex h-full w-full max-w-xl sm:max-w-2xl flex-col border-l border-hairline bg-canvas shadow-2xl">
        <div className="flex items-center justify-between border-b border-hairline px-5 py-3.5 bg-surface shrink-0">
          <div>
            <h2 id="cheatsheet-drawer-title" className="font-serif text-lg font-medium text-white">
              Syntax &amp; complexity reference
            </h2>
            <p className="text-[11px] text-pewter">
              Python standard library, Pandas, and Big-O rules
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/cheatsheet"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-md border border-hairline bg-canvas px-2.5 py-1 text-xs font-medium text-ink transition hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt"
            >
              <Maximize2 className="h-3 w-3" />
              <span>Full page</span>
            </Link>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close reference drawer (Esc)"
              className="rounded-md border border-hairline bg-canvas p-1.5 text-pewter transition hover:bg-elevated hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <PythonCheatSheetContent compact />
        </div>
      </aside>
    </div>,
    document.body
  );
}
