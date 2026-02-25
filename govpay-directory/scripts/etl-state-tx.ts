/**
 * GovPay.Directory — Texas State Employee Salary ETL
 *
 * Downloads and processes Texas state employee compensation data
 * from the Texas Comptroller's Open Data portal.
 *
 * Data source: https://data.texas.gov/ (Texas Open Data Portal)
 * Dataset: State Employee Compensation
 *
 * Usage: npx tsx scripts/etl-state-tx.ts
 * Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";
import { parse } from "csv-parse/sync";
import { writeFile, readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";

config({ path: resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DATA_DIR = resolve(process.cwd(), "data");
const TX_DATA_FILE = resolve(DATA_DIR, "tx_employees.csv");

// Texas Comptroller Socrata Open Data API
// Public dataset — no API key required for small requests
const TX_SOCRATA_URL =
  "https://data.texas.gov/resource/mzg3-ywn2.csv?$limit=50000&$order=annual_salary DESC";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function downloadTexasData(): Promise<string> {
  await mkdir(DATA_DIR, { recursive: true });

  if (existsSync(TX_DATA_FILE)) {
    console.log("  Using cached TX data file");
    return await readFile(TX_DATA_FILE, "utf-8");
  }

  console.log("  Downloading from Texas Open Data Portal...");
  const response = await fetch(TX_SOCRATA_URL);
  if (!response.ok) {
    throw new Error(`TX download failed: ${response.status} ${response.statusText}`);
  }

  const csv = await response.text();
  await writeFile(TX_DATA_FILE, csv);
  console.log(`  Downloaded ${(csv.length / 1024 / 1024).toFixed(1)}MB`);
  return csv;
}

interface TXRecord {
  first_name?: string;
  last_name?: string;
  agency_name?: string;
  class_title?: string;
  annual_salary?: string;
  ethnicity?: string;
  gender?: string;
  [key: string]: string | undefined;
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
  const records: TXRecord[] = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });
  console.log(`  Parsed ${records.length} records`);

  // Get Texas state ID
  const { data: texasState } = await supabase
    .from("states")
    .select("id")
    .eq("slug", "texas")
    .single();

  if (!texasState) {
    throw new Error("Texas state not found. Run seed-reference.ts first.");
  }

  const agencyCache = new Map<string, number>();
  const batchSize = 500;
  let inserted = 0;
  let skipped = 0;

  // Log ETL run
  const { data: etlRun } = await supabase
    .from("etl_runs")
    .insert({
      source: "STATE_TX",
      status: "running",
      records_processed: records.length,
    })
    .select("id")
    .single();

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const rows = [];

    for (const rec of batch) {
      const firstName = (rec.first_name ?? "").trim();
      const lastName = (rec.last_name ?? "").trim();
      const agencyName = (rec.agency_name ?? "").trim();
      const salary = parseFloat(rec.annual_salary ?? "0");

      if (!firstName || !lastName || !agencyName || salary <= 0) {
        skipped++;
        continue;
      }

      const agencyId = await ensureAgency(agencyName, agencyCache);
      const externalId = `tx-${slugify(firstName)}-${slugify(lastName)}-${i}`;

      rows.push({
        external_id: externalId,
        slug: `${slugify(firstName)}-${slugify(lastName)}-${externalId}`,
        first_name: firstName,
        last_name: lastName,
        job_title: (rec.class_title ?? "").trim() || null,
        agency_id: agencyId,
        state_id: texasState.id,
        pay_plan: "STATE",
        base_salary: salary,
        total_compensation: salary,
        fiscal_year: 2025,
        data_source: "STATE_TX",
        duty_station: "Texas",
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

    if ((i + batchSize) % 5000 === 0 || i + batchSize >= records.length) {
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
  console.log("  Refreshing materialized views...");
  // Update agency stats
  const { error } = await supabase.rpc("refresh_agency_stats");
  if (error) {
    console.log("  (agency_stats view refresh requires manual SQL — run REFRESH MATERIALIZED VIEW agency_stats;)");
  }
}

async function main() {
  console.log("GovPay.Directory — Texas Employee Salary ETL\n");

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
  }

  const startTime = Date.now();

  console.log("Step 1: Download data");
  const csvData = await downloadTexasData();

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
