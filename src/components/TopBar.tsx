'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileCode2, LogOut, Map } from 'lucide-react';
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
    <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold tracking-tight text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30 text-xs font-mono font-bold">
              PR
            </span>
            <span>PatternRecall</span>
          </Link>

          <nav aria-label="Main Navigation" className="hidden sm:flex items-center gap-1 text-sm">
            <Link
              href="/"
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition ${
                pathname === '/'
                  ? 'bg-zinc-800/80 text-white font-medium'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500`}
            >
              <Map className="h-3.5 w-3.5" />
              Roadmap
            </Link>
            <Link
              href="/cheatsheet"
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition ${
                pathname === '/cheatsheet'
                  ? 'bg-zinc-800/80 text-white font-medium'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500`}
            >
              <FileCode2 className="h-3.5 w-3.5" />
              Cheat Sheet
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Toggle Quick Cheat Sheet Drawer"
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900/60 px-2.5 py-1.5 text-xs text-zinc-300 transition hover:bg-zinc-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <FileCode2 className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden xs:inline">Quick Sheet</span>
            <kbd
              suppressHydrationWarning
              className="hidden sm:inline-block rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 border border-zinc-700"
            >
              {isMac ? '⌘J' : 'Ctrl+J'}
            </kbd>
          </button>
          <form action={signOutAction}>
            <button
              type="submit"
              aria-label="Sign out"
              title="Sign out"
              className="rounded-md border border-transparent p-1.5 text-zinc-400 transition hover:bg-zinc-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
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
