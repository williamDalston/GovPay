import { createServerClient } from "../supabase";
import { Agency } from "../types";
import { sanitizeForLike } from "./utils";

/**
 * Get agencies with pagination.
 */
export async function getAgencies(options?: {
  limit?: number;
  offset?: number;
}): Promise<{ agencies: Agency[]; total: number }> {
  const supabase = createServerClient();
  const { limit = 50, offset = 0 } = options ?? {};

  const { data: agencies, error, count } = await supabase
    .from("agencies")
    .select("id, slug, name, abbreviation, employee_count, avg_salary, median_salary", { count: "exact" })
    .order("employee_count", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  if (!agencies) return { agencies: [], total: 0 };

  return {
    agencies: agencies.map((a) => ({
      slug: a.slug,
      name: a.name,
      abbreviation: a.abbreviation ?? undefined,
      employeeCount: a.employee_count ?? 0,
      averageSalary: Number(a.avg_salary) || 0,
      medianSalary: Number(a.median_salary) || 0,
      highestSalary: 0,
      lowestSalary: 0,
      topOccupations: [],
      stateBreakdown: [],
    })),
    total: count ?? 0,
  };
}

/**
 * Get all agencies without pagination.
 */
export async function getAllAgencies(): Promise<Agency[]> {
  const supabase = createServerClient();

  const { data: agencies, error } = await supabase
    .from("agencies")
    .select("id, slug, name, abbreviation, employee_count, avg_salary, median_salary")
    .order("employee_count", { ascending: false });

  if (error) throw error;
  if (!agencies) return [];

  return agencies.map((a) => ({
    slug: a.slug,
    name: a.name,
    abbreviation: a.abbreviation ?? undefined,
    employeeCount: a.employee_count ?? 0,
    averageSalary: Number(a.avg_salary) || 0,
    medianSalary: Number(a.median_salary) || 0,
    highestSalary: 0,
    lowestSalary: 0,
    topOccupations: [],
    stateBreakdown: [],
  }));
}

/**
 * Get a single agency by slug with full details.
 */
export async function getAgencyBySlug(slug: string): Promise<Agency | null> {
  const supabase = createServerClient();

  const { data: agency, error } = await supabase
    .from("agencies")
    .select("id, slug, name, abbreviation, employee_count, avg_salary, median_salary")
    .eq("slug", slug)
    .single();

  if (error || !agency) return null;

  const [occupationsResult, stateBreakdownResult, salaryMaxResult, salaryMinResult] =
    await Promise.all([
      supabase.rpc("get_agency_top_occupations", { agency_id_param: agency.id }),
      supabase.rpc("get_agency_state_breakdown", { agency_id_param: agency.id }),
      supabase
        .from("employees")
        .select("total_compensation")
        .eq("agency_id", agency.id)
        .order("total_compensation", { ascending: false })
        .limit(1),
      supabase
        .from("employees")
        .select("total_compensation")
        .eq("agency_id", agency.id)
        .order("total_compensation", { ascending: true })
        .limit(1),
    ]);

  const occupations = occupationsResult.data;
  const stateBreakdown = stateBreakdownResult.data;
  const salaryRange = salaryMaxResult.data;
  const salaryMin = salaryMinResult.data;

  return {
    slug: agency.slug,
    name: agency.name,
    abbreviation: agency.abbreviation ?? undefined,
    employeeCount: agency.employee_count ?? 0,
    averageSalary: Number(agency.avg_salary) || 0,
    medianSalary: Number(agency.median_salary) || 0,
    highestSalary: salaryRange?.[0]?.total_compensation ?? 0,
    lowestSalary: salaryMin?.[0]?.total_compensation ?? 0,
    topOccupations: (occupations ?? []).map((o: { title: string; count: number; avg_salary: number }) => ({
      title: o.title,
      count: Number(o.count),
      avgSalary: Number(o.avg_salary),
    })),
    stateBreakdown: (stateBreakdown ?? []).map((s: { state: string; state_slug: string; count: number }) => ({
      state: s.state,
      stateSlug: s.state_slug,
      count: Number(s.count),
    })),
  };
}

/**
 * Get all agency slugs for sitemap generation.
 */
export async function getAgencySlugs(): Promise<string[]> {
  const supabase = createServerClient();
  const { data } = await supabase.from("agencies").select("slug");
  return (data ?? []).map((a) => a.slug);
}

/**
 * Get the average salary for a specific agency.
 */
export async function getAgencyAvgSalary(agencySlug: string): Promise<number> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("agencies")
    .select("avg_salary")
    .eq("slug", agencySlug)
    .single();
  return Number(data?.avg_salary) || 0;
}

/**
 * Search agencies by name or abbreviation.
 */
export async function searchAgencies(query: string): Promise<Agency[]> {
  const supabase = createServerClient();
  const sanitized = sanitizeForLike(query);

  const { data, error } = await supabase
    .from("agencies")
    .select("id, slug, name, abbreviation, employee_count, avg_salary, median_salary")
    .or(`name.ilike.%${sanitized}%,abbreviation.ilike.%${sanitized}%`)
    .order("employee_count", { ascending: false })
    .limit(6);

  if (error) throw error;
  return (data ?? []).map((a) => ({
    slug: a.slug,
    name: a.name,
    abbreviation: a.abbreviation ?? undefined,
    employeeCount: a.employee_count ?? 0,
    averageSalary: Number(a.avg_salary) || 0,
    medianSalary: Number(a.median_salary) || 0,
    highestSalary: 0,
    lowestSalary: 0,
    topOccupations: [],
    stateBreakdown: [],
  }));
}
