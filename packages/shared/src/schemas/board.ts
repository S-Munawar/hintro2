import { z } from "zod";
import { uuidSchema, timestampSchema } from "./common.js";
import { BoardRoleEnum } from "./enums.js";

// ─── Board ───────────────────────────────────────────────────────────
// Mirrors the "boards" table.

export const BoardSchema = z.object({
  id: uuidSchema,
  owner_id: uuidSchema,
  name: z.string().min(1).max(255),
  description: z.string().nullable(),
  color: z.string().max(7).regex(/^#[0-9a-fA-F]{6}$/),
  is_archived: z.boolean(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
});

export type Board = z.infer<typeof BoardSchema>;

// ─── Board Member ────────────────────────────────────────────────────
// Mirrors the "board_members" table. Unique on (board_id, user_id).

export const BoardMemberSchema = z.object({
  id: uuidSchema,
  board_id: uuidSchema,
  user_id: uuidSchema,
  role: BoardRoleEnum,
  joined_at: timestampSchema,
});

export type BoardMember = z.infer<typeof BoardMemberSchema>;
