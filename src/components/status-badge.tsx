import { STATUS_LABELS, type StudentStatus } from "@/lib/student-status";

const DOT: Record<StudentStatus, string> = {
  ACTIVE: "bg-brand-500",
  INACTIVE: "bg-line-strong",
  GRADUATED: "bg-amber-600",
};

/** A small coloured dot and a plain label. */
export function StatusBadge({ status }: { status: StudentStatus }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <span aria-hidden className={`size-1.5 rounded-full ${DOT[status]}`} />
      {STATUS_LABELS[status]}
    </span>
  );
}
