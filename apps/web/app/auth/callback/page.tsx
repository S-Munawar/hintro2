"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/authService";
import Loader from "@/components/Common/Loader";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await authService.getSession();
        router.replace("/");
      } catch (error) {
        console.error("Auth callback error:", error);
        router.replace("/login?error=auth_failed");
      }
    };
    handleCallback();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-5 auth-gradient">
      <Loader size="lg" />
      <p className="text-sm text-slate-500 font-medium">Completing sign in...</p>
    </div>
  );
}
