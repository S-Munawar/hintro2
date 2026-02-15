"use client";

import AuthenticatedLayout from "@/components/Auth/AuthenticatedLayout";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, Settings, Shield, User } from "lucide-react";

export default function SettingsPage() {
  const { user, logoutUser } = useAuth();

  return (
    <AuthenticatedLayout>
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-8 py-6">
          <div className="max-w-3xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Settings size={18} className="text-indigo-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Settings</h1>
          </div>
        </div>

        <div className="p-8 max-w-3xl space-y-8">
          {/* Account section */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <User size={14} className="text-slate-400" />
              <h2 className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Account</h2>
            </div>
            <div className="card divide-y divide-slate-100">
              <div className="flex items-center justify-between px-5 py-4">
                <label className="text-sm font-medium text-slate-500">Email</label>
                <span className="text-sm font-medium text-slate-800">{user?.email ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between px-5 py-4">
                <label className="text-sm font-medium text-slate-500">User ID</label>
                <span className="text-xs text-slate-400 font-mono bg-slate-50 px-2.5 py-1 rounded-md">{user?.id ?? "—"}</span>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Shield size={14} className="text-red-400" />
              <h2 className="text-[11px] font-semibold text-red-400 uppercase tracking-widest">Danger Zone</h2>
            </div>
            <div className="card border-red-200/60 p-5">
              <p className="text-sm text-slate-500 mb-4">Sign out of your account on this device.</p>
              <button
                className="btn btn-danger"
                onClick={logoutUser}
                type="button"
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          </section>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
