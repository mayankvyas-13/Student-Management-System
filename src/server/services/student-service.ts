/**
 * Student business logic: the only place that reads or writes the `students` table.
 *
 * Layering:  API route / page  ->  service (this file)  ->  Prisma  ->  PostgreSQL
 * Routes never call Prisma directly, and callers never see Prisma errors or row
 * objects: inputs are validated `StudentInput`s, outputs are plain `StudentDto`s.
 */
import type { Department, Prisma, Student } from "@prisma/client";
import type { StudentStatus } from "@/lib/student-status";
import type { StudentInput, StudentListQuery } from "@/lib/validation";
import { prisma } from "@/server/db";
import { AppError, rethrowDbError } from "@/server/errors";
import type { DepartmentDto } from "@/server/services/department-service";

/** What the API returns for a student (dates as strings so it serialises cleanly to JSON). */
export interface StudentDto {
  id: string;
  rollNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string | null;
  dateOfBirth: string | null; // "YYYY-MM-DD"
  admissionYear: number;
  status: StudentStatus;
  department: DepartmentDto;
  createdAt: string; // ISO 8601
  updatedAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

type StudentWithDepartment = Student & { department: Department };

function toDto(s: StudentWithDepartment): StudentDto {
  return {
    id: s.id,
    rollNumber: s.rollNumber,
    firstName: s.firstName,
    lastName: s.lastName,
    fullName: `${s.firstName} ${s.lastName}`,
    email: s.email,
    phone: s.phone,
    dateOfBirth: s.dateOfBirth ? s.dateOfBirth.toISOString().slice(0, 10) : null,
    admissionYear: s.admissionYear,
    status: s.status,
    department: { id: s.department.id, code: s.department.code, name: s.department.name },
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

/** Maps validated input to the columns Prisma expects. */
function toData(input: StudentInput) {
  return {
    rollNumber: input.rollNumber,
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    // A DATE column: store midnight UTC so the day never shifts with time zones.
    dateOfBirth: input.dateOfBirth ? new Date(`${input.dateOfBirth}T00:00:00.000Z`) : null,
    admissionYear: input.admissionYear,
    status: input.status,
    departmentId: input.departmentId,
  } satisfies Prisma.StudentUncheckedCreateInput;
}

function buildWhere(query: StudentListQuery): Prisma.StudentWhereInput {
  const where: Prisma.StudentWhereInput = {};
  if (query.search) {
    // Every word must match at least one field, so "Mayank Vyas" finds first name + last name.
    where.AND = query.search.split(/\s+/).map((word) => {
      const contains = { contains: word, mode: "insensitive" } as const;
      return {
        OR: [
          { firstName: contains },
          { lastName: contains },
          { email: contains },
          { rollNumber: contains },
        ],
      };
    });
  }
  if (query.departmentId) where.departmentId = query.departmentId;
  if (query.status) where.status = query.status;
  return where;
}

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

export async function listStudents(query: StudentListQuery): Promise<Paginated<StudentDto>> {
  const where = buildWhere(query);
  const total = await prisma.student.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / query.pageSize));
  // If the page is past the end (e.g. the last row on it was just deleted), show the last page.
  const page = Math.min(query.page, totalPages);

  const rows = await prisma.student.findMany({
    where,
    include: { department: true },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }, { id: "asc" }],
    skip: (page - 1) * query.pageSize,
    take: query.pageSize,
  });

  return { items: rows.map(toDto), total, page, pageSize: query.pageSize, totalPages };
}

// ---------------------------------------------------------------------------
// Read one
// ---------------------------------------------------------------------------

export async function getStudent(id: string): Promise<StudentDto> {
  const student = await prisma.student.findUnique({ where: { id }, include: { department: true } });
  if (!student) throw new AppError("NOT_FOUND", "Student not found.");
  return toDto(student);
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export async function createStudent(input: StudentInput): Promise<StudentDto> {
  try {
    const student = await prisma.student.create({ data: toData(input), include: { department: true } });
    return toDto(student);
  } catch (err) {
    rethrowDbError(err); // duplicate email/roll number -> 409, unknown department -> 400
  }
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export async function updateStudent(id: string, input: StudentInput): Promise<StudentDto> {
  try {
    const student = await prisma.student.update({
      where: { id },
      data: toData(input),
      include: { department: true },
    });
    return toDto(student);
  } catch (err) {
    rethrowDbError(err); // missing student -> 404, plus the same cases as create
  }
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export async function deleteStudent(id: string): Promise<void> {
  try {
    await prisma.student.delete({ where: { id } });
  } catch (err) {
    rethrowDbError(err); // missing student -> 404
  }
}
