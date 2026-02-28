# GovPay.Directory

Programmatic SEO site for government employee salary data. Search, explore, and compare compensation data across federal and state government agencies.

**A project by [Alston Analytics](https://alstonanalytics.com)**

## Tech Stack

- **Framework:** Next.js 16 (App Router, React 19)
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS v4
- **Charts:** Recharts
- **Icons:** Lucide React
- **Fonts:** Space Mono, DM Sans, JetBrains Mono

## Prerequisites

- Node.js 18+
- A Supabase project (free tier works)

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env.local

# 3. Edit .env.local with your Supabase credentials (see below)

# 4. Run database migration in Supabase SQL Editor
#    Copy contents of: supabase/migrations/001_schema.sql

# 5. Seed reference data
npm run db:seed

# 6. Start development server
npm run dev
```

## Environment Variables

Create a `.env.local` file with:

```bash
# Required - Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Find these values in your [Supabase Dashboard](https://supabase.com/dashboard) under Project Settings → API.

## Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor in your Supabase dashboard
3. Paste and run the contents of `supabase/migrations/001_schema.sql`
4. This creates all tables, indexes, RPC functions, and RLS policies

### Tables Created

| Table | Description |
|-------|-------------|
| `agencies` | Federal and state agencies with employee counts |
| `states` | US states and territories |
| `employees` | Individual employee salary records |
| `occupations` | Job classification codes |
| `gs_pay_scales` | GS pay rates by grade/step/year |
| `locality_areas` | Locality pay adjustment rates |
| `etl_runs` | Data pipeline audit log |

## Data Pipeline

Seed reference data and run ETL scripts to populate the database:

```bash
npm run db:seed        # Seed states, GS pay scale, locality areas
npm run etl:opm        # Federal agency statistics from OPM FedScope
npm run etl:tx         # Texas state employee data
npm run etl:ca         # California state employee data
npm run etl:all        # Run all of the above in sequence
```

### Data Sources

| Source | Data Type | URL |
|--------|-----------|-----|
| OPM FedScope | Federal agency statistics (aggregated) | [fedscope.opm.gov](https://www.fedscope.opm.gov/) |
| Texas Comptroller | Individual state employee records | [data.texas.gov](https://data.texas.gov/) |
| California State Controller | Individual state employee records | [publicpay.ca.gov](https://publicpay.ca.gov/) |
| OPM Pay Tables | GS pay scale rates | [opm.gov](https://www.opm.gov/policy-data-oversight/pay-leave/salaries-wages/) |

### Important Data Limitations

**Federal Employee Data:**
- OPM FedScope provides **aggregated/anonymized** data only
- Individual federal employee names are **NOT available** from FedScope
- We display agency-level statistics (headcounts, average salaries)
- Individual employee records come from state transparency portals only

**State Data:**
- Currently includes Texas and California
- Each state ETL is limited to 50,000 records per run
- Data freshness varies by state release schedule

**Reference Data:**
- GS Pay Scale: Updated annually (currently 2025)
- Locality adjustments: Updated annually
- Cost of living indices: Updated quarterly

## Development

```bash
npm run dev            # Start dev server at localhost:3000
npm run build          # Production build
npm run start          # Start production server
npm run lint           # Run ESLint
npm run type-check     # TypeScript type checking
npm run test           # Run Vitest test suite
npm run validate       # Run type-check + lint + tests
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy

### Other Platforms

The app is a standard Next.js application and can be deployed to any platform supporting Next.js:
- AWS Amplify
- Netlify
- Railway
- Self-hosted with `npm run build && npm run start`

## API Reference

### Search API

#### `GET /api/search`

Search for employees by name, job title, or agency.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `q` | string | required | Search query (max 200 chars) |
| `page` | number | 1 | Page number (max 500) |
| `limit` | number | 20 | Results per page (max 100) |

**Response:**
```json
{
  "results": [
    {
      "id": 123,
      "slug": "john-smith-department-of-defense",
      "fullName": "John Smith",
      "jobTitle": "Program Analyst",
      "agency": "Department of Defense",
      "totalCompensation": 95000
    }
  ],
  "total": 150,
  "page": 1,
  "totalPages": 8
}
```

**Rate Limit:** 30 requests per minute per IP

#### `GET /api/search/suggest`

Get autocomplete suggestions for search.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `q` | string | required | Search query (min 2 chars) |

**Response:**
```json
{
  "suggestions": [
    { "slug": "john-smith-dod", "fullName": "John Smith", "agency": "DOD" }
  ]
}
```

**Rate Limit:** 30 requests per minute per IP

## Project Structure

```
src/
  app/                    # Next.js App Router pages
    agencies/             # Agency listing + detail pages
    employees/            # Employee detail pages
    states/               # State listing + detail pages
    pay-scales/gs/        # GS pay scale tables
    tools/                # Compare + cost-of-living calculators
    search/               # Search results page
    api/search/           # Search + autocomplete API routes
    about/                # About page
    privacy/              # Privacy policy
    terms/                # Terms of service
  components/             # Shared React components
  lib/
    db.ts                 # Supabase data access layer
    supabase.ts           # Supabase client factory
    env.ts                # Environment variable validation
    types.ts              # TypeScript interfaces
    format.ts             # Currency/number formatters
    reference-data.ts     # GS pay scale, locality areas, states
scripts/                  # ETL and seed scripts
supabase/migrations/      # Database schema SQL
```

## Legal

All employee compensation data displayed on this site is derived from publicly available government records, published under the Freedom of Information Act (FOIA) and state open records laws.

## Contact

For questions or concerns, email [info@alstonanalytics.com](mailto:info@alstonanalytics.com).

## License

Copyright © 2025-2026 Alston Analytics. All rights reserved.
