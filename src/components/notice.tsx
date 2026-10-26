const MESSAGES: Record<string, string> = {
  created: "Student added.",
  updated: "Student updated.",
  deleted: "Student deleted.",
};

/**
 * Confirmation line after a save or delete.
 * The form adds ?notice=created (etc.) to the URL when it redirects back to the list.
 */
export function Notice({ code }: { code: string | undefined }) {
  const message = code ? MESSAGES[code] : undefined;
  if (!message) return null;
  return (
    <div role="status" className="border-l-2 border-brand-500 bg-brand-50 px-4 py-2.5 text-sm text-brand-700">
      {message}
    </div>
  );
}
