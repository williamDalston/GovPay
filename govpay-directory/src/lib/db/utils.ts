import { Employee } from "../types";
import type { EmployeeWithRelations } from "../database.types";

/**
 * Sanitize user input for use in ILIKE patterns.
 * Escapes special PostgreSQL pattern characters: %, _, \
 * This prevents SQL injection via pattern matching.
 */
export function sanitizeForLike(input: string): string {
  return input
    .replace(/\\/g, "\\\\") // Escape backslashes first
    .replace(/%/g, "\\%")   // Escape percent signs
    .replace(/_/g, "\\_");  // Escape underscores
}

/**
 * Standard select clause for employee queries with relations.
 */
export const EMPLOYEE_SELECT =
  "id, slug, first_name, last_name, full_name, job_title, duty_station, pay_plan, grade, step, base_salary, total_compensation, fiscal_year, agencies(name, slug), states(name, slug), occupations(code, title)";

/**
 * Map a database employee row to the application Employee type.
 */
export function mapEmployee(row: EmployeeWithRelations): Employee {
  return {
    id: String(row.id),
    name: row.full_name ?? `${row.first_name} ${row.last_name}`,
    firstName: row.first_name,
    lastName: row.last_name,
    jobTitle: row.job_title ?? "",
    agency: row.agencies?.name ?? "",
    agencySlug: row.agencies?.slug ?? "",
    dutyStation: row.duty_station ?? "",
    state: row.states?.name ?? "",
    stateSlug: row.states?.slug ?? "",
    payPlan: row.pay_plan ?? "",
    grade: row.grade ?? "",
    step: row.step ?? "",
    baseSalary: row.base_salary ?? 0,
    totalCompensation: row.total_compensation ?? 0,
    occupationCode: row.occupations?.code ?? "",
    occupationTitle: row.occupations?.title ?? "",
    year: row.fiscal_year,
    slug: row.slug,
  };
}
