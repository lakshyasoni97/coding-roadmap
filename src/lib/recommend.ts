import { PROBLEMS, TOPICS, problemsForTrack, problemsOf, type Problem, type TrackId } from '@/content/neetcode150';

export type Status = 'todo' | 'solved' | 'hint' | 'stuck';

export interface ProgressRow {
  problem_slug: string;
  status: Status;
  hints_used: number;
  attempts: number;
  next_review_on: string | null;
}

export interface Recommendation {
  problem: Problem;
  reason: string;
}

const DIFF_ORDER = { Easy: 0, Medium: 1, Hard: 2 } as const;

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function todayString(): string {
  return new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
}

/** When to bring a problem back, given how the attempt went. */
export function nextReviewDate(status: Status, attempts: number, today: string): string | null {
  if (status === 'todo') return null;
  if (status === 'stuck') return addDays(today, 1);
  if (status === 'hint') return addDays(today, 2);
  return addDays(today, attempts >= 3 ? 21 : 7); // solved alone
}

export function topicStats(
  progress: Map<string, ProgressRow>,
  topic: string,
  track: TrackId = 'neetcode150'
) {
  const list = problemsOf(topic, track);
  const solved = list.filter((p) => progress.get(p.slug)?.status === 'solved').length;
  return { solved, total: list.length };
}

/** Pick the single best problem to do next, with a human-readable reason. */
export function recommendNext(
  progress: Map<string, ProgressRow>,
  today: string,
  track: TrackId = 'neetcode150'
): Recommendation | null {
  const trackProblems = problemsForTrack(track);
  const bySlug = new Map(trackProblems.map((p) => [p.slug, p]));

  // 1. Reviews that are due. Stuck first, then hints, then solved; oldest first.
  const rank = { stuck: 0, hint: 1, solved: 2, todo: 3 } as const;
  const due = [...progress.values()]
    .filter((r) => r.status !== 'todo' && r.next_review_on && r.next_review_on <= today && bySlug.has(r.problem_slug))
    .sort((a, b) => rank[a.status] - rank[b.status] || a.next_review_on!.localeCompare(b.next_review_on!));
  if (due.length) {
    const r = due[0];
    const why = { stuck: 'you got stuck on this', hint: 'you needed hints on this', solved: 'time to check it stuck', todo: '' }[r.status];
    return { problem: bySlug.get(r.problem_slug)!, reason: `Review: ${why}.` };
  }

  const todoIn = (topic: string) =>
    problemsOf(topic, track)
      .filter((p) => (progress.get(p.slug)?.status ?? 'todo') === 'todo')
      .sort((a, b) => DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty]);

  // 2. Weak topic: 2+ problems currently marked hint/stuck → easiest untouched problem there.
  for (const t of TOPICS) {
    const weak = problemsOf(t.slug, track).filter((p) => {
      const s = progress.get(p.slug)?.status;
      return s === 'hint' || s === 'stuck';
    }).length;
    const next = todoIn(t.slug)[0];
    if (weak >= 2 && next) {
      return { problem: next, reason: `Strengthen ${t.name}: ${weak} problems needed hints or got you stuck.` };
    }
  }

  // 3. Roadmap order: first unlocked topic with unsolved problems.
  for (const t of TOPICS) {
    const unlocked = t.prereqs.every((slug) => {
      const { solved, total } = topicStats(progress, slug, track);
      return total === 0 || solved >= Math.ceil(total / 2);
    });
    const next = todoIn(t.slug)[0];
    if (unlocked && next) {
      const { solved, total } = topicStats(progress, t.slug, track);
      return { problem: next, reason: `Next on the roadmap: ${t.name} (${solved} / ${total} solved).` };
    }
  }

  // 4. Fallback: anything unsolved (e.g. prerequisites never reached 50%).
  const any = trackProblems.find((p) => (progress.get(p.slug)?.status ?? 'todo') === 'todo');
  return any ? { problem: any, reason: 'Next unsolved problem.' } : null;
}
