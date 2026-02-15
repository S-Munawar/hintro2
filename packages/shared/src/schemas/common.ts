import { z } from "zod";

/** Reusable UUID v4 validator matching PostgreSQL UUID columns. */
export const uuidSchema = z.string().uuid();

/** Reusable ISO 8601 datetime string / Date coercion for timestamp columns. */
export const timestampSchema = z.coerce.date();

/** Reusable ISO 8601 date-only string / Date coercion for date columns. */
export const dateSchema = z.coerce.date();
