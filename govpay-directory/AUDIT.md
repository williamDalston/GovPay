# GovPay.Directory — Comprehensive Site Audit

---

## 1. PROJECT IDENTITY & PURPOSE

**What this site IS:** GovPay.Directory is a programmatic SEO salary transparency website that aggregates compensation data for 2M+ federal and state government employees. Users can search by name, browse by agency or state, compare GS pay scales across locality areas, and use salary calculators. Data is sourced from the Office of Personnel Management (OPM FedScope), the Texas Comptroller, and the California State Controller — all public records obtained via FOIA and open data portals.

**Target audience:**
- Federal job seekers (25–55, researching GS pay bands before applying)
- Current federal employees (30–60, comparing their salary to peers)
- Journalists and researchers (investigating government compensation)
- Taxpayers curious about public spending
- HR professionals in government
- 65% mobile / 35% desktop (salary lookups are impulsive/mobile-first)
- Moderate tech savviness (comfortable with search, filters, tables)

**Core value proposition:** Free, instant access to 2M+ searchable government salaries with comparison tools — no paywall, no account required. Competitors require sign-up or limit data.

**Competitive landscape:**
| Site | Differentiator |
|------|---------------|
| FederalPay.org | GovPay has state data (TX, CA) in addition to federal; cleaner UI; GS calculator tools |
| OpenPayrolls.com | GovPay is faster (ISR/SSR vs client-rendered); better SEO; no interstitial ads |
| Transparent California | CA-only; GovPay covers federal + multi-state |

---

## 2. ARCHITECTURE OVERVIEW

**Tech stack:**
- **Framework:** Next.js 16.1.6 (App Router, React 19.2.3)
- **Language:** TypeScript 5 (strict mode)
- **Database:** Supabase (PostgreSQL via PostgREST)
- **Styling:** Tailwind CSS v4, custom `@utility` classes
- **Charts:** Recharts 3.7.0 (lazy-loaded)
- **Icons:** Lucide React 0.575.0
- **Analytics:** Vercel Analytics 1.6.1
- **Testing:** Vitest 4.0.18, React Testing Library 16.3.2
- **Hosting:** Vercel (inferred from config)

**File/folder structure:**
```
govpay-directory/
├── middleware.ts                 # Bot blocking, trailing slash normalization
├── next.config.ts               # Security headers, CSP
├── vitest.config.ts             # Test configuration
├── package.json                 # Scripts: dev, build, test, etl
├── CLAUDE.md                    # Project documentation
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root: fonts, metadata, analytics
│   │   ├── page.tsx             # Homepage: hero, stats, top agencies/earners
│   │   ├── globals.css          # Theme, keyframes, utilities, print styles
│   │   ├── manifest.ts          # PWA manifest
│   │   ├── icon.tsx             # Dynamic favicon (32×32)
│   │   ├── apple-icon.tsx       # Dynamic apple icon (180×180)
│   │   ├── robots.ts            # Robots.txt generation
│   │   ├── sitemap.ts           # Multi-sitemap (paginated for 2M+ URLs)
│   │   ├── opengraph-image.tsx  # Root OG image
│   │   ├── not-found.tsx        # Global 404
│   │   ├── error.tsx            # Global error boundary
│   │   ├── loading.tsx          # Root loading skeleton
│   │   ├── agencies/            # /agencies index + /agencies/[slug] detail
│   │   ├── employees/           # /employees/[slug] detail only
│   │   ├── states/              # /states index + /states/[slug] detail
│   │   ├── pay-scales/           # /pay-scales index + /pay-scales/gs/ + /pay-scales/gs/[grade]
│   │   ├── tools/compare/       # GS salary comparison calculator
│   │   ├── tools/cost-of-living/# Cost-of-living salary adjuster
│   │   ├── search/              # Client-side search with filters
│   │   ├── insights/            # Insights/analysis hub
│   │   ├── about/               # About, data sources, FAQ
│   │   ├── privacy/             # Privacy policy
│   │   └── terms/               # Terms of service
│   ├── components/
│   │   ├── Header.tsx           # Sticky nav, mobile menu (client)
│   │   ├── Footer.tsx           # 4-column nav footer (server)
│   │   ├── SearchBar.tsx        # Autocomplete search (client)
│   │   ├── EmployeeCard.tsx     # Employee summary card
│   │   ├── Breadcrumb.tsx       # Breadcrumb + JSON-LD
│   │   ├── StatsBar.tsx         # Stats grid + GlobalStatsBar
│   │   ├── SalaryChart.tsx      # Recharts bar chart (client)
│   │   ├── AnimateOnScroll.tsx  # IntersectionObserver fade-in (client)
│   │   ├── AnimatedBar.tsx      # Animated width bar (client)
│   │   ├── AnimatedNumber.tsx   # Counter animation (client)
│   │   └── BackToTop.tsx        # Scroll-to-top button (client)
│   ├── lib/
│   │   ├── db.ts               # All Supabase queries
│   │   ├── supabase.ts         # Supabase client factory
│   │   ├── env.ts              # Env variable validation
│   │   ├── format.ts           # formatCurrency, formatNumber
│   │   ├── rate-limit.ts       # In-memory rate limiter (30/min per IP)
│   │   ├── reference-data.ts   # GS pay tables, states, localities, COL indices
│   │   └── types.ts            # TypeScript interfaces
│   └── __tests__/              # 5 test files, 41 tests
├── scripts/
│   ├── seed-reference.ts       # Seed states, pay scales, localities
│   ├── etl-opm.ts              # Federal agency data ETL
│   ├── etl-state-tx.ts         # Texas employee data ETL
│   └── etl-state-ca.ts         # California employee data ETL
└── supabase/migrations/        # SQL schema + RPC functions
```

