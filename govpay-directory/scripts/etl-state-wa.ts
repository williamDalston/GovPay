/**
 * GovPay.Directory — Washington State Employee Salary ETL
 *
 * Downloads and processes Washington state employee compensation data
 * from fiscal.wa.gov (Office of Financial Management).
 *
 * Data source: https://fiscal.wa.gov/Staffing/Salaries
 * FAQ:         https://fiscal.wa.gov/staffing/SalaryDataFAQ.pdf
 *
 * Washington publishes individual employee names (except protected workers).
 * ~65,000+ state employees. Updated annually (early summer).
 *
 * Usage: npx tsx scripts/etl-state-wa.ts
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
const WA_DATA_FILE = resolve(DATA_DIR, "wa_employees.csv");

const WA_PORTAL_URL = "https://fiscal.wa.gov/Staffing/Salaries";

interface WARecord {
  "First Name"?: string;
  "Last Name"?: string;
  "Middle Name"?: string;
  "Employee Name"?: string;
  Name?: string;
  Agency?: string;
  "Agency Name"?: string;
  Department?: string;
  "Job Title"?: string;
  "Job Class"?: string;
  "Class Title"?: string;
  Title?: string;
  "Annual Salary"?: string;
  Salary?: string;
  "Total Earnings"?: string;
  "Gross Earnings"?: string;
  Year?: string;
  "Calendar Year"?: string;
  [key: string]: string | undefined;
}

function parseName(rec: WARecord): { firstName: string; lastName: string } {
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

async function downloadWAData(): Promise<string | null> {
  await mkdir(DATA_DIR, { recursive: true });

  if (existsSync(WA_DATA_FILE)) {
    console.log("  Using cached WA data file");
    return await readFile(WA_DATA_FILE, "utf-8");
  }

  console.log("  WA data file not found.");
  console.log("  To load Washington data:");
  console.log(`    1. Visit ${WA_PORTAL_URL}`);
  console.log('    2. Click "Download Data" (provides email link)');
  console.log("    3. Download the full CSV from the emailed link");
  console.log(`    4. Save as: ${WA_DATA_FILE}`);
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
  const records: WARecord[] = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });
  console.log(`  Parsed ${records.length} records`);

  const { data: waState } = await supabase
    .from("states")
    .select("id")
    .eq("slug", "washington")
    .single();

  if (!waState) {
    throw new Error("Washington state not found. Run seed-reference.ts first.");
  }

  const agencyCache = new Map<string, number>();
  const batchSize = 500;
  let inserted = 0;
  let skipped = 0;

  const { data: etlRun } = await supabase
    .from("etl_runs")
    .insert({
      source: "STATE_WA",
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
      const middleName = (rec["Middle Name"] ?? "").trim();
      const agencyName = (
        rec["Agency Name"] ?? rec.Agency ?? rec.Department ?? ""
      ).trim();

      const annualSalary = parseFloat(
        (rec["Annual Salary"] ?? rec.Salary ?? "0").replace(/[,$]/g, "")
      );
      const totalEarnings = parseFloat(
        (rec["Total Earnings"] ?? rec["Gross Earnings"] ?? "0").replace(
          /[,$]/g,
          ""
        )
      );
      const salary = annualSalary > 0 ? annualSalary : totalEarnings;

      if (!firstName || !lastName || !agencyName || salary <= 0) {
        skipped++;
        continue;
      }

      const agencyId = await ensureAgency(agencyName, agencyCache);
      const fullName = middleName
        ? `${firstName} ${middleName} ${lastName}`
        : `${firstName} ${lastName}`;
      const uniqueIndex = i + j;

      const yearStr = rec["Calendar Year"] ?? rec.Year ?? "";
      const fiscalYear = yearStr ? parseInt(yearStr, 10) || 2024 : 2024;

      rows.push({
        slug: `${slugify(firstName)}-${slugify(lastName)}-wa-${uniqueIndex}`,
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
        job_title:
          (
            rec["Job Title"] ??
            rec["Class Title"] ??
            rec["Job Class"] ??
            rec.Title ??
            ""
          ).trim() || null,
        agency_id: agencyId,
        state_id: waState.id,
        pay_plan: "STATE",
        base_salary: salary,
        total_compensation: totalEarnings > 0 ? totalEarnings : salary,
        fiscal_year: fiscalYear,
        duty_station: "Washington",
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
  console.log("GovPay.Directory — Washington Employee Salary ETL\n");

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
  }

  const startTime = Date.now();

  console.log("Step 1: Locate data file");
  const csvData = await downloadWAData();
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
