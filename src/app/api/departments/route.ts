/**
 *   GET /api/departments   List all departments (for dropdowns)
 */
import { NextResponse } from "next/server";
import { withErrorHandling } from "@/server/http";
import { listDepartments } from "@/server/services/department-service";

export const GET = withErrorHandling(async () => {
  return NextResponse.json({ departments: await listDepartments() });
});
