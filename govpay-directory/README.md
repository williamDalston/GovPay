# GovPay.Directory

Programmatic SEO site for government employee salary data. Search, explore, and compare compensation data across federal and state government agencies.

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

## Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Database Setup

Run the migration against your Supabase project to create tables, indexes, and RPC functions:

```bash
# Via Supabase Dashboard: SQL Editor → paste contents of:
supabase/migrations/001_schema.sql
```

## Data Pipeline

Seed reference data and run ETL scripts to populate the database:

```bash
npm run db:seed        # Seed states, occupations, GS pay scale
npm run etl:opm        # Federal employee data from OPM FedScope
npm run etl:tx         # Texas state employee data
npm run etl:ca         # California state employee data
npm run etl:all        # Run all of the above in sequence
```

## Development

```bash
npm run dev            # Start dev server at localhost:3000
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | TypeScript type checking |
| `npm run validate` | Run type-check + lint |
| `npm run db:seed` | Seed reference data |
| `npm run etl:opm` | Run OPM federal ETL |
| `npm run etl:tx` | Run Texas state ETL |
| `npm run etl:ca` | Run California state ETL |
| `npm run etl:all` | Run full data pipeline |

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
    insights/             # Insights landing
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

## Data Sources

- [OPM FedScope](https://www.fedscope.opm.gov/) — Federal workforce statistics
- [Texas Comptroller](https://data.texas.gov/) — Texas state employee records
- [California State Controller](https://publicpay.ca.gov/) — California state employee records
- [OPM Pay Tables](https://www.opm.gov/policy-data-oversight/pay-leave/salaries-wages/) — GS pay scale data
