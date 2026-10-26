/**
 * Input validation rules, written once with zod and shared by:
 *   - the API routes (server-side, authoritative), and
 *   - the student form (client-side, for instant feedback).
 * zod also derives the TypeScript types, so rules and types can never disagree.
 */
import { z } from "zod";
import { STUDENT_STATUSES } from "@/lib/student-status";

/** Form fields arrive as strings; treat "" (or a missing field) as "no value". */
const emptyToNull = (value: unknown) =>
  value === undefined || (typeof value === "string" && value.trim() === "") ? null : value;

const currentYear = () => new Date().getFullYear();

const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the format YYYY-MM-DD")
  .refine((v) => !Number.isNaN(Date.parse(v)), "Not a valid date");

export const studentInputSchema = z.object({
  rollNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9-]{3,20}$/, "3–20 characters: letters, digits or hyphens"),
  firstName: z.string().trim().min(1, "First name is required").max(50, "At most 50 characters"),
  lastName: z.string().trim().min(1, "Last name is required").max(50, "At most 50 characters"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(254),
  phone: z.preprocess(
    emptyToNull,
    z
      .string()
      .trim()
      .regex(/^\+?[0-9][0-9 -]{6,18}$/, "Digits, spaces or hyphens, optionally starting with +")
      .nullable(),
  ),
  dateOfBirth: z.preprocess(
    emptyToNull,
    dateOnly
      .refine((v) => v >= "1900-01-01", "Date of birth looks too early")
      .refine((v) => new Date(`${v}T00:00:00Z`) < new Date(), "Date of birth must be in the past")
      .nullable(),
  ),
  admissionYear: z.coerce
    .number({ invalid_type_error: "Enter a year" })
    .int("Enter a whole year")
    .min(1950, "Year must be 1950 or later")
    .refine((y) => y <= currentYear() + 1, "Year cannot be more than one year ahead"),
  departmentId: z.coerce
    .number({ invalid_type_error: "Select a department" })
    .int()
    .positive("Select a department"),
  status: z.enum(STUDENT_STATUSES, { errorMap: () => ({ message: "Select a status" }) }),
});

/** The cleaned, typed value after validation (e.g. email lower-cased, "" -> null). */
export type StudentInput = z.infer<typeof studentInputSchema>;

/** Field names of the student form, used to show errors next to each input. */
export type StudentField = keyof StudentInput;

/**
 * Query-string options for listing students.
 * `.catch()` makes a bad value fall back to the default instead of failing the
 * whole request, e.g. `?page=abc` simply shows page 1.
 */
export const studentListQuerySchema = z.object({
  search: z.preprocess(emptyToNull, z.string().trim().max(100).nullable()).catch(null),
  departmentId: z.preprocess(emptyToNull, z.coerce.number().int().positive().nullable()).catch(null),
  status: z.preprocess(emptyToNull, z.enum(STUDENT_STATUSES).nullable()).catch(null),
  page: z.coerce.number().int().min(1).catch(1),
  pageSize: z.coerce.number().int().min(1).max(100).catch(10),
});

export type StudentListQuery = z.infer<typeof studentListQuerySchema>;

export const uuidSchema = z.string().uuid();
