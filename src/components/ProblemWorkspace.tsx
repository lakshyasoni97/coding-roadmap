'use client';

import { useState, useTransition, useSyncExternalStore, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Lightbulb,
  Sparkles,
  Check,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Loader2,
  Lock,
  FileEdit,
  MessageSquare,
  Send,
  Trash2,
} from 'lucide-react';
import type { Status } from '@/lib/recommend';
import { analyzeApproachAction, getHintAction, askAboutCodeAction, type ChatMessage } from '@/lib/ai';
import { rateProblemAction, saveNotesAction } from '@/lib/progress.actions';

const QUICK_QUESTIONS = [
  'Find bugs or edge cases',
  'Explain what my code does',
  'How can I optimize this?',
  'Trace with a sample input',
];

const HINT_STEPS = [
  { level: 1 as const, label: 'Level 1: Gentle Nudge', desc: 'A subtle mental direction without code' },
  { level: 2 as const, label: 'Level 2: Core Pattern & Approach', desc: 'The exact algorithmic pattern to apply' },
  { level: 3 as const, label: 'Level 3: Python Pseudocode', desc: 'Structural pseudocode walkthrough' },
];

const RATING_OPTIONS: {
  status: Status;
  label: string;
  schedule: string;
  activeClass: string;
  badgeClass: string;
  icon: typeof Check;
}[] = [
  {
    status: 'solved',
    label: 'Solved alone',
    schedule: 'Review in 7–21 days',
    activeClass: 'border-emerald-500 bg-emerald-500/15 text-emerald-300 ring-2 ring-emerald-500/40',
    badgeClass: 'text-emerald-400',
    icon: Check,
  },
  {
    status: 'hint',
    label: 'Needed hints',
    schedule: 'Review in 2 days',
    activeClass: 'border-amber-500 bg-amber-500/15 text-amber-300 ring-2 ring-amber-500/40',
    badgeClass: 'text-amber-400',
    icon: HelpCircle,
  },
  {
    status: 'stuck',
    label: 'Got stuck',
    schedule: 'Review tomorrow',
    activeClass: 'border-red-500 bg-red-500/15 text-red-300 ring-2 ring-red-500/40',
    badgeClass: 'text-red-400',
    icon: AlertCircle,
  },
];

function Rich({ text }: { text: string }) {
  return (
    <div className="space-y-1.5 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith('**') ? (
          <strong key={i} className="block pt-1.5 font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </div>
  );
}

