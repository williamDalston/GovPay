/**
 * GovPay.Directory — New Jersey State Employee Salary ETL
 *
 * Downloads and processes New Jersey state employee compensation data
 * from the NJ Transparency portal.
 *
 * Data source: https://www.nj.gov/transparency/workforce/employees/
 * Direct CSV:  https://www.nj.gov/transparency/transparency/payroll/data/payroll_pcy_rawdata.csv
 *
 * New Jersey publishes individual employee names with quarterly updates.
 * ~70,000+ state employees.
 *
 * Usage: npx tsx scripts/etl-state-nj.ts
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
const NJ_DATA_FILE = resolve(DATA_DIR, "nj_employees.csv");

// NJ Open Data — Socrata SODA API (auto-download, updated quarterly)
// Dataset: YourMoney Agency Payroll (iqwc-r2w7)
// Use SODA resource endpoint with $limit to avoid downloading entire multi-year dataset
const NJ_CSV_URL =
  "https://data.nj.gov/resource/iqwc-r2w7.csv?$limit=200000&$order=calendar_year+DESC";

interface NJRecord {
  "First Name"?: string;
  "Last Name"?: string;
  "Middle Initial"?: string;
  FIRST_NAME?: string;
  LAST_NAME?: string;
  Department?: string;
  "Department Name"?: string;
  DEPARTMENT?: string;
  Section?: string;
  "Section Name"?: string;
  Title?: string;
  "Title Name"?: string;
  TITLE?: string;
  "Job Title"?: string;
  "Annual Salary"?: string;
  Salary?: string;
  SALARY?: string;
  "YTD Earnings"?: string;
  "Regular Earnings"?: string;
  "Overtime Earnings"?: string;
  "Calendar Year"?: string;
  Year?: string;
  [key: string]: string | undefined;
}

async function downloadNJData(): Promise<string | null> {
  await mkdir(DATA_DIR, { recursive: true });

  if (existsSync(NJ_DATA_FILE)) {
    console.log("  Using cached NJ data file");
    return await readFile(NJ_DATA_FILE, "utf-8");
  }

  console.log("  Downloading from NJ Open Data (SODA API, limited to 200K rows)...");
  try {
    const response = await fetch(NJ_CSV_URL);
    if (response.ok) {
      const csv = await response.text();
      if (csv.length > 1000) {
        await writeFile(NJ_DATA_FILE, csv);
        console.log(
          `  Downloaded ${(csv.length / 1024 / 1024).toFixed(1)}MB`
        );
        return csv;
      }
    }
    console.log(`  NJ download returned ${response.status}`);
  } catch (err) {
    console.log("  NJ download failed:", err);
  }

  console.log("  NJ data download failed.");
  console.log("  To load New Jersey data manually:");
  console.log("    1. Visit https://www.nj.gov/transparency/workforce/employees/");
  console.log('    2. Click "Agency Payroll" or "Download Raw Data"');
  console.log(`    3. Save as: ${NJ_DATA_FILE}`);
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
    .upsert({ slug, name, abbreviation: null }, { onConflict: "slug" })
    .select("id")
    .single();

  if (error) throw error;
  agencyCache.set(slug, inserted!.id);
  return inserted!.id;
}

async function processRecords(csvData: string) {
  console.log("  Parsing CSV...");
  const records: NJRecord[] = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });
  console.log(`  Parsed ${records.length} records`);

  const { data: njState } = await supabase
    .from("states")
    .select("id")
    .eq("slug", "new-jersey")
    .single();

  if (!njState) {
    throw new Error("New Jersey state not found. Run seed-reference.ts first.");
  }

  const agencyCache = new Map<string, number>();
  const batchSize = 500;
  let inserted = 0;
  let skipped = 0;

  const { data: etlRun } = await supabase
    .from("etl_runs")
    .insert({
      source: "STATE_NJ",
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
      // SODA API returns lowercase snake_case columns
      const firstName = (
        rec.first_name ?? rec["First Name"] ?? rec.FIRST_NAME ?? ""
      ).trim();
      const lastName = (
        rec.last_name ?? rec["Last Name"] ?? rec.LAST_NAME ?? ""
      ).trim();
      const middleInitial = (rec.middle_initial ?? rec["Middle Initial"] ?? "").trim();
      const agencyName = (
        rec.master_department_agency_desc ?? rec.paid_department_agency_desc ??
        rec["Department Name"] ?? rec.Department ?? rec.DEPARTMENT ?? ""
      ).trim();

      // Prefer salary_hourly_rate (annual salary), fall back to YTD earnings
      const salaryStr =
        rec.salary_hourly_rate ?? rec["Annual Salary"] ?? rec.Salary ?? rec.SALARY ??
        rec.master_ytd_regular_pay ?? rec["Regular Earnings"] ?? rec["YTD Earnings"] ?? "0";
      const salary = parseFloat(salaryStr.replace(/[,$]/g, ""));

      if (!firstName || !lastName || !agencyName || salary <= 0) {
        skipped++;
        continue;
      }

      const agencyId = await ensureAgency(agencyName, agencyCache);
      const fullName = middleInitial
        ? `${firstName} ${middleInitial} ${lastName}`
        : `${firstName} ${lastName}`;
      const uniqueIndex = i + j;

      const yearStr = rec.calendar_year ?? rec["Calendar Year"] ?? rec.Year ?? "";
      const fiscalYear = yearStr ? parseInt(yearStr, 10) || 2024 : 2024;

      // Section as sub-agency detail in duty_station
      const section = (rec.master_section_desc ?? rec["Section Name"] ?? rec.Section ?? "").trim();

      rows.push({
        slug: `${slugify(firstName)}-${slugify(lastName)}-nj-${uniqueIndex}`,
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
        job_title:
          (
            rec.master_title_desc ?? rec["Title Name"] ?? rec["Job Title"] ?? rec.Title ?? rec.TITLE ?? ""
          ).trim() || null,
        agency_id: agencyId,
        state_id: njState.id,
        pay_plan: "STATE",
        base_salary: salary,
        total_compensation: salary,
        fiscal_year: fiscalYear,
        duty_station: section || "New Jersey",
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
  console.log("GovPay.Directory — New Jersey Employee Salary ETL\n");

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
  }

  const startTime = Date.now();

  console.log("Step 1: Download data");
  const csvData = await downloadNJData();
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
