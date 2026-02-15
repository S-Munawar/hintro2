import { z } from "zod";
import { uuidSchema, timestampSchema } from "./common.js";

// ─── List ────────────────────────────────────────────────────────────
// Mirrors the "lists" table.

export const ListSchema = z.object({
  id: uuidSchema,
  board_id: uuidSchema,
  name: z.string().min(1).max(255),
  position: z.number().int().nonnegative(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
});

export type List = z.infer<typeof ListSchema>;
