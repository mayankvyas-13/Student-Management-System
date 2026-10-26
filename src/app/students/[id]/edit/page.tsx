import Link from "next/link";
import { notFound } from "next/navigation";
import { StudentForm } from "@/components/student-form";
import { uuidSchema } from "@/lib/validation";
import { AppError } from "@/server/errors";
import { listDepartments } from "@/server/services/department-service";
import { getStudent } from "@/server/services/student-service";

export const dynamic = "force-dynamic";

/** GET /students/:id/edit - the "Edit student" page. */
export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!uuidSchema.safeParse(id).success) notFound();

  const [student, departments] = await Promise.all([
    getStudent(id).catch((err: unknown) => {
      if (err instanceof AppError && err.code === "NOT_FOUND") notFound(); // shows not-found.tsx
      throw err;
    }),
    listDepartments(),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <Link href="/students" className="link text-sm">← Students</Link>
        <h1 className="mt-3 text-3xl tracking-tight">Edit {student.fullName}</h1>
        <p className="mt-1 text-sm text-muted">Roll number {student.rollNumber}</p>
      </div>
      <StudentForm departments={departments} student={student} />
    </div>
  );
}
