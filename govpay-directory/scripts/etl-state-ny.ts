/**
 * GovPay.Directory — New York State Employee Salary ETL
 *
 * Downloads and processes New York state employee compensation data
 * from the SeeThroughNY transparency portal.
 *
 * Data source: https://www.seethroughny.net/payrolls
 * API: https://www.seethroughny.net/tools/required/reports/payroll
 *
 * New York publishes individual employee names, making this high-value
 * for searchable salary data. ~300,000+ state employees.
 *
 * Usage: npx tsx scripts/etl-state-ny.ts
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
const NY_DATA_FILE = resolve(DATA_DIR, "ny_employees.csv");

// NY Open Data Portal - Socrata API (auto-download)
// Dataset: Salary Information for State Authorities
const NY_CSV_URL = "https://data.ny.gov/api/views/unag-2p27/rows.csv?accessType=DOWNLOAD";

interface NYRecord {
  "First Name"?: string;
  "Last Name"?: string;
  "Middle Initial"?: string;
  "Authority Name"?: string;
  Department?: string;
  Title?: string;
  "Pay Type"?: string;
  "Base Annualized Salary"?: string;
  "Actual Salary Paid"?: string;
  "Total Compensation"?: string;
  "Overtime Paid"?: string;
  "Fiscal Year End Date"?: string;
  [key: string]: string | undefined;
}

async function downloadNYData(): Promise<string | null> {
  await mkdir(DATA_DIR, { recursive: true });

  if (existsSync(NY_DATA_FILE)) {
    console.log("  Using cached NY data file");
    return await readFile(NY_DATA_FILE, "utf-8");
  }

  console.log("  Downloading from NY Open Data Portal...");
  try {
    const response = await fetch(NY_CSV_URL);
    if (response.ok) {
      const csv = await response.text();
      await writeFile(NY_DATA_FILE, csv);
      console.log(`  Downloaded ${(csv.length / 1024 / 1024).toFixed(1)}MB`);
      return csv;
    }
    console.log(`  NY download returned ${response.status}`);
  } catch (err) {
    console.log("  NY download failed:", err);
  }

  console.log("  NY data download failed.");
  console.log("  To load New York data manually:");
  console.log("    1. Visit https://data.ny.gov/Transparency/Salary-Information-for-State-Authorities/unag-2p27");
  console.log('    2. Click "Export" → "CSV"');
  console.log(`    3. Save as: ${NY_DATA_FILE}`);
  console.log("    4. Re-run this script");

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
  const records: NYRecord[] = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });
  console.log(`  Parsed ${records.length} records`);

  // Get New York state ID
  const { data: nyState } = await supabase
    .from("states")
    .select("id")
    .eq("slug", "new-york")
    .single();

  if (!nyState) {
    throw new Error("New York state not found. Run seed-reference.ts first.");
  }

  const agencyCache = new Map<string, number>();
  const batchSize = 500;
  let inserted = 0;
  let skipped = 0;

  // Log ETL run
  const { data: etlRun } = await supabase
    .from("etl_runs")
    .insert({
      source: "STATE_NY",
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
      const agencyName = (rec["Authority Name"] ?? "").trim();
      const totalComp = parseFloat((rec["Total Compensation"] ?? "0").replace(/[,$]/g, ""));
      const baseSalary = parseFloat((rec["Base Annualized Salary"] ?? "0").replace(/[,$]/g, ""));

      if (!firstName || !lastName || !agencyName || totalComp <= 0) {
        skipped++;
        continue;
      }

      const agencyId = await ensureAgency(agencyName, agencyCache);
      const fullName = middleInitial
        ? `${firstName} ${middleInitial} ${lastName}`
        : `${firstName} ${lastName}`;
      const uniqueIndex = i + j;

      // Parse fiscal year from date like "12/31/2017"
      const fiscalYearDate = rec["Fiscal Year End Date"] ?? "";
      const fiscalYear = fiscalYearDate ? parseInt(fiscalYearDate.split("/")[2] ?? "2024", 10) : 2024;

      rows.push({
        slug: `${slugify(firstName)}-${slugify(lastName)}-ny-${uniqueIndex}`,
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
        job_title: (rec.Title ?? "").trim() || null,
        agency_id: agencyId,
        state_id: nyState.id,
        pay_plan: rec["Pay Type"] ?? "STATE",
        base_salary: baseSalary > 0 ? baseSalary : totalComp,
        total_compensation: totalComp,
        fiscal_year: fiscalYear,
        duty_station: "New York",
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
  console.log("GovPay.Directory — New York Employee Salary ETL\n");

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
  }

  const startTime = Date.now();

  console.log("Step 1: Locate data file");
  const csvData = await downloadNYData();
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
