import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env";

// Server-side read client (server components, API routes, sitemap)
// Uses the anon key so RLS policies are enforced.
export function createServerClient(): SupabaseClient {
  return createClient(env.supabaseUrl, env.supabaseAnonKey);
}

// Admin client — bypasses RLS. Only use in ETL scripts / data ingestion.
export function createAdminClient(): SupabaseClient {
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey);
}
