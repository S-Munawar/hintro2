// This file defines a custom React hook called `useAuth` that provides authentication functionality using Supabase and Zustand for state management. It initializes the authentication state, listens for authentication state changes, and provides methods for logging in, registering, logging out, and resetting passwords.

"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/lib/supabaseClient";

export function useAuth() {
  const { user, isAuthenticated, isLoading, initialize, loginUser, registerUser, loginWithOAuth, logoutUser, resetPassword, setSession } = useAuthStore();

  useEffect(() => {
    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initialize, setSession]);

  return {
    user,
    isAuthenticated,
    isLoading,
    loginUser,
    registerUser,
    loginWithOAuth,
    logoutUser,
    resetPassword,
    userName: user?.email?.split("@")[0] || "User"
  };
}
