import Link from "next/link";
import { STATUS_LABELS, STUDENT_STATUSES } from "@/lib/student-status";
import type { StudentListQuery } from "@/lib/validation";
import type { DepartmentDto } from "@/server/services/department-service";

/**
 * Search and filter bar.
 * A plain HTML form with method="get": submitting it reloads /students with the
 * values in the URL (e.g. /students?search=asha&status=ACTIVE). No JavaScript
 * needed, and every filtered view has a shareable URL.
 */
export function StudentFilters({ query, departments }: { query: StudentListQuery; departments: DepartmentDto[] }) {
  return (
    <form method="get" action="/students" className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end">
      <div>
        <label htmlFor="search" className="field-label">Search</label>
        <input
          id="search"
          name="search"
          type="search"
          className="input"
          placeholder="Name, email or roll number"
          defaultValue={query.search ?? ""}
        />
      </div>
      <div>
        <label htmlFor="departmentId" className="field-label">Department</label>
        <select id="departmentId" name="departmentId" className="input" defaultValue={query.departmentId ?? ""}>
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.code} – {d.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="status" className="field-label">Status</label>
        <select id="status" name="status" className="input" defaultValue={query.status ?? ""}>
          <option value="">All statuses</option>
          {STUDENT_STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" className="btn-primary">Apply</button>
        <Link href="/students" className="link text-sm">Clear</Link>
      </div>
    </form>
  );
}
