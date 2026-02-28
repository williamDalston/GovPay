/**
 * GovPay.Directory — Florida State Employee Salary ETL
 *
 * Downloads and processes Florida state employee compensation data
 * from the Florida Has A Right To Know transparency portal.
 *
 * Data source: https://floridahasarighttoknow.myflorida.com/search_state_payroll
 * Alternative: https://www.openthebooks.com/florida-state-employees/ (historical)
 *
 * Florida publishes individual employee names. ~180,000+ state employees.
 * Data updated weekly (first business day, before 10 AM).
 *
 * Usage: npx tsx scripts/etl-state-fl.ts
 * Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";
import { parse } from "csv-parse/sync";
import { readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { slugify } from "../src/lib/slugify";

config({ path: resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DATA_DIR = resolve(process.cwd(), "data");
const FL_DATA_FILE = resolve(DATA_DIR, "fl_employees.csv");

// Florida Has A Right To Know portal - manual download required
// No direct CSV API available
const FL_PORTAL_URL = "https://floridahasarighttoknow.myflorida.com/search_state_payroll";

interface FLRecord {
  "First Name"?: string;
  "Last Name"?: string;
  "Middle Name"?: string;
  Agency?: string;
  "Agency Name"?: string;
  "Class Title"?: string;
  "Position Title"?: string;
  "Annual Salary"?: string;
  Salary?: string;
  "Hire Date"?: string;
  [key: string]: string | undefined;
}

async function downloadFLData(): Promise<string | null> {
  await mkdir(DATA_DIR, { recursive: true });

  if (existsSync(FL_DATA_FILE)) {
    console.log("  Using cached FL data file");
    return await readFile(FL_DATA_FILE, "utf-8");
  }

  console.log("  FL data file not found.");
  console.log("  To load Florida data:");
  console.log(`    1. Visit ${FL_PORTAL_URL}`);
  console.log('    2. Navigate to "State Employee Salaries"');
  console.log('    3. Click "Export" or "Download" to get CSV');
  console.log(`    4. Save as: ${FL_DATA_FILE}`);
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
  const records: FLRecord[] = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });
  console.log(`  Parsed ${records.length} records`);

  // Get Florida state ID
  const { data: flState } = await supabase
    .from("states")
    .select("id")
    .eq("slug", "florida")
    .single();

  if (!flState) {
    throw new Error("Florida state not found. Run seed-reference.ts first.");
  }

  const agencyCache = new Map<string, number>();
  const batchSize = 500;
  let inserted = 0;
  let skipped = 0;

  // Log ETL run
  const { data: etlRun } = await supabase
    .from("etl_runs")
    .insert({
      source: "STATE_FL",
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
      const middleName = (rec["Middle Name"] ?? "").trim();
      const agencyName = (rec["Agency Name"] ?? rec.Agency ?? "").trim();
      const salary = parseFloat(
        (rec["Annual Salary"] ?? rec.Salary ?? "0").replace(/[,$]/g, "")
      );

      if (!firstName || !lastName || !agencyName || salary <= 0) {
        skipped++;
        continue;
      }

      const agencyId = await ensureAgency(agencyName, agencyCache);
      const fullName = middleName
        ? `${firstName} ${middleName} ${lastName}`
        : `${firstName} ${lastName}`;
      const uniqueIndex = i + j;

      rows.push({
        slug: `${slugify(firstName)}-${slugify(lastName)}-fl-${uniqueIndex}`,
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
        job_title: (rec["Class Title"] ?? rec["Position Title"] ?? "").trim() || null,
        agency_id: agencyId,
        state_id: flState.id,
        pay_plan: "STATE",
        base_salary: salary,
        total_compensation: salary,
        fiscal_year: 2024,
        duty_station: "Florida",
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
  console.log("GovPay.Directory — Florida Employee Salary ETL\n");

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
  }

  const startTime = Date.now();

  console.log("Step 1: Locate data file");
  const csvData = await downloadFLData();
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
