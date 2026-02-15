"use client";

import { useEffect, useState } from "react";
import AuthenticatedLayout from "@/components/Auth/AuthenticatedLayout";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { Plus, Archive, Users } from "lucide-react";

export default function DashboardPage() {
  const { userName } = useAuth();

  return (
    <AuthenticatedLayout>
      <div>
        <div>
          <div>
            <h1>Welcome, {userName}!</h1>
            <p>Manage your boards and tasks</p>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
