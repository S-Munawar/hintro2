import { z } from "zod";
import { uuidSchema, timestampSchema } from "./common.js";

// ─── Profile ─────────────────────────────────────────────────────────
// Mirrors the "profiles" table. id references Supabase auth.users.id.

export const ProfileSchema = z.object({
  id: uuidSchema,
  email: z.string().email().max(255),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  avatar_url: z.string().url().nullable(),
  is_active: z.boolean(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
});

export type Profile = z.infer<typeof ProfileSchema>;
