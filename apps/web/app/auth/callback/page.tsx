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
    <div>
      <div>
        <Loader size="lg" />
        <p>Completing sign in...</p>
      </div>
    </div>
  );
}
