import { createServerClient } from "../supabase";
import { StateData } from "../types";
import type { EmployeeWithRelations } from "../database.types";
import { EMPLOYEE_SELECT, mapEmployee } from "./utils";

/**
 * Get a single state by slug with full details.
 */
export async function getStateBySlug(slug: string): Promise<StateData | null> {
  const supabase = createServerClient();

  const { data: state } = await supabase
    .from("states")
    .select("id, slug, name, abbreviation, employee_count, avg_salary")
    .eq("slug", slug)
    .single();

  if (!state) return null;

  const empCount = state.employee_count ?? 0;
  const mid = Math.floor(empCount / 2);

  const [agenciesResult, topEarnersResult, medianResult] = await Promise.all([
    supabase.rpc("get_state_agencies", { state_id_param: state.id }),
    supabase
      .from("employees")
      .select(EMPLOYEE_SELECT)
      .eq("state_id", state.id)
      .order("total_compensation", { ascending: false })
      .limit(10),
    empCount > 0
      ? supabase
          .from("employees")
          .select("total_compensation")
          .eq("state_id", state.id)
          .order("total_compensation")
          .range(mid, mid)
      : Promise.resolve({ data: null }),
  ]);

  const agencies = agenciesResult.data;
  const topEarnersData = topEarnersResult.data;
  const medianSalary = medianResult.data?.[0]?.total_compensation ?? 0;

  return {
    slug: state.slug,
    name: state.name,
    abbreviation: state.abbreviation,
    employeeCount: empCount,
    averageSalary: Number(state.avg_salary) || 0,
    medianSalary,
    agencies: (agencies ?? []).map((a: { name: string; slug: string; count: number }) => ({
      name: a.name,
      slug: a.slug,
      count: Number(a.count),
    })),
    topEarners: (topEarnersData ?? []).map((r) =>
      mapEmployee(r as unknown as EmployeeWithRelations)
    ),
  };
}
