import { createServerClient } from "../supabase";
import { Employee } from "../types";
import type { EmployeeWithRelations, EmployeeSuggestionRow, AgencySuggestionRow } from "../database.types";
import { EMPLOYEE_SELECT, mapEmployee, sanitizeForLike } from "./utils";

/**
 * Search employees by name with optional filters.
 */
export async function searchEmployees(
  query: string,
  filters: { agency?: string | null; state?: string | null },
  page = 1,
  pageSize = 20
): Promise<{ employees: Employee[]; total: number }> {
  const supabase = createServerClient();
  const offset = (page - 1) * pageSize;

  let q = supabase
    .from("employees")
    .select(EMPLOYEE_SELECT, { count: "exact" });

  if (query.trim()) {
    q = q.textSearch("fts", query, { type: "websearch" });
  }

  if (filters.agency) {
    const { data: agency } = await supabase
      .from("agencies")
      .select("id")
      .eq("slug", filters.agency)
      .single();
    if (agency) q = q.eq("agency_id", agency.id);
  }

  if (filters.state) {
    const { data: state } = await supabase
      .from("states")
      .select("id")
      .eq("slug", filters.state)
      .single();
    if (state) q = q.eq("state_id", state.id);
  }

  const { data, error, count } = await q
    .order("total_compensation", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) throw error;
  return {
    employees: (data ?? []).map((r) => mapEmployee(r as unknown as EmployeeWithRelations)),
    total: count ?? 0,
  };
}

/**
 * Get autocomplete suggestions for search.
 */
export async function getSuggestions(
  prefix: string
): Promise<{
  employees: { name: string; slug: string; agency: string }[];
  agencies: { name: string; slug: string }[];
}> {
  const supabase = createServerClient();
  const term = prefix.trim();
  if (term.length < 2) return { employees: [], agencies: [] };

  const sanitized = sanitizeForLike(term);

  const [empResult, agencyResult] = await Promise.all([
    supabase
      .from("employees")
      .select("slug, first_name, last_name, agencies(name)")
      .or(`first_name.ilike.${sanitized}%,last_name.ilike.${sanitized}%`)
      .order("total_compensation", { ascending: false })
      .limit(5),
    supabase
      .from("agencies")
      .select("slug, name, abbreviation")
      .or(`name.ilike.%${sanitized}%,abbreviation.ilike.%${sanitized}%`)
      .order("employee_count", { ascending: false })
      .limit(3),
  ]);

  return {
    employees: (empResult.data ?? []).map((e) => {
      const emp = e as unknown as EmployeeSuggestionRow;
      return {
        name: `${emp.first_name} ${emp.last_name}`,
        slug: emp.slug,
        agency: emp.agencies?.name ?? "",
      };
    }),
    agencies: (agencyResult.data ?? []).map((a) => {
      const agency = a as unknown as AgencySuggestionRow;
      return {
        name: agency.name,
        slug: agency.slug,
      };
    }),
  };
}
