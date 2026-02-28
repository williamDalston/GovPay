import { createServerClient } from "../supabase";
import { SalaryDistribution } from "../types";

const SALARY_BUCKETS = [
  { range: "$20k-$40k", min: 20000, max: 40000 },
  { range: "$40k-$60k", min: 40000, max: 60000 },
  { range: "$60k-$80k", min: 60000, max: 80000 },
  { range: "$80k-$100k", min: 80000, max: 100000 },
  { range: "$100k-$120k", min: 100000, max: 120000 },
  { range: "$120k-$150k", min: 120000, max: 150000 },
  { range: "$150k-$200k", min: 150000, max: 200000 },
  { range: "$200k+", min: 200000, max: Infinity },
] as const;

/**
 * Get global salary distribution across all employees.
 */
export async function getSalaryDistribution(): Promise<SalaryDistribution[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase.rpc("get_salary_distribution");

  if (error || !data) {
    return SALARY_BUCKETS.map((b) => ({ range: b.range, count: 0 }));
  }

  return data.map((d: { range: string; count: number }) => ({
    range: d.range,
    count: Number(d.count),
  }));
}

/**
 * Get salary distribution for a specific agency using RPC.
 */
export async function getSalaryDistributionForAgency(
  agencySlug: string
): Promise<SalaryDistribution[]> {
  const supabase = createServerClient();

  const { data: agency } = await supabase
    .from("agencies")
    .select("id")
    .eq("slug", agencySlug)
    .single();

  if (!agency) {
    return SALARY_BUCKETS.map((b) => ({ range: b.range, count: 0 }));
  }

  const { data, error } = await supabase.rpc("get_agency_salary_distribution", {
    agency_id_param: agency.id,
  });

  if (error || !data) {
    return SALARY_BUCKETS.map((b) => ({ range: b.range, count: 0 }));
  }

  return data.map((d: { range: string; count: number }) => ({
    range: d.range,
    count: Number(d.count),
  }));
}

/**
 * Get global statistics for the homepage.
 */
export async function getGlobalStats(): Promise<{
  totalEmployees: number;
  totalAgencies: number;
  avgSalary: number;
  lastUpdated: string;
}> {
  const supabase = createServerClient();

  try {
    const [empResult, agencyResult] = await Promise.all([
      supabase.from("employees").select("total_compensation", { count: "exact", head: true }),
      supabase.from("agencies").select("id", { count: "exact", head: true }),
    ]);

    if (empResult.error) throw empResult.error;
    if (agencyResult.error) throw agencyResult.error;

    const { data: avgData } = await supabase.rpc("get_avg_salary");

    const { data: latestFY } = await supabase
      .from("employees")
      .select("fiscal_year")
      .order("fiscal_year", { ascending: false })
      .limit(1);
    const fy = latestFY?.[0]?.fiscal_year;
    const lastUpdated = fy ? `FY ${fy}` : "FY 2025";

    return {
      totalEmployees: empResult.count ?? 0,
      totalAgencies: agencyResult.count ?? 0,
      avgSalary: Number(avgData) || 0,
      lastUpdated,
    };
  } catch (error) {
    console.error("getGlobalStats error:", error);
    return { totalEmployees: 0, totalAgencies: 0, avgSalary: 0, lastUpdated: "FY 2025" };
  }
}

/**
 * Get the national average salary.
 */
export async function getNationalAvgSalary(): Promise<number> {
  const supabase = createServerClient();
  const { data } = await supabase.rpc("get_avg_salary");
  return Number(data) || 0;
}
