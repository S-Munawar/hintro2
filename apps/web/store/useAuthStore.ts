// This file defines a Zustand store for managing authentication state in a Next.js application using Supabase as the backend service. It provides actions for initializing the auth state, logging in, registering, logging out, and resetting passwords.

"use client";

import { create } from "zustand";
import { authService } from "@/lib/authService";
import type { Session, User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  initialize: () => Promise<void>;
  loginUser: (email: string, password: string) => Promise<void>;
  registerUser: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  loginWithOAuth: (provider: "google") => Promise<void>;
  logoutUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    try {
      const session = await authService.getSession();
      if (session) {
        const user = await authService.getUser();
        set({ user, session, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, session: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ user: null, session: null, isAuthenticated: false, isLoading: false });
    }
  },

  loginUser: async (email, password) => {
    const { session, user } = await authService.signIn(email, password);
    set({ user, session, isAuthenticated: true });
  },

  registerUser: async (email, password, firstName, lastName) => {
    const { session, user } = await authService.signUp(email, password, firstName, lastName);
    set({ user, session, isAuthenticated: !!session });
  },

  loginWithOAuth: async (provider) => {
    await authService.signInWithOAuth(provider);
  },

  logoutUser: async () => {
    await authService.signOut();
    set({ user: null, session: null, isAuthenticated: false });
  },

  resetPassword: async (email) => {
    await authService.resetPassword(email);
  },

  setSession: (session) => {
    set({
      session,
      isAuthenticated: !!session,
      user: session?.user ?? null,
    });
  },
}));
