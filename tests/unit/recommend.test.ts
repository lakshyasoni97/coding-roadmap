import { describe, expect, it } from 'vitest';
import { PROBLEMS, TOPICS } from '@/content/neetcode150';
import { addDays, nextReviewDate, recommendNext, type ProgressRow, type Status } from '@/lib/recommend';

const TODAY = '2026-10-25';

function prog(entries: ([string, Status] | [string, Status, string | null])[]): Map<string, ProgressRow> {
  return new Map(
    entries.map(([slug, status, review]) => [
      slug,
      { problem_slug: slug, status, hints_used: 0, attempts: 1, next_review_on: review ?? null },
    ])
  );
}

describe('content', () => {
  it('has the 150 problems with unique slugs', () => {
    expect(PROBLEMS).toHaveLength(150);
    expect(new Set(PROBLEMS.map((p) => p.slug)).size).toBe(150);
  });
  it('every problem has a valid topic and every prereq exists', () => {
    const topics = new Set(TOPICS.map((t) => t.slug));
    PROBLEMS.forEach((p) => expect(topics.has(p.topic)).toBe(true));
    TOPICS.forEach((t) => t.prereqs.forEach((s) => expect(topics.has(s)).toBe(true)));
  });
});

describe('nextReviewDate', () => {
  it('schedules by outcome', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(nextReviewDate('stuck', 1, TODAY)).toBe('2026-10-26');
    expect(nextReviewDate('hint', 1, TODAY)).toBe('2026-10-27');
    expect(nextReviewDate('solved', 1, TODAY)).toBe('2026-11-01');
    expect(nextReviewDate('solved', 3, TODAY)).toBe('2026-11-15');
    expect(nextReviewDate('todo', 0, TODAY)).toBeNull();
  });
});

describe('recommendNext', () => {
  it('starts at the first easy problem of the first topic', () => {
    const r = recommendNext(new Map(), TODAY)!;
    expect(r.problem.topic).toBe('arrays-hashing');
    expect(r.problem.difficulty).toBe('Easy');
  });

  it('prioritises due reviews, stuck before solved', () => {
    const r = recommendNext(
      prog([
        ['two-sum', 'solved', '2026-10-20'],
        ['valid-anagram', 'stuck', '2026-10-25'],
      ]),
      TODAY
    )!;
    expect(r.problem.slug).toBe('valid-anagram');
    expect(r.reason).toMatch(/^Review/);
  });

  it('ignores reviews that are not due yet', () => {
    const r = recommendNext(prog([['contains-duplicate', 'solved', '2026-11-01']]), TODAY)!;
    expect(r.reason).toMatch(/roadmap/);
    expect(r.problem.slug).not.toBe('contains-duplicate');
  });

  it('strengthens a weak topic with 2+ hint/stuck problems', () => {
    const r = recommendNext(
      prog([
        ['contains-duplicate', 'hint', '2026-12-01'],
        ['valid-anagram', 'stuck', '2026-12-01'],
      ]),
      TODAY
    )!;
    expect(r.reason).toMatch(/Strengthen Arrays & Hashing/);
    expect(r.problem.topic).toBe('arrays-hashing');
  });

  it('unlocks the next topic once prerequisites are half solved', () => {
    const ah = PROBLEMS.filter((p) => p.topic === 'arrays-hashing').map((p) => [p.slug, 'solved', '2026-12-01'] as [string, Status, string]);
    const r = recommendNext(prog(ah), TODAY)!;
    expect(r.problem.topic).toBe('two-pointers');
  });
});
