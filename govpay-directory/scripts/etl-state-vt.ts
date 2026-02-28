/**
 * GovPay.Directory — Vermont State Employee Salary ETL
 *
 * Downloads and processes Vermont state employee compensation data
 * from Vermont Open Data (data.vermont.gov) via Socrata SODA API.
 *
 * Data source: https://data.vermont.gov/Government/State-of-Vermont-Employee-Salaries/jgqy-2smf
 * Socrata ID:  jgqy-2smf
 *
 * Vermont publishes individual employee names. ~10,000+ state employees.
 * Current snapshot updated monthly.
 *
 * Usage: npx tsx scripts/etl-state-vt.ts
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
const VT_DATA_FILE = resolve(DATA_DIR, "vt_employees.csv");

// Vermont Open Data (Socrata) — SODA API
const VT_CSV_URL =
  "https://data.vermont.gov/resource/jgqy-2smf.csv?$limit=50000";

interface VTRecord {
  name?: string;
  job_title?: string;
  department?: string;
  reg_temp?: string;
  salary?: string;
  salary_type?: string;
  data_as_of?: string;
  [key: string]: string | undefined;
}

/**
 * Parse Vermont name format: "Last,First" or "Last, First"
 */
function parseName(rec: VTRecord): {
  firstName: string;
  lastName: string;
  fullName: string;
} {
  const raw = (rec.name ?? "").trim();
  if (!raw) return { firstName: "", lastName: "", fullName: "" };

  if (raw.includes(",")) {
    const [last, first] = raw.split(",").map((s) => s.trim());
    return {
      firstName: first || "",
      lastName: last || "",
      fullName: first && last ? `${first} ${last}` : raw,
    };
  }

  const parts = raw.split(/\s+/);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || "",
    fullName: raw,
  };
}

/**
 * Annualize salary based on salary_type.
 * "Annual" → as-is, "Hourly" → *2080, "Weekly" → *52
 */
function annualizeSalary(amount: number, salaryType: string): number {
  const type = salaryType.toLowerCase();
  if (type.includes("hour")) return amount * 2080;
  if (type.includes("week")) return amount * 52;
  return amount; // Annual or unknown
}

async function downloadVTData(): Promise<string | null> {
  await mkdir(DATA_DIR, { recursive: true });

  if (existsSync(VT_DATA_FILE)) {
    console.log("  Using cached VT data file");
    return await readFile(VT_DATA_FILE, "utf-8");
  }

  console.log("  Attempting auto-download from Vermont Open Data...");
  try {
    const response = await fetch(VT_CSV_URL);
    if (response.ok) {
      const csv = await response.text();
      if (csv.length > 1000) {
        await writeFile(VT_DATA_FILE, csv);
        console.log(
          `  Downloaded ${(csv.length / 1024 / 1024).toFixed(1)}MB`
        );
        return csv;
      }
    }
    console.log(`  VT auto-download returned ${response.status}`);
  } catch (err) {
    console.log("  VT auto-download failed:", err);
  }

  console.log("  VT data download failed.");
  console.log("  To load Vermont data manually:");
  console.log(
    "    1. Visit https://data.vermont.gov/Government/State-of-Vermont-Employee-Salaries/jgqy-2smf"
  );
  console.log('    2. Click "Export" → "CSV"');
  console.log(`    3. Save as: ${VT_DATA_FILE}`);
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
  const records: VTRecord[] = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });
  console.log(`  Parsed ${records.length} records`);

  const { data: vtState } = await supabase
    .from("states")
    .select("id")
    .eq("slug", "vermont")
    .single();

  if (!vtState) {
    throw new Error("Vermont state not found. Run seed-reference.ts first.");
  }

  // Determine fiscal year from data_as_of field
  let fiscalYear = 2025;
  if (records.length > 0 && records[0].data_as_of) {
    const dateStr = records[0].data_as_of;
    const year = parseInt(dateStr.slice(0, 4), 10);
    if (year > 0) fiscalYear = year;
  }
  console.log(`  Data as of fiscal year: ${fiscalYear}`);

  const agencyCache = new Map<string, number>();
  const batchSize = 500;
  let inserted = 0;
  let skipped = 0;

  const { data: etlRun } = await supabase
    .from("etl_runs")
    .insert({
      source: "STATE_VT",
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
      const { firstName, lastName, fullName } = parseName(rec);
      const agencyName = (rec.department ?? "").trim();
      const rawSalary = parseFloat(
        (rec.salary ?? "0").replace(/[,$]/g, "")
      );
      const salaryType = rec.salary_type ?? "Annual";
      const salary = annualizeSalary(rawSalary, salaryType);

      if (!firstName || !lastName || !agencyName || salary <= 0) {
        skipped++;
        continue;
      }

      const agencyId = await ensureAgency(agencyName, agencyCache);
      const uniqueIndex = i + j;

      rows.push({
        slug: `${slugify(firstName)}-${slugify(lastName)}-vt-${uniqueIndex}`,
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
        job_title: (rec.job_title ?? "").trim() || null,
        agency_id: agencyId,
        state_id: vtState.id,
        pay_plan: "STATE",
        base_salary: salary,
        total_compensation: salary,
        fiscal_year: fiscalYear,
        duty_station: "Vermont",
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
  console.log("GovPay.Directory — Vermont Employee Salary ETL\n");

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
  }

  const startTime = Date.now();

  console.log("Step 1: Download data");
  const csvData = await downloadVTData();
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
