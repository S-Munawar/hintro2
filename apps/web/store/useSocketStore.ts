"use client";

import { create } from "zustand";
import { io, type Socket } from "socket.io-client";

interface SocketState {
  socket: Socket | null;
  connected: boolean;

  /** Connect to the API websocket with a Supabase JWT */
  connect: (token: string) => void;

  /** Disconnect the socket */
  disconnect: () => void;

  /** Join a board room to receive real-time events */
  joinBoard: (boardId: string) => void;

  /** Leave a board room */
  leaveBoard: (boardId: string) => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  connected: false,

  connect: (token) => {
    const existing = get().socket;
    if (existing?.connected) return; // already connected

    // Clean up previous disconnected socket
    existing?.removeAllListeners();
    existing?.disconnect();

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    const socket = io(apiUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });

    socket.on("connect", () => {
      set({ connected: true });
    });

    socket.on("disconnect", () => {
      set({ connected: false });
    });

    socket.on("connect_error", (err) => {
      console.error("[socket] connect error:", err.message);
      set({ connected: false });
    });

    set({ socket, connected: false });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      set({ socket: null, connected: false });
    }
  },

  joinBoard: (boardId) => {
    get().socket?.emit("join-board", boardId);
  },

  leaveBoard: (boardId) => {
    get().socket?.emit("leave-board", boardId);
  },
}));
