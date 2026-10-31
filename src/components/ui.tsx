import type { Difficulty } from '@/content/neetcode150';
import type { Status } from '@/lib/recommend';
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
