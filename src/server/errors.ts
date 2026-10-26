/**
 * Application errors.
 *
 * Services throw `AppError` with a stable `code`; the HTTP layer turns it into a
 * JSON response. Database-specific errors are translated here, so nothing above
 * the service layer needs to know about Prisma error codes.
 */
import type { StudentField } from "@/lib/validation";

export type ErrorCode = "VALIDATION_FAILED" | "NOT_FOUND" | "CONFLICT" | "INTERNAL";

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  VALIDATION_FAILED: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL: 500,
};

/** Field name -> messages, shown next to the matching form input. */
export type FieldErrors = Partial<Record<StudentField, string[]>>;

export class AppError extends Error {
  readonly status: number;

  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly fieldErrors?: FieldErrors,
  ) {
    super(message);
    this.name = "AppError";
    this.status = STATUS_BY_CODE[code];
  }
}

/** The parts of a Prisma "known request error" we rely on (duck-typed, so it is testable without a DB). */
interface PrismaErrorLike {
  code: string;
  meta?: Record<string, unknown>;
}

function isPrismaError(err: unknown): err is PrismaErrorLike {
  if (typeof err !== "object" || err === null) return false;
  const code = (err as { code?: unknown }).code;
  return typeof code === "string" && /^P\d{4}$/.test(code);
}

/**
 * Translate a Prisma error into an AppError, or return null if it is not one we expect.
 * Prisma error codes: https://www.prisma.io/docs/orm/reference/error-reference
 */
export function fromPrismaError(err: unknown): AppError | null {
  if (!isPrismaError(err)) return null;
  const meta = JSON.stringify(err.meta ?? {});

  switch (err.code) {
    // Unique constraint violated
    case "P2002":
      if (meta.includes("email")) {
        return new AppError("CONFLICT", "A student with this email already exists.", {
          email: ["This email is already registered"],
        });
      }
      if (meta.includes("roll")) {
        return new AppError("CONFLICT", "A student with this roll number already exists.", {
          rollNumber: ["This roll number is already taken"],
        });
      }
      return new AppError("CONFLICT", "This record already exists.");

    // Foreign key constraint violated (e.g. departmentId that does not exist)
    case "P2003":
      return new AppError("VALIDATION_FAILED", "The selected department does not exist.", {
        departmentId: ["Select a valid department"],
      });

    // Record to update/delete not found
    case "P2025":
      return new AppError("NOT_FOUND", "Student not found.");

    default:
      return null;
  }
}

/** Use in a `catch` block: rethrow as an AppError when we recognise it, otherwise unchanged. */
export function rethrowDbError(err: unknown): never {
  throw fromPrismaError(err) ?? err;
}
