/**
 * GovPay.Directory — Massachusetts State Employee Salary ETL
 *
 * Downloads and processes Massachusetts state employee compensation data
 * from CTHRU (Socrata API).
 *
 * Data source: https://cthru.data.socrata.com/
 * Dataset: Commonwealth Of Massachusetts Payrollv3 (9ttk-7vz6)
 * API: Socrata SODA API
 *
 * Massachusetts publishes individual employee names. ~80,000+ state employees.
 *
 * Usage: npx tsx scripts/etl-state-ma.ts
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
const MA_DATA_FILE = resolve(DATA_DIR, "ma_employees.csv");

// CTHRU Socrata API - Massachusetts payroll data
// Limit to 200K rows per request
const MA_CSV_URL =
  "https://cthru.data.socrata.com/api/views/9ttk-7vz6/rows.csv?accessType=DOWNLOAD&$limit=200000";

interface MARecord {
  // Format: "Name  - DEPARTMENT (CODE) - Title DEPARTMENT (CODE)"
  Employees?: string;
  "Base Pay"?: string;
  "Overtime Pay"?: string;
  "Leave Buy Back"?: string;
  "Other Pay"?: string;
  Total?: string;
  [key: string]: string | undefined;
}

function parseMAEmployee(employees: string): {
  firstName: string;
  lastName: string;
  department: string;
  title: string;
} {
  // Format: "Francisco Martin  - UNIVERSITY OF MASSACHUSETTS SYSTEM (UMS) - Head Basketball Coach UNIVERSITY OF MASSACHUSETTS SYSTEM (UMS)"
  const parts = employees.split(" - ");
  if (parts.length < 2) {
    return { firstName: "", lastName: "", department: "", title: "" };
  }

  const namePart = parts[0].trim();
  const nameParts = namePart.split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  // Department is in format "DEPARTMENT NAME (CODE)"
  const deptPart = parts[1]?.trim() || "";
  const deptMatch = deptPart.match(/^(.+?)\s*\([A-Z]+\)$/);
  const department = deptMatch ? deptMatch[1].trim() : deptPart;

  // Title is after second dash, before the repeated department
  let title = "";
  if (parts.length >= 3) {
    const titlePart = parts[2]?.trim() || "";
    // Remove the repeated department name at the end
    const titleMatch = titlePart.match(/^(.+?)\s+[A-Z][A-Z\s]+\([A-Z]+\)\s*$/);
    title = titleMatch ? titleMatch[1].trim() : titlePart.split(/\s{2,}/)[0] || "";
  }

  return { firstName, lastName, department, title };
}

async function downloadMAData(): Promise<string | null> {
  await mkdir(DATA_DIR, { recursive: true });

  if (existsSync(MA_DATA_FILE)) {
    console.log("  Using cached MA data file");
    return await readFile(MA_DATA_FILE, "utf-8");
  }

  console.log("  Downloading from CTHRU Socrata API...");
  try {
    const response = await fetch(MA_CSV_URL);
    if (response.ok) {
      const csv = await response.text();
      if (csv.length > 1000) {
        await writeFile(MA_DATA_FILE, csv);
        console.log(`  Downloaded ${(csv.length / 1024 / 1024).toFixed(1)}MB`);
        return csv;
      }
    }
    console.log(`  MA download returned ${response.status}`);
  } catch (err) {
    console.log("  MA download failed:", err);
  }

  console.log("  MA data file not found.");
  console.log("  To load Massachusetts data manually:");
  console.log("    1. Visit https://cthrupayroll.mass.gov/");
  console.log('    2. Click "View Data in Worksheet" then "VIEW"');
  console.log("    3. Export as CSV");
  console.log(`    4. Save as: ${MA_DATA_FILE}`);
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
  const records: MARecord[] = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });
  console.log(`  Parsed ${records.length} records`);

  if (records.length > 0) {
    console.log("  Sample columns:", Object.keys(records[0]).slice(0, 10));
  }

  // Get Massachusetts state ID
  const { data: maState } = await supabase
    .from("states")
    .select("id")
    .eq("slug", "massachusetts")
    .single();

  if (!maState) {
    throw new Error("Massachusetts state not found. Run seed-reference.ts first.");
  }

  const agencyCache = new Map<string, number>();
  const batchSize = 500;
  let inserted = 0;
  let skipped = 0;

  // Log ETL run
  const { data: etlRun } = await supabase
    .from("etl_runs")
    .insert({
      source: "STATE_MA",
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
      const { firstName, lastName, department, title } = parseMAEmployee(rec.Employees ?? "");
      const total = parseFloat((rec.Total ?? "0").replace(/[,$]/g, ""));
      const basePay = parseFloat((rec["Base Pay"] ?? "0").replace(/[,$]/g, ""));

      if (!firstName || !lastName || !department || total <= 0) {
        skipped++;
        continue;
      }

      const agencyId = await ensureAgency(department, agencyCache);
      const fullName = `${firstName} ${lastName}`;
      const uniqueIndex = i + j;

      rows.push({
        slug: `${slugify(firstName)}-${slugify(lastName)}-ma-${uniqueIndex}`,
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
        job_title: title || null,
        agency_id: agencyId,
        state_id: maState.id,
        pay_plan: "STATE",
        base_salary: basePay > 0 ? basePay : total,
        total_compensation: total,
        fiscal_year: 2024,
        duty_station: "Massachusetts",
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
  console.log("GovPay.Directory — Massachusetts Employee Salary ETL\n");

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
  }

  const startTime = Date.now();

  console.log("Step 1: Download/locate data file");
  const csvData = await downloadMAData();
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
