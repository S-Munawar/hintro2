import { Server as HttpServer } from "http";
import { Server, type Socket } from "socket.io";
import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

// ─── Event Types ─────────────────────────────────────────────────────

export interface ServerToClientEvents {
  "task:created": (data: { boardId: string; task: unknown }) => void;
  "task:updated": (data: { boardId: string; task: unknown }) => void;
  "task:deleted": (data: { boardId: string; taskId: string; listId: string }) => void;
  "task:moved": (data: { boardId: string; task: unknown }) => void;
  "board:updated": (data: { boardId: string; board: unknown }) => void;
  "list:created": (data: { boardId: string; list: unknown }) => void;
  "list:updated": (data: { boardId: string; list: unknown }) => void;
  "list:deleted": (data: { boardId: string; listId: string }) => void;
  "member:added": (data: { boardId: string; member: unknown }) => void;
  "member:removed": (data: { boardId: string; userId: string }) => void;
}

export interface ClientToServerEvents {
  "join-board": (boardId: string) => void;
  "leave-board": (boardId: string) => void;
}

// ─── Singleton IO Instance ───────────────────────────────────────────

let io: Server<ClientToServerEvents, ServerToClientEvents> | null = null;

export function getIO(): Server<ClientToServerEvents, ServerToClientEvents> {
  if (!io) throw new Error("Socket.IO not initialised — call initSocketIO first");
  return io;
}

// ─── Bootstrap ───────────────────────────────────────────────────────

export function initSocketIO(httpServer: HttpServer): Server<ClientToServerEvents, ServerToClientEvents> {
  io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  // ── Auth middleware — validate Supabase JWT on connection ──────────
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });

      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return next(new Error("Invalid or expired token"));
      }

      // Attach user data to socket for later use
      (socket as any).userId = user.id;
      (socket as any).userEmail = user.email;
      next();
    } catch {
      next(new Error("Authentication failed"));
    }
  });

  // ── Connection handler ────────────────────────────────────────────
  io.on("connection", (socket) => {
    const userId = (socket as any).userId as string;
    logger.info(`Socket connected: ${socket.id} (user: ${userId})`);

    // Join a board room
    socket.on("join-board", (boardId) => {
      socket.join(`board:${boardId}`);
      logger.debug(`User ${userId} joined room board:${boardId}`);
    });

    // Leave a board room
    socket.on("leave-board", (boardId) => {
      socket.leave(`board:${boardId}`);
      logger.debug(`User ${userId} left room board:${boardId}`);
    });

    socket.on("disconnect", (reason) => {
      logger.info(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  logger.info("Socket.IO initialised");
  return io;
}

// ─── Helpers — emit to a specific board room ─────────────────────────

export function emitToBoard(
  boardId: string,
  event: string,
  data: unknown,
): void {
  getIO().to(`board:${boardId}`).emit(event as any, data as any);
}
