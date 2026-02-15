"use client";

import { useState } from "react";
import AuthenticatedLayout from "@/components/Auth/AuthenticatedLayout";
import { useAuth } from "@/hooks/useAuth";
import { LogOut } from "lucide-react";

export default function SettingsPage() {
  const { user, logoutUser } = useAuth();

  return (
    <AuthenticatedLayout>
      <div className="settings">
        <h1 className="settings-title">Settings</h1>

        <section className="settings-section">
          <h2>Account</h2>
          <div className="settings-card">
            <div className="settings-field">
              <label>Email</label>
              <span>{user?.email ?? "—"}</span>
            </div>
            <div className="settings-field">
              <label>User ID</label>
              <span className="settings-mono">{user?.id ?? "—"}</span>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h2>Danger Zone</h2>
          <div className="settings-card settings-danger">
            <p>Sign out of your account on this device.</p>
            <button className="btn btn-danger" onClick={logoutUser} type="button">
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </section>
      </div>
    </AuthenticatedLayout>
  );
}
