/**
 * GovPay.Directory — Iowa State Employee Salary ETL
 *
 * Downloads and processes Iowa state employee compensation data
 * from Iowa Open Data (data.iowa.gov) via Socrata SODA API.
 *
 * Data source: https://data.iowa.gov/Government-Employees/State-of-Iowa-Salary-Book/s3p7-wy6w
 * Socrata ID:  s3p7-wy6w
 *
 * Iowa publishes individual employee names. ~50,000+ state employees per year.
 * Multi-year dataset (FY2007–present). Data updated annually.
 *
 * Usage: npx tsx scripts/etl-state-ia.ts
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
const IA_DATA_FILE = resolve(DATA_DIR, "ia_employees.csv");

// Iowa Open Data (Socrata) — SODA API
// Fetch most recent fiscal year only (limit 200k, order by fiscal_year DESC)
const IA_CSV_URL =
  "https://data.iowa.gov/resource/s3p7-wy6w.csv?$limit=200000&$order=fiscal_year+DESC";

interface IARecord {
  record_id?: string;
  fiscal_year?: string;
  department?: string;
  agency_institution?: string;
  name?: string;
  gender?: string;
  place_of_residence?: string;
  position?: string;
  base_salary?: string;
  base_salary_date?: string;
  total_salary_paid?: string;
  travel_subsistence?: string;
  [key: string]: string | undefined;
}

/**
 * Parse Iowa name format: "LASTNAME FIRSTNAME MIDDLE"
 * All caps, space-delimited, first token is last name.
 */
function parseName(rec: IARecord): {
  firstName: string;
  lastName: string;
  fullName: string;
} {
  const raw = (rec.name ?? "").trim();
  if (!raw) return { firstName: "", lastName: "", fullName: "" };

  const parts = raw.split(/\s+/);
  if (parts.length < 2) return { firstName: "", lastName: raw, fullName: raw };

  const lastName = parts[0];
  const firstName = parts[1];
  const middle = parts.slice(2).join(" ");

  // Title-case the names (they come in ALL CAPS)
  const tc = (s: string) =>
    s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

  const fn = tc(firstName);
  const ln = tc(lastName);
  const mi = middle ? ` ${tc(middle)}` : "";

  return {
    firstName: fn,
    lastName: ln,
    fullName: `${fn}${mi} ${ln}`,
  };
}

/**
 * Parse Iowa base_salary field: "87609.60 YR" or "31.62 HR"
 * Returns annualized salary.
 */
function parseSalary(raw: string): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[,$]/g, "").trim();
  const match = cleaned.match(/^([\d.]+)\s*(HR|YR)?$/i);
  if (!match) return parseFloat(cleaned) || 0;

  const amount = parseFloat(match[1]);
  const unit = (match[2] ?? "YR").toUpperCase();

  if (unit === "HR") return amount * 2080; // 40hr/week * 52 weeks
  return amount;
}

async function downloadIAData(): Promise<string | null> {
  await mkdir(DATA_DIR, { recursive: true });

  if (existsSync(IA_DATA_FILE)) {
    console.log("  Using cached IA data file");
    return await readFile(IA_DATA_FILE, "utf-8");
  }

  console.log("  Attempting auto-download from Iowa Open Data...");
  try {
    const response = await fetch(IA_CSV_URL);
    if (response.ok) {
      const csv = await response.text();
      if (csv.length > 1000) {
        await writeFile(IA_DATA_FILE, csv);
        console.log(
          `  Downloaded ${(csv.length / 1024 / 1024).toFixed(1)}MB`
        );
        return csv;
      }
    }
    console.log(`  IA auto-download returned ${response.status}`);
  } catch (err) {
    console.log("  IA auto-download failed:", err);
  }

  console.log("  IA data download failed.");
  console.log("  To load Iowa data manually:");
  console.log(
    "    1. Visit https://data.iowa.gov/Government-Employees/State-of-Iowa-Salary-Book/s3p7-wy6w"
  );
  console.log('    2. Click "Export" → "CSV"');
  console.log(`    3. Save as: ${IA_DATA_FILE}`);
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
  const records: IARecord[] = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });
  console.log(`  Parsed ${records.length} records`);

  // Find the most recent fiscal year in the data
  const maxYear = records.reduce((max, r) => {
    const y = parseInt(r.fiscal_year ?? "0", 10);
    return y > max ? y : max;
  }, 0);

  if (maxYear === 0) {
    throw new Error("No valid fiscal years found in Iowa data");
  }
  console.log(`  Most recent fiscal year: ${maxYear}`);

  // Filter to most recent year only
  const recentRecords = records.filter(
    (r) => parseInt(r.fiscal_year ?? "0", 10) === maxYear
  );
  console.log(`  Records for FY${maxYear}: ${recentRecords.length}`);

  const { data: iaState } = await supabase
    .from("states")
    .select("id")
    .eq("slug", "iowa")
    .single();

  if (!iaState) {
    throw new Error("Iowa state not found. Run seed-reference.ts first.");
  }

  const agencyCache = new Map<string, number>();
  const batchSize = 500;
  let inserted = 0;
  let skipped = 0;

  const { data: etlRun } = await supabase
    .from("etl_runs")
    .insert({
      source: "STATE_IA",
      status: "running",
      records_processed: recentRecords.length,
    })
    .select("id")
    .single();

  for (let i = 0; i < recentRecords.length; i += batchSize) {
    const batch = recentRecords.slice(i, i + batchSize);
    const rows = [];

    for (let j = 0; j < batch.length; j++) {
      const rec = batch[j];
      const { firstName, lastName, fullName } = parseName(rec);
      const agencyName = (rec.department ?? "").trim();
      const baseSalary = parseSalary(rec.base_salary ?? "");
      const totalPaid = parseFloat(
        (rec.total_salary_paid ?? "0").replace(/[,$]/g, "")
      );

      if (!firstName || !lastName || !agencyName || baseSalary <= 0) {
        skipped++;
        continue;
      }

      const agencyId = await ensureAgency(agencyName, agencyCache);
      const uniqueIndex = i + j;
      const fiscalYear = parseInt(rec.fiscal_year ?? "2025", 10);

      rows.push({
        slug: `${slugify(firstName)}-${slugify(lastName)}-ia-${uniqueIndex}`,
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
        job_title: (rec.position ?? "").trim() || null,
        agency_id: agencyId,
        state_id: iaState.id,
        pay_plan: "STATE",
        base_salary: baseSalary,
        total_compensation: totalPaid > 0 ? totalPaid : baseSalary,
        fiscal_year: fiscalYear,
        duty_station: "Iowa",
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

    if ((i + batchSize) % 10000 === 0 || i + batchSize >= recentRecords.length) {
      console.log(
        `  Progress: ${Math.min(i + batchSize, recentRecords.length)}/${recentRecords.length} (${inserted} inserted, ${skipped} skipped)`
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
  console.log("GovPay.Directory — Iowa Employee Salary ETL\n");

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
  }

  const startTime = Date.now();

  console.log("Step 1: Download data");
  const csvData = await downloadIAData();
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
