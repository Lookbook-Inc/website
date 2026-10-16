"use client";

import Link from "next/link";
import posthog from "posthog-js";
import { useActionState, useEffect } from "react";
import type { FormState } from "@/app/auth-actions";

type Action = (state: FormState, data: FormData) => Promise<FormState>;

export function AuthForm({
  action,
  mode,
  next,
}: {
  action: Action;
  mode: "login" | "forgot" | "update";
  next?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const login = mode === "login";
  useEffect(() => {
    if (login && state.error && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.capture("login failed");
    }
  }, [login, state.error]);

  return (
    <form action={formAction} className="auth-form">
      {next ? <input type="hidden" name="next" value={next} /> : null}
      {mode !== "update" ? (
        <label>
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" required autoFocus />
        </label>
      ) : null}
      {login || mode === "update" ? (
        <label>
          <span>{mode === "update" ? "New password" : "Password"}</span>
          <input
            name="password"
            type="password"
            minLength={mode === "update" ? 8 : undefined}
            autoComplete={mode === "update" ? "new-password" : "current-password"}
            required
            autoFocus={mode === "update"}
          />
        </label>
      ) : null}
      {state.error ? <p className="form-message error" role="alert">{state.error}</p> : null}
      {state.success ? <p className="form-message success" role="status">{state.success}</p> : null}
      <button className="button primary wide" disabled={pending}>
        {pending ? "One moment…" : login ? "Sign in" : mode === "forgot" ? "Send reset link" : "Update password"}
      </button>
      {login ? <Link className="text-link center" href="/forgot-password">Forgot password?</Link> : null}
    </form>
  );
}
