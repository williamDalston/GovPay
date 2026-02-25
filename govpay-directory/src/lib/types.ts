export interface Employee {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  agency: string;
  agencySlug: string;
  dutyStation: string;
  state: string;
  stateSlug: string;
  payPlan: string;
  grade: string;
  step: string;
  baseSalary: number;
  totalCompensation: number;
  occupationCode: string;
  occupationTitle: string;
  year: number;
  slug: string;
}

export interface Agency {
  slug: string;
  name: string;
  abbreviation?: string;
  employeeCount: number;
  averageSalary: number;
  medianSalary: number;
  highestSalary: number;
  lowestSalary: number;
  topOccupations: { title: string; count: number; avgSalary: number }[];
  stateBreakdown: { state: string; stateSlug: string; count: number }[];
}

export interface StateData {
  slug: string;
  name: string;
  abbreviation: string;
  employeeCount: number;
  averageSalary: number;
  medianSalary: number;
  agencies: { name: string; slug: string; count: number }[];
  topEarners: Employee[];
}

export interface GSPayScale {
  grade: number;
  steps: number[];
  localities: {
    area: string;
    slug: string;
    adjustedSteps: number[];
  }[];
}

export interface OccupationData {
  code: string;
  title: string;
  employeeCount: number;
  averageSalary: number;
  medianSalary: number;
  salaryRange: { min: number; max: number };
  topLocations: { state: string; count: number; avgSalary: number }[];
  topAgencies: { name: string; count: number; avgSalary: number }[];
}

export interface SalaryDistribution {
  range: string;
  count: number;
}

export interface SearchResult {
  type: "employee" | "agency" | "state" | "occupation";
  title: string;
  subtitle: string;
  url: string;
}
