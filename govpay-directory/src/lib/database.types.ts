/**
 * Database types for Supabase PostgREST queries.
 * These types mirror the database schema and are used to provide
 * type safety for database operations.
 *
 * Note: In production, these should be generated using:
 * npx supabase gen types typescript --project-id <project-id> > src/lib/database.types.ts
 */

export interface Database {
  public: {
    Tables: {
      agencies: {
        Row: {
          id: number;
          slug: string;
          name: string;
          abbreviation: string | null;
          employee_count: number | null;
          avg_salary: number | null;
          median_salary: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["agencies"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["agencies"]["Insert"]>;
      };
      states: {
        Row: {
          id: number;
          slug: string;
          name: string;
          abbreviation: string;
          employee_count: number | null;
          avg_salary: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["states"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["states"]["Insert"]>;
      };
      occupations: {
        Row: {
          id: number;
          code: string;
          title: string;
        };
        Insert: Omit<Database["public"]["Tables"]["occupations"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["occupations"]["Insert"]>;
      };
      employees: {
        Row: {
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
          agency_id: number | null;
          state_id: number | null;
          occupation_id: number | null;
          created_at: string;
          updated_at: string;
          fts: unknown;
        };
        Insert: Omit<Database["public"]["Tables"]["employees"]["Row"], "id" | "created_at" | "updated_at" | "fts">;
        Update: Partial<Database["public"]["Tables"]["employees"]["Insert"]>;
      };
      gs_pay_scales: {
        Row: {
          id: number;
          fiscal_year: number;
          grade: number;
          step: number;
          base_pay: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["gs_pay_scales"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["gs_pay_scales"]["Insert"]>;
      };
      locality_areas: {
        Row: {
          id: number;
          slug: string;
          name: string;
          adjustment_rate: number;
          fiscal_year: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["locality_areas"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["locality_areas"]["Insert"]>;
      };
      etl_runs: {
        Row: {
          id: number;
          source: string;
          status: "pending" | "running" | "completed" | "failed";
          records_processed: number | null;
          records_inserted: number | null;
          records_updated: number | null;
          error_message: string | null;
          started_at: string;
          completed_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["etl_runs"]["Row"], "id" | "started_at">;
        Update: Partial<Database["public"]["Tables"]["etl_runs"]["Insert"]>;
      };
    };
    Functions: {
      get_avg_salary: {
        Args: Record<string, never>;
        Returns: number;
      };
      get_agency_top_occupations: {
        Args: { agency_id_param: number };
        Returns: Array<{ title: string; count: number; avg_salary: number }>;
      };
      get_agency_state_breakdown: {
        Args: { agency_id_param: number };
        Returns: Array<{ state: string; state_slug: string; count: number }>;
      };
      get_state_agencies: {
        Args: { state_id_param: number };
        Returns: Array<{ name: string; slug: string; count: number }>;
      };
      get_salary_distribution: {
        Args: Record<string, never>;
        Returns: Array<{ range: string; count: number }>;
      };
      refresh_agency_stats: {
        Args: Record<string, never>;
        Returns: void;
      };
      refresh_state_stats: {
        Args: Record<string, never>;
        Returns: void;
      };
      search_employees_fuzzy: {
        Args: { search_term: string; result_limit?: number };
        Returns: Array<{
          slug: string;
          first_name: string;
          last_name: string;
          full_name: string;
          agency_name: string | null;
          similarity: number;
        }>;
      };
      get_agency_salary_distribution: {
        Args: { agency_id_param: number };
        Returns: Array<{ range: string; count: number }>;
      };
      get_state_salary_distribution: {
        Args: { state_id_param: number };
        Returns: Array<{ range: string; count: number }>;
      };
    };
  };
}

// Convenience types for common query results
export type AgencyRow = Database["public"]["Tables"]["agencies"]["Row"];
export type StateRow = Database["public"]["Tables"]["states"]["Row"];
export type EmployeeRow = Database["public"]["Tables"]["employees"]["Row"];
export type OccupationRow = Database["public"]["Tables"]["occupations"]["Row"];

/**
 * Type for employee with joined relations as returned by the EMPLOYEE_SELECT query.
 * This is a subset of EmployeeRow with only the fields we actually select.
 */
export interface EmployeeWithRelations {
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

// Type for suggestion query results (from ilike query)
export interface EmployeeSuggestionRow {
  slug: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  agencies: { name: string } | null;
  // From fuzzy search RPC
  agency_name?: string;
  similarity?: number;
}

export interface AgencySuggestionRow {
  slug: string;
  name: string;
  abbreviation: string | null;
}
