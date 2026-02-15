import { z } from "zod";
import { uuidSchema, timestampSchema, dateSchema } from "./common.js";
import { TaskPriorityEnum } from "./enums.js";

// ─── Task ────────────────────────────────────────────────────────────
// Mirrors the "tasks" table.

export const TaskSchema = z.object({
  id: uuidSchema,
  list_id: uuidSchema,
  title: z.string().min(1).max(255),
  description: z.string().nullable(),
  position: z.number().int().nonnegative(),
  priority: TaskPriorityEnum,
  due_date: dateSchema.nullable(),
  is_completed: z.boolean(),
  created_by: uuidSchema,
  created_at: timestampSchema,
  updated_at: timestampSchema,
});

export type Task = z.infer<typeof TaskSchema>;

// ─── Task Assignee ───────────────────────────────────────────────────
// Mirrors the "task_assignees" table. Unique on (task_id, user_id).

export const TaskAssigneeSchema = z.object({
  id: uuidSchema,
  task_id: uuidSchema,
  user_id: uuidSchema,
  assigned_at: timestampSchema,
});

export type TaskAssignee = z.infer<typeof TaskAssigneeSchema>;