**Data flow:**
1. ETL scripts fetch CSV from OPM/TX/CA → transform → upsert into Supabase PostgreSQL
2. Next.js server components call `db.ts` functions → Supabase PostgREST API → PostgreSQL
3. ISR caches rendered pages at edge (1hr for detail, 24hr for employees)
4. Client components (search, tools) hit `/api/search` → rate limiter → `db.ts` → Supabase
5. Autocomplete hits `/api/search/suggest` → debounced 200ms → parallel employee + agency queries

**Database schema:**
| Table | Key Fields | Relationships |
|-------|-----------|---------------|
| agencies | id, slug, name, abbreviation, employee_count, avg_salary, median_salary | — |
| states | id, slug, name, abbreviation, employee_count, avg_salary | — |
| employees | id, slug, full_name, job_title, duty_station, pay_plan, grade, step, base_salary, total_compensation, fiscal_year | FK → agencies, states, occupations |
| occupations | id, code, title | — |

**Indexes:** slug (all tables), agency_id, state_id, total_compensation (desc), full_name tsvector (GIN), name trigram (GIN)

**API routes:**
| Route | Method | Auth | Rate Limited | Purpose |
|-------|--------|------|-------------|---------|
| /api/search | GET | None | Yes (30/min) | Full-text search with agency/state filters |
| /api/search/suggest | GET | None | Yes (30/min) | Autocomplete suggestions |

**Third-party integrations:**
- Supabase (database + auth layer)
- Vercel Analytics (page views, web vitals)
- Google Fonts (Space Mono, DM Sans, JetBrains Mono)

---

## 3. CURRENT STYLING & DESIGN AUDIT

### Color Palette
| Role | Color | Hex |
|------|-------|-----|
| Background (darkest) | navy-950 | `#0F1B2D` |
| Card/panel background | navy-900 | `#1E293B` |
| Hover background | navy-800 | `#1a2332` |
| Borders | navy-700 | `#334155` |
| Disabled text | navy-600 | `#475569` |
| Secondary text | navy-500 | `#64748B` |
| Muted text | navy-400 | `#94A3B8` |
| Body text | navy-300 | `#CBD5E1` |
| Heading text | navy-200 | `#E2E8F0` |
| Primary text | navy-100 | `#F1F5F9` |
| Primary accent | accent-blue | `#3B82F6` |
| Primary hover | accent-blue-hover | `#2563EB` |
| Success/growth | accent-green | `#10B981` |
| Warning/tertiary | accent-amber | `#F59E0B` |
| Error/danger | accent-red | `#EF4444` |

