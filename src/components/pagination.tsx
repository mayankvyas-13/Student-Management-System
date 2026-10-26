import Link from "next/link";

type Params = Record<string, string | string[] | undefined>;

/** Builds a /students URL for `page`, keeping the current search and filters. */
function pageHref(params: Params, page: number): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string" && value !== "" && key !== "page" && key !== "notice") qs.set(key, value);
  }
  if (page > 1) qs.set("page", String(page));
  const s = qs.toString();
  return s ? `/students?${s}` : "/students";
}

/** "Previous / Page 2 of 5 / Next" links. Renders nothing when everything fits on one page. */
export function Pagination({ page, totalPages, params }: { page: number; totalPages: number; params: Params }) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between border-t border-line pt-4 text-sm">
      {page > 1 ? (
        <Link href={pageHref(params, page - 1)} className="link">← Previous</Link>
      ) : (
        <span className="text-muted/50">← Previous</span>
      )}
      <span className="text-muted">Page {page} of {totalPages}</span>
      {page < totalPages ? (
        <Link href={pageHref(params, page + 1)} className="link">Next →</Link>
      ) : (
        <span className="text-muted/50">Next →</span>
      )}
    </nav>
  );
}
