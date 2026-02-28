/**
 * GovPay.Directory — Wisconsin State Employee Salary ETL
 *
 * Processes Wisconsin state employee compensation data from
 * the Wisconsin Legislative Fiscal Bureau or DER.
 *
 * Data source: https://doa.wi.gov/Pages/StateFinances/OpenBook.aspx
 * Alternative: https://legis.wisconsin.gov/lfb/
 *
 * Wisconsin publishes individual employee names. ~40,000+ state employees.
 *
 * Usage: npx tsx scripts/etl-state-wi.ts
 * Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";
import { parse } from "csv-parse/sync";
import { readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { slugify } from "../src/lib/slugify";

config({ path: resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DATA_DIR = resolve(process.cwd(), "data");
const WI_DATA_FILE = resolve(DATA_DIR, "wi_employees.csv");

// Wisconsin DOA OpenBook - manual download
const WI_PORTAL_URL = "https://doa.wi.gov/Pages/StateFinances/OpenBook.aspx";

interface WIRecord {
  "First Name"?: string;
  "Last Name"?: string;
  Name?: string;
  "Employee Name"?: string;
  Agency?: string;
  "Agency Name"?: string;
  Department?: string;
  "Job Title"?: string;
  "Class Title"?: string;
  Title?: string;
  Position?: string;
  Salary?: string;
  "Annual Salary"?: string;
  "Base Salary"?: string;
  Year?: string;
  [key: string]: string | undefined;
}

async function downloadWIData(): Promise<string | null> {
  await mkdir(DATA_DIR, { recursive: true });

  if (existsSync(WI_DATA_FILE)) {
    console.log("  Using cached WI data file");
    return await readFile(WI_DATA_FILE, "utf-8");
  }

  console.log("  WI data file not found.");
  console.log("  To load Wisconsin data:");
  console.log(`    1. Visit ${WI_PORTAL_URL}`);
  console.log("    2. Navigate to Employee Compensation data");
  console.log("    3. Export/download as CSV");
  console.log(`    4. Save as: ${WI_DATA_FILE}`);
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

function parseName(record: WIRecord): { firstName: string; lastName: string } {
  if (record["First Name"] && record["Last Name"]) {
    return {
      firstName: record["First Name"].trim(),
      lastName: record["Last Name"].trim(),
    };
  }

  const name = (record["Employee Name"] ?? record.Name ?? "").trim();
  if (name.includes(",")) {
    const [last, first] = name.split(",").map((s) => s.trim());
    return { firstName: first || "", lastName: last || "" };
  }

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
  console.log("  Parsing CSV...");
  const records: WIRecord[] = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });
  console.log(`  Parsed ${records.length} records`);

  if (records.length > 0) {
    console.log("  Sample columns:", Object.keys(records[0]).slice(0, 8));
  }

  // Get Wisconsin state ID
  const { data: wiState } = await supabase
    .from("states")
    .select("id")
    .eq("slug", "wisconsin")
    .single();

  if (!wiState) {
    throw new Error("Wisconsin state not found. Run seed-reference.ts first.");
  }

  const agencyCache = new Map<string, number>();
  const batchSize = 500;
  let inserted = 0;
  let skipped = 0;

  // Log ETL run
  const { data: etlRun } = await supabase
    .from("etl_runs")
    .insert({
      source: "STATE_WI",
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
        (rec["Annual Salary"] ?? rec.Salary ?? rec["Base Salary"] ?? "0")
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
        slug: `${slugify(firstName)}-${slugify(lastName)}-wi-${uniqueIndex}`,
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
        job_title: (rec["Job Title"] ?? rec["Class Title"] ?? rec.Title ?? rec.Position ?? "").trim() || null,
        agency_id: agencyId,
        state_id: wiState.id,
        pay_plan: "STATE",
        base_salary: salary,
        total_compensation: salary,
        fiscal_year: parseInt(rec.Year ?? "2024", 10),
        duty_station: "Wisconsin",
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
  console.log("GovPay.Directory — Wisconsin Employee Salary ETL\n");

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
  }

  const startTime = Date.now();

  console.log("Step 1: Locate data file");
  const csvData = await downloadWIData();
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
