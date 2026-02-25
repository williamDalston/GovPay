import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env";

// Server-side client (server components, API routes, sitemap)
export function createServerClient(): SupabaseClient {
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey);
}

// Browser client (client components via API routes)
export function createBrowserClient(): SupabaseClient {
  return createClient(env.supabaseUrl, env.supabaseAnonKey);
}
