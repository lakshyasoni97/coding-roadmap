import type { Difficulty } from '@/content/neetcode150';
import type { Status } from '@/lib/recommend';
import { Check, HelpCircle, AlertCircle, Circle } from 'lucide-react';

const DIFF_STYLE: Record<Difficulty, string> = {
  Easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Hard: 'text-red-400 bg-red-500/10 border-red-500/20',
};

export function DifficultyBadge({ d }: { d: Difficulty }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium tracking-wide ${DIFF_STYLE[d]}`}
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
    label: 'Not started',
    bg: 'bg-zinc-800/40',
    text: 'text-zinc-400',
    border: 'border-zinc-700/60',
    icon: Circle,
  },
  solved: {
    label: 'Solved alone',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    icon: Check,
  },
  hint: {
    label: 'Needed hints',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    icon: HelpCircle,
  },
  stuck: {
    label: 'Stuck',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/30',
    icon: AlertCircle,
  },
};

export function StatusBadge({ status }: { status: Status }) {
  const conf = STATUS_CONFIG[status] ?? STATUS_CONFIG.todo;
  const Icon = conf.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${conf.bg} ${conf.text} ${conf.border}`}
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span>{conf.label}</span>
    </span>
  );
}

export function StatusDot({ status }: { status: Status }) {
  const conf = STATUS_CONFIG[status] ?? STATUS_CONFIG.todo;
  const dotColor = {
    todo: 'bg-zinc-600',
    solved: 'bg-emerald-400',
    hint: 'bg-amber-400',
    stuck: 'bg-red-400',
  }[status];

  return (
    <span
      title={conf.label}
      aria-label={conf.label}
      className={`inline-block h-2 w-2 rounded-full ${dotColor}`}
    />
  );
}
