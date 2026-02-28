import { createServerClient } from "./supabase";
import { Employee, Agency, StateData, SalaryDistribution } from "./types";

// ---------------------------------------------------------------------------
// Row-to-type mappers
// ---------------------------------------------------------------------------

interface DbEmployeeRow {
  id: number;
  slug: string;
  first_name: string;
  last_name: string;
  full_name: string;
  job_title: string | null;
  duty_station: string | null;
  pay_plan: string | null;
  grade: string | null;
  step: string | null;
  base_salary: number | null;
  total_compensation: number | null;
  fiscal_year: number;
  agencies: { name: string; slug: string } | null;
  states: { name: string; slug: string } | null;
  occupations: { code: string; title: string } | null;
}

function mapEmployee(row: DbEmployeeRow): Employee {
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

// ---------------------------------------------------------------------------
// Agencies
// ---------------------------------------------------------------------------

export async function getAgencies(): Promise<Agency[]> {
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

export async function getAgencyBySlug(
  slug: string
): Promise<Agency | null> {
  const supabase = createServerClient();

  // Main agency data
  const { data: agency, error } = await supabase
    .from("agencies")
    .select("id, slug, name, abbreviation, employee_count, avg_salary, median_salary")
    .eq("slug", slug)
    .single();

  if (error || !agency) return null;

  // Run all four queries in parallel
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

export async function getAgencySlugs(): Promise<string[]> {
  const supabase = createServerClient();
  const { data } = await supabase.from("agencies").select("slug");
  return (data ?? []).map((a) => a.slug);
}

// ---------------------------------------------------------------------------
// Employees
// ---------------------------------------------------------------------------

const EMPLOYEE_SELECT =
  "id, slug, first_name, last_name, full_name, job_title, duty_station, pay_plan, grade, step, base_salary, total_compensation, fiscal_year, agencies(name, slug), states(name, slug), occupations(code, title)";

export async function getEmployeeBySlug(
  slug: string
): Promise<Employee | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("employees")
    .select(EMPLOYEE_SELECT)
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return mapEmployee(data as unknown as DbEmployeeRow);
}

export async function getEmployeesByAgency(
  agencySlug: string,
  limit = 20,
  offset = 0
): Promise<{ employees: Employee[]; total: number }> {
  const supabase = createServerClient();

  // Get agency ID
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
    employees: (data ?? []).map((r) => mapEmployee(r as unknown as DbEmployeeRow)),
    total: count ?? 0,
  };
}

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
    employees: (data ?? []).map((r) => mapEmployee(r as unknown as DbEmployeeRow)),
    total: count ?? 0,
  };
}

export async function getEmployeesByGrade(
  grade: string,
  limit = 12
): Promise<Employee[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("employees")
    .select(EMPLOYEE_SELECT)
    .eq("pay_plan", "GS")
    .eq("grade", grade)
    .order("total_compensation", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map((r) => mapEmployee(r as unknown as DbEmployeeRow));
}

export async function getTopEarners(limit = 10): Promise<Employee[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("employees")
    .select(EMPLOYEE_SELECT)
    .order("total_compensation", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map((r) => mapEmployee(r as unknown as DbEmployeeRow));
}

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------

export async function getStateBySlug(
  slug: string
): Promise<StateData | null> {
  const supabase = createServerClient();

  const { data: state } = await supabase
    .from("states")
    .select("id, slug, name, abbreviation, employee_count, avg_salary")
    .eq("slug", slug)
    .single();

  if (!state) return null;

  const empCount = state.employee_count ?? 0;
  const mid = Math.floor(empCount / 2);

  // Run all three queries in parallel
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
      mapEmployee(r as unknown as DbEmployeeRow)
    ),
  };
}

// ---------------------------------------------------------------------------
// Salary Distribution
// ---------------------------------------------------------------------------

