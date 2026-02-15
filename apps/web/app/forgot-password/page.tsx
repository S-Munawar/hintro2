"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Loader from "@/components/Common/Loader";
import Link from "next/link";
import { authService } from "@/lib/authService";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await authService.resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div>
        <div>
          <div>
            <h1>Hintro</h1>
          </div>
          <div>
            <h2>Check Your Email</h2>
            <p>
              We sent a password reset link to <strong>{email}</strong>.
            </p>
            <Link href="/login">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div>
        <div>
          <h1>Hintro</h1>
          <p>Reset Your Password</p>
        </div>
        <form onSubmit={handleSubmit}>
          <h2>Forgot Password</h2>
          {error && <div>{error}</div>}
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
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader size="sm" /> : "Send Reset Link"}
          </button>
          <div>
            <Link href="/login">Back to Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
