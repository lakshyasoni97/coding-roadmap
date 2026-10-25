import { FileCode2 } from 'lucide-react';
import { PythonCheatSheetContent } from '@/components/cheatsheet/PythonCheatSheetContent';

export default function CheatSheetPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800/80 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
            <FileCode2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Python, Pandas & DSA Cheat Sheet
            </h1>
            <p className="mt-0.5 text-xs text-zinc-400">
              Simple, side-by-side quick reference for Pandas (DataFrames, I/O, `.loc`/`.iloc`, cleaning, `groupby`, `merge`), Python Core (`str`, `list`), and DSA Big-O rules.
            </p>
          </div>
        </div>
      </div>

      <PythonCheatSheetContent />
    </div>
  );
}