export async function getSalaryDistribution(): Promise<SalaryDistribution[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase.rpc("get_salary_distribution");

  if (error || !data) {
    return [
      { range: "$20k-$40k", count: 0 },
      { range: "$40k-$60k", count: 0 },
      { range: "$60k-$80k", count: 0 },
      { range: "$80k-$100k", count: 0 },
      { range: "$100k-$120k", count: 0 },
      { range: "$120k-$150k", count: 0 },
      { range: "$150k-$200k", count: 0 },
      { range: "$200k+", count: 0 },
    ];
  }

  return data.map((d: { range: string; count: number }) => ({
    range: d.range,
    count: Number(d.count),
  }));
}

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

  const { data: salaries } = await supabase
    .from("employees")
    .select("total_compensation")
    .eq("agency_id", agency.id);

  const counts = new Map<string, number>();
  for (const b of SALARY_BUCKETS) counts.set(b.range, 0);

  for (const row of salaries ?? []) {
    const comp = row.total_compensation ?? 0;
    for (const b of SALARY_BUCKETS) {
      if (comp >= b.min && (comp < b.max || b.max === Infinity)) {
        counts.set(b.range, (counts.get(b.range) ?? 0) + 1);
        break;
      }
    }
  }

  return SALARY_BUCKETS.map((b) => ({ range: b.range, count: counts.get(b.range) ?? 0 }));
}

// ---------------------------------------------------------------------------
// Global Stats
// ---------------------------------------------------------------------------

export async function getGlobalStats(): Promise<{
  totalEmployees: number;
  totalAgencies: number;
  avgSalary: number;
  lastUpdated: string;
}> {
  const supabase = createServerClient();

  const [empResult, agencyResult] = await Promise.all([
    supabase.from("employees").select("total_compensation", { count: "exact", head: true }),
    supabase.from("agencies").select("id", { count: "exact", head: true }),
  ]);

  // Avg salary
  const { data: avgData } = await supabase.rpc("get_avg_salary");

  // Latest fiscal year in the data
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
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

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
    q = q.textSearch("full_name", query, { type: "websearch" });
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
    employees: (data ?? []).map((r) => mapEmployee(r as unknown as DbEmployeeRow)),
    total: count ?? 0,
  };
}

export async function searchAgencies(
  query: string
): Promise<Agency[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("agencies")
    .select("id, slug, name, abbreviation, employee_count, avg_salary, median_salary")
    .or(`name.ilike.%${query}%,abbreviation.ilike.%${query}%`)
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

// ---------------------------------------------------------------------------
// Sitemap helpers
// ---------------------------------------------------------------------------

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

export async function getEmployeeSlugs(
  offset: number,
  limit: number
): Promise<string[]> {
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

// ---------------------------------------------------------------------------
// Agency average (for employee context)
// ---------------------------------------------------------------------------

export async function getAgencyAvgSalary(
  agencySlug: string
): Promise<number> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("agencies")
    .select("avg_salary")
    .eq("slug", agencySlug)
    .single();
  return Number(data?.avg_salary) || 0;
}

export async function getNationalAvgSalary(): Promise<number> {
  const supabase = createServerClient();
  const { data } = await supabase.rpc("get_avg_salary");
  return Number(data) || 0;
}

// ---------------------------------------------------------------------------
// Autocomplete suggestions
// ---------------------------------------------------------------------------

export async function getSuggestions(
  prefix: string
): Promise<{
  employees: { name: string; slug: string; agency: string }[];
  agencies: { name: string; slug: string }[];
}> {
  const supabase = createServerClient();
  const term = prefix.trim();
  if (term.length < 2) return { employees: [], agencies: [] };

  const [empResult, agencyResult] = await Promise.all([
    supabase
      .from("employees")
      .select("slug, first_name, last_name, agencies(name)")
      .or(`first_name.ilike.${term}%,last_name.ilike.${term}%`)
      .order("total_compensation", { ascending: false })
      .limit(5),
    supabase
      .from("agencies")
      .select("slug, name, abbreviation")
      .or(`name.ilike.%${term}%,abbreviation.ilike.%${term}%`)
      .order("employee_count", { ascending: false })
      .limit(3),
  ]);

  return {
    employees: (empResult.data ?? []).map((e: Record<string, unknown>) => ({
      name: `${e.first_name} ${e.last_name}`,
      slug: e.slug as string,
      agency: (e.agencies as { name: string } | null)?.name ?? "",
    })),
    agencies: (agencyResult.data ?? []).map((a: Record<string, unknown>) => ({
      name: a.name as string,
      slug: a.slug as string,
    })),
  };
}
