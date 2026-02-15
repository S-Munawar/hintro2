"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useSocketStore } from "@/store/useSocketStore";

/**
 * Auto-connects / disconnects the WebSocket based on auth state.
 * Place this once in AuthenticatedLayout or a global provider.
 */
export function useSocket() {
  const session = useAuthStore((s) => s.session);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { connect, disconnect, connected } = useSocketStore();

  useEffect(() => {
    if (isAuthenticated && session?.access_token) {
      connect(session.access_token);
    } else {
      disconnect();
    }

    return () => {
      // Don't disconnect on unmount — the socket is app-wide.
      // Only disconnect when auth state changes (handled above).
    };
  }, [isAuthenticated, session?.access_token, connect, disconnect]);

  return { connected };
}
