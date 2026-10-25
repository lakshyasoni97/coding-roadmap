import { AuthForm } from '@/components/auth/AuthForm';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-zinc-100">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-8 shadow-2xl backdrop-blur">
        <div className="space-y-2 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 font-mono text-xl font-bold ring-1 ring-emerald-500/30">
            PR
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">PatternRecall</h1>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
            Spaced repetition and progressive hint coaching for NeetCode 150 patterns.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300"
          >
            {error}
          </div>
        )}

        {message && (
          <div
            role="status"
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300"
          >
            {message}
          </div>
        )}

        <AuthForm />

        <div className="border-t border-zinc-800/80 pt-4 text-center text-xs text-zinc-500">
          Reinforce algorithmic patterns through active recall before you forget.
        </div>
      </div>
    </div>
  );
}
