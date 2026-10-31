'use client';

import { useState, useTransition, useSyncExternalStore, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Check,
  AlertCircle,
  HelpCircle,
  Loader2,
  Lock,
  Send,
  Trash2,
} from 'lucide-react';
import type { Status } from '@/lib/recommend';
import { analyzeApproachAction, getHintAction, askAboutCodeAction, type ChatMessage } from '@/lib/ai';
import { Rich } from '@/components/ui';
import { rateProblemAction, saveNotesAction } from '@/lib/progress.actions';

const QUICK_QUESTIONS = [
  'Check edge cases',
  'Explain what my code does',
  'Can I reduce space complexity?',
  'Trace with a small input',
];

const HINT_STEPS = [
  { level: 1 as const, label: 'Hint 1 · Mental nudge', desc: 'Direction without giving away the algorithm' },
  { level: 2 as const, label: 'Hint 2 · Pattern & invariant', desc: 'The data structure and key state to maintain' },
  { level: 3 as const, label: 'Hint 3 · Python skeleton', desc: 'Step-by-step structural walkthrough' },
];

const RATING_OPTIONS: {
  status: Status;
  label: string;
  schedule: string;
  activeClass: string;
  icon: typeof Check;
}[] = [
  {
    status: 'solved',
    label: 'Solved alone',
    schedule: '7–21d interval',
    activeClass: 'border-emerald-500 bg-emerald-500/15 text-emerald-300',
    icon: Check,
  },
  {
    status: 'hint',
    label: 'Assisted',
    schedule: '2d interval',
    activeClass: 'border-amber-500 bg-amber-500/15 text-amber-300',
    icon: HelpCircle,
  },
  {
    status: 'stuck',
    label: 'Needs recall',
    schedule: '1d interval',
    activeClass: 'border-rose-500 bg-rose-500/15 text-rose-300',
    icon: AlertCircle,
  },
];

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
  const [activeTab, setActiveTab] = useState<'hints' | 'qa' | 'notes'>('hints');
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
    if (activeTab === 'qa') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [chatMessages, activeTab]);

  function handleAskQuestion(customQuestion?: string) {
    const q = (customQuestion ?? question).trim();
    if (!q || asking) return;
    if (!approach.trim()) {
      setError('Write or paste your Python code on the left before asking a question.');
      return;
    }
    setError(null);
    setActiveTab('qa');
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

  const revealedHintCount = Object.keys(hints).length;

  return (
    <div className="space-y-6">
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-200 flex items-start gap-2.5"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
          <div className="flex-1">{error}</div>
        </div>
      )}

      {/* Two-Column Studio Workbench */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* LEFT COLUMN (7 cols): Code Editor, Complexity Feedback & Spaced Repetition Dock */}
        <div className="lg:col-span-7 space-y-5">
          <div className="rounded-xl border border-hairline bg-surface overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline px-4 py-3 bg-surface">
              <div>
                <h2 className="text-xs font-semibold text-white">Python solution or approach</h2>
                <p className="text-[11px] text-pewter">
                  Write your solution or pseudocode to verify time and space complexity
                </p>
              </div>
              <span className="font-mono text-[11px] text-pewter hidden sm:inline">
                <kbd
                  suppressHydrationWarning
                  className="rounded bg-canvas px-1.5 py-0.5 text-ink border border-hairline"
                >
                  {isMac ? '⌘↵' : 'Ctrl+Enter'}
                </kbd>{' '}
                to check
              </span>
            </div>

            <textarea
              value={approach}
              onChange={(e) => setApproach(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={12}
              placeholder={`def solution():\n    # Write your Python implementation or outline your invariant...\n    pass`}
              className="w-full resize-y bg-canvas p-4 font-mono text-xs sm:text-sm text-ink placeholder:text-pewter/50 focus:outline-none leading-relaxed"
            />

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-hairline bg-surface px-4 py-2.5">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={analyzing || !approach.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-cobalt px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Checking complexity…</span>
                  </>
                ) : (
                  <span>Check complexity</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('qa');
                  setTimeout(() => chatInputRef.current?.focus(), 50);
                }}
                className="text-xs font-medium text-pewter transition hover:text-white"
              >
                Ask a question about this code
              </button>
            </div>
          </div>

          {analysis && (
            <div
              aria-live="polite"
              className="rounded-xl border border-hairline bg-surface p-5 space-y-2.5"
            >
              <div className="flex items-center justify-between border-b border-hairline pb-2">
                <span className="text-xs font-semibold text-cobalt">
                  Complexity &amp; approach review
                </span>
              </div>
              <Rich text={analysis} />
            </div>
          )}

          {/* Spaced-Repetition Self-Assessment Dock */}
          <div className="rounded-xl border border-hairline bg-surface p-5 space-y-3.5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h2 className="text-xs font-semibold text-white">Log recall outcome</h2>
                <p className="text-[11px] text-pewter">
                  Sets the next spaced-repetition review interval for this problem
                </p>
              </div>
              {status !== 'todo' && (
                <span className="font-mono text-[11px] text-emerald-400">
                  Logged ({ RATING_OPTIONS.find((o) => o.status === status)?.label })
                </span>
              )}
            </div>

            <div className="grid gap-2.5 sm:grid-cols-3">
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
                    className={`flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt ${
                      isSelected
                        ? opt.activeClass
                        : 'border-hairline bg-canvas/70 hover:border-pewter/50 hover:bg-elevated/60'
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-white">
                        <Icon className="h-3.5 w-3.5" />
                        {opt.label}
                      </span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                    </div>
                    <span className="font-mono text-[11px] text-pewter">{opt.schedule}</span>
                  </button>
                );
              })}
            </div>

            {status !== 'todo' && (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-hairline">
                <span className="text-xs text-pewter">
                  Review scheduled in your recall queue.
                </span>

                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-cobalt px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt"
                >
                  Next problem in queue
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (5 cols): Recall Inspector Rail (Hints, Code Q&A, Personal Notes) */}
        <aside className="lg:col-span-5 rounded-xl border border-hairline bg-surface overflow-hidden">
          {/* Inspector Navigation Tabs */}
          <div
            role="tablist"
            aria-label="Workbench recall tools"
            className="grid grid-cols-3 border-b border-hairline bg-canvas/50 p-1 gap-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'hints'}
              onClick={() => setActiveTab('hints')}
              className={`rounded-lg py-2 text-xs font-medium transition ${
                activeTab === 'hints'
                  ? 'bg-elevated text-white shadow-sm'
                  : 'text-pewter hover:text-ink'
              }`}
            >
              Hints ({revealedHintCount}/3)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'qa'}
              onClick={() => setActiveTab('qa')}
              className={`rounded-lg py-2 text-xs font-medium transition ${
                activeTab === 'qa'
                  ? 'bg-elevated text-white shadow-sm'
                  : 'text-pewter hover:text-ink'
              }`}
            >
              Code Q&amp;A {chatMessages.length > 0 ? `(${Math.ceil(chatMessages.length / 2)})` : ''}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'notes'}
              onClick={() => setActiveTab('notes')}
              className={`rounded-lg py-2 text-xs font-medium transition ${
                activeTab === 'notes'
                  ? 'bg-elevated text-white shadow-sm'
                  : 'text-pewter hover:text-ink'
              }`}
            >
              Notes {notes.trim() ? '•' : ''}
            </button>
          </div>

          {/* TAB 1: Progressive Active-Recall Hints */}
          {activeTab === 'hints' && (
            <div className="p-4 sm:p-5 space-y-3">
              <p className="text-xs text-pewter">
                Unlock one stage at a time only when stuck to preserve active recall.
              </p>

              <div className="space-y-2.5" aria-live="polite">
                {HINT_STEPS.map(({ level, label, desc }) => {
                  const isRevealed = Boolean(hints[level]);
                  const isUnlocked = level === 1 || Boolean(hints[level - 1]);
                  const isLoading = hintLoading === level;

                  return (
                    <div
                      key={level}
                      className={`rounded-lg border p-3.5 transition ${
                        isRevealed
                          ? 'border-hairline bg-canvas'
                          : isUnlocked
                          ? 'border-hairline bg-canvas/50'
                          : 'border-hairline/50 bg-canvas/20 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-xs font-semibold text-white">{label}</h3>
                          {!isRevealed && <p className="text-[11px] text-pewter mt-0.5">{desc}</p>}
                        </div>

                        {!isRevealed ? (
                          <button
                            type="button"
                            disabled={!isUnlocked || isLoading}
                            onClick={() => revealHint(level)}
                            className="shrink-0 rounded-md border border-hairline bg-surface px-2.5 py-1 text-xs font-medium text-ink transition hover:bg-elevated disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt"
                          >
                            {isLoading ? (
                              <span className="inline-flex items-center gap-1">
                                <Loader2 className="h-3 w-3 animate-spin" /> Loading…
                              </span>
                            ) : !isUnlocked ? (
                              <span className="inline-flex items-center gap-1 text-pewter">
                                <Lock className="h-3 w-3" /> Locked
                              </span>
                            ) : (
                              'Reveal'
                            )}
                          </button>
                        ) : (
                          <span className="font-mono text-[10px] text-emerald-400">Revealed</span>
                        )}
                      </div>

                      {isRevealed && (
                        <div className="mt-2.5 pt-2.5 border-t border-hairline/80">
                          <Rich text={hints[level]} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Code Q&A Assistant */}
          {activeTab === 'qa' && (
            <div className="p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-pewter">
                  Inspects the Python code currently in your editor.
                </p>
                {chatMessages.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setChatMessages([])}
                    disabled={asking}
                    className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] text-pewter transition hover:bg-elevated hover:text-white disabled:opacity-40"
                  >
                    <Trash2 className="h-3 w-3" />
                    Clear
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    disabled={asking || !approach.trim()}
                    onClick={() => handleAskQuestion(q)}
                    className="rounded-md border border-hairline bg-canvas px-2.5 py-1 text-[11px] text-ink transition hover:border-cobalt/50 hover:bg-elevated disabled:opacity-40"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {chatMessages.length > 0 ? (
                <div
                  aria-live="polite"
                  className="max-h-80 space-y-2.5 overflow-y-auto pr-1"
                >
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${
                        msg.role === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`max-w-[92%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-cobalt/15 border border-cobalt/30 text-ink'
                            : 'bg-canvas border border-hairline text-ink w-full'
                        }`}
                      >
                        {msg.role === 'user' ? (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        ) : (
                          <Rich text={msg.content} />
                        )}
                      </div>
                    </div>
                  ))}

                  {asking && (
                    <div className="flex items-center gap-2 rounded-lg border border-hairline bg-canvas px-3 py-2 text-xs text-pewter">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-cobalt" />
                      <span>Inspecting your code…</span>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              ) : (
                <p className="text-xs text-pewter py-2">
                  {approach.trim()
                    ? 'Ask why a test case fails, how an invariant holds, or how to simplify a loop.'
                    : 'Paste your code in the editor on the left first, then ask a question here.'}
                </p>
              )}

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
                      ? 'Ask about your code…'
                      : 'Write code on the left first…'
                  }
                  className="flex-1 rounded-lg border border-hairline bg-canvas px-3 py-2 text-xs text-ink placeholder:text-pewter/60 focus:border-cobalt focus:outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={asking || !question.trim() || !approach.trim()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-cobalt px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt"
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

          {/* TAB 3: Personal Notes */}
          {activeTab === 'notes' && (
            <div className="p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-pewter">
                  Record invariants, edge cases, or mistakes to remember on next recall.
                </p>
                <span className="font-mono text-[11px] text-pewter">
                  {notesSaveStatus === 'saving' && 'Saving…'}
                  {notesSaveStatus === 'saved' && <span className="text-emerald-400">Saved</span>}
                  {notesSaveStatus === 'error' && <span className="text-rose-400">Save failed</span>}
                  {notesSaveStatus === 'idle' && 'Autosaves'}
                </span>
              </div>

              <textarea
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  if (notesSaveStatus === 'saved') setNotesSaveStatus('idle');
                }}
                onBlur={handleNotesBlur}
                rows={8}
                placeholder="e.g. Window is valid while (r - l + 1) - max_freq <= k. No need to decrement max_freq when shrinking left pointer..."
                className="w-full rounded-lg border border-hairline bg-canvas p-3 text-xs sm:text-sm text-ink placeholder:text-pewter/50 focus:border-cobalt focus:outline-none leading-relaxed"
              />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
