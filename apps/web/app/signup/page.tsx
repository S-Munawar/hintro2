"use client";

import SignupForm from "@/components/Auth/SignupForm";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loader from "@/components/Common/Loader";
import { Kanban } from "lucide-react";

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
      <div className="flex items-center justify-center h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center auth-gradient px-4 overflow-hidden">
      <div className="float-shape float-shape-1" />
      <div className="float-shape float-shape-2" />
      <div className="float-shape float-shape-3" />
      <div className="relative z-10 flex flex-col items-center w-full">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-2 bg-indigo-600 rounded-xl">
            <Kanban size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Hintro</h1>
        </div>
        <p className="text-slate-500 text-sm mb-8">Real-Time Task Collaboration</p>
        <SignupForm />
      </div>
    </div>
  );
}
