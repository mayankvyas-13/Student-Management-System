import Link from "next/link";
import { DeleteStudentButton } from "@/components/delete-student-button";
import { Notice } from "@/components/notice";
import { Pagination } from "@/components/pagination";
import { StatusBadge } from "@/components/status-badge";
import { StudentFilters } from "@/components/student-filters";
import { studentListQuerySchema } from "@/lib/validation";
import { listDepartments } from "@/server/services/department-service";
import { listStudents } from "@/server/services/student-service";

// Always render on request: the list must reflect the current database.
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** GET /students - the list page (server component: runs on the server, queries the DB directly). */
export default async function StudentsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = studentListQuerySchema.parse(params);
  const [result, departments] = await Promise.all([listStudents(query), listDepartments()]);
  const isFiltered = Boolean(query.search || query.departmentId || query.status);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl tracking-tight">Students</h1>
        <p className="mt-1 text-sm text-muted">
          {result.total} {result.total === 1 ? "student" : "students"}
          {isFiltered && " matching your filters"}
        </p>
      </div>

      <Notice code={typeof params.notice === "string" ? params.notice : undefined} />

      <StudentFilters query={query} departments={departments} />

      <div>
        {result.items.length === 0 ? (
          <div className="border-y border-line py-14 text-center text-sm text-muted">
            {isFiltered ? (
              <>
                No students match these filters.{" "}
                <Link href="/students" className="link">Clear filters</Link>
              </>
            ) : (
              <>
                No students yet.{" "}
                <Link href="/students/new" className="link">Add the first one</Link>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-line-strong text-left text-muted">
                <tr>
                  <th className="py-2.5 pr-4 font-normal">Roll no.</th>
                  <th className="py-2.5 pr-4 font-normal">Name</th>
                  <th className="py-2.5 pr-4 font-normal">Department</th>
                  <th className="py-2.5 pr-4 font-normal">Admitted</th>
                  <th className="py-2.5 pr-4 font-normal">Status</th>
                  <th className="py-2.5 text-right font-normal"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {result.items.map((s) => (
                  <tr key={s.id} className="hover:bg-brand-50/60">
                    <td className="py-3.5 pr-4 font-mono text-xs text-muted">{s.rollNumber}</td>
                    <td className="py-3.5 pr-4">
                      <div className="font-medium">{s.fullName}</div>
                      <div className="text-xs text-muted">{s.email}</div>
                    </td>
                    <td className="py-3.5 pr-4" title={s.department.name}>{s.department.code}</td>
                    <td className="py-3.5 pr-4 tabular-nums">{s.admissionYear}</td>
                    <td className="py-3.5 pr-4"><StatusBadge status={s.status} /></td>
                    <td className="py-3.5">
                      <div className="flex items-center justify-end gap-3">
                        <Link href={`/students/${s.id}/edit`} className="link">Edit</Link>
                        <DeleteStudentButton studentId={s.id} studentName={s.fullName} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={result.page} totalPages={result.totalPages} params={params} />
    </div>
  );
}
