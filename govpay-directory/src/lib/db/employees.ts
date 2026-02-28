import { createServerClient } from "../supabase";
import { Employee } from "../types";
import type { EmployeeWithRelations } from "../database.types";
import { EMPLOYEE_SELECT, mapEmployee } from "./utils";

/**
 * Get a single employee by slug.
 */
export async function getEmployeeBySlug(slug: string): Promise<Employee | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("employees")
    .select(EMPLOYEE_SELECT)
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  // Supabase returns relations with different shapes depending on query type
  // Using unknown as intermediate to handle the type mismatch
  return mapEmployee(data as unknown as EmployeeWithRelations);
}

/**
 * Get employees for a specific agency with pagination.
 */
export async function getEmployeesByAgency(
  agencySlug: string,
  limit = 20,
  offset = 0
): Promise<{ employees: Employee[]; total: number }> {
  const supabase = createServerClient();

  const { data: agency } = await supabase
    .from("agencies")
    .select("id")
    .eq("slug", agencySlug)
    .single();

  if (!agency) return { employees: [], total: 0 };

  const { data, error, count } = await supabase
    .from("employees")
    .select(EMPLOYEE_SELECT, { count: "exact" })
    .eq("agency_id", agency.id)
    .order("total_compensation", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return {
    employees: (data ?? []).map((r) => mapEmployee(r as unknown as EmployeeWithRelations)),
    total: count ?? 0,
  };
}

/**
 * Get employees for a specific state with pagination.
 */
export async function getEmployeesByState(
  stateSlug: string,
  limit = 20,
  offset = 0
): Promise<{ employees: Employee[]; total: number }> {
  const supabase = createServerClient();

  const { data: state } = await supabase
    .from("states")
    .select("id")
    .eq("slug", stateSlug)
    .single();

  if (!state) return { employees: [], total: 0 };

  const { data, error, count } = await supabase
    .from("employees")
    .select(EMPLOYEE_SELECT, { count: "exact" })
    .eq("state_id", state.id)
    .order("total_compensation", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return {
    employees: (data ?? []).map((r) => mapEmployee(r as unknown as EmployeeWithRelations)),
    total: count ?? 0,
  };
}

/**
 * Get employees for a specific GS grade.
 */
export async function getEmployeesByGrade(grade: string, limit = 12): Promise<Employee[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("employees")
    .select(EMPLOYEE_SELECT)
    .eq("pay_plan", "GS")
    .eq("grade", grade)
    .order("total_compensation", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map((r) => mapEmployee(r as unknown as EmployeeWithRelations));
}

/**
 * Get top earners across all employees.
 */
export async function getTopEarners(limit = 10): Promise<Employee[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("employees")
    .select(EMPLOYEE_SELECT)
    .order("total_compensation", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map((r) => mapEmployee(r as unknown as EmployeeWithRelations));
}

/**
 * Get total count of employees with valid data (for sitemap).
 */
export async function getEmployeeCount(): Promise<number> {
  const supabase = createServerClient();
  const { count } = await supabase
    .from("employees")
    .select("id", { count: "exact", head: true })
    .not("job_title", "is", null)
    .not("duty_station", "is", null)
    .gt("total_compensation", 0);
  return count ?? 0;
}

/**
 * Get employee slugs for sitemap generation with pagination.
 */
export async function getEmployeeSlugs(offset: number, limit: number): Promise<string[]> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("employees")
    .select("slug")
    .not("job_title", "is", null)
    .not("duty_station", "is", null)
    .gt("total_compensation", 0)
    .order("id")
    .range(offset, offset + limit - 1);
  return (data ?? []).map((r: { slug: string }) => r.slug);
}
