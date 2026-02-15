"use client";

import AuthGuard from "@/components/Auth/AuthGuard";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div>
        <main>{children}</main>
      </div>
    </AuthGuard>
  );
}