### Typography
| Element | Font Family | Size | Weight | Line Height |
|---------|------------|------|--------|-------------|
| h1 | Space Mono | 2xl–3xl (24–30px) | 700 | default |
| h2 | Space Mono | lg (18px) | 700 | default |
| h3 | Space Mono | sm–base (14–16px) | 700 | default |
| Section labels | Space Mono | xs (12px) uppercase tracking-wider | 700 | default |
| Body | DM Sans | sm–base (14–16px) | 400 | relaxed (1.625) |
| Data/numbers | JetBrains Mono | xs–3xl | 400–700 | default |
| Small/meta | DM Sans | xs (12px) | 400 | default |

### Border Radius
- Cards: `rounded-xl` (12px)
- Buttons: `rounded-lg` (8px)
- Badges/pills: `rounded-full` (9999px)
- Inputs: `rounded-xl` (12px)
- Small tags: `rounded-lg` (8px)
- Table container: `rounded-xl` (12px)
- Logo badge: `rounded` (4px) — Header; `rounded-lg` (8px) — Detail pages

### Spacing System
Consistent Tailwind scale: `px-4 py-3` (cards), `px-6 py-8` (page sections), `gap-4` (grids), `mt-8` (section spacing), `gap-2`/`gap-3` (inline items)

Page wrapper: `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8`

### Shadows
- Card hover: `hover:shadow-lg hover:shadow-accent-blue/5` (subtle blue glow)
- Dropdown: `shadow-xl` (search suggestions)
- BackToTop: `shadow-lg`
- No shadows at rest (dark theme relies on borders)

### Button Styles
- **Primary:** `bg-accent-blue text-white rounded-lg px-6 py-3 hover:bg-accent-blue-hover active:scale-[0.98]`
- **Secondary:** `border border-navy-700 bg-navy-900 text-navy-300 rounded-lg px-4 py-2 hover:bg-navy-800`
- **Ghost:** `text-navy-400 hover:text-accent-blue` (links)
- **No button has a disabled-cursor style** unless pagination

### Card Styles
- Border: `border border-navy-700`
- Background: `bg-navy-900`
- Padding: `p-5` or `p-6`
- Radius: `rounded-xl`
- Hover: `-translate-y-0.5` + `border-accent-blue/50` + `shadow-lg shadow-accent-blue/5`

### Navigation
- **Position:** Sticky top-0, z-50
- **Height:** h-16 (64px)
- **Background:** `bg-navy-950/95 backdrop-blur-sm`
- **Border:** `border-b border-navy-700`
- **Mobile:** Grid-row height transition (0fr → 1fr), hamburger icon
- **Active state:** `font-medium text-accent-blue` + `aria-current="page"`

### Footer
- **Background:** `border-t border-navy-700 bg-navy-950`
- **Layout:** 4-column grid (2-col on mobile)
- **Content:** Browse by State, Top Agencies, Tools, Resources
- **Bottom bar:** Logo + copyright + Alston Analytics credit + FOIA notice
- **Text:** navy-400/navy-500

### Responsive Breakpoints
| Breakpoint | Width | Layout Changes |
|-----------|-------|---------------|
| Default | <640px | Single column, hamburger menu, compact cards |
| sm | 640px | 2-column grids, larger search bar |
| md | 768px | Desktop nav visible, 4-column stats |
| lg | 1024px | 3-column grids, sidebar layouts |
| xl | 1280px | max-w-7xl container |

### Animations
- `shimmer` — Skeleton loading sweep (1.5s infinite)
- `fade-in-up` — Opacity 0→1 + translateY 12→0 (0.5s ease-out)
- `slide-down` — Dropdown reveal (0.2s ease-out)
- Stagger delays: 60ms increments (stagger-1 through stagger-8)
- Card hover: `-translate-y-0.5` (0.15s)
- Button press: `active:scale-[0.98]`
- BackToTop: opacity/scale/translate transition (0.3s)
- Mobile menu: grid-template-rows transition (0.3s)
- AnimatedNumber: requestAnimationFrame counter (0.6s cubic ease-out)
- AnimatedBar: width transition (0.7s ease-out)
- All guarded by `prefers-reduced-motion: reduce`

### Dark Mode
- **Status:** Dark-only (no light mode toggle)
- **Implementation:** `<html className="dark">` + Tailwind v4 `@theme` inline variables
- **Complete:** Yes — every component uses the navy palette

