/**
 *   GET    /api/students/:id   Get one student
 *   PUT    /api/students/:id   Replace a student's details
 *   DELETE /api/students/:id   Delete a student
 */
import { NextResponse, type NextRequest } from "next/server";
import { studentInputSchema, uuidSchema } from "@/lib/validation";
import { AppError } from "@/server/errors";
import { parseJsonBody, withErrorHandling, type RouteContext } from "@/server/http";
import { deleteStudent, getStudent, updateStudent } from "@/server/services/student-service";

type Context = RouteContext<{ id: string }>;

/** A malformed id can never match a student, so answer 404 rather than querying the DB. */
async function studentIdFrom(ctx: Context): Promise<string> {
  const { id } = await ctx.params;
  if (!uuidSchema.safeParse(id).success) throw new AppError("NOT_FOUND", "Student not found.");
  return id;
}

export const GET = withErrorHandling(async (_req: NextRequest, ctx: Context) => {
  const student = await getStudent(await studentIdFrom(ctx));
  return NextResponse.json({ student });
});

export const PUT = withErrorHandling(async (req: NextRequest, ctx: Context) => {
  const id = await studentIdFrom(ctx);
  const input = await parseJsonBody(req, studentInputSchema);
  const student = await updateStudent(id, input);
  return NextResponse.json({ student });
});

export const DELETE = withErrorHandling(async (_req: NextRequest, ctx: Context) => {
  await deleteStudent(await studentIdFrom(ctx));
  return new NextResponse(null, { status: 204 });
});
