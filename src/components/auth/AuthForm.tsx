'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { loginAction, signUpAction } from '@/lib/actions/auth.actions';

export function AuthForm() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 rounded-lg bg-canvas p-1 border border-hairline">
        <button
          type="button"
          onClick={() => setMode('signin')}
          className={`rounded-md py-1.5 text-xs font-medium transition ${
            mode === 'signin'
              ? 'bg-elevated text-white shadow-sm'
              : 'text-pewter hover:text-ink'
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode('signup')}
          className={`rounded-md py-1.5 text-xs font-medium transition ${
            mode === 'signup'
              ? 'bg-elevated text-white shadow-sm'
              : 'text-pewter hover:text-ink'
          }`}
        >
          Create account
        </button>
      </div>

      <form action={mode === 'signin' ? loginAction : signUpAction} className="space-y-4">
        <div>
          <label
            htmlFor="auth-email"
            className="block text-xs font-medium text-ink mb-1.5"
          >
            Email address
          </label>
          <input
            id="auth-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="block w-full rounded-lg border border-hairline bg-canvas px-3.5 py-2.5 text-sm text-white placeholder-pewter/50 transition focus:border-cobalt focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="auth-password"
            className="block text-xs font-medium text-ink mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="auth-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              placeholder="••••••••••••"
              className="block w-full rounded-lg border border-hairline bg-canvas px-3.5 py-2.5 pr-10 text-sm text-white placeholder-pewter/50 transition focus:border-cobalt focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-2.5 top-2.5 p-1 text-pewter hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt rounded"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="pt-1">
          <button
            type="submit"
            className="flex w-full items-center justify-center rounded-lg bg-cobalt py-2.5 text-xs font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt"
          >
            {mode === 'signin' ? 'Sign in to workbench' : 'Create account'}
          </button>
        </div>
      </form>
    </div>
  );
}