### Icon System
- **Library:** Lucide React
- **Sizes:** 10px, 12px, 14px, 18px, 20px, 24px
- **Consistent:** Yes — size correlates with context (inline=12-14, standalone=18-24)

### Image Handling
- **External images:** None (all text/data-based)
- **OG images:** Generated dynamically via `next/og` ImageResponse (1200×630)
- **Favicon:** Dynamic SVG-like via ImageResponse (32×32)
- **No `next/image` usage** — site has no user-uploaded or static photography

---

## 4. TARGET AUDIENCE PSYCHOLOGY & STYLING RECOMMENDATIONS

### Visual Language Expected
Federal employees and job seekers expect **authoritative, institutional, trustworthy** design — similar to banking/fintech. Clean data presentation. No playfulness. The current dark theme with monospace headings and data typography achieves this well.

### Trust Signals Needed
- [x] Data source attribution (OPM, state comptrollers) — Present in About
- [x] FOIA disclaimer in footer — Present
- [x] Last-updated dates — Present on pay scale pages
- [x] Data freshness indicator on homepage hero — "Pay data updated January 2025" pill
- [ ] **Missing:** Total records count badge in hero (e.g., "2,147,832 records indexed")
- [ ] **Missing:** External validation — link to OPM source on every agency page

### Specific Styling Changes
1. ~~Add data freshness pill to homepage hero~~ ✅ Driven by `DATA_LAST_UPDATED.gsPayScale` from `reference-data.ts` — auto-updates when data changes
2. **Increase touch target on mobile nav links** — Change `py-2.5` to `py-3.5` for 48px minimum tap targets
3. ~~Add focus-visible rings to all interactive elements~~ ✅ Global `:focus-visible` rule in `globals.css`
4. **Increase body text contrast** — Promote key descriptions from `text-navy-400` (#94A3B8) to `text-navy-300` (#CBD5E1) for WCAG AAA compliance on dark background
5. **Add subtle gradient to hero section** — `bg-gradient-to-b from-navy-950 via-navy-950 to-navy-900` to create depth
6. **Enlarge CTA buttons** — Change hero search bar from `py-4` to `py-5` on mobile for thumb-friendliness

### Mobile-First Priorities
- Touch targets: Most are 44px+ (good). Mobile nav links should increase to 48px.
- Reading: Body text at 14px is tight on mobile. Consider 15-16px for key paragraphs.
- Thumb zone: Search bar is top of page (good). Back-to-top in bottom-right (good).
- Horizontal scrolling: Pay scale table uses `overflow-x-auto` with sticky first column (good).

### Conversion Psychology
- **Primary CTA** (search) is prominent in hero with gradient background — strong
- **Secondary CTAs** (browse states/agencies) are immediately below — good discoverability
- **No email capture or account wall** — reduces friction, good for SEO traffic
- **Missing:** Search suggestions on empty homepage could drive engagement
- **Missing:** "Popular searches" or "Trending" section to reduce blank-slate problem

### Page Load Perception
- Shimmer skeletons on all loading states (good)
- ISR means most pages load instantly from cache (excellent)
- Recharts lazy-loaded (good — doesn't block first paint)
- Above-the-fold content is hero + search + stats (excellent priority)

---

## 5. DOMAIN NAME RECOMMENDATIONS

| Rank | Domain | Why It Works | TLD | Availability | SEO Keywords |
|------|--------|-------------|-----|-------------|-------------|
| 1 | **govpay.directory** | Already owned. Professional, memorable, .directory TLD signals data/lookup utility. Perfect brand-domain fit. | .directory | Owned | "gov pay" — high-value search term |
| 2 | **federalsalary.com** | Direct keyword match for primary search intent. .com authority. | .com | Likely taken | "federal salary" — exact match |
| 3 | **govpay.com** | Shorter, more memorable, broader than .directory. Premium .com. | .com | Likely premium/taken | "gov pay" |
| 4 | **publicsalaries.org** | .org signals public-interest mission. Broader than federal-only. | .org | Possible | "public salaries" |
| 5 | **fedpay.info** | Short, brandable, .info suits data reference sites. | .info | Likely available | "fed pay" |

**Recommendation:** Keep `govpay.directory` — it's unique, branded, SEO-relevant, and already established. The .directory TLD is unusual enough to be memorable and signals the site's purpose.

---

## 6. MONETIZATION PLAN

### Current Monetization Infrastructure (Built)

The following monetization infrastructure is implemented and ready to activate:

**Ad Slots (via `AdSlot` component):** Render nothing when `NEXT_PUBLIC_ADSENSE_ID` is unset; activate instantly when the env var is set.
| Location | Ad Format | Page |
|----------|----------|------|
| Below hero stats | Leaderboard 728×90 | Homepage |
| Below salary distribution chart | Leaderboard 728×90 | Agency detail |
| Sidebar | Rectangle 300×250 | Agency detail, Employee detail, State detail |
| Below tool results | Leaderboard 728×90 | Compare tool, COL tool |
| After 2nd article section + sidebar | Leaderboard + Rectangle | Article pages |

**Outbound Job CTAs (via `JobsCTA` component):** Live on every agency detail page and employee detail page. Links to USAJobs.gov filtered by agency name and job title. Drives engagement and user utility; not a formal affiliate program. Future potential: partner with job boards, resume services, or recruiter platforms for actual referral revenue.

**Newsletter Capture (via `NewsletterCTA` component):** Placed on homepage and article sidebar. Stores signups locally until connected to an email service (Mailchimp, ConvertKit, or Supabase table).

**Social Share (via `ShareButton` component):** X/Twitter, LinkedIn, copy-link, and native Web Share API on mobile. Placed on employee detail pages (salary data is inherently shareable) and article pages.

**Editorial Content (5 articles at `/insights/[slug]`):**
1. "Complete Guide to the GS Pay Scale in 2025" — targets "GS pay scale 2025"
2. "Highest Paying Federal Agencies Ranked" — targets "highest paying federal jobs"
3. "Federal Locality Pay Explained" — targets "locality pay"
4. "How Federal Employee Step Increases Work" — targets "GS step increase"
5. "Federal vs. Private Sector Pay" — targets "federal vs private salary"

Each article has full JSON-LD Article schema, OG images, related data links, sidebar newsletter + ad slots, and "Continue Reading" section.

### Primary Revenue Model: Display Advertising (Google AdSense + Programmatic)
**Why:** 2M+ indexable pages = massive long-tail organic traffic potential. Salary pages have high commercial intent (people considering job changes, researching compensation). CPMs for finance/employment niches are $5-$15.

### Secondary Revenue Streams
1. **Outbound job links (USAJobs)** — Live on agency + employee detail pages. Engagement/utility CTA, not formal affiliate. Explore job board partnerships for referral revenue.
2. **Premium API access** — Rate-limited free tier (current), paid tier for researchers/journalists. $29/mo.

### AdSense Readiness
- **Content quality:** Strong — original data, unique pages, no duplicate content ✅
- **Content policies:** Compliant — public records, no PII beyond publicly available names ✅
- **Page count:** 2M+ pages ✅
- **Editorial content:** 5 articles written, need 5-10 more for safety margin
- **Ad slot infrastructure:** Built and ready (`AdSlot` component) ✅
- **Traffic requirement:** Need consistent organic traffic (~1-3 months of indexed pages)

### Pricing (Premium API)
- **Free:** 30 req/min (current rate limit)
- **Starter:** $29/mo — 100 req/min, bulk CSV exports
- **Pro:** $99/mo — 500 req/min, webhook alerts for salary changes, historical data

### Remaining Steps to Activate Revenue
1. ~~Create editorial articles at `/insights/[slug]`~~ ✅ (5 done, write 5-10 more)
2. ~~Add ad slot containers to templates~~ ✅
3. ~~Add USAJobs affiliate links~~ ✅
4. ~~Add social share buttons~~ ✅
5. ~~Add newsletter capture~~ ✅
6. Connect newsletter to email service (Mailchimp/ConvertKit)
7. Apply for Google AdSense (after 3+ months indexed content)
8. Set `NEXT_PUBLIC_ADSENSE_ID` env var to activate all ad slots
9. Update CSP to allow `*.googlesyndication.com` and `*.googleadservices.com`

---

## 7. FEATURES — CURRENT STATE

| Feature | Status | Works | Missing |
|---------|--------|-------|---------|
| Homepage | Complete | Hero, stats, agency grid, top earners, state grid, search, latest articles, newsletter, data freshness pill | — |
| Search + Autocomplete | Complete | Full-text search, agency/state filters, debounced suggestions, pagination | Search analytics/tracking |
| Employee Detail | Complete | Compensation breakdown, comparison bars, related employees, JSON-LD, share buttons, JobsCTA, related guides, ad slots | — |
| Agency Detail | Complete | Stats, salary chart, top occupations, state breakdown, top earners, JobsCTA, ad slots | Historical salary trend data |
| Agency Index | Complete | Full agency grid with search, employee counts, salary ranges | — |
| State Detail | Complete | Stats, agency list, top earners, nearby states, ad slots | — |
| State Index | Complete | 51-state grid with abbreviation badges | Employee count per state tile |
| GS Pay Scale Table | Complete | 15×10 interactive table, locality selector, hover highlight, related guides | — |
| GS Grade Detail | Complete | Step breakdown, locality table, employee examples | — |
| Compare Tool | Complete | Side-by-side GS salary comparison with locality, ad slot, related guides | — |
| Cost of Living Tool | Complete | 15-city COL adjuster with salary input, ad slot, related guides | More cities |
| Insights Hub | Complete | Article cards + tool cards, 5 full editorial articles at `/insights/[slug]` | 5-10 more articles for AdSense |
| Article Pages | Complete | Full articles with JSON-LD, OG images, share buttons, newsletter CTA, ad slots, related articles | — |
| About Page | Complete | Mission, data sources, methodology, FAQ | — |
| Privacy / Terms | Complete | Comprehensive, FOIA-aware | — |
| Monetization | Infrastructure Ready | Ad slots (AdSlot), affiliate CTAs (JobsCTA), newsletter (NewsletterCTA), share buttons (ShareButton) | AdSense approval, email service connection |
| Error Boundaries | Complete | All dynamic routes have error.tsx | — |
| Not Found Pages | Complete | All dynamic routes + global 404 | — |
| Loading Skeletons | Complete | Shimmer animation on all loading states | — |
| OG Images | Complete | Dynamic for all routes including articles | — |
| Sitemap | Complete | Multi-sitemap supporting 2M+ URLs | — |
| Rate Limiting | Complete | 30 req/min per IP on API routes | — |
| Middleware | Complete | Bot blocking, trailing slash normalization | — |
| Analytics | Complete | Vercel Analytics integrated | Custom event tracking |
| Tests | Partial | 41 tests (format, rate-limit, reference-data, EmployeeCard, Breadcrumb) | API routes, search, tools tests |
| Animations | Complete | Shimmer, fade-in-up, slide-down, stagger, scroll-triggered, animated bars | — |
| Accessibility | Complete | Skip nav, ARIA labels, reduced motion, keyboard nav, sr-only tables, focus-visible rings | — |

---

## 8. SEO & DISCOVERABILITY

### Current Meta Tags
Every page has `<title>`, `<meta description>`, OpenGraph tags (type, siteName, locale), and Twitter card (summary_large_image). Dynamic pages generate canonical URLs and JSON-LD structured data.

### Missing SEO Elements
- [ ] `/pay-scales/gs` page (client component) has no JSON-LD — needs `DataSet` schema
- [x] Editorial content: 5 articles at `/insights/[slug]` with JSON-LD, OG images, full article pages. Need 5-10 more for AdSense safety margin.
- [ ] No `hreflang` tags (English-only site, not needed unless expanding)
- [x] `/pay-scales` index page created — sitemap will pick it up automatically

### Content Strategy for Organic Traffic
**High-value target keywords:**

| Keyword | Monthly Volume (est.) | Difficulty | Content Needed |
|---------|----------------------|-----------|---------------|
| "GS-13 salary" | 40K | Medium | Grade detail page (exists) + editorial guide |
| "federal employee pay scale 2025" | 25K | Medium | GS index (exists) + article |
| "highest paid federal employees" | 15K | Low | Agency comparisons (exists) + article |
| "GS pay scale with locality" | 12K | Medium | Calculator (exists) |
| "NASA salaries" | 8K | Low | Agency detail (exists) |
| "federal employee salary lookup" | 6K | Medium | Search page (exists) |
| "GS-7 to GS-9 promotion" | 5K | Low | New article needed |
| "cost of living federal employees" | 4K | Low | Tool (exists) + article |

**Content to create:** 10-15 editorial articles at `/insights/[slug]`:
1. "Complete GS Pay Scale Guide 2025"
2. "Highest Paying Federal Agencies Ranked"
3. "Federal Employee Salary by State: Complete Breakdown"
4. "GS Grade Promotion Timeline: How Fast Can You Advance?"
5. "Locality Pay Explained: How Location Affects Your Federal Salary"
6. "Top 10 Highest Paid Federal Jobs"
7. "Federal vs Private Sector Salary Comparison"
8. "Understanding Your GS Step Increase"
9. "Best States for Federal Employees (Salary vs Cost of Living)"
10. "NASA Engineer Salary Breakdown"

### Page Speed
- Server-rendered with ISR — excellent TTFB
- Recharts lazy-loaded — no render blocking
- No external images to optimize
- Fonts loaded via Next.js Font API (preloaded, font-display: swap)
- CSP allows inline styles/scripts — no render blocking
- **Potential issue:** Tailwind v4 generates CSS at build time; bundle should be checked post-build

### Accessibility Score
- **Estimated Lighthouse Accessibility:** 95-98/100
- All major WCAG 2.1 AA requirements met
- ~~Minor: Some nav links missing `focus-visible` outline~~ ✅ Fixed — global `:focus-visible` rule
- Minor: Animated numbers don't have `aria-live` region

### Crawl Budget Strategy
At 2M+ URLs, sitemap submission alone is insufficient. Tiered approach:
- **Sitemap indexes:** Separate sitemaps for employees, agencies, states, pay-scales, insights
- **Priority:** Agency and state pages first (highest unique-value density), then grade pages, then employees
- **`lastmod`:** Accurate per-page timestamps from ETL metadata
- **Thin-page mitigation:** Every employee page has contextual comparisons (vs agency avg, vs national avg), related employees, related guides, and occupation context — not just a data row
- **Search/filter pages:** `/search` uses `noindex` by default (parameterized queries). Only canonical entity pages are indexed.
- **Monitoring:** Track indexed page count vs submitted in GSC. If indexing plateaus, prune lowest-value pages.

### Data Correction & Opt-Out Workflow
Even though data is public, names + salary can trigger complaints. Defensive posture:
- [x] Public records notice on employee detail pages (visible source attribution + fiscal year)
- [x] Privacy policy + terms of service with FOIA notice
- [ ] **TODO:** Data correction / contact form (simple email workflow → `info@alstonanalytics.com`)
- [ ] **TODO:** Response SOP for correction requests, misidentification, and outdated data complaints
- [ ] **TODO:** Consider `X-Robots-Tag` or meta robots for individual opt-out requests

### ETL Provenance (Recommended)
Currently "data updated" is a hardcoded string in `reference-data.ts`. For operational maturity:
- [ ] **TODO:** Create `etl_runs` table: `source_name`, `run_started_at`, `completed_at`, `records_inserted`, `records_updated`, `records_failed`, `source_file_hash`, `fiscal_year`, `status`
- [ ] **TODO:** Surface latest ETL run date in UI freshness pill (replace hardcoded `DATA_LAST_UPDATED`)
- [ ] **TODO:** ETL scripts should write provenance on each run

---

## 9. ENVIRONMENT VARIABLES & SECRETS

| Variable | Where Used | Purpose | Set? | How to Get |
|----------|-----------|---------|------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `src/lib/supabase.ts`, `src/lib/env.ts`, layout.tsx (preconnect) | Supabase project URL | Check `.env.local` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `src/lib/supabase.ts`, `src/lib/env.ts` | Supabase public/anon API key | Check `.env.local` | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | `src/lib/supabase.ts`, ETL scripts | Supabase service role key (full DB access) | Check `.env.local` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SITE_URL` | Layout/metadata (optional) | Canonical site URL | Optional | Set to `https://govpay.directory` |
| `NEXT_PUBLIC_VERCEL_ANALYTICS_ID` | Auto-injected by Vercel | Analytics project ID | Auto on Vercel | Vercel Dashboard → Analytics |

---

## 10. MANUAL SETUP TASKS REMAINING

- [ ] **Supabase project** — Create project at supabase.com, copy URL + keys to `.env.local`
- [ ] **Database migrations** — Run all SQL files in `supabase/migrations/` via Supabase SQL Editor or CLI
- [ ] **Seed reference data** — Run `npm run db:seed` (requires `SUPABASE_SERVICE_ROLE_KEY`)
- [ ] **ETL pipeline** — Run `npm run etl:all` to populate employee data (OPM + TX + CA)
- [ ] **Domain DNS** — Point `govpay.directory` to Vercel: Add CNAME record → `cname.vercel-dns.com`
- [ ] **Vercel deployment** — Connect GitHub repo, set environment variables in Vercel Dashboard
- [ ] **Vercel env vars** — Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] **Google Search Console** — Verify domain ownership, submit sitemap URL
- [ ] **Google AdSense** — Apply after 3+ months of indexed content; set `NEXT_PUBLIC_ADSENSE_ID` to activate
- [ ] **Twitter/X account** — Create `@GovPayDir` to match Twitter card meta
- [ ] **Email** — Set up `info@alstonanalytics.com` (referenced in footer Contact link)
- [ ] **SSL** — Automatic via Vercel (no action needed)
- [x] **Editorial content** — 5 articles created at `/insights/[slug]`; write 5-10 more for AdSense eligibility
- [ ] **Email service** — Connect `NewsletterCTA` to Mailchimp/ConvertKit/Supabase table

---

## 11. PRIORITY ACTION LIST

### 🔴 MUST DO BEFORE LAUNCH (blocking)

1. **Set up Supabase + run migrations + seed data** — No data = no site — 1 hour
2. **Run ETL pipeline** (`npm run etl:all`) — Populates 2M+ employee records — 2-4 hours (data download + processing)
3. **Deploy to Vercel + set env vars** — Site not live without hosting — 30 min
4. **Configure DNS** — Domain must point to Vercel — 15 min + propagation
5. **Verify Google Search Console + submit sitemap** — Crawling won't start without this — 30 min

### 🟡 SHOULD DO BEFORE LAUNCH (quality)

1. ~~Add focus-visible rings to all nav/button elements~~ ✅ Global CSS rule
2. ~~Add data freshness indicator to homepage~~ ✅ "Pay data updated January 2025" pill
3. **Create Twitter/X account `@GovPayDir`** — Twitter cards reference it — 10 min
4. **Test all routes with production database** — Verify no edge cases — 1 hour
5. **Run Lighthouse audit on deployed site** — Catch performance/a11y issues — 30 min
6. ~~Add `/pay-scales` index page~~ ✅ Landing page with GS, SES (coming soon), LEO (coming soon)
7. ~~Improve robots.txt~~ ✅ Crawl-delay, sitemap, 12 AI scrapers blocked

### 🟢 DO AFTER LAUNCH (monetization activation)

1. ~~Add USAJobs outbound links~~ ✅ Live on agency + employee detail pages (utility CTA, not affiliate)
2. ~~Add social share buttons~~ ✅ On employee + article pages (X, LinkedIn, copy link, native share)
3. ~~Write editorial articles~~ ✅ 5 done; write 5-10 more for AdSense safety margin
4. ~~Add ad slot infrastructure~~ ✅ Set `NEXT_PUBLIC_ADSENSE_ID` to activate
5. ~~Add newsletter capture~~ ✅ Connect to Mailchimp/ConvertKit
6. **Apply for Google AdSense** — After 3+ months indexed + 10-15 articles — 1 hour apply + 1-4 week review
7. **Update CSP for AdSense** — Allow `*.googlesyndication.com`, `*.googleadservices.com`
8. **Add custom event tracking** — Track searches, tool usage, affiliate clicks — 2 hours
9. **Expand COL tool** — Add more cities beyond 15 — 1 hour
10. **Add historical salary trend data** — Year-over-year comparison if data available — 1-2 days
11. **Write more tests** — API routes, search page, tools pages — 3-4 hours
9. **Consider light mode toggle** — Expands audience preference — 2-3 hours
10. **Build premium API tier** — Revenue stream for researchers — 1-2 days

---

## 12. ONE-LINE SITE SUMMARY

> **GovPay.Directory** is a programmatic SEO salary database for federal job seekers, government employees, and researchers that lets you search, compare, and analyze 2M+ public employee compensation records, monetized via display advertising and affiliate links.
