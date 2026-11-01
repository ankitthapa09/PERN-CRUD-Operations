"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/features/auth/api";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
};

const authCopy = {
  login: {
    eyebrow: "Welcome back",
    title: "Sign in to your account",
    subtitle: "Continue where you left off and keep your work moving.",
    submit: "Sign in",
    submitting: "Signing in...",
    alternateText: "New to My Tasks?",
    alternateLabel: "Create an account",
    alternatePath: "/register",
  },
  register: {
    eyebrow: "Get started",
    title: "Create your account",
    subtitle: "A clear workspace for the work you want to move forward.",
    submit: "Create account",
    submitting: "Creating account...",
    alternateText: "Already have an account?",
    alternateLabel: "Sign in",
    alternatePath: "/login",
  },
} as const;

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const copy = authCopy[mode];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Email is required");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (mode === "register" && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      if (mode === "register") {
        await authApi.register(normalizedEmail, password);
      } else {
        await authApi.login(normalizedEmail, password);
      }

      router.push("/");
    } catch (authError) {
      setError(
        authError instanceof Error
          ? authError.message
          : "Unable to authenticate. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-brand">My tasks</div>
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p className="auth-subtitle">{copy.subtitle}</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              minLength={8}
              required
            />
          </label>

          {mode === "register" && (
            <label>
              Confirm password
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repeat your password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>
          )}

          {error && <p className="error-message">{error}</p>}

          <button className="auth-submit" type="submit" disabled={submitting}>
            {submitting ? copy.submitting : copy.submit}
          </button>
        </form>

        <p className="auth-alternate">
          {copy.alternateText}{" "}
          <a href={copy.alternatePath}>{copy.alternateLabel}</a>
        </p>
      </section>
    </main>
  );
}
