'use server';

import { PROBLEM_BY_SLUG, TOPIC_BY_SLUG } from '@/content/neetcode150';
import { createClient } from '@/lib/supabase/server';

type Result = { text?: string; error?: string };

async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user ? { supabase, user: data.user } : null;
}

const SYSTEM_FORMAT_INSTRUCTION =
  'Format responses in clean Markdown: keep **bold** terms (such as **O(n)**) and `inline code` inline within sentences rather than on separate lines, and keep `**Bold Label:** explanation` on a single line inside list items.';

async function gemini(prompt: string): Promise<Result> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return { error: 'GEMINI_API_KEY is missing in .env.local.' };

  const configured = (process.env.GEMINI_MODEL || 'gemini-2.5-flash').trim();
  const models = Array.from(new Set([configured, 'gemini-2.5-flash', 'gemini-2.0-flash']));
  let lastError = 'Failed to reach Gemini.';

  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_FORMAT_INSTRUCTION }] },
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1024,
              // keep "thinking" tokens from eating the answer budget on 2.5 models
              ...(model.includes('2.5') ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
            },
          }),
        }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        lastError = body?.error?.message || `HTTP ${res.status} from ${model}`;
        if (res.status === 404 || res.status === 400) continue;
        break;
      }
      const data = await res.json();
      const text = (data?.candidates?.[0]?.content?.parts ?? [])
        .map((p: { text?: string }) => p.text ?? '')
        .join('\n')
        .trim();
      if (text) return { text };
    } catch (e) {
      lastError = e instanceof Error ? e.message : 'Network error calling Gemini';
    }
  }
  return { error: lastError };
}

/** Level 2 = approach hint, level 3 = pseudocode. (Level 1 is static content.) */
export async function getHintAction(slug: string, level: 2 | 3): Promise<Result> {
  const auth = await requireUser();
  if (!auth) return { error: 'Not signed in.' };
  const p = PROBLEM_BY_SLUG.get(slug);
  if (!p) return { error: 'Unknown problem.' };
  const topic = TOPIC_BY_SLUG.get(p.topic)!;

  const prompt =
    level === 2
      ? `You are a coding interview coach. Problem: "${p.title}" (${p.difficulty}). Pattern: ${topic.name}.
Give a hint in at most 3 short bullets, WITHOUT code and without the full solution:
- name the idea/pattern and why it fits,
- the key invariant or data to keep track of,
- the most common edge case or off-by-one trap.`
      : `You are a coding interview coach. Problem: "${p.title}" (${p.difficulty}). Pattern: ${topic.name}. Optimal: time ${p.time}, space ${p.space}.
Give 4-6 lines of plain-language pseudocode for the optimal solution (no real language syntax), then one sentence on why it is ${p.time} time and ${p.space} space.`;

  const out = await gemini(prompt);
  if (out.text) {
    const { supabase, user } = auth;
    const { data: row } = await supabase
      .from('progress')
      .select('hints_used')
      .eq('user_id', user.id)
      .eq('problem_slug', slug)
      .maybeSingle();
    await supabase.from('progress').upsert(
      {
        user_id: user.id,
        problem_slug: slug,
        hints_used: Math.max(row?.hints_used ?? 0, level),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,problem_slug' }
    );
  }
  return out;
}

export async function analyzeApproachAction(slug: string, approach: string): Promise<Result> {
  const auth = await requireUser();
  if (!auth) return { error: 'Not signed in.' };
  const p = PROBLEM_BY_SLUG.get(slug);
  if (!p) return { error: 'Unknown problem.' };
  const text = approach.trim().slice(0, 8000);
  if (!text) return { error: 'Paste your approach or code first.' };

  const prompt = `You are a friendly tutor explaining Big-O to someone who finds it confusing.
Problem: "${p.title}". Best known solution: time ${p.time}, space ${p.space}.
The learner's approach/code:
"""
${text}
"""
Reply in plain English, no jargon, at most 150 words, using EXACTLY this format:

**Time: O(...)**
2-3 sentences: which loops/recursion/sorting cause it and how many times each runs.

**Space: O(...)**
1-2 sentences: what extra memory is used and why.

**Compared to the best solution**
One sentence: is it optimal, or how far off is it?

**How to improve**
One concrete change (what data structure/idea replaces which part). Say "already optimal" if so. Do not write full code.`;

  const out = await gemini(prompt);
  if (out.text) {
    const { supabase, user } = auth;
    await supabase.from('progress').upsert(
      { user_id: user.id, problem_slug: slug, last_analysis: out.text, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,problem_slug' }
    );
  }
  return out;
}

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

export async function askAboutCodeAction(
  slug: string,
  code: string,
  question: string,
  history: ChatMessage[] = []
): Promise<Result> {
  const auth = await requireUser();
  if (!auth) return { error: 'Not signed in.' };
  const p = PROBLEM_BY_SLUG.get(slug);
  if (!p) return { error: 'Unknown problem.' };
  const topic = TOPIC_BY_SLUG.get(p.topic)!;

  const trimmedCode = code.trim().slice(0, 8000);
  if (!trimmedCode) return { error: 'Paste your code or approach in the box above first.' };

  const trimmedQuestion = question.trim().slice(0, 2000);
  if (!trimmedQuestion) return { error: 'Ask a question first.' };

  const recentHistory = history
    .slice(-10)
    .map((m) => `${m.role === 'user' ? 'Learner' : 'Tutor'}: ${m.content.slice(0, 1500)}`)
    .join('\n\n');

  const prompt = `You are a concise, friendly coding interview tutor helping a learner with their code.
Problem: "${p.title}" (${p.difficulty}). Topic/Pattern: ${topic.name}. Optimal complexity: time ${p.time}, space ${p.space}.

The learner's current code/approach in the editor:
"""
${trimmedCode}
"""
${recentHistory ? `\nConversation so far:\n${recentHistory}\n` : ''}
Learner's question: ${trimmedQuestion}

Instructions:
- Answer directly, referencing specific lines, variables, or logic in their pasted code.
- Keep your response concise (under 150 words unless a trace is requested) and easy to scan.
- Format cleanly in Markdown: keep **bold** terms (like **O(n)**) and \`inline code\` inline within sentences, and keep \`**Bold Label:** explanation\` on a single line inside bullet or numbered list items.
- Guide them toward understanding and fixing issues themselves rather than dumping a complete replacement solution, unless they explicitly ask for a small snippet.`;

  return gemini(prompt);
}
