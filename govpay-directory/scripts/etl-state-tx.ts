/**
 * GovPay.Directory — Texas State Employee Salary ETL
 *
 * Downloads and processes Texas state employee compensation data
 * from the Texas Tribune Government Salaries Explorer.
 *
 * Data source: https://salaries.texastribune.org/
 * CSV: https://s3.amazonaws.com/raw.texastribune.org/state_of_texas/salaries/02_non_duplicated_employees/{date}.csv
 *
 * CSV Columns:
 *   AGENCY, AGENCY NAME, LAST NAME, FIRST NAME, MI, CLASS CODE, CLASS TITLE,
 *   ETHNICITY, GENDER, EMPLOYEE TYPE, HIRE DATE, RATE, HRSWKD, MONTHLY, ANNUAL,
 *   STATENUM, duplicated, multiple_full_time_jobs, combined_multiple_jobs,
 *   hide_from_search, summed_annual_salary
 *
 * Usage: npx tsx scripts/etl-state-tx.ts
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
const TX_DATA_FILE = resolve(DATA_DIR, "tx_employees.csv");

// Texas Tribune Government Salaries Explorer
// Updated January 2026 — ~155,000 state employees
const TX_CSV_URL =
  "https://s3.amazonaws.com/raw.texastribune.org/state_of_texas/salaries/02_non_duplicated_employees/2026-01-01.csv";

async function downloadTexasData(): Promise<string> {
  await mkdir(DATA_DIR, { recursive: true });

  if (existsSync(TX_DATA_FILE)) {
    console.log("  Using cached TX data file");
    return await readFile(TX_DATA_FILE, "utf-8");
  }

  console.log("  Downloading from Texas Tribune...");
  const response = await fetch(TX_CSV_URL);
  if (!response.ok) {
    throw new Error(`TX download failed: ${response.status} ${response.statusText}`);
  }

  const csv = await response.text();
  await writeFile(TX_DATA_FILE, csv);
  console.log(`  Downloaded ${(csv.length / 1024 / 1024).toFixed(1)}MB`);
  return csv;
}

interface TXRecord {
  "FIRST NAME"?: string;
  "LAST NAME"?: string;
  "AGENCY NAME"?: string;
  "CLASS TITLE"?: string;
  ANNUAL?: string;
  ETHNICITY?: string;
  GENDER?: string;
  AGENCY?: string;
  hide_from_search?: string;
  duplicated?: string;
  summed_annual_salary?: string;
  [key: string]: string | undefined;
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
  const records: TXRecord[] = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });
  console.log(`  Parsed ${records.length} records`);

  // Get Texas state ID
  const { data: texasState } = await supabase
    .from("states")
    .select("id")
    .eq("slug", "texas")
    .single();

  if (!texasState) {
    throw new Error("Texas state not found. Run seed-reference.ts first.");
  }

  const agencyCache = new Map<string, number>();
  const batchSize = 500;
  let inserted = 0;
  let skipped = 0;

  // Log ETL run
  const { data: etlRun } = await supabase
    .from("etl_runs")
    .insert({
      source: "STATE_TX",
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
      const firstName = (rec["FIRST NAME"] ?? "").trim();
      const lastName = (rec["LAST NAME"] ?? "").trim();
      const agencyName = (rec["AGENCY NAME"] ?? "").trim();
      const salary = parseFloat(rec.ANNUAL ?? "0");

      // Skip hidden/duplicate rows and invalid records
      if (rec.hide_from_search === "True") {
        skipped++;
        continue;
      }
      if (!firstName || !lastName || !agencyName || salary <= 0) {
        skipped++;
        continue;
      }

      const agencyId = await ensureAgency(agencyName, agencyCache);
      const fullName = `${firstName} ${lastName}`;
      const uniqueIndex = i + j;

      rows.push({
        slug: `${slugify(firstName)}-${slugify(lastName)}-tx-${uniqueIndex}`,
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
        job_title: (rec["CLASS TITLE"] ?? "").trim() || null,
        agency_id: agencyId,
        state_id: texasState.id,
        pay_plan: "STATE",
        base_salary: salary,
        total_compensation: salary,
        fiscal_year: 2025,
        duty_station: "Texas",
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

    if ((i + batchSize) % 5000 === 0 || i + batchSize >= records.length) {
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
  console.log("  Refreshing materialized views...");
  // Update agency stats
  const { error } = await supabase.rpc("refresh_agency_stats");
  if (error) {
    console.log("  (agency_stats view refresh requires manual SQL — run REFRESH MATERIALIZED VIEW agency_stats;)");
  }
}

async function main() {
  console.log("GovPay.Directory — Texas Employee Salary ETL\n");

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
  }

  const startTime = Date.now();

  console.log("Step 1: Download data");
  const csvData = await downloadTexasData();

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
