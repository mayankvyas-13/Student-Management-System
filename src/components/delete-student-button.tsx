"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiRequest } from "@/lib/api-client";

/**
 * Two-step delete: the first click asks for confirmation, the second deletes.
 * Runs in the browser ("use client") because it reacts to clicks.
 */
export function DeleteStudentButton({ studentId, studentName }: { studentId: string; studentName: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setBusy(true);
    setError(null);
    const result = await apiRequest<void>(`/api/students/${studentId}`, { method: "DELETE" });
    setBusy(false);

    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    setConfirming(false);
    router.refresh(); // re-run the server component so the list no longer shows this student
  }

  if (!confirming) {
    return (
      <button type="button" className="btn-danger btn-sm" onClick={() => setConfirming(true)}>
        Delete
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-danger">{error}</span>}
      <button
        type="button"
        className="btn-danger btn-sm font-semibold"
        disabled={busy}
        onClick={handleDelete}
        aria-label={`Confirm deleting ${studentName}`}
      >
        {busy ? "Deleting…" : "Confirm"}
      </button>
      <button
        type="button"
        className="btn btn-sm text-muted hover:text-ink"
        disabled={busy}
        onClick={() => setConfirming(false)}
      >
        Cancel
      </button>
    </div>
  );
}
