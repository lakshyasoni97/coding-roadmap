import { PythonCheatSheetContent } from '@/components/cheatsheet/PythonCheatSheetContent';

export const metadata = { title: 'Syntax reference · PatternRecall' };

export default function CheatSheetPage() {
  return (
    <div className="space-y-8">
      <div className="border-b border-hairline pb-5 space-y-1.5">
        <h1 className="font-serif text-3xl font-medium tracking-tight text-white">
          Python, Pandas &amp; Big-O reference
        </h1>
        <p className="text-sm text-pewter max-w-2xl leading-relaxed">
          Side-by-side syntax lookup for Python data structures, Pandas DataFrames, and algorithmic complexity rules.
        </p>
      </div>

      <PythonCheatSheetContent />
    </div>
  );
}
