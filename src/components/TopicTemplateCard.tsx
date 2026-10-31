'use client';

import { useState } from 'react';
import { Code2, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

export function TopicTemplateCard({
  template,
  topicName,
}: {
  template: string;
  topicName: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(template);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border border-hairline bg-surface/60 overflow-hidden transition">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-elevated/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt"
      >
        <span className="flex items-center gap-2 text-xs font-medium text-ink">
          <Code2 className="h-4 w-4 text-cobalt" />
          <span>{topicName} canonical Python skeleton</span>
        </span>
        <span className="flex items-center gap-1.5 text-xs text-pewter">
          <span>{open ? 'Hide skeleton' : 'Reveal skeleton'}</span>
          {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </span>
      </button>

      {open && (
        <div className="border-t border-hairline bg-canvas p-4 relative">
          <div className="flex justify-end mb-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-md border border-hairline bg-surface px-2.5 py-1 text-xs text-ink transition hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy skeleton</span>
                </>
              )}
            </button>
          </div>
          <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-ink">
            {template}
          </pre>
        </div>
      )}
    </div>
  );
}
