/**
 * GovPay.Directory — Connecticut State Employee Salary ETL
 *
 * Downloads and processes Connecticut state employee compensation data
 * from CT Open Data (data.ct.gov) and OpenPayroll.
 *
 * Data source: https://data.ct.gov/Government/State-Employee-Payroll-Data-Calendar-Year-2015-thr/9m78-yc88
 * OpenPayroll: https://openpayroll.ct.gov/
 * Socrata ID:  9m78-yc88
 *
 * Connecticut publishes individual employee names. ~50,000+ state employees.
 * Data updated bi-weekly.
 *
 * Usage: npx tsx scripts/etl-state-ct.ts
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
const CT_DATA_FILE = resolve(DATA_DIR, "ct_employees.csv");

// CT Open Data (Socrata) — SODA API with limit to avoid multi-year download
const CT_CSV_URL =
  "https://data.ct.gov/resource/9m78-yc88.csv?$limit=200000&$order=calendar_year+DESC";
const CT_PORTAL_URL =
  "https://data.ct.gov/Government/State-Employee-Payroll-Data-Calendar-Year-2015-thr/9m78-yc88";

interface CTRecord {
  "First Name"?: string;
  "Last Name"?: string;
  "Employee Name"?: string;
  Name?: string;
  Agency?: string;
  "Agency Name"?: string;
  Department?: string;
  "Job Title"?: string;
  "Job Class"?: string;
  Title?: string;
  "Annual Salary"?: string;
  "Annual Rate"?: string;
  Salary?: string;
  "Total Earnings"?: string;
  "Gross Earnings"?: string;
  "Bi-Weekly Comp Rate"?: string;
  "Calendar Year"?: string;
  Year?: string;
  [key: string]: string | undefined;
}

function parseName(rec: CTRecord): { firstName: string; lastName: string } {
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

async function downloadCTData(): Promise<string | null> {
  await mkdir(DATA_DIR, { recursive: true });

  if (existsSync(CT_DATA_FILE)) {
    console.log("  Using cached CT data file");
    return await readFile(CT_DATA_FILE, "utf-8");
  }

  console.log("  Attempting auto-download from CT Open Data...");
  try {
    const response = await fetch(CT_CSV_URL);
    if (response.ok) {
      const csv = await response.text();
      if (csv.length > 1000) {
        await writeFile(CT_DATA_FILE, csv);
        console.log(
          `  Downloaded ${(csv.length / 1024 / 1024).toFixed(1)}MB`
        );
        return csv;
      }
    }
    console.log(`  CT auto-download returned ${response.status}`);
  } catch (err) {
    console.log("  CT auto-download failed:", err);
  }

  console.log("  CT data download failed.");
  console.log("  To load Connecticut data manually:");
  console.log(`    1. Visit ${CT_PORTAL_URL}`);
  console.log('    2. Click "Export" → "CSV"');
  console.log(`    3. Save as: ${CT_DATA_FILE}`);
  console.log("    4. Re-run this script");
  console.log("");
  console.log("  Alternative: CT OpenPayroll");
  console.log("    1. Visit https://openpayroll.ct.gov/");
  console.log("    2. Export payroll data");
  console.log(`    3. Save as: ${CT_DATA_FILE}`);

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
  const records: CTRecord[] = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });
  console.log(`  Parsed ${records.length} records`);

  const { data: ctState } = await supabase
    .from("states")
    .select("id")
    .eq("slug", "connecticut")
    .single();

  if (!ctState) {
    throw new Error(
      "Connecticut state not found. Run seed-reference.ts first."
    );
  }

  const agencyCache = new Map<string, number>();
  const batchSize = 500;
  let inserted = 0;
  let skipped = 0;

  const { data: etlRun } = await supabase
    .from("etl_runs")
    .insert({
      source: "STATE_CT",
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
      // SODA API returns lowercase snake_case columns
      const firstName = (
        rec.first_name ?? rec["First Name"] ?? ""
      ).trim();
      const lastName = (
        rec.last_name ?? rec["Last Name"] ?? ""
      ).trim();
      const agencyName = (
        rec.agency ?? rec.department ?? rec["Agency Name"] ?? rec.Agency ?? rec.Department ?? ""
      ).trim();

      // Try annual_rate first, then compute from bi_weekly_comp_rate
      let salary = parseFloat(
        (
          rec.annual_rate ??
          rec["Annual Salary"] ??
          rec["Annual Rate"] ??
          rec.Salary ??
          "0"
        ).replace(/[,$]/g, "")
      );

      if (salary <= 0) {
        const biWeekly = parseFloat(
          (rec.bi_weekly_comp_rate ?? rec["Bi-Weekly Comp Rate"] ?? "0").replace(/[,$]/g, "")
        );
        if (biWeekly > 0) salary = biWeekly * 26;
      }

      const totalEarnings = parseFloat(
        (rec.tot_gross ?? rec.salaries_wages ?? rec["Total Earnings"] ?? rec["Gross Earnings"] ?? "0").replace(
          /[,$]/g,
          ""
        )
      );

      if (!firstName || !lastName || !agencyName || salary <= 0) {
        skipped++;
        continue;
      }

      const agencyId = await ensureAgency(agencyName, agencyCache);
      const fullName = `${firstName} ${lastName}`;
      const uniqueIndex = i + j;

      const yearStr = rec.calendar_year ?? rec["Calendar Year"] ?? rec.Year ?? "";
      const fiscalYear = yearStr ? parseInt(yearStr, 10) || 2024 : 2024;

      rows.push({
        slug: `${slugify(firstName)}-${slugify(lastName)}-ct-${uniqueIndex}`,
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
        job_title:
          (
            rec.job_cd_descr ?? rec["Job Title"] ?? rec["Job Class"] ?? rec.Title ?? ""
          ).trim() || null,
        agency_id: agencyId,
        state_id: ctState.id,
        pay_plan: "STATE",
        base_salary: salary,
        total_compensation: totalEarnings > 0 ? totalEarnings : salary,
        fiscal_year: fiscalYear,
        duty_station: "Connecticut",
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
  console.log("GovPay.Directory — Connecticut Employee Salary ETL\n");

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
  }

  const startTime = Date.now();

  console.log("Step 1: Download data");
  const csvData = await downloadCTData();
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