export function ProblemWorkspace({
  slug,
  hint1,
  initialStatus,
  initialNotes,
  initialAnalysis,
}: {
  slug: string;
  hint1: string;
  initialStatus: Status;
  initialNotes: string;
  initialAnalysis: string;
}) {
  const [hints, setHints] = useState<Record<number, string>>({});
  const [hintLoading, setHintLoading] = useState<number | null>(null);
  const [approach, setApproach] = useState('');
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [analyzing, startAnalyze] = useTransition();
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [asking, startAsking] = useTransition();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>(initialStatus);
  const [ratingPending, setRatingPending] = useState(false);
  const [notes, setNotes] = useState(initialNotes);
  const [notesSaveStatus, setNotesSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const isMac = useSyncExternalStore(
    () => () => {},
    () => typeof navigator !== 'undefined' && /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent),
    () => true
  );

  async function revealHint(level: 1 | 2 | 3) {
    if (hints[level] || hintLoading) return;
    setError(null);
    if (level === 1) {
      setHints((h) => ({ ...h, 1: hint1 }));
      return;
    }
    setHintLoading(level);
    const res = await getHintAction(slug, level);
    setHintLoading(null);
    if (res.error) {
      setError(res.error);
    } else {
      setHints((h) => ({ ...h, [level]: res.text! }));
    }
  }

  function handleAnalyze() {
    if (!approach.trim() || analyzing) return;
    setError(null);
    startAnalyze(async () => {
      const res = await analyzeApproachAction(slug, approach);
      if (res.error) {
        setError(res.error);
      } else {
        setAnalysis(res.text!);
      }
    });
  }

  useEffect(() => {
    if (chatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [chatMessages, chatOpen]);

  function handleAskQuestion(customQuestion?: string) {
    const q = (customQuestion ?? question).trim();
    if (!q || asking) return;
    if (!approach.trim()) {
      setError('Paste your code or approach in the editor box above before asking a question.');
      return;
    }
    setError(null);
    setChatOpen(true);
    const historySnapshot = chatMessages;
    const nextMessages: ChatMessage[] = [...historySnapshot, { role: 'user', content: q }];
    setChatMessages(nextMessages);
    if (!customQuestion) setQuestion('');

    startAsking(async () => {
      const res = await askAboutCodeAction(slug, approach, q, historySnapshot);
      if (res.error) {
        setError(res.error);
      } else if (res.text) {
        setChatMessages((prev) => [...prev, { role: 'assistant', content: res.text! }]);
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleAnalyze();
    }
  }

  async function handleRate(s: Status) {
    setError(null);
    setRatingPending(true);
    const res = await rateProblemAction(slug, s);
    setRatingPending(false);
    if (res.error) {
      setError(res.error);
    } else {
      setStatus(s);
    }
  }

  async function handleNotesBlur() {
    if (notes === initialNotes && notesSaveStatus === 'idle') return;
    setNotesSaveStatus('saving');
    const res = await saveNotesAction(slug, notes);
    if (res.error) {
      setNotesSaveStatus('error');
    } else {
      setNotesSaveStatus('saved');
      setTimeout(() => setNotesSaveStatus('idle'), 3000);
    }
  }

  return (
    <div className="space-y-8">
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300 flex items-start gap-3"
        >
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
          <div className="flex-1">{error}</div>
        </div>
      )}

      {/* SECTION 1: Approach / Solution Code */}
      <section className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              1. Your Approach or Python Solution
            </h2>
            <p className="text-xs text-zinc-400">
              Paste your solution or brainstorm your approach to verify Time & Space complexity.
            </p>
          </div>
          <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
            Press{' '}
            <kbd
              suppressHydrationWarning
              className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-400 border border-zinc-700"
            >
              {isMac ? '⌘ Enter' : 'Ctrl+Enter'}
            </kbd>{' '}
            to analyze
          </span>
        </div>

        <div className="relative rounded-xl border border-zinc-800 bg-zinc-950/80 focus-within:border-emerald-500/60 focus-within:ring-1 focus-within:ring-emerald-500/40">
          <textarea
            value={approach}
            onChange={(e) => setApproach(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={9}
            placeholder={`def solution():\n    # Describe or paste your implementation here...\n    pass`}
            className="w-full resize-y rounded-xl bg-transparent p-4 font-mono text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none leading-relaxed"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={analyzing || !approach.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Analyzing Complexity…</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Analyze Time & Space Complexity</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              const next = !chatOpen;
              setChatOpen(next);
              if (next) {
                setTimeout(() => chatInputRef.current?.focus(), 50);
              }
            }}
            aria-expanded={chatOpen}
            className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              chatOpen
                ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                : 'border-zinc-700 bg-zinc-800/80 text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
            <span>Ask Questions About My Code</span>
            {chatMessages.length > 0 && (
              <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">
                {Math.ceil(chatMessages.length / 2)}
              </span>
            )}
          </button>
        </div>

        {analysis && (
          <div
            aria-live="polite"
            className="mt-4 rounded-xl border border-zinc-800/90 bg-zinc-950 p-5 space-y-2"
          >
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 text-xs font-semibold text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              AI Complexity & Approach Feedback
            </div>
            <Rich text={analysis} />
          </div>
        )}

        {chatOpen && (
          <div className="mt-4 rounded-xl border border-zinc-800/90 bg-zinc-950 p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Code Q&A Assistant</span>
                <span className="text-[11px] font-normal text-zinc-500">
                  (reads the code in your editor above)
                </span>
              </div>
              {chatMessages.length > 0 && (
                <button
                  type="button"
                  onClick={() => setChatMessages([])}
                  disabled={asking}
                  className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-200 disabled:opacity-40"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear chat
                </button>
              )}
            </div>

            {/* Quick starter prompt chips */}
            <div className="flex flex-wrap gap-1.5">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={asking || !approach.trim()}
                  onClick={() => handleAskQuestion(q)}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/70 px-2.5 py-1 text-[11px] font-medium text-zinc-300 transition hover:border-emerald-500/40 hover:bg-zinc-800 hover:text-white disabled:opacity-40"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Message History */}
            {chatMessages.length > 0 ? (
              <div
                aria-live="polite"
                className="max-h-96 space-y-3 overflow-y-auto pr-1"
              >
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[90%] rounded-xl px-3.5 py-2.5 text-sm ${
                        msg.role === 'user'
                          ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-100'
                          : 'bg-zinc-900/90 border border-zinc-800 text-zinc-200 w-full'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <p className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed">
                          {msg.content}
                        </p>
                      ) : (
                        <Rich text={msg.content} />
                      )}
                    </div>
                  </div>
                ))}

                {asking && (
                  <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3.5 py-2.5 text-xs text-zinc-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                    <span>Inspecting your code and thinking…</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            ) : (
              <p className="text-xs text-zinc-500 py-1">
                {approach.trim()
                  ? 'Ask anything about your code above — e.g. why a test case fails, what a line does, or how to simplify a loop.'
                  : 'Paste your code or approach in the editor above first, then ask any question about it here.'}
              </p>
            )}

            {/* Question Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskQuestion();
              }}
              className="flex items-center gap-2 pt-1"
            >
              <input
                ref={chatInputRef}
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={asking}
                placeholder={
                  approach.trim()
                    ? 'Ask a question about your pasted code… (Enter to send)'
                    : 'Paste your code in the box above first…'
                }
                className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900/90 px-3.5 py-2 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus-within:ring-emerald-500/40 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={asking || !question.trim() || !approach.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                {asking ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                <span>Ask</span>
              </button>
            </form>
          </div>
        )}
      </section>

      {/* SECTION 2: Gated Progressive Hints */}
      <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-400" />
            2. Progressive Active-Recall Hints
          </h2>
          <p className="text-xs text-zinc-400">
            Try to solve it without peeking first. Unlock one step at a time if you get stuck.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {HINT_STEPS.map(({ level, label, desc }) => {
            const isRevealed = Boolean(hints[level]);
            const isUnlocked = level === 1 || Boolean(hints[level - 1]);
            const isLoading = hintLoading === level;

            return (
              <div
                key={level}
                className={`rounded-xl border p-3.5 transition flex flex-col justify-between ${
                  isRevealed
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : isUnlocked
                    ? 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                    : 'border-zinc-800/40 bg-zinc-950/40 opacity-60'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">{label}</span>
                    {isRevealed ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : !isUnlocked ? (
                      <Lock className="h-3.5 w-3.5 text-zinc-500" />
                    ) : null}
                  </div>
                  <p className="text-[11px] text-zinc-400">{desc}</p>
                </div>

                <div className="pt-3">
                  {!isRevealed ? (
                    <button
                      type="button"
                      disabled={!isUnlocked || isLoading}
                      onClick={() => revealHint(level)}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800/80 px-2.5 py-1.5 text-xs font-medium text-zinc-200 transition hover:bg-zinc-700 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                      {isLoading ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Loader2 className="h-3 w-3 animate-spin" /> Fetching…
                        </span>
                      ) : !isUnlocked ? (
                        'Unlock Level ' + (level - 1) + ' first'
                      ) : (
                        'Reveal hint ' + level
                      )}
                    </button>
                  ) : (
                    <span className="text-[11px] font-medium text-emerald-400 inline-flex items-center gap-1">
                      <Check className="h-3 w-3" /> Revealed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Revealed Hint Bodies */}
        <div className="space-y-3" aria-live="polite">
          {[1, 2, 3].map(
            (lvl) =>
              hints[lvl] && (
                <div
                  key={lvl}
                  className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 space-y-1"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    Hint {lvl}
                  </p>
                  <Rich text={hints[lvl]} />
                </div>
              )
          )}
        </div>
      </section>

      {/* SECTION 3: Self-Assessment & Spaced Repetition */}
      <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
        <div>
          <h2 className="text-sm font-bold text-white">3. Self-Assessment: How did it go?</h2>
          <p className="text-xs text-zinc-400">
            Be honest with yourself. This directly determines when the problem returns to your spaced-repetition queue.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {RATING_OPTIONS.map((opt) => {
            const isSelected = status === opt.status;
            const Icon = opt.icon;

            return (
              <button
                key={opt.status}
                type="button"
                onClick={() => handleRate(opt.status)}
                disabled={ratingPending}
                aria-pressed={isSelected}
                className={`flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  isSelected
                    ? opt.activeClass
                    : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-850/60'
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Icon className="h-3.5 w-3.5" />
                    {opt.label}
                  </span>
                  {isSelected && <Check className="h-4 w-4 text-emerald-400" />}
                </div>
                <span className="text-[11px] text-zinc-400">{opt.schedule}</span>
              </button>
            );
          })}
        </div>

        {status !== 'todo' && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800/60">
            <span className="text-xs text-emerald-400 font-medium inline-flex items-center gap-1">
              <Check className="h-3.5 w-3.5" /> Rating recorded & review scheduled
            </span>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <span>Continue to Next Recommended Problem</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </section>

      {/* SECTION 4: Personal Notes */}
      <section className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileEdit className="h-4 w-4 text-zinc-400" />
              4. Personal Notes & Key Takeaways
            </h2>
            <p className="text-xs text-zinc-400">
              Note edge cases, gotchas, or why you got stuck.
            </p>
          </div>

          <div className="text-xs font-medium">
            {notesSaveStatus === 'saving' && (
              <span className="text-zinc-400 inline-flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" /> Saving…
              </span>
            )}
            {notesSaveStatus === 'saved' && (
              <span className="text-emerald-400 inline-flex items-center gap-1">
                <Check className="h-3 w-3" /> Saved to cloud
              </span>
            )}
            {notesSaveStatus === 'error' && (
              <span className="text-red-400">Failed to save</span>
            )}
            {notesSaveStatus === 'idle' && (
              <span className="text-zinc-500">Autosaves on blur</span>
            )}
          </div>
        </div>

        <textarea
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            if (notesSaveStatus === 'saved') setNotesSaveStatus('idle');
          }}
          onBlur={handleNotesBlur}
          rows={3}
          placeholder="e.g. Remember that binary search requires sorted array; watch out for off-by-one with hi = len - 1 vs hi = len..."
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 p-3.5 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 focus:outline-none"
        />
      </section>
    </div>
  );
}
