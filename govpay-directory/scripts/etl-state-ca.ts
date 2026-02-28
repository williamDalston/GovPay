/**
 * GovPay.Directory — California State Employee Salary ETL
 *
 * Processes California state employee compensation data from the
 * State Controller's Government Compensation in California (GCC) portal.
 *
 * Data source: https://publicpay.ca.gov/reports/rawexport.aspx
 * Download: "2024 State Department Data" CSV
 *
 * IMPORTANT: California does NOT publish employee names. Records are
 * loaded as anonymous entries with generated identifiers. The salary,
 * position, and department data is real.
 *
 * CSV Columns:
 *   Year, EmployerType, EmployerName, DepartmentOrSubdivision, Position,
 *   ElectedOfficial, Judicial, OtherPositions, MinPositionSalary,
 *   MaxPositionSalary, ReportedBaseWage, RegularPay, OvertimePay,
 *   LumpSumPay, OtherPay, TotalWages, DefinedBenefitPlanContribution,
 *   EmployeesRetirementCostCovered, DeferredCompensationPlan,
 *   HealthDentalVision, TotalRetirementAndHealthContribution,
 *   PensionFormula, EmployerURL, EmployerPopulation, LastUpdatedDate,
 *   EmployerCounty, SpecialDistrictActivities, IncludesUnfundedLiability,
 *   SpecialDistrictType
 *
 * Usage: npx tsx scripts/etl-state-ca.ts
 * Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";
import { parse } from "csv-parse/sync";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { slugify } from "../src/lib/slugify";

config({ path: resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DATA_DIR = resolve(process.cwd(), "data");

// Look for the file under common naming patterns
const CA_FILE_CANDIDATES = [
  resolve(DATA_DIR, "2024_StateDepartment.csv"),
  resolve(DATA_DIR, "ca_employees.csv"),
  resolve(DATA_DIR, "StateDepartment_2024.csv"),
];

interface CARecord {
  EmployerName?: string;
  DepartmentOrSubdivision?: string;
  Position?: string;
  RegularPay?: string;
  TotalWages?: string;
  OvertimePay?: string;
  Year?: string;
  [key: string]: string | undefined;
}

function findDataFile(): string | null {
  for (const path of CA_FILE_CANDIDATES) {
    if (existsSync(path)) return path;
  }
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

async function processRecords(records: CARecord[]) {
  if (records.length === 0) {
    console.log("  No records to process");
    return { inserted: 0, skipped: 0 };
  }

  console.log(`  Processing ${records.length} records...`);

  // Get California state ID
  const { data: caState } = await supabase
    .from("states")
    .select("id")
    .eq("slug", "california")
    .single();

  if (!caState) {
    throw new Error("California state not found. Run seed-reference.ts first.");
  }

  const agencyCache = new Map<string, number>();
  const batchSize = 500;
  let inserted = 0;
  let skipped = 0;

  // Log ETL run
  const { data: etlRun } = await supabase
    .from("etl_runs")
    .insert({
      source: "STATE_CA",
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
      const department = (rec.EmployerName ?? "").trim();
      const position = (rec.Position ?? "").trim();
      const totalWages = parseFloat(rec.TotalWages ?? "0");
      const regularPay = parseFloat(rec.RegularPay ?? "0");
      const basePay = regularPay > 0 ? regularPay : totalWages;

      if (!department || totalWages <= 0) {
        skipped++;
        continue;
      }

      const agencyId = await ensureAgency(department, agencyCache);
      const globalIndex = i + j;

      // California data is anonymous — generate identifiers
      const employeeNum = String(globalIndex + 1).padStart(6, "0");
      const firstName = "CA";
      const lastName = `Employee #${employeeNum}`;
      const fullName = position
        ? `CA Employee #${employeeNum} — ${position}`
        : `CA Employee #${employeeNum}`;

      rows.push({
        slug: `ca-employee-${employeeNum}`,
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
        job_title: position || null,
        agency_id: agencyId,
        state_id: caState.id,
        pay_plan: "STATE",
        base_salary: basePay,
        total_compensation: totalWages,
        fiscal_year: parseInt(rec.Year ?? "2024", 10),
        duty_station: "California",
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
  console.log("GovPay.Directory — California Employee Salary ETL\n");

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
  }

  const startTime = Date.now();

  console.log("Step 1: Locate data file");
  const dataFile = findDataFile();
  if (!dataFile) {
    console.error("  No CA data file found in data/ directory.");
    console.error("  Download '2024 State Department Data' from:");
    console.error("    https://publicpay.ca.gov/reports/rawexport.aspx");
    console.error("  Save as: data/2024_StateDepartment.csv");
    process.exit(1);
  }
  console.log(`  Using: ${dataFile}`);

  console.log("\nStep 2: Parse CSV");
  const csvData = await readFile(dataFile, "utf-8");
  const records: CARecord[] = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });
  console.log(`  Parsed ${records.length} records`);

  console.log("\nStep 3: Process and load records");
  const { inserted, skipped } = await processRecords(records);

  console.log("\nStep 4: Refresh views");
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
