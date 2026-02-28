/**
 * GovPay.Directory — Georgia State Employee Salary ETL
 *
 * Downloads and processes Georgia state employee compensation data
 * from the Open Georgia transparency portal.
 *
 * Data source: https://open.ga.gov/download.html
 * Direct download: Salary data by year (text files in zip)
 *
 * Georgia publishes individual employee names. ~100,000+ state employees.
 *
 * Usage: npx tsx scripts/etl-state-ga.ts
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
const GA_DATA_FILE = resolve(DATA_DIR, "ga_employees.csv");
const GA_ZIP_FILE = resolve(DATA_DIR, "ga_salaries.zip");

// Open Georgia - direct download
// 2024 salary data: ~10MB zip file
const GA_CSV_URL = "https://open.ga.gov/openga/salaryTravel/download/2024_Salary.zip";

interface GARecord {
  // Georgia format: pipe-delimited or CSV
  // Typical columns: Name, Agency, Job Title, Salary
  Name?: string;
  "Employee Name"?: string;
  Agency?: string;
  "Agency Name"?: string;
  Department?: string;
  "Job Title"?: string;
  Title?: string;
  Position?: string;
  Salary?: string;
  "Annual Salary"?: string;
  "Total Salary"?: string;
  Year?: string;
  [key: string]: string | undefined;
}

async function downloadGAData(): Promise<string | null> {
  await mkdir(DATA_DIR, { recursive: true });

  if (existsSync(GA_DATA_FILE)) {
    console.log("  Using cached GA data file");
    return await readFile(GA_DATA_FILE, "utf-8");
  }

  console.log("  Attempting GA Open Data download...");
  try {
    const response = await fetch(GA_CSV_URL);
    if (response.ok) {
      const buffer = await response.arrayBuffer();
      await writeFile(GA_ZIP_FILE, Buffer.from(buffer));
      console.log(`  Downloaded ${(buffer.byteLength / 1024 / 1024).toFixed(1)}MB zip`);

      // Extract the zip file
      console.log("  Extracting zip file...");
      const AdmZip = (await import("adm-zip")).default;
      const zip = new AdmZip(GA_ZIP_FILE);
      const entries = zip.getEntries();

      for (const entry of entries) {
        if (entry.entryName.endsWith(".txt") || entry.entryName.endsWith(".csv")) {
          const content = entry.getData().toString("utf-8");
          await writeFile(GA_DATA_FILE, content);
          console.log(`  Extracted ${entry.entryName} (${(content.length / 1024 / 1024).toFixed(1)}MB)`);
          return content;
        }
      }
      console.log("  No CSV/TXT file found in zip");
    } else {
      console.log(`  GA download returned ${response.status}`);
    }
  } catch (err) {
    console.log("  GA download failed:", err);
  }

  console.log("  GA data file not found.");
  console.log("  To load Georgia data manually:");
  console.log("    1. Visit https://open.ga.gov/download.html");
  console.log("    2. Download '2024 Salary' zip file");
  console.log("    3. Extract the text file");
  console.log(`    4. Save as: ${GA_DATA_FILE}`);
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

function parseName(record: GARecord): { firstName: string; lastName: string } {
  const name = (record["Employee Name"] ?? record.Name ?? "").trim();

  // Handle "Last, First" format
  if (name.includes(",")) {
    const [last, first] = name.split(",").map((s) => s.trim());
    return { firstName: first || "", lastName: last || "" };
  }

  // Handle "First Last" format
  const parts = name.split(/\s+/);
  if (parts.length >= 2) {
    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(" "),
    };
  }

  return { firstName: name, lastName: "" };
}

async function processRecords(csvData: string) {
  console.log("  Parsing data...");

  // Georgia uses pipe-delimited format, try to detect
  const firstLine = csvData.split("\n")[0];
  const delimiter = firstLine.includes("|") ? "|" : ",";

  const records: GARecord[] = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    delimiter,
    trim: true,
  });
  console.log(`  Parsed ${records.length} records`);

  // Log sample record to debug column names
  if (records.length > 0) {
    console.log("  Sample columns:", Object.keys(records[0]).slice(0, 8));
  }

  // Get Georgia state ID
  const { data: gaState } = await supabase
    .from("states")
    .select("id")
    .eq("slug", "georgia")
    .single();

  if (!gaState) {
    throw new Error("Georgia state not found. Run seed-reference.ts first.");
  }

  const agencyCache = new Map<string, number>();
  const batchSize = 500;
  let inserted = 0;
  let skipped = 0;

  // Log ETL run
  const { data: etlRun } = await supabase
    .from("etl_runs")
    .insert({
      source: "STATE_GA",
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
      const { firstName, lastName } = parseName(rec);
      const agencyName = (
        rec["Agency Name"] ?? rec.Agency ?? rec.Department ?? ""
      ).trim();
      const salary = parseFloat(
        (rec["Annual Salary"] ?? rec["Total Salary"] ?? rec.Salary ?? "0")
          .replace(/[,$]/g, "")
      );

      if (!firstName || !lastName || !agencyName || salary <= 0) {
        skipped++;
        continue;
      }

      const agencyId = await ensureAgency(agencyName, agencyCache);
      const fullName = `${firstName} ${lastName}`;
      const uniqueIndex = i + j;

      rows.push({
        slug: `${slugify(firstName)}-${slugify(lastName)}-ga-${uniqueIndex}`,
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
        job_title: (rec["Job Title"] ?? rec.Title ?? rec.Position ?? "").trim() || null,
        agency_id: agencyId,
        state_id: gaState.id,
        pay_plan: "STATE",
        base_salary: salary,
        total_compensation: salary,
        fiscal_year: parseInt(rec.Year ?? "2024", 10),
        duty_station: "Georgia",
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
  console.log("GovPay.Directory — Georgia Employee Salary ETL\n");

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
  }

  const startTime = Date.now();

  console.log("Step 1: Download/locate data file");
  const csvData = await downloadGAData();
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
