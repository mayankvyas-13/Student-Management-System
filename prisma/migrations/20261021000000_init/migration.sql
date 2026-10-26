-- Initial schema. Generated from prisma/schema.prisma, plus CHECK constraints
-- (marked below) that Prisma's schema language cannot express. They make the
-- database reject bad data even if it bypasses the application's validation.

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'GRADUATED');

-- CreateTable
CREATE TABLE "departments" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" UUID NOT NULL,
    "roll_number" VARCHAR(20) NOT NULL,
    "first_name" VARCHAR(50) NOT NULL,
    "last_name" VARCHAR(50) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "phone" VARCHAR(20),
    "date_of_birth" DATE,
    "admission_year" SMALLINT NOT NULL,
    "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
    "department_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "departments_code_key" ON "departments"("code");

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "students_roll_number_key" ON "students"("roll_number");

-- CreateIndex
CREATE UNIQUE INDEX "students_email_key" ON "students"("email");

-- CreateIndex
CREATE INDEX "students_department_id_idx" ON "students"("department_id");

-- CreateIndex
CREATE INDEX "students_status_idx" ON "students"("status");

-- CreateIndex
CREATE INDEX "students_last_name_first_name_idx" ON "students"("last_name", "first_name");

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- -----------------------------------------------------------------------------
-- Hand-written CHECK constraints (not representable in schema.prisma)
-- -----------------------------------------------------------------------------
ALTER TABLE "departments"
  ADD CONSTRAINT "departments_code_format" CHECK ("code" ~ '^[A-Z]{2,10}$');

ALTER TABLE "students"
  ADD CONSTRAINT "students_roll_number_format" CHECK ("roll_number" ~ '^[A-Z0-9-]{3,20}$'),
  ADD CONSTRAINT "students_names_not_blank"    CHECK (btrim("first_name") <> '' AND btrim("last_name") <> ''),
  ADD CONSTRAINT "students_email_lowercase"    CHECK ("email" = lower("email")),
  ADD CONSTRAINT "students_admission_year_range" CHECK ("admission_year" BETWEEN 1950 AND 2100),
  -- "Must be in the past" is checked by the app; a CHECK must not depend on the current date.
  ADD CONSTRAINT "students_dob_plausible"      CHECK ("date_of_birth" IS NULL OR "date_of_birth" >= DATE '1900-01-01');
