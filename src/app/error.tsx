"use client";

/** Shown if a page throws an unexpected error (for example, the database is down). */
export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  const dbDown = error.message.includes("Can't reach database");
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="text-2xl tracking-tight">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted">
        {dbDown
          ? "The database is not reachable. Start it with `npm run db:up` and try again."
          : "An unexpected error occurred while loading this page."}
      </p>
      <button type="button" className="btn-primary mt-5" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
