import { prisma } from "@/server/db";

export interface DepartmentDto {
  id: number;
  code: string;
  name: string;
}

/** All departments, alphabetically - used for dropdowns and filters. */
export async function listDepartments(): Promise<DepartmentDto[]> {
  return prisma.department.findMany({
    select: { id: true, code: true, name: true },
    orderBy: { name: "asc" },
  });
}
