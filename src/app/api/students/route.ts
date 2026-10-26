/**
 *   GET  /api/students   List students (supports ?search=&departmentId=&status=&page=&pageSize=)
 *   POST /api/students   Create a student
 */
import { NextResponse, type NextRequest } from "next/server";
import { studentInputSchema, studentListQuerySchema } from "@/lib/validation";
import { parseJsonBody, withErrorHandling } from "@/server/http";
import { createStudent, listStudents } from "@/server/services/student-service";

export const GET = withErrorHandling(async (req: NextRequest) => {
  const query = studentListQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams));
  return NextResponse.json(await listStudents(query));
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const input = await parseJsonBody(req, studentInputSchema);
  const student = await createStudent(input);
  return NextResponse.json(
    { student },
    { status: 201, headers: { Location: `/api/students/${student.id}` } },
  );
});
