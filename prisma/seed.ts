/**
 * Demo data: 5 departments and 24 students (enough to show pagination at 10 per page).
 * Run with `npm run db:seed`. Safe to re-run: it replaces all students each time.
 */
import { PrismaClient, type StudentStatus } from "@prisma/client";

const prisma = new PrismaClient();

const departments = [
  { code: "CSE", name: "Computer Science and Engineering" },
  { code: "ECE", name: "Electronics and Communication Engineering" },
  { code: "ME", name: "Mechanical Engineering" },
  { code: "CE", name: "Civil Engineering" },
  { code: "BBA", name: "Business Administration" },
];

// [first name, last name, department code, admission year, status, date of birth, phone]
type Row = [string, string, string, number, StudentStatus, string | null, string | null];
const students: Row[] = [
  ["Aarav", "Sharma", "CSE", 2024, "ACTIVE", "2006-03-14", "+91 98765 43210"],
  ["Diya", "Patel", "CSE", 2024, "ACTIVE", "2006-11-02", null],
  ["Kabir", "Mehta", "CSE", 2023, "ACTIVE", "2005-07-21", "+91 91234 56780"],
  ["Ananya", "Iyer", "CSE", 2022, "ACTIVE", "2004-01-30", null],
  ["Rohan", "Gupta", "CSE", 2021, "GRADUATED", "2003-09-09", null],
  ["Meera", "Nair", "ECE", 2024, "ACTIVE", "2006-05-17", "+91 99887 76655"],
  ["Vihaan", "Rao", "ECE", 2023, "ACTIVE", "2005-02-11", null],
  ["Ishita", "Singh", "ECE", 2022, "INACTIVE", "2004-12-25", null],
  ["Arjun", "Reddy", "ECE", 2021, "GRADUATED", null, null],
  ["Saanvi", "Joshi", "ME", 2024, "ACTIVE", "2006-08-04", null],
  ["Aditya", "Kulkarni", "ME", 2023, "ACTIVE", "2005-04-19", "+91 90000 11122"],
  ["Riya", "Desai", "ME", 2022, "ACTIVE", "2004-06-08", null],
  ["Krishna", "Menon", "ME", 2020, "GRADUATED", "2002-10-15", null],
  ["Tara", "Banerjee", "CE", 2024, "ACTIVE", "2006-01-22", null],
  ["Yash", "Chauhan", "CE", 2023, "INACTIVE", "2005-03-03", null],
  ["Nisha", "Pillai", "CE", 2022, "ACTIVE", "2004-09-27", "+91 98123 45678"],
  ["Dev", "Malhotra", "CE", 2021, "GRADUATED", "2003-05-12", null],
  ["Kavya", "Agarwal", "BBA", 2024, "ACTIVE", "2006-07-07", null],
  ["Siddharth", "Bose", "BBA", 2024, "ACTIVE", null, null],
  ["Pooja", "Verma", "BBA", 2023, "ACTIVE", "2005-11-30", null],
  ["Harsh", "Trivedi", "BBA", 2022, "INACTIVE", "2004-02-14", null],
  ["Neha", "Kapoor", "CSE", 2025, "ACTIVE", "2007-04-01", null],
  ["Rahul", "Saxena", "ECE", 2025, "ACTIVE", "2007-08-18", null],
  ["Zoya", "Khan", "ME", 2025, "ACTIVE", "2007-06-26", "+91 97654 32109"],
];

async function main() {
  // Departments: upsert so re-running keeps the same ids.
  const deptIdByCode = new Map<string, number>();
  for (const d of departments) {
    const dept = await prisma.department.upsert({ where: { code: d.code }, update: { name: d.name }, create: d });
    deptIdByCode.set(d.code, dept.id);
  }

  await prisma.student.deleteMany();

  // Roll number pattern: <admission year><department code><3-digit sequence>, e.g. 2024CSE001
  const sequence = new Map<string, number>();
  const data = students.map(([firstName, lastName, deptCode, year, status, dob, phone]) => {
    const key = `${year}${deptCode}`;
    const next = (sequence.get(key) ?? 0) + 1;
    sequence.set(key, next);
    const departmentId = deptIdByCode.get(deptCode);
    if (departmentId === undefined) throw new Error(`Unknown department ${deptCode}`);
    return {
      rollNumber: `${key}${String(next).padStart(3, "0")}`,
      firstName,
      lastName,
      email: `${firstName}.${lastName}@example.edu`.toLowerCase(),
      phone,
      dateOfBirth: dob ? new Date(`${dob}T00:00:00.000Z`) : null,
      admissionYear: year,
      status,
      departmentId,
    };
  });

  await prisma.student.createMany({ data });
  console.log(`Seeded ${departments.length} departments and ${data.length} students.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
