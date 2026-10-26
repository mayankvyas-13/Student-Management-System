/**
 * Helpers shared by every API route: consistent JSON errors and body parsing.
 * Every error response has the same shape:
 *   { "error": { "code": "NOT_FOUND", "message": "...", "fieldErrors": { ... } } }
 */
import { NextResponse } from "next/server";
import { ZodError, type ZodType, type ZodTypeDef } from "zod";
import { AppError, type FieldErrors } from "@/server/errors";

export interface ErrorResponseBody {
  error: { code: string; message: string; fieldErrors?: FieldErrors };
}

export function errorResponse(err: unknown): NextResponse<ErrorResponseBody> {
  if (err instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_FAILED",
          message: "Please correct the highlighted fields.",
          fieldErrors: err.flatten().fieldErrors as FieldErrors,
        },
      },
      { status: 400 },
    );
  }
  if (err instanceof AppError) {
    return NextResponse.json(
      { error: { code: err.code, message: err.message, fieldErrors: err.fieldErrors } },
      { status: err.status },
    );
  }
  // Anything else is a bug or an outage: log the details, return a generic message.
  console.error("Unexpected API error:", err);
  return NextResponse.json(
    { error: { code: "INTERNAL", message: "Something went wrong. Please try again." } },
    { status: 500 },
  );
}

/**
 * Wraps a route handler so any thrown error becomes a proper JSON error response.
 * Lets each handler focus on the happy path (similar to @ControllerAdvice in Spring).
 */
export function withErrorHandling<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>,
): (...args: Args) => Promise<Response> {
  return async (...args: Args) => {
    try {
      return await handler(...args);
    } catch (err) {
      return errorResponse(err);
    }
  };
}

/** Reads the JSON body and validates it; throws ZodError (-> 400) if invalid. */
export async function parseJsonBody<T>(req: Request, schema: ZodType<T, ZodTypeDef, unknown>): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new AppError("VALIDATION_FAILED", "Request body must be valid JSON.");
  }
  return schema.parse(body);
}

/** Shape of the second argument Next.js passes to dynamic route handlers like /api/students/[id]. */
export interface RouteContext<Params extends Record<string, string>> {
  params: Promise<Params>;
}
