import type { Difficulty } from '@/content/neetcode150';
import type { Status } from '@/lib/recommend';
import { parseMarkdown, tokenizeInline } from '@/lib/markdown';
import { Check, HelpCircle, AlertCircle, Circle } from 'lucide-react';

const DIFF_STYLE: Record<Difficulty, string> = {
  Easy: 'text-emerald-400 border-emerald-500/25 bg-emerald-500/5',
  Medium: 'text-amber-400 border-amber-500/25 bg-amber-500/5',
  Hard: 'text-rose-400 border-rose-500/25 bg-rose-500/5',
};

export function DifficultyBadge({ d }: { d: Difficulty }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[11px] font-medium ${DIFF_STYLE[d]}`}
    >
      {d}
    </span>
  );
}

export const STATUS_CONFIG: Record<
  Status,
  { label: string; bg: string; text: string; border: string; icon: typeof Check }
> = {
  todo: {
    label: 'Unseen',
    bg: 'bg-surface',
    text: 'text-pewter',
    border: 'border-hairline',
    icon: Circle,
  },
  solved: {
    label: 'Solved alone',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/25',
    icon: Check,
  },
  hint: {
    label: 'Assisted',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/25',
    icon: HelpCircle,
  },
  stuck: {
    label: 'Needs recall',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/25',
    icon: AlertCircle,
  },
};

export function StatusBadge({ status }: { status: Status }) {
  const conf = STATUS_CONFIG[status] ?? STATUS_CONFIG.todo;
  const Icon = conf.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-xs font-medium ${conf.bg} ${conf.text} ${conf.border}`}
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span>{conf.label}</span>
    </span>
  );
}

export function StatusDot({ status }: { status: Status }) {
  const conf = STATUS_CONFIG[status] ?? STATUS_CONFIG.todo;
  const dotColor = {
    todo: 'bg-hairline',
    solved: 'bg-emerald-400',
    hint: 'bg-amber-400',
    stuck: 'bg-rose-400',
  }[status];

  return (
    <span
      title={conf.label}
      aria-label={conf.label}
      className={`inline-block h-2 w-2 rounded-full ${dotColor}`}
    />
  );
}

function InlineContent({ text }: { text: string }) {
  const tokens = tokenizeInline(text);
  return (
    <>
      {tokens.map((tok, i) => {
        switch (tok.type) {
          case 'code':
            return (
              <code
                key={i}
                className="rounded border border-hairline/90 bg-elevated/90 px-1.5 py-0.5 font-mono text-[11px] text-sky-300"
              >
                {tok.value}
              </code>
            );
          case 'bold':
            return (
              <strong key={i} className="font-semibold text-white">
                {tok.value}
              </strong>
            );
          case 'bold-italic':
            return (
              <strong key={i} className="font-semibold italic text-white">
                {tok.value}
              </strong>
            );
          case 'italic':
            return (
              <em key={i} className="italic text-ink/90">
                {tok.value}
              </em>
            );
          default:
            return <span key={i}>{tok.value}</span>;
        }
      })}
    </>
  );
}

export function Rich({ text }: { text: string }) {
  const blocks = parseMarkdown(text);

  return (
    <div className="space-y-2.5 text-xs sm:text-sm leading-relaxed text-ink max-w-[68ch]">
      {blocks.map((block, i) => {
        if (block.type === 'heading') {
          return (
            <h4
              key={i}
              className="pt-1 text-xs font-semibold tracking-wide text-white first:pt-0"
            >
              <InlineContent text={block.text} />
            </h4>
          );
        }

        if (block.type === 'paragraph') {
          return (
            <p key={i} className="leading-relaxed text-ink">
              <InlineContent text={block.text} />
            </p>
          );
        }

        if (block.type === 'code-block') {
          return (
            <pre
              key={i}
              className="overflow-x-auto rounded-lg border border-hairline bg-elevated/70 p-3 font-mono text-xs leading-relaxed text-ink"
            >
              <code>{block.code}</code>
            </pre>
          );
        }

        return (
          <ul key={i} className="space-y-1.5">
            {block.items.map((item, j) => (
              <li
                key={j}
                className={`flex items-baseline gap-2 leading-relaxed text-ink ${
                  item.indent >= 2 ? 'pl-4' : ''
                }`}
              >
                <span
                  className={`shrink-0 select-none font-mono text-[11px] ${
                    item.ordered ? 'min-w-[1.25rem] font-semibold text-cobalt' : 'text-pewter'
                  }`}
                >
                  {item.marker}
                </span>
                <span className="min-w-0 flex-1">
                  <InlineContent text={item.text} />
                </span>
              </li>
            ))}
          </ul>
        );
      })}
    </div>
  );
}
