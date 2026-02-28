/**
 * GovPay.Directory — Pennsylvania State Employee Salary ETL
 *
 * Downloads and processes Pennsylvania state employee compensation data
 * from the PA Open Data Portal.
 *
 * Data source: https://data.pa.gov/
 * Dataset: State Employee Salaries
 * Direct: https://data.pa.gov/Government-Efficiency-Citizen-Engagement/State-Employee-Salaries/r5gx-5huc
 *
 * Pennsylvania publishes individual employee names. ~80,000+ state employees.
 *
 * Usage: npx tsx scripts/etl-state-pa.ts
 * Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";
import { parse } from "csv-parse/sync";
import { writeFile, readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { slugify } from "../src/lib/slugify";

config({ path: resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DATA_DIR = resolve(process.cwd(), "data");
const PA_DATA_FILE = resolve(DATA_DIR, "pa_employees.csv");

// PennWATCH - Pennsylvania's transparency portal
// Manual download required - no direct CSV API
const PA_PORTAL_URL = "https://pennwatch.pa.gov/Employees/Salaries";

interface PARecord {
  "First Name"?: string;
  "Last Name"?: string;
  "Middle Initial"?: string;
  Agency?: string;
  "Agency Name"?: string;
  "Job Title"?: string;
  "Annual Salary"?: string;
  Salary?: string;
  "Fiscal Year"?: string;
  [key: string]: string | undefined;
}

async function downloadPAData(): Promise<string | null> {
  await mkdir(DATA_DIR, { recursive: true });

  if (existsSync(PA_DATA_FILE)) {
    console.log("  Using cached PA data file");
    return await readFile(PA_DATA_FILE, "utf-8");
  }

  console.log("  PA data file not found.");
  console.log("  To load Pennsylvania data:");
  console.log(`    1. Visit ${PA_PORTAL_URL}`);
  console.log("    2. Use the search tool to query all employees");
  console.log("    3. Export results (may need to do in batches by agency)");
  console.log(`    4. Save as: ${PA_DATA_FILE}`);
  console.log("    5. Re-run this script");

  return null;
}

async function ensureAgency(
  name: string,
  agencyCache: Map<string, number>
): Promise<number> {
  const slug = slugify(name);
  if (agencyCache.has(slug)) return agencyCache.get(slug)!;

  const { data: existing } = await supabase
    .from("agencies")
    .select("id")
    .eq("slug", slug)
    .single();

  if (existing) {
    agencyCache.set(slug, existing.id);
    return existing.id;
  }

  const { data: inserted, error } = await supabase
    .from("agencies")
    .insert({ slug, name, abbreviation: null })
    .select("id")
    .single();

  if (error) throw error;
  agencyCache.set(slug, inserted!.id);
  return inserted!.id;
}

async function processRecords(csvData: string) {
  console.log("  Parsing CSV...");
  const records: PARecord[] = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });
  console.log(`  Parsed ${records.length} records`);

  // Get Pennsylvania state ID
  const { data: paState } = await supabase
    .from("states")
    .select("id")
    .eq("slug", "pennsylvania")
    .single();

  if (!paState) {
    throw new Error("Pennsylvania state not found. Run seed-reference.ts first.");
  }

  const agencyCache = new Map<string, number>();
  const batchSize = 500;
  let inserted = 0;
  let skipped = 0;

  // Log ETL run
  const { data: etlRun } = await supabase
    .from("etl_runs")
    .insert({
      source: "STATE_PA",
      status: "running",
      records_processed: records.length,
    })
    .select("id")
    .single();

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const rows = [];

    for (let j = 0; j < batch.length; j++) {
      const rec = batch[j];
      const firstName = (rec["First Name"] ?? "").trim();
      const lastName = (rec["Last Name"] ?? "").trim();
      const middleInitial = (rec["Middle Initial"] ?? "").trim();
      const agencyName = (rec["Agency Name"] ?? rec.Agency ?? "").trim();
      const salary = parseFloat(
        (rec["Annual Salary"] ?? rec.Salary ?? "0").replace(/[,$]/g, "")
      );

      if (!firstName || !lastName || !agencyName || salary <= 0) {
        skipped++;
        continue;
      }

      const agencyId = await ensureAgency(agencyName, agencyCache);
      const fullName = middleInitial
        ? `${firstName} ${middleInitial} ${lastName}`
        : `${firstName} ${lastName}`;
      const uniqueIndex = i + j;

      rows.push({
        slug: `${slugify(firstName)}-${slugify(lastName)}-pa-${uniqueIndex}`,
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
        job_title: (rec["Job Title"] ?? "").trim() || null,
        agency_id: agencyId,
        state_id: paState.id,
        pay_plan: "STATE",
        base_salary: salary,
        total_compensation: salary,
        fiscal_year: parseInt(rec["Fiscal Year"] ?? "2024", 10),
        duty_station: "Pennsylvania",
      });
    }

    if (rows.length > 0) {
      const { error } = await supabase.from("employees").upsert(rows, {
        onConflict: "slug",
      });
      if (error) {
        console.error(`  Batch error at ${i}:`, error.message);
      } else {
        inserted += rows.length;
      }
    }

    if ((i + batchSize) % 10000 === 0 || i + batchSize >= records.length) {
      console.log(
        `  Progress: ${Math.min(i + batchSize, records.length)}/${records.length} (${inserted} inserted, ${skipped} skipped)`
      );
    }
  }

  // Update ETL run
  if (etlRun) {
    await supabase
      .from("etl_runs")
      .update({
        status: "completed",
        records_inserted: inserted,
        completed_at: new Date().toISOString(),
      })
      .eq("id", etlRun.id);
  }

  return { inserted, skipped };
}

async function refreshViews() {
  console.log("  Refreshing state stats...");
  const { error } = await supabase.rpc("refresh_state_stats");
  if (error) {
    console.log("  (state_stats refresh skipped:", error.message, ")");
  }
}

async function main() {
  console.log("GovPay.Directory — Pennsylvania Employee Salary ETL\n");

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
  }

  const startTime = Date.now();

  console.log("Step 1: Download/locate data file");
  const csvData = await downloadPAData();
  if (!csvData) {
    process.exit(1);
  }

  console.log("\nStep 2: Process and load records");
  const { inserted, skipped } = await processRecords(csvData);

  console.log("\nStep 3: Refresh views");
  await refreshViews();

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\nDone in ${elapsed}s`);
  console.log(`  Records inserted: ${inserted}`);
  console.log(`  Records skipped: ${skipped}`);
}

main().catch((err) => {
  console.error("ETL failed:", err);
  process.exit(1);
});
