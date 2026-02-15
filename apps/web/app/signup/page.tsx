"use client";

import SignupForm from "@/components/Auth/SignupForm";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loader from "@/components/Common/Loader";

export default function SignupPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div>
        <Loader size="lg" />
      </div>
    );
  }

  if (isAuthenticated) return null;

  return (
    <div>
      <div>
        <div>
          <h1>Hintro</h1>
          <p>Real-Time Task Collaboration</p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
