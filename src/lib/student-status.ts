/**
 * Student status values, mirrored from the `StudentStatus` enum in schema.prisma.
 *
 * Defined here (instead of importing from @prisma/client) so browser code can use
 * them without pulling the database client into the client-side bundle.
 */
export const STUDENT_STATUSES = ["ACTIVE", "INACTIVE", "GRADUATED"] as const;

export type StudentStatus = (typeof STUDENT_STATUSES)[number];

export const STATUS_LABELS: Record<StudentStatus, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  GRADUATED: "Graduated",
};
