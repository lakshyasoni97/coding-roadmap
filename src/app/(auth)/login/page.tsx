import { AuthForm } from '@/components/auth/AuthForm';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 text-ink">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-hairline bg-surface p-8 shadow-xl">
        <div className="space-y-1.5 border-b border-hairline pb-4">
          <div className="flex items-baseline justify-between">
            <h1 className="font-serif text-3xl font-medium tracking-tight text-white">
              PatternRecall
            </h1>
            <span className="font-mono text-xs text-pewter">NeetCode 150</span>
          </div>
          <p className="text-xs text-pewter leading-relaxed">
            Spaced-repetition recall and progressive hint workbench for algorithmic interviews.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-200"
          >
            {error}
          </div>
        )}

        {message && (
          <div
            role="status"
            className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-200"
          >
            {message}
          </div>
        )}

        <AuthForm />

        <div className="border-t border-hairline pt-4 text-xs text-pewter">
          Retain core algorithmic invariants through scheduled recall.
        </div>
      </div>
    </div>
  );
}
