/**
 * GovPay.Directory — Michigan State Employee Salary ETL
 *
 * Downloads and processes Michigan state employee compensation data
 * from Open Michigan Transparency and the Mackinac Center database.
 *
 * Data source: https://transparency.michigan.gov/
 * Mackinac:    https://www.mackinac.org/salaries
 *
 * Michigan publishes individual employee names. ~50,000+ state employees.
 *
 * Usage: npx tsx scripts/etl-state-mi.ts
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
const MI_DATA_FILE = resolve(DATA_DIR, "mi_employees.csv");

const MI_PORTAL_URL = "https://transparency.michigan.gov/";

interface MIRecord {
  "First Name"?: string;
  "Last Name"?: string;
  "Employee Name"?: string;
  Name?: string;
  Agency?: string;
  "Agency Name"?: string;
  Department?: string;
  Title?: string;
  "Job Title"?: string;
  "Class Title"?: string;
  "Position Title"?: string;
  "Annual Salary"?: string;
  Salary?: string;
  "Total Pay"?: string;
  "Gross Pay"?: string;
  Year?: string;
  "Calendar Year"?: string;
  [key: string]: string | undefined;
}

function parseName(rec: MIRecord): { firstName: string; lastName: string } {
  const first = (rec["First Name"] ?? "").trim();
  const last = (rec["Last Name"] ?? "").trim();
  if (first && last) return { firstName: first, lastName: last };

  const combined = (rec["Employee Name"] ?? rec.Name ?? "").trim();
  if (!combined) return { firstName: "", lastName: "" };

  if (combined.includes(",")) {
    const [ln, fn] = combined.split(",").map((s) => s.trim());
    return { firstName: fn || "", lastName: ln || "" };
  }

  const parts = combined.split(/\s+/);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || "",
  };
}

async function downloadMIData(): Promise<string | null> {
  await mkdir(DATA_DIR, { recursive: true });

  if (existsSync(MI_DATA_FILE)) {
    console.log("  Using cached MI data file");
    return await readFile(MI_DATA_FILE, "utf-8");
  }

  console.log("  MI data file not found.");
  console.log("  To load Michigan data:");
  console.log(`    1. Visit ${MI_PORTAL_URL}`);
  console.log("    2. Navigate to Employee Compensation data");
  console.log("    3. Export/download as CSV");
  console.log(`    4. Save as: ${MI_DATA_FILE}`);
  console.log("    5. Re-run this script");
  console.log("");
  console.log("  Alternative: Mackinac Center");
  console.log("    1. Visit https://www.mackinac.org/salaries");
  console.log("    2. Search for state employees and export");
  console.log(`    3. Save as: ${MI_DATA_FILE}`);

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
  const records: MIRecord[] = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });
  console.log(`  Parsed ${records.length} records`);

  const { data: miState } = await supabase
    .from("states")
    .select("id")
    .eq("slug", "michigan")
    .single();

  if (!miState) {
    throw new Error("Michigan state not found. Run seed-reference.ts first.");
  }

  const agencyCache = new Map<string, number>();
  const batchSize = 500;
  let inserted = 0;
  let skipped = 0;

  const { data: etlRun } = await supabase
    .from("etl_runs")
    .insert({
      source: "STATE_MI",
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
        (
          rec["Annual Salary"] ??
          rec.Salary ??
          rec["Total Pay"] ??
          rec["Gross Pay"] ??
          "0"
        ).replace(/[,$]/g, "")
      );

      if (!firstName || !lastName || !agencyName || salary <= 0) {
        skipped++;
        continue;
      }

      const agencyId = await ensureAgency(agencyName, agencyCache);
      const fullName = `${firstName} ${lastName}`;
      const uniqueIndex = i + j;

      const yearStr = rec["Calendar Year"] ?? rec.Year ?? "";
      const fiscalYear = yearStr ? parseInt(yearStr, 10) || 2024 : 2024;

      rows.push({
        slug: `${slugify(firstName)}-${slugify(lastName)}-mi-${uniqueIndex}`,
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
        job_title:
          (
            rec["Job Title"] ??
            rec["Class Title"] ??
            rec["Position Title"] ??
            rec.Title ??
            ""
          ).trim() || null,
        agency_id: agencyId,
        state_id: miState.id,
        pay_plan: "STATE",
        base_salary: salary,
        total_compensation: salary,
        fiscal_year: fiscalYear,
        duty_station: "Michigan",
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
  console.log("GovPay.Directory — Michigan Employee Salary ETL\n");

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
  }

  const startTime = Date.now();

  console.log("Step 1: Locate data file");
  const csvData = await downloadMIData();
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
