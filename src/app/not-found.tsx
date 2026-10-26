import Link from "next/link";

/** Shown for unknown URLs and whenever a page calls notFound(). */
export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="text-2xl tracking-tight">Not found</h1>
      <p className="mt-2 text-sm text-muted">The page or student you are looking for does not exist.</p>
      <Link href="/students" className="link mt-5 inline-block text-sm">
        Back to students
      </Link>
    </div>
  );
}
