"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function LoginForm() {
  const { loginUser, loginWithOAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await loginUser(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div>
        <h1>Welcome Back</h1>
        <p>Sign in to your account</p>

        {error && <div>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
              minLength={6}
            />
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div>
          <span>or continue with</span>
        </div>

        <div>
          <button onClick={() => loginWithOAuth("google")} type="button">
            Google
          </button>
        </div>

        <p>
          Don&apos;t have an account? <Link href="/signup">Sign Up</Link>
        </p>

        <p>
          <Link href="/forgot-password">Forgot password?</Link>
        </p>
      </div>
    </div>
  );
}
