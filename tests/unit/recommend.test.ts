import { describe, expect, it } from 'vitest';
import { PROBLEMS, TOPICS, problemsForTrack, problemsOf } from '@/content/neetcode150';
import { addDays, nextReviewDate, recommendNext, topicStats, type ProgressRow, type Status } from '@/lib/recommend';

const TODAY = '2026-10-25';

function prog(entries: ([string, Status] | [string, Status, string | null])[]): Map<string, ProgressRow> {
  return new Map(
    entries.map(([slug, status, review]) => [
      slug,
      { problem_slug: slug, status, hints_used: 0, attempts: 1, next_review_on: review ?? null },
    ])
  );
}

describe('content & tracks', () => {
  it('has the 150 problems with unique slugs', () => {
    expect(PROBLEMS).toHaveLength(150);
    expect(new Set(PROBLEMS.map((p) => p.slug)).size).toBe(150);
  });
  it('every problem has a valid topic and every prereq exists', () => {
    const topics = new Set(TOPICS.map((t) => t.slug));
    PROBLEMS.forEach((p) => expect(topics.has(p.topic)).toBe(true));
    TOPICS.forEach((t) => t.prereqs.forEach((s) => expect(topics.has(s)).toBe(true)));
  });
  it('has 50 problems in core50 and 75 in blind75, covering all 18 topics in every track', () => {
    expect(problemsForTrack('core50')).toHaveLength(50);
    expect(problemsForTrack('blind75')).toHaveLength(75);
    expect(problemsForTrack('neetcode150')).toHaveLength(150);

    for (const t of TOPICS) {
      expect(problemsOf(t.slug, 'core50').length).toBeGreaterThanOrEqual(2);
      expect(problemsOf(t.slug, 'blind75').length).toBeGreaterThanOrEqual(1);
    }
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

  it('respects the selected track in recommendNext and topicStats', () => {
    // In core50, first problem in arrays-hashing is two-sum (contains-duplicate is not in core50)
    const rCore = recommendNext(new Map(), TODAY, 'core50')!;
    expect(rCore.problem.slug).toBe('two-sum');

    // Solving 2 out of 4 core50 problems in arrays-hashing unlocks two-pointers in core50
    const twoCoreSolved = prog([
      ['two-sum', 'solved', '2026-12-01'],
      ['group-anagrams', 'solved', '2026-12-01'],
    ]);
    expect(topicStats(twoCoreSolved, 'arrays-hashing', 'core50')).toEqual({ solved: 2, total: 4 });
    const nextAfterHalfCore = recommendNext(twoCoreSolved, TODAY, 'core50')!;
    expect(nextAfterHalfCore.problem.slug).toBe('top-k-frequent-elements');

    // Solve all 4 core50 in arrays-hashing -> moves to two-pointers
    const allCoreAh = prog([
      ['two-sum', 'solved', '2026-12-01'],
      ['group-anagrams', 'solved', '2026-12-01'],
      ['top-k-frequent-elements', 'solved', '2026-12-01'],
      ['product-of-array-except-self', 'solved', '2026-12-01'],
    ]);
    expect(recommendNext(allCoreAh, TODAY, 'core50')!.problem.topic).toBe('two-pointers');
  });
});
