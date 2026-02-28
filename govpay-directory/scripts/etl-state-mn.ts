/**
 * GovPay.Directory — Minnesota State Employee Salary ETL
 *
 * Downloads and processes Minnesota state employee compensation data
 * from the Minnesota Management and Budget (MMB) transparency portal.
 *
 * Data source: https://mn.gov/mmb/transparency-mn/payrolldata.jsp
 * Direct download: Excel file (~22MB) with 48 data elements per employee
 *
 * Minnesota publishes individual employee names. ~55,000+ state employees.
 * Includes Executive, Judicial branches, constitutional offices, and MN State colleges.
 *
 * Usage: npx tsx scripts/etl-state-mn.ts
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
const MN_DATA_FILE = resolve(DATA_DIR, "mn_employees.csv");

// Minnesota MMB Payroll Data - Excel download
// Convert to CSV before running this script
const MN_PORTAL_URL = "https://mn.gov/mmb/transparency-mn/payrolldata.jsp";
const MN_EXCEL_URL = "https://mn.gov/mmb-stat/transparency-mn/payroll/FY2024PayrollData.xlsx";

interface MNRecord {
  "First Name"?: string;
  "Last Name"?: string;
  "Middle Name"?: string;
  "Agency Name"?: string;
  Agency?: string;
  Department?: string;
  "Job Title"?: string;
  "Class Title"?: string;
  Title?: string;
  "Annual Salary"?: string;
  Salary?: string;
  "Base Salary"?: string;
  "Total Compensation"?: string;
  "Fiscal Year"?: string;
  Year?: string;
  [key: string]: string | undefined;
}

async function downloadMNData(): Promise<string | null> {
  await mkdir(DATA_DIR, { recursive: true });

  if (existsSync(MN_DATA_FILE)) {
    console.log("  Using cached MN data file");
    return await readFile(MN_DATA_FILE, "utf-8");
  }

  // Try to download and convert Excel
  console.log("  Attempting MN Excel download...");
  try {
    const response = await fetch(MN_EXCEL_URL);
    if (response.ok) {
      const buffer = await response.arrayBuffer();
      const excelFile = resolve(DATA_DIR, "mn_employees.xlsx");
      await writeFile(excelFile, Buffer.from(buffer));
      console.log(`  Downloaded ${(buffer.byteLength / 1024 / 1024).toFixed(1)}MB Excel file`);

      // Convert Excel to CSV using xlsx library
      const XLSX = (await import("xlsx")).default;
      const workbook = XLSX.read(Buffer.from(buffer), { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      await writeFile(MN_DATA_FILE, csv);
      console.log(`  Converted to CSV (${(csv.length / 1024 / 1024).toFixed(1)}MB)`);
      return csv;
    }
    console.log(`  MN download returned ${response.status}`);
  } catch (err) {
    console.log("  MN download/conversion failed:", err);
  }

  console.log("  MN data file not found.");
  console.log("  To load Minnesota data manually:");
  console.log(`    1. Visit ${MN_PORTAL_URL}`);
  console.log("    2. Download the FY2024 Payroll Data Excel file");
  console.log("    3. Open in Excel and Save As CSV");
  console.log(`    4. Save as: ${MN_DATA_FILE}`);
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
  const records: MNRecord[] = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });
  console.log(`  Parsed ${records.length} records`);

  if (records.length > 0) {
    console.log("  Sample columns:", Object.keys(records[0]).slice(0, 10));
  }

  // Get Minnesota state ID
  const { data: mnState } = await supabase
    .from("states")
    .select("id")
    .eq("slug", "minnesota")
    .single();

  if (!mnState) {
    throw new Error("Minnesota state not found. Run seed-reference.ts first.");
  }

  const agencyCache = new Map<string, number>();
  const batchSize = 500;
  let inserted = 0;
  let skipped = 0;

  // Log ETL run
  const { data: etlRun } = await supabase
    .from("etl_runs")
    .insert({
      source: "STATE_MN",
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
      const agencyName = (
        rec["Agency Name"] ?? rec.Agency ?? rec.Department ?? ""
      ).trim();
      const salary = parseFloat(
        (rec["Annual Salary"] ?? rec.Salary ?? rec["Base Salary"] ?? rec["Total Compensation"] ?? "0")
          .replace(/[,$]/g, "")
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
        slug: `${slugify(firstName)}-${slugify(lastName)}-mn-${uniqueIndex}`,
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
        job_title: (rec["Job Title"] ?? rec["Class Title"] ?? rec.Title ?? "").trim() || null,
        agency_id: agencyId,
        state_id: mnState.id,
        pay_plan: "STATE",
        base_salary: salary,
        total_compensation: salary,
        fiscal_year: parseInt(rec["Fiscal Year"] ?? rec.Year ?? "2024", 10),
        duty_station: "Minnesota",
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
  console.log("GovPay.Directory — Minnesota Employee Salary ETL\n");

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
  }

  const startTime = Date.now();

  console.log("Step 1: Download/locate data file");
  const csvData = await downloadMNData();
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
