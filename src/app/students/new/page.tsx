import Link from "next/link";
import { StudentForm } from "@/components/student-form";
import { listDepartments } from "@/server/services/department-service";

// Render on each request (the department list comes from the database).
export const dynamic = "force-dynamic";

/** GET /students/new - the "Add student" page. */
export default async function NewStudentPage() {
  const departments = await listDepartments();
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <Link href="/students" className="link text-sm">← Students</Link>
        <h1 className="mt-3 text-3xl tracking-tight">Add student</h1>
      </div>
      <StudentForm departments={departments} />
    </div>
  );
}
