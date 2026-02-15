import { z } from "zod";

// ─── Database Enums ──────────────────────────────────────────────────
// Mirror PostgreSQL enums exactly as defined in the Prisma schema.

export const TaskPriorityEnum = z.enum(["low", "medium", "high"]);
export type TaskPriority = z.infer<typeof TaskPriorityEnum>;

export const BoardRoleEnum = z.enum(["admin", "editor", "viewer"]);
export type BoardRole = z.infer<typeof BoardRoleEnum>;

export const ActionTypeEnum = z.enum(["create", "update", "delete", "move"]);
export type ActionType = z.infer<typeof ActionTypeEnum>;

export const EntityTypeEnum = z.enum(["board", "list", "task", "comment"]);
export type EntityType = z.infer<typeof EntityTypeEnum>;
