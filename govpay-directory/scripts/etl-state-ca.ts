/**
 * GovPay.Directory — California State Employee Salary ETL
 *
 * Downloads and processes California state employee compensation data
 * from the State Controller's public pay data.
 *
 * Data source: https://publicpay.ca.gov/ (California State Controller)
 * Alternate: https://data.ca.gov/ (California Open Data Portal)
 * Socrata API: https://data.ca.gov/dataset/calhr-civil-service-demographics
 *
 * Usage: npx tsx scripts/etl-state-ca.ts
 * Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";
import { writeFile, readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";

config({ path: resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DATA_DIR = resolve(process.cwd(), "data");
const CA_DATA_FILE = resolve(DATA_DIR, "ca_employees.csv");

// California State Controller — Transparent California dataset
// This is a publicly available dataset. Adjust URL to current source.
const CA_DATA_URL =
  "https://data.ca.gov/api/3/action/datastore_search?resource_id=57da6c9a-41a7-44b0-ab91-571c6c3d4f75&limit=50000&sort=total_wages DESC";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function downloadCaliforniaData(): Promise<Record<string, string>[]> {
  await mkdir(DATA_DIR, { recursive: true });

  if (existsSync(CA_DATA_FILE)) {
    console.log("  Using cached CA data file");
    const raw = await readFile(CA_DATA_FILE, "utf-8");
    return JSON.parse(raw);
  }

  console.log("  Downloading from California Open Data...");

  // Try CKAN API first
  try {
    const response = await fetch(CA_DATA_URL);
    if (response.ok) {
      const json = await response.json();
      const records = json.result?.records ?? [];
      await writeFile(CA_DATA_FILE, JSON.stringify(records));
      console.log(`  Downloaded ${records.length} records`);
      return records;
    }
  } catch {
    console.log("  CKAN API unavailable, trying CSV fallback...");
  }

  // Fallback: generate instructions
  console.log("  Could not auto-download CA data.");
  console.log("  Manual download instructions:");
  console.log("  1. Visit https://publicpay.ca.gov/");
  console.log("  2. Select 'State' as the entity type");
  console.log("  3. Export the results as CSV");
  console.log(`  4. Save as ${CA_DATA_FILE}`);
  console.log("  5. Re-run this script");
  return [];
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

async function processRecords(records: Record<string, string>[]) {
  if (records.length === 0) {
    console.log("  No records to process");
    return { inserted: 0, skipped: 0 };
  }

  console.log(`  Processing ${records.length} records...`);

  // Get California state ID
  const { data: caState } = await supabase
    .from("states")
    .select("id")
    .eq("slug", "california")
    .single();

  if (!caState) {
    throw new Error("California state not found. Run seed-reference.ts first.");
  }

  const agencyCache = new Map<string, number>();
  const batchSize = 500;
  let inserted = 0;
  let skipped = 0;

  // Log ETL run
  const { data: etlRun } = await supabase
    .from("etl_runs")
    .insert({
      source: "STATE_CA",
      status: "running",
      records_processed: records.length,
    })
    .select("id")
    .single();

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const rows = [];

    for (const rec of batch) {
      // Field names vary by dataset — common patterns:
      const firstName = (rec.first_name ?? rec.FirstName ?? rec["First Name"] ?? "").trim();
      const lastName = (rec.last_name ?? rec.LastName ?? rec["Last Name"] ?? "").trim();
      const agency = (rec.department ?? rec.Department ?? rec.agency_name ?? rec["Department"] ?? "").trim();
      const jobTitle = (rec.position ?? rec.Position ?? rec.classification ?? rec["Classification"] ?? "").trim();
      const salary = parseFloat(
        rec.total_wages ?? rec.TotalWages ?? rec.total_pay ?? rec["Total Wages"] ?? "0"
      );
      const basePay = parseFloat(
        rec.regular_pay ?? rec.RegularPay ?? rec["Regular Pay"] ?? String(salary)
      );

      if (!firstName || !lastName || !agency || salary <= 0) {
        skipped++;
        continue;
      }

      const agencyId = await ensureAgency(agency, agencyCache);
      const externalId = `ca-${slugify(firstName)}-${slugify(lastName)}-${i}`;

      rows.push({
        external_id: externalId,
        slug: `${slugify(firstName)}-${slugify(lastName)}-${externalId}`,
        first_name: firstName,
        last_name: lastName,
        job_title: jobTitle || null,
        agency_id: agencyId,
        state_id: caState.id,
        pay_plan: "STATE",
        base_salary: basePay,
        total_compensation: salary,
        fiscal_year: 2025,
        data_source: "STATE_CA",
        duty_station: "California",
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

async function main() {
  console.log("GovPay.Directory — California Employee Salary ETL\n");

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
  }

  const startTime = Date.now();

  console.log("Step 1: Download data");
  const records = await downloadCaliforniaData();

  console.log("\nStep 2: Process and load records");
  const { inserted, skipped } = await processRecords(records);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\nDone in ${elapsed}s`);
  console.log(`  Records inserted: ${inserted}`);
  console.log(`  Records skipped: ${skipped}`);
}

main().catch((err) => {
  console.error("ETL failed:", err);
  process.exit(1);
});
