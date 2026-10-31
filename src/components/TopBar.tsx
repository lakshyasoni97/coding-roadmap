'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, LogOut } from 'lucide-react';
import { signOutAction } from '@/lib/actions/auth.actions';
import { PythonCheatSheetDrawer } from '@/components/cheatsheet/PythonCheatSheetDrawer';

const subscribe = () => () => {};

export function TopBar() {
  const [open, setOpen] = useState(false);
  const isMac = useSyncExternalStore(
    subscribe,
    () => typeof navigator !== 'undefined' && /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent),
    () => true
  );
  const pathname = usePathname();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-hairline bg-canvas/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-baseline gap-2.5 text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt rounded"
          >
            <span className="font-serif text-lg font-medium tracking-tight text-white">
              PatternRecall
            </span>
            <span className="hidden md:inline-block font-mono text-[11px] text-pewter">
              index &amp; workbench
            </span>
          </Link>

          <nav aria-label="Main navigation" className="hidden sm:flex items-center gap-1 text-sm">
            <Link
              href="/"
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                pathname === '/' || pathname.startsWith('/topics') || pathname.startsWith('/problems')
                  ? 'bg-elevated text-white'
                  : 'text-pewter hover:bg-surface hover:text-ink'
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt`}
            >
              Curriculum
            </Link>
            <Link
              href="/cheatsheet"
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                pathname === '/cheatsheet'
                  ? 'bg-elevated text-white'
                  : 'text-pewter hover:bg-surface hover:text-ink'
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt`}
            >
              Syntax reference
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open quick syntax reference drawer"
            className="inline-flex items-center gap-2 rounded-md border border-hairline bg-surface px-2.5 py-1.5 text-xs text-ink transition hover:border-pewter/50 hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt"
          >
            <BookOpen className="h-3.5 w-3.5 text-cobalt" />
            <span className="hidden xs:inline">Reference</span>
            <kbd
              suppressHydrationWarning
              className="hidden sm:inline-block rounded bg-canvas px-1.5 py-0.5 font-mono text-[10px] text-pewter border border-hairline"
            >
              {isMac ? '⌘J' : 'Ctrl+J'}
            </kbd>
          </button>
          <form action={signOutAction}>
            <button
              type="submit"
              aria-label="Sign out"
              title="Sign out"
              className="rounded-md p-1.5 text-pewter transition hover:bg-surface hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
      <PythonCheatSheetDrawer isOpen={open} onClose={() => setOpen(false)} />
    </header>
  );
}
