# GovPay.Directory

Programmatic SEO site for government employee salary data.

**A project by Alston Analytics** — Contact: info@alstonanalytics.com

## Tech Stack

- **Framework:** Next.js 16 (App Router, React 19)
- **Database:** Supabase (PostgreSQL via PostgREST)
- **Styling:** Tailwind CSS v4
- **Charts:** Recharts
- **Icons:** Lucide React
- **Language:** TypeScript (strict mode)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── about/              # About page
│   ├── agencies/[slug]/    # Agency detail (server component)
│   ├── api/search/         # Search + suggest API routes
│   ├── employees/[slug]/   # Employee detail (server component)
│   ├── insights/           # Blog/insights index
│   ├── pay-scales/gs/      # GS pay scale overview + [grade] detail
│   ├── privacy/            # Privacy policy
│   ├── search/             # Client-side search page
│   ├── states/[slug]/      # State detail (server component)
│   ├── terms/              # Terms of service
│   └── tools/              # Compare + cost-of-living calculators
├── components/             # Shared React components
│   ├── BackToTop.tsx       # Scroll-to-top button (client)
│   ├── Breadcrumb.tsx      # Breadcrumb navigation
│   ├── EmployeeCard.tsx    # Employee summary card
│   ├── Footer.tsx          # Site footer with nav links
│   ├── Header.tsx          # Sticky header with active nav (client)
│   ├── SalaryChart.tsx     # Recharts bar chart (client)
│   ├── SearchBar.tsx       # Search with autocomplete (client)
│   └── StatsBar.tsx        # Stats grid + GlobalStatsBar (server)
└── lib/
    ├── db.ts               # All Supabase queries (server only)
    ├── env.ts              # Environment variable validation
    ├── format.ts           # Number/currency formatters
    ├── reference-data.ts   # GS pay tables, states, localities (static)
    ├── supabase.ts         # Supabase client singleton
    └── types.ts            # Shared TypeScript interfaces
scripts/                    # ETL data pipeline scripts
supabase/migrations/        # Database schema SQL
```

## Key Patterns

- **Server Components by default.** Only pages/components needing interactivity use `"use client"`.
- **Data layer:** All DB queries go through `src/lib/db.ts`. No direct Supabase calls elsewhere.
- **Error handling:** Every dynamic `[slug]` and `[grade]` route has `error.tsx`, `not-found.tsx`, and `loading.tsx`.
- **SEO:** Every page has `generateMetadata()` or `metadata` export. Dynamic routes include JSON-LD, canonical URLs, and OG images.
- **Revalidation:** Detail pages use `revalidate = 3600` (1 hour). Static reference pages use `86400` (24 hours).
- **Formatting:** Use `formatNumber()` and `formatCurrency()` from `src/lib/format.ts` — never raw `.toLocaleString()`.
- **Accessibility:** Skip-to-content link, `aria-label` on all nav/tables, `aria-current="page"` on active links, screen-reader-only data tables for charts, `prefers-reduced-motion` guard on all animations.
- **Rate Limiting:** API routes (`/api/search`, `/api/search/suggest`) use in-memory rate limiter (30 req/min per IP).
- **Analytics:** Vercel Analytics via `@vercel/analytics/next`.
- **Testing:** Vitest + React Testing Library. Tests in `src/__tests__/`.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # TypeScript check (tsc --noEmit)
npm run test         # Run Vitest test suite
npm run validate     # type-check + lint + tests
npm run etl:all      # Full data pipeline (seed + OPM + TX + CA)
```

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` — Service role key (ETL scripts only)

## Data Limitations

**Important:** Federal employee data from OPM FedScope is aggregated/anonymized — individual names are NOT available. Individual employee records come from state transparency portals (TX, CA) only.

See `scripts/etl-opm.ts` header comments for details on data sources and update schedule.
