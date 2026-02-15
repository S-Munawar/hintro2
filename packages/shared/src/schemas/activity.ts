import { z } from "zod";
import { uuidSchema, timestampSchema } from "./common.js";
import { ActionTypeEnum, EntityTypeEnum } from "./enums.js";

// ─── Activity Log ────────────────────────────────────────────────────
// Mirrors the "activity_logs" table.

export const ActivityLogSchema = z.object({
  id: uuidSchema,
  board_id: uuidSchema,
  task_id: uuidSchema.nullable(),
  user_id: uuidSchema,
  action_type: ActionTypeEnum,
  entity_type: EntityTypeEnum,
  changes: z.record(z.unknown()).nullable(),
  created_at: timestampSchema,
});

export type ActivityLog = z.infer<typeof ActivityLogSchema>;
