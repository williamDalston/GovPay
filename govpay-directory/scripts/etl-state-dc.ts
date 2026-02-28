/**
 * GovPay.Directory — District of Columbia Employee Salary ETL
 *
 * Downloads and processes DC government employee compensation data
 * from Open Data DC.
 *
 * Data source: https://opendata.dc.gov/datasets/DCGIS::dc-public-employee-salary
 * Portal: https://dchr.dc.gov/public-employee-salary-information
 *
 * DC publishes individual employee names quarterly. ~35,000+ employees.
 *
 * Usage: npx tsx scripts/etl-state-dc.ts
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
const DC_DATA_FILE = resolve(DATA_DIR, "dc_employees.csv");

// Open Data DC — ArcGIS Hub
// GeoJSON API available; CSV via manual export
const DC_PORTAL_URL =
  "https://opendata.dc.gov/datasets/DCGIS::dc-public-employee-salary";

// ArcGIS Feature Service CSV export (auto-download attempt)
const DC_CSV_URL =
  "https://opendata.dc.gov/api/download/v1/items/c9a03cab565b44849bcfc57e63fd3591/csv?layers=24";

interface DCRecord {
  FIRST_NAME?: string;
  "First Name"?: string;
  LAST_NAME?: string;
  "Last Name"?: string;
  MIDDLE_NAME?: string;
  "Middle Name"?: string;
  AGENCY?: string;
  "Agency Name"?: string;
  AGENCY_NAME?: string;
  TITLE?: string;
  "Position Title"?: string;
  POSITION_TITLE?: string;
  GRADE?: string;
  "Pay Grade"?: string;
  SALARY?: string;
  "Annual Salary"?: string;
  ANNUAL_SALARY?: string;
  HIRE_DATE?: string;
  "Hire Date"?: string;
  [key: string]: string | undefined;
}

async function downloadDCData(): Promise<string | null> {
  await mkdir(DATA_DIR, { recursive: true });

  if (existsSync(DC_DATA_FILE)) {
    console.log("  Using cached DC data file");
    return await readFile(DC_DATA_FILE, "utf-8");
  }

  console.log("  Attempting auto-download from Open Data DC...");
  try {
    const response = await fetch(DC_CSV_URL);
    if (response.ok) {
      const csv = await response.text();
      if (csv.length > 1000) {
        await writeFile(DC_DATA_FILE, csv);
        console.log(
          `  Downloaded ${(csv.length / 1024 / 1024).toFixed(1)}MB`
        );
        return csv;
      }
    }
    console.log(`  DC auto-download returned ${response.status}`);
  } catch (err) {
    console.log("  DC auto-download failed:", err);
  }

  console.log("  DC data file not found.");
  console.log("  To load DC data:");
  console.log(`    1. Visit ${DC_PORTAL_URL}`);
  console.log('    2. Click "Download" → select CSV format');
  console.log(`    3. Save as: ${DC_DATA_FILE}`);
  console.log("    4. Re-run this script");
  console.log("");
  console.log("  Alternative: DCHR portal");
  console.log("    1. Visit https://dchr.dc.gov/public-employee-salary-information");
  console.log("    2. Download the quarterly salary report (CSV/Excel)");
  console.log(`    3. Save as: ${DC_DATA_FILE}`);

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
  const records: DCRecord[] = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });
  console.log(`  Parsed ${records.length} records`);

  // DC is in the states table as "district-of-columbia"
  const { data: dcState } = await supabase
    .from("states")
    .select("id")
    .eq("slug", "district-of-columbia")
    .single();

  if (!dcState) {
    throw new Error(
      "District of Columbia not found. Run seed-reference.ts first."
    );
  }

  const agencyCache = new Map<string, number>();
  const batchSize = 500;
  let inserted = 0;
  let skipped = 0;

  const { data: etlRun } = await supabase
    .from("etl_runs")
    .insert({
      source: "STATE_DC",
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
      const firstName = (
        rec.FIRST_NAME ?? rec["First Name"] ?? ""
      ).trim();
      const lastName = (
        rec.LAST_NAME ?? rec["Last Name"] ?? ""
      ).trim();
      const middleName = (
        rec.MIDDLE_NAME ?? rec["Middle Name"] ?? ""
      ).trim();
      const agencyName = (
        rec.DESCRSHORT ?? rec.AGENCY_NAME ?? rec["Agency Name"] ?? rec.AGENCY ?? ""
      ).trim();
      const salary = parseFloat(
        (
          rec.COMPRATE ??
          rec.ANNUAL_SALARY ??
          rec["Annual Salary"] ??
          rec.SALARY ??
          "0"
        ).replace(/[,$]/g, "")
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
      const grade = (rec.GRADE ?? rec["Pay Grade"] ?? "").trim() || null;

      rows.push({
        slug: `${slugify(firstName)}-${slugify(lastName)}-dc-${uniqueIndex}`,
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
        job_title:
          (
            rec.JOBTITLE ??
            rec.POSITION_TITLE ??
            rec["Position Title"] ??
            rec.TITLE ??
            ""
          ).trim() || null,
        agency_id: agencyId,
        state_id: dcState.id,
        pay_plan: "STATE",
        grade,
        base_salary: salary,
        total_compensation: salary,
        fiscal_year: 2025,
        duty_station: "District of Columbia",
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
  console.log("GovPay.Directory — DC Employee Salary ETL\n");

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
  }

  const startTime = Date.now();

  console.log("Step 1: Locate data file");
  const csvData = await downloadDCData();
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
