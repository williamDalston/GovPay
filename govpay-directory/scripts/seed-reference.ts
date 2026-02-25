/**
 * Seed reference data into Supabase: states, GS pay scales, locality areas.
 * Idempotent via ON CONFLICT DO UPDATE.
 *
 * Usage: npx tsx scripts/seed-reference.ts
 * Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// -- States --
const STATES = [
  { name: "Alabama", slug: "alabama", abbreviation: "AL" },
  { name: "Alaska", slug: "alaska", abbreviation: "AK" },
  { name: "Arizona", slug: "arizona", abbreviation: "AZ" },
  { name: "Arkansas", slug: "arkansas", abbreviation: "AR" },
  { name: "California", slug: "california", abbreviation: "CA" },
  { name: "Colorado", slug: "colorado", abbreviation: "CO" },
  { name: "Connecticut", slug: "connecticut", abbreviation: "CT" },
  { name: "Delaware", slug: "delaware", abbreviation: "DE" },
  { name: "Florida", slug: "florida", abbreviation: "FL" },
  { name: "Georgia", slug: "georgia", abbreviation: "GA" },
  { name: "Hawaii", slug: "hawaii", abbreviation: "HI" },
  { name: "Idaho", slug: "idaho", abbreviation: "ID" },
  { name: "Illinois", slug: "illinois", abbreviation: "IL" },
  { name: "Indiana", slug: "indiana", abbreviation: "IN" },
  { name: "Iowa", slug: "iowa", abbreviation: "IA" },
  { name: "Kansas", slug: "kansas", abbreviation: "KS" },
  { name: "Kentucky", slug: "kentucky", abbreviation: "KY" },
  { name: "Louisiana", slug: "louisiana", abbreviation: "LA" },
  { name: "Maine", slug: "maine", abbreviation: "ME" },
  { name: "Maryland", slug: "maryland", abbreviation: "MD" },
  { name: "Massachusetts", slug: "massachusetts", abbreviation: "MA" },
  { name: "Michigan", slug: "michigan", abbreviation: "MI" },
  { name: "Minnesota", slug: "minnesota", abbreviation: "MN" },
  { name: "Mississippi", slug: "mississippi", abbreviation: "MS" },
  { name: "Missouri", slug: "missouri", abbreviation: "MO" },
  { name: "Montana", slug: "montana", abbreviation: "MT" },
  { name: "Nebraska", slug: "nebraska", abbreviation: "NE" },
  { name: "Nevada", slug: "nevada", abbreviation: "NV" },
  { name: "New Hampshire", slug: "new-hampshire", abbreviation: "NH" },
  { name: "New Jersey", slug: "new-jersey", abbreviation: "NJ" },
  { name: "New Mexico", slug: "new-mexico", abbreviation: "NM" },
  { name: "New York", slug: "new-york", abbreviation: "NY" },
  { name: "North Carolina", slug: "north-carolina", abbreviation: "NC" },
  { name: "North Dakota", slug: "north-dakota", abbreviation: "ND" },
  { name: "Ohio", slug: "ohio", abbreviation: "OH" },
  { name: "Oklahoma", slug: "oklahoma", abbreviation: "OK" },
  { name: "Oregon", slug: "oregon", abbreviation: "OR" },
  { name: "Pennsylvania", slug: "pennsylvania", abbreviation: "PA" },
  { name: "Rhode Island", slug: "rhode-island", abbreviation: "RI" },
  { name: "South Carolina", slug: "south-carolina", abbreviation: "SC" },
  { name: "South Dakota", slug: "south-dakota", abbreviation: "SD" },
  { name: "Tennessee", slug: "tennessee", abbreviation: "TN" },
  { name: "Texas", slug: "texas", abbreviation: "TX" },
  { name: "Utah", slug: "utah", abbreviation: "UT" },
  { name: "Vermont", slug: "vermont", abbreviation: "VT" },
  { name: "Virginia", slug: "virginia", abbreviation: "VA" },
  { name: "Washington", slug: "washington", abbreviation: "WA" },
  { name: "West Virginia", slug: "west-virginia", abbreviation: "WV" },
  { name: "Wisconsin", slug: "wisconsin", abbreviation: "WI" },
  { name: "Wyoming", slug: "wyoming", abbreviation: "WY" },
  { name: "District of Columbia", slug: "district-of-columbia", abbreviation: "DC" },
];

// -- GS Pay Scale 2025 --
const GS_PAY: Record<number, number[]> = {
  1: [21986, 22719, 23449, 24175, 24905, 25392, 26115, 26844, 26873, 27556],
  2: [24727, 25313, 26131, 26873, 27187, 27984, 28781, 29578, 30375, 31172],
  3: [26979, 27878, 28777, 29676, 30575, 31474, 32373, 33272, 34171, 35070],
  4: [30282, 31291, 32300, 33309, 34318, 35327, 36336, 37345, 38354, 39363],
  5: [33878, 35007, 36136, 37265, 38394, 39523, 40652, 41781, 42910, 44039],
  6: [37749, 39007, 40265, 41523, 42781, 44039, 45297, 46555, 47813, 49071],
  7: [41925, 43322, 44719, 46116, 47513, 48910, 50307, 51704, 53101, 54498],
  8: [46370, 47916, 49462, 51008, 52554, 54100, 55646, 57192, 58738, 60284],
  9: [51115, 52819, 54523, 56227, 57931, 59635, 61339, 63043, 64747, 66451],
  10: [56297, 58173, 60049, 61925, 63801, 65677, 67553, 69429, 71305, 73181],
  11: [61764, 63822, 65880, 67938, 69996, 72054, 74112, 76170, 78228, 80286],
  12: [74009, 76476, 78943, 81410, 83877, 86344, 88811, 91278, 93745, 96212],
  13: [88012, 90946, 93880, 96814, 99748, 102682, 105616, 108550, 111484, 114418],
  14: [103994, 107461, 110928, 114395, 117862, 121329, 124796, 128263, 131730, 135197],
  15: [122319, 126396, 130473, 134550, 138627, 142704, 146781, 150858, 154935, 159012],
};

// -- Locality Areas --
const LOCALITIES = [
  { slug: "rest-of-us", name: "Rest of US", adjustment_rate: 1.0 },
  { slug: "washington-dc", name: "Washington-Baltimore-Arlington, DC-MD-VA-WV-PA", adjustment_rate: 1.3275 },
  { slug: "san-francisco", name: "San Francisco-San Jose-Oakland, CA", adjustment_rate: 1.4472 },
  { slug: "new-york", name: "New York-Newark-Jersey City, NY-NJ-CT-PA", adjustment_rate: 1.3614 },
  { slug: "los-angeles", name: "Los Angeles-Long Beach, CA", adjustment_rate: 1.3449 },
  { slug: "chicago", name: "Chicago-Naperville, IL-IN-WI", adjustment_rate: 1.2959 },
  { slug: "houston", name: "Houston-The Woodlands, TX", adjustment_rate: 1.3419 },
  { slug: "dallas", name: "Dallas-Fort Worth, TX-OK", adjustment_rate: 1.2724 },
  { slug: "seattle", name: "Seattle-Tacoma, WA", adjustment_rate: 1.3401 },
  { slug: "boston", name: "Boston-Worcester-Providence, MA-RI-NH-ME", adjustment_rate: 1.3117 },
  { slug: "denver", name: "Denver-Aurora, CO", adjustment_rate: 1.2881 },
  { slug: "atlanta", name: "Atlanta-Athens-Clarke County, GA-AL", adjustment_rate: 1.2615 },
  { slug: "philadelphia", name: "Philadelphia-Reading-Camden, PA-NJ-DE-MD", adjustment_rate: 1.2613 },
  { slug: "detroit", name: "Detroit-Warren-Ann Arbor, MI", adjustment_rate: 1.2921 },
  { slug: "miami", name: "Miami-Fort Lauderdale-Port St. Lucie, FL", adjustment_rate: 1.254 },
];

async function seedStates() {
  console.log("Seeding states...");
  const { error } = await supabase.from("states").upsert(
    STATES.map((s) => ({
      slug: s.slug,
      name: s.name,
      abbreviation: s.abbreviation,
    })),
    { onConflict: "slug" }
  );
  if (error) throw error;
  console.log(`  ${STATES.length} states upserted`);
}

async function seedGSPayScales() {
  console.log("Seeding GS pay scales...");
  const rows: { fiscal_year: number; grade: number; step: number; base_pay: number }[] = [];
  for (const [grade, steps] of Object.entries(GS_PAY)) {
    steps.forEach((pay, i) => {
      rows.push({ fiscal_year: 2025, grade: parseInt(grade), step: i + 1, base_pay: pay });
    });
  }
  const { error } = await supabase.from("gs_pay_scales").upsert(rows, {
    onConflict: "fiscal_year,grade,step",
  });
  if (error) throw error;
  console.log(`  ${rows.length} pay scale entries upserted`);
}

async function seedLocalityAreas() {
  console.log("Seeding locality areas...");
  const { error } = await supabase.from("locality_areas").upsert(
    LOCALITIES.map((l) => ({ ...l, fiscal_year: 2025 })),
    { onConflict: "slug,fiscal_year" }
  );
  if (error) throw error;
  console.log(`  ${LOCALITIES.length} locality areas upserted`);
}

async function main() {
  console.log("GovPay.Directory — Seed Reference Data\n");

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
  }

  await seedStates();
  await seedGSPayScales();
  await seedLocalityAreas();

  console.log("\nDone! Reference data seeded successfully.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
