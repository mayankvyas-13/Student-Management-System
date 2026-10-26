"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { apiRequest } from "@/lib/api-client";
import { STATUS_LABELS, STUDENT_STATUSES } from "@/lib/student-status";
import { studentInputSchema, type StudentField } from "@/lib/validation";
import type { DepartmentDto } from "@/server/services/department-service";
import type { StudentDto } from "@/server/services/student-service";

/** Every input is held as a string while the user types; the schema converts on submit. */
type FormValues = Record<StudentField, string>;
type FieldErrors = Partial<Record<StudentField, string>>;

interface Props {
  departments: DepartmentDto[];
  /** Pass an existing student to edit it; omit to create a new one. */
  student?: StudentDto;
}

function initialValues(student?: StudentDto): FormValues {
  return {
    rollNumber: student?.rollNumber ?? "",
    firstName: student?.firstName ?? "",
    lastName: student?.lastName ?? "",
    email: student?.email ?? "",
    phone: student?.phone ?? "",
    dateOfBirth: student?.dateOfBirth ?? "",
    admissionYear: String(student?.admissionYear ?? new Date().getFullYear()),
    departmentId: student ? String(student.department.id) : "",
    status: student?.status ?? "ACTIVE",
  };
}

/** Keep the first message per field, which is all the form displays. */
function firstMessages(errors: Record<string, string[] | undefined>): FieldErrors {
  const out: FieldErrors = {};
  for (const [field, messages] of Object.entries(errors)) {
    if (messages?.[0]) out[field as StudentField] = messages[0];
  }
  return out;
}

/** One form for both "Add student" and "Edit student". */
export function StudentForm({ departments, student }: Props) {
  const router = useRouter();
  const isEdit = student !== undefined;
  const [values, setValues] = useState<FormValues>(() => initialValues(student));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function update(field: StudentField, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined })); // clear the error as the user fixes it
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    // 1. Validate in the browser with the same schema the server uses: instant feedback.
    const parsed = studentInputSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(firstMessages(parsed.error.flatten().fieldErrors));
      return;
    }

    // 2. Send to the API. The server validates again; it is the real gatekeeper.
    setSaving(true);
    const result = isEdit
      ? await apiRequest(`/api/students/${student.id}`, { method: "PUT", body: parsed.data })
      : await apiRequest("/api/students", { method: "POST", body: parsed.data });
    setSaving(false);

    if (!result.ok) {
      // e.g. "This email is already registered" (409) shown under the email field
      setErrors(firstMessages(result.error.fieldErrors ?? {}));
      setFormError(result.error.message);
      return;
    }

    // 3. Back to the list with a confirmation banner.
    router.push(`/students?notice=${isEdit ? "updated" : "created"}`);
    router.refresh();
  }

  /** Shared props for an <input>: value, change handler and accessible error state. */
  const inputProps = (field: StudentField) => ({
    id: field,
    name: field,
    value: values[field],
    onChange: (e: { target: { value: string } }) => update(field, e.target.value),
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? `${field}-error` : undefined,
    className: "input",
  });

  const errorText = (field: StudentField) =>
    errors[field] ? (
      <p id={`${field}-error`} className="mt-1 text-xs text-danger">{errors[field]}</p>
    ) : null;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-10">
      {formError && (
        <div role="alert" className="border-l-2 border-danger bg-red-50 px-4 py-2.5 text-sm text-danger">
          {formError}
        </div>
      )}

      <fieldset className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
        <legend className="mb-4 w-full border-b border-line pb-2 font-serif text-lg">Personal details</legend>
        <div>
          <label htmlFor="firstName" className="field-label">First name *</label>
          <input {...inputProps("firstName")} autoComplete="given-name" maxLength={50} />
          {errorText("firstName")}
        </div>
        <div>
          <label htmlFor="lastName" className="field-label">Last name *</label>
          <input {...inputProps("lastName")} autoComplete="family-name" maxLength={50} />
          {errorText("lastName")}
        </div>
        <div>
          <label htmlFor="email" className="field-label">Email *</label>
          <input {...inputProps("email")} type="email" autoComplete="email" placeholder="name@example.edu" />
          {errorText("email")}
        </div>
        <div>
          <label htmlFor="phone" className="field-label">Phone</label>
          <input {...inputProps("phone")} type="tel" autoComplete="tel" placeholder="+91 98765 43210" />
          {errorText("phone")}
        </div>
        <div>
          <label htmlFor="dateOfBirth" className="field-label">Date of birth</label>
          <input {...inputProps("dateOfBirth")} type="date" max={new Date().toISOString().slice(0, 10)} />
          {errorText("dateOfBirth")}
        </div>
      </fieldset>

      <fieldset className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
        <legend className="mb-4 w-full border-b border-line pb-2 font-serif text-lg">Academic details</legend>
        <div>
          <label htmlFor="rollNumber" className="field-label">Roll number *</label>
          <input {...inputProps("rollNumber")} placeholder="2026CSE001" className="input uppercase" />
          {errorText("rollNumber")}
        </div>
        <div>
          <label htmlFor="departmentId" className="field-label">Department *</label>
          <select {...inputProps("departmentId")}>
            <option value="">Select a department…</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.code} – {d.name}</option>
            ))}
          </select>
          {errorText("departmentId")}
        </div>
        <div>
          <label htmlFor="admissionYear" className="field-label">Admission year *</label>
          <input {...inputProps("admissionYear")} type="number" inputMode="numeric" min={1950} />
          {errorText("admissionYear")}
        </div>
        <div>
          <label htmlFor="status" className="field-label">Status *</label>
          <select {...inputProps("status")}>
            {STUDENT_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          {errorText("status")}
        </div>
      </fieldset>

      <div className="flex items-center justify-end gap-4">
        <Link href="/students" className="link text-sm">Cancel</Link>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Saving…" : isEdit ? "Save changes" : "Add student"}
        </button>
      </div>
    </form>
  );
}
