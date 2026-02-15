"use client";

import AuthGuard from "@/components/Auth/AuthGuard";
import Sidebar from "@/components/Layout/Sidebar";
import { useSocket } from "@/hooks/useSocket";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  useSocket();

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </AuthGuard>
  );
}
