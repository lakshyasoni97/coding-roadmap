'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { PROBLEM_BY_SLUG, TRACK_COOKIE, parseTrack, type TrackId } from '@/content/neetcode150';
import { createClient } from '@/lib/supabase/server';
import { nextReviewDate, todayString, type Status } from '@/lib/recommend';

const STATUSES: Status[] = ['todo', 'solved', 'hint', 'stuck'];

export async function setRoadmapTrackAction(track: TrackId) {
  const validTrack = parseTrack(track);
  const cookieStore = await cookies();
  cookieStore.set(TRACK_COOKIE, validTrack, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax',
  });
  revalidatePath('/');
  revalidatePath('/topics/[slug]', 'page');
  return { ok: true, track: validTrack };
}

async function ctx(slug: string) {
  if (!PROBLEM_BY_SLUG.has(slug)) throw new Error('Unknown problem');
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error('Not signed in');
  const { data: row } = await supabase
    .from('progress')
    .select('attempts')
    .eq('user_id', data.user.id)
    .eq('problem_slug', slug)
    .maybeSingle();
  return { supabase, userId: data.user.id, attempts: row?.attempts ?? 0 };
}

function refresh(slug: string) {
  revalidatePath('/');
  revalidatePath('/topics/[slug]', 'page');
  revalidatePath(`/problems/${slug}`);
}

/** Record how an attempt went. Schedules the next review. */
export async function rateProblemAction(slug: string, status: Status) {
  if (!STATUSES.includes(status)) return { error: 'Bad status' };
  const { supabase, userId, attempts } = await ctx(slug);
  const today = todayString();
  const n = status === 'todo' ? 0 : attempts + 1;
  const { error } = await supabase.from('progress').upsert(
    {
      user_id: userId,
      problem_slug: slug,
      status,
      attempts: n,
      last_attempt_on: status === 'todo' ? null : today,
      next_review_on: nextReviewDate(status, n, today),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,problem_slug' }
  );
  refresh(slug);
  return error ? { error: error.message } : { ok: true };
}

/** Checkbox on the topic table: solved <-> todo. */
export async function toggleSolvedAction(slug: string, solved: boolean) {
  return rateProblemAction(slug, solved ? 'solved' : 'todo');
}

export async function saveNotesAction(slug: string, notes: string) {
  const { supabase, userId } = await ctx(slug);
  const { error } = await supabase.from('progress').upsert(
    { user_id: userId, problem_slug: slug, notes: notes.slice(0, 5000), updated_at: new Date().toISOString() },
    { onConflict: 'user_id,problem_slug' }
  );
  return error ? { error: error.message } : { ok: true };
}
