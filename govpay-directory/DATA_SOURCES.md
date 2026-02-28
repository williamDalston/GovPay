# GovPay.Directory — Data Sources

## Current Data Coverage

| State | Records | Named Individuals | Source |
|-------|---------|-------------------|--------|
| Texas | ~155,000 | ✅ Yes | Texas Tribune |
| California | ~270,000 | ❌ Anonymous | CA State Controller |
| New York | ~877,000 | ✅ Yes | NY Open Data |

**Total searchable records: ~1.3 million**

---

## Available ETL Scripts

### Tier 1 — High Population (scripts ready)

| State | Est. Records | Data Source | Script | Download |
|-------|--------------|-------------|--------|----------|
| **New York** | ~877,000 | [NY Open Data](https://data.ny.gov/Transparency/Salary-Information-for-State-Authorities/unag-2p27) | `etl-state-ny.ts` | ✅ Auto |
| **Florida** | ~180,000 | [FL Right to Know](https://floridahasarighttoknow.myflorida.com/search_state_payroll) | `etl-state-fl.ts` | Manual |
| **Pennsylvania** | ~80,000 | [PennWATCH](https://pennwatch.pa.gov/Employees/Salaries) | `etl-state-pa.ts` | Manual |

### Tier 2 — Medium Population (scripts ready)

| State | Est. Records | Data Source | Script | Download |
|-------|--------------|-------------|--------|----------|
| **Illinois** | ~60,000 | [IL Comptroller](https://salary.illinoiscomptroller.gov/) | `etl-state-il.ts` | Manual |
| **Ohio** | ~50,000 | [Ohio Checkbook](https://checkbook.ohio.gov/) | `etl-state-oh.ts` | Manual |
| **Georgia** | ~100,000 | [Open Georgia](https://open.ga.gov/download.html) | `etl-state-ga.ts` | Manual |
| **Minnesota** | ~55,000 | [MN MMB](https://mn.gov/mmb/transparency-mn/payrolldata.jsp) | `etl-state-mn.ts` | Manual |
| **Arizona** | ~55,000 | [AZ OpenBooks](https://openbooks.az.gov/) | `etl-state-az.ts` | Manual |
| **Wisconsin** | ~40,000 | [WI DOA](https://doa.wi.gov/Pages/StateFinances/OpenBook.aspx) | `etl-state-wi.ts` | Manual |

### Scripts from Other Agent (10 states + DC)

| State | Est. Records | Script | Download |
|-------|--------------|--------|----------|
| DC | ~35,000 | `etl-state-dc.ts` | Auto (ArcGIS) |
| Virginia | ~120,000 | `etl-state-va.ts` | Auto (Socrata) |
| New Jersey | ~70,000 | `etl-state-nj.ts` | Auto (CSV) |
| Massachusetts | ~80,000 | `etl-state-ma.ts` | Manual |
| North Carolina | ~85,000 | `etl-state-nc.ts` | Manual |
| Maryland | ~80,000 | `etl-state-md.ts` | Manual |
| Washington | ~65,000 | `etl-state-wa.ts` | Manual |
| Colorado | ~60,000 | `etl-state-co.ts` | Manual |
| Connecticut | ~50,000 | `etl-state-ct.ts` | Auto (Socrata) |
| Michigan | ~50,000 | `etl-state-mi.ts` | Manual |

### Tier 3 — Auto-Download via Socrata API (2 states)

| State | Est. Records | Data Source | Script | Download |
|-------|--------------|-------------|--------|----------|
| **Iowa** | ~50,000/yr | [IA Open Data](https://data.iowa.gov/Government-Employees/State-of-Iowa-Salary-Book/s3p7-wy6w) | `etl-state-ia.ts` | ✅ Auto (Socrata) |
| **Vermont** | ~10,000 | [VT Open Data](https://data.vermont.gov/Government/State-of-Vermont-Employee-Salaries/jgqy-2smf) | `etl-state-vt.ts` | ✅ Auto (Socrata) |

### States Without Scripts Yet

| State | Est. Records | Data Source |
|-------|--------------|-------------|
| Indiana | ~35,000 | [IN Gateway](https://gateway.ifionline.org/) |
| Tennessee | ~45,000 | [TN Comptroller](https://comptroller.tn.gov/) |
| Missouri | ~50,000 | [MO Accountability](https://mapyourtaxes.mo.gov/) |
| Oregon | ~40,000 | [OR Transparency](https://www.oregon.gov/transparency/) |
| Nevada | ~25,000 | [NV Open Gov](https://open.nv.gov/) |

---

## How to Load Data

### Automatic Download

```bash
# New York — auto-downloads from NY Open Data (877K records)
npx tsx scripts/etl-state-ny.ts

# Texas — auto-downloads from Texas Tribune
npx tsx scripts/etl-state-tx.ts

# DC, VA, NJ, CT — auto-download (from other agent scripts)
npx tsx scripts/etl-state-dc.ts
npx tsx scripts/etl-state-va.ts
npx tsx scripts/etl-state-nj.ts
npx tsx scripts/etl-state-ct.ts

# Iowa, Vermont — auto-download (Socrata SODA API)
npx tsx scripts/etl-state-ia.ts
npx tsx scripts/etl-state-vt.ts
```

### Manual Download Required

For states with manual download:

1. Visit the data source URL listed above
2. Export/download as CSV (or Excel, then convert to CSV)
3. Save to `data/` folder with the expected filename:
   - `data/fl_employees.csv`
   - `data/pa_employees.csv`
   - `data/il_employees.csv`
   - `data/oh_employees.csv`
   - `data/ga_employees.csv`
   - `data/mn_employees.csv`
   - `data/az_employees.csv`
   - `data/wi_employees.csv`
4. Run the ETL script:

```bash
npx tsx scripts/etl-state-fl.ts
npx tsx scripts/etl-state-pa.ts
npx tsx scripts/etl-state-il.ts
npx tsx scripts/etl-state-oh.ts
npx tsx scripts/etl-state-ga.ts
npx tsx scripts/etl-state-mn.ts
npx tsx scripts/etl-state-az.ts
npx tsx scripts/etl-state-wi.ts
```

---

## Federal Data

### Current: OPM FedScope (Aggregate Only)

The `etl-opm.ts` script loads **aggregate statistics** from OPM FedScope:
- Employee counts per agency
- Average salaries per agency

**Limitation:** FedScope does NOT publish individual employee names.

```bash
npx tsx scripts/etl-opm.ts
```

### Future: Individual Federal Records

OPM does publish some individual-level data through:
- **FedScope Employment Cubes** — anonymized but includes grade/step/location
- **USAJobs API** — job postings with salary ranges (not actual employees)

For named federal employees, the best sources are:
- **White House Staff Salaries** — published annually (~500 records)
- **Congressional Staff** — via LegiStorm or official disclosures
- **Senior Executive Service (SES)** — some agencies publish

---

## Data Quality Notes

### Named vs Anonymous Records

- **Named records** (TX, NY, FL, etc.) are high-value for SEO — people search for specific names
- **Anonymous records** (CA) still provide value for aggregate stats and job title searches

### Deduplication

Most ETL scripts use `slug` as a unique key with `upsert` to handle:
- Re-running the same data (idempotent)
- Employees appearing in multiple years

### Fiscal Year

Each record includes `fiscal_year` to track data freshness. Most state portals update annually.

---

## Expanding Coverage

To add a new state:

1. **Find the data source** — search for "[State] employee salary database" or "[State] transparency portal"
2. **Check data quality** — does it include individual names? Job titles? Agencies?
3. **Copy an existing ETL script** — use `etl-state-tx.ts` as a template
4. **Map CSV columns** — adjust field names to match the source
5. **Test with a small batch** — verify data loads correctly
6. **Run full ETL** — load all records

### Template for New State ETL

```typescript
// Key fields to map:
// - First Name / Last Name (or combined Name field)
// - Agency / Department
// - Job Title / Position
// - Salary / Annual Wages / Total Compensation
// - Year (fiscal year)
```

---

## Refresh Schedule

| Source | Frequency | Notes |
|--------|-----------|-------|
| Texas Tribune | Quarterly | Auto-updates ~January, April, July, October |
| California | Annually | New data released ~March |
| OPM FedScope | Annually | September snapshot |
| Other states | Varies | Check source for update schedule |

---

## Impact on SEO

With all 22 states + DC loaded, you would have:
- **~2.5 million+ searchable records**
- Coverage of 22 of 50 states (44%)
- All top 10 population states covered
- Strong long-tail query coverage

**Current status:**
- ✅ New York loaded (877K records)
- ✅ Texas loaded (~155K records)
- ✅ California loaded (~270K records)
- ⏳ 19 more states ready to load

**Recommended next steps:**
1. Run auto-download scripts (DC, VA, NJ, CT)
2. Manually download FL, PA, GA, IL, OH data
3. Run remaining ETL scripts
4. Refresh materialized views
