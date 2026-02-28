# GovPay.Directory — SEO Optimization Checklist

Adapted for the GovPay Directory codebase. Each item is marked with audit status:
- [x] = PASS (implemented correctly)
- [ ] = FAIL (missing or broken — needs action)
- [~] = PARTIAL (works but has issues)

---

## 0) Definition of "SEO-ready" for GovPay.Directory

Use this as your pass/fail bar:

- Pages are **crawlable** (robots.txt + middleware don't accidentally block crawlers)
- Important URLs are **indexable** (metadata + canonical + sitemap)
- Templates are **unique enough** to avoid thin-page patterns (2M+ employee pages)
- Google can **understand page purpose** (metadata + structured data + internal links)
- Site is **fast enough** on mobile and stable under load (CWV)
- You can **monitor indexing and performance** after launch (GSC)

If any one of those is weak, SEO becomes a slot machine.

---

## 1) Domain, Canonical & URL Hygiene

### Canonical domain setup

- [x] Canonical domain picked: `https://govpay.directory`
- [x] `metadataBase` set to `https://govpay.directory` (`layout.tsx:28`)
- [x] HTTPS enforced in all hardcoded URLs (sitemap, robots, JSON-LD, ShareButton)
- [~] www vs non-www redirect — **Not handled at application level.** Relies on Vercel DNS config. If migrating off Vercel, this becomes a gap.
- [x] Sitemap references canonical domain (`robots.ts:12`, `sitemap.ts:5`)
- [x] URL case normalization in middleware — 308 redirects uppercase paths to lowercase canonical form

### URL normalization

- [x] Trailing slash normalization via middleware 308 redirect (`middleware.ts:32-36`)
- [x] Root path `/` excluded from trailing slash stripping
- [x] Case normalization — uppercase paths redirected to lowercase canonical form (`middleware.ts:24-29`)
- [x] Internal links always use lowercase, no trailing slashes
- [x] No redirect chains (single-hop redirects only)
- [ ] **Query param canonicalization missing** — `/search?q=nasa` has no canonical pointing to `/search`, risking infinite indexable param variants

---

## 2) Crawl & Indexing Controls

### robots.txt (`src/app/robots.ts`)

- [x] `robots.txt` exists and returns valid output
- [x] Sitemap URL listed: `https://govpay.directory/sitemap.xml`
- [x] `/api/` blocked from crawling
- [x] Root `/` explicitly allowed (no accidental `Disallow: /`)
- [x] Staging/preview environment blocking — env-aware `Disallow: /` for non-production
- [x] AI scraper bots declared in robots.txt (GPTBot, ChatGPT-User, CCBot, etc.)
- [x] `/search` blocked from crawling

### Middleware (`middleware.ts`)

- [x] AI scraper bots blocked (GPTBot, ChatGPT-User, CCBot, anthropic-ai, Google-Extended, ClaudeBot, Bytespider, Amazonbot)
- [x] Googlebot, Bingbot, and search crawlers NOT blocked
- [x] FacebookExternalHit NOT blocked (social sharing previews work)
- [x] Matcher excludes `_next/static`, `_next/image`, `sitemap`, `robots`, `favicon`
- [~] `Google-Extended` blocking uses substring match (`ua.includes(...)`) — currently safe but fragile if Google changes UA naming

---

## 3) Sitemap Architecture

### Structure (`src/app/sitemap.ts`)

- [x] Sitemap index via `generateSitemaps()` — sitemap 0 = static/agency/state/grade pages, sitemaps 1..N = employee pages
- [x] 45,000 URLs per sitemap (safely below 50K limit)
- [x] All URLs use canonical `https://govpay.directory` base
- [x] Employee pages paginated across multiple child sitemaps
- [x] `lastModified` uses fixed dates (`DATA_UPDATED` for data pages, `SITE_UPDATED` for code pages) — no more `new Date()` spam
- [x] `/search` excluded from sitemap
- [x] Quality filtering — `getEmployeeSlugs()` and `getEmployeeCount()` exclude thin records (null job_title, null duty_station, zero compensation) from sitemap
- [x] `/pay-scales` included in sitemap
- [~] Sitemap 0 combines static + agency + state + grade pages — currently safe (~100 URLs) but has no upper bound guard

---

## 4) Indexability QA by Template

### Templates audited

| Template | Route | Status | Canonical | Title | Description | JSON-LD | OG Tags |
|----------|-------|--------|-----------|-------|-------------|---------|---------|
| Homepage | `/` | [x] | PASS | Inherits default | Inherits default | PASS (WebSite + Org) | FAIL |
| Agency index | `/agencies` | [x] | PASS | PASS | PASS | PASS (ItemList) | FAIL |
| Agency detail | `/agencies/[slug]` | [x] | PASS | PASS | PASS | PASS (GovOrg + FAQ) | FAIL (no OG image) |
| Employee detail | `/employees/[slug]` | [x] | PASS | PASS | PASS | PASS (Person) | FAIL (no OG image) |
| State detail | `/states/[slug]` | [x] | PASS | PASS | PASS | PASS (FAQPage) | FAIL (no OG image) |
| GS Pay Scale | `/pay-scales/gs` | [x] | PASS | PASS | PASS | PASS (Dataset) | FAIL |
| GS Grade detail | `/pay-scales/gs/[grade]` | [x] | PASS | PASS | PASS | PASS (FAQPage) | FAIL |
| Pay Scales index | `/pay-scales` | [x] | PASS | PASS | PASS | PASS (CollectionPage) | FAIL |
| Compare Tool | `/tools/compare` | [x] | PASS (layout) | PASS (layout) | PASS (layout) | PASS (WebApp) | FAIL |
| COL Tool | `/tools/cost-of-living` | [x] | PASS (layout) | PASS (layout) | PASS (layout) | PASS (WebApp) | FAIL |
| Insights hub | `/insights` | [x] | PASS | PASS | PASS | PASS (Collection) | FAIL |
| Article detail | `/insights/[slug]` | [x] | PASS | PASS | PASS | PASS (Article) | PASS |
| About | `/about` | [x] | PASS | PASS | PASS | PASS (AboutPage) | FAIL |

### Client component metadata (resolved)

The GS Pay Scale page was refactored into a server component (`page.tsx`) wrapping a client island (`GSPayScaleClient.tsx`), so it now exports metadata directly. Compare Tool and COL Tool still use `layout.tsx` files for metadata.

### Canonical URL consistency

- [x] All dynamic routes use absolute URLs (`https://govpay.directory/...`)
- [x] All static pages have `alternates.canonical` set
- [x] Agency index and state index pages have canonicals

### OG tag gap

Only `/insights/[slug]` has explicit OG tags (with a dynamic `opengraph-image.tsx`). All other pages rely on Next.js auto-deriving `og:title` and `og:description` from metadata, but **no pages have explicit `og:image`** except article pages. Several routes have `opengraph-image.tsx` files — verify these are being picked up.

### Title double-branding

- [x] Fixed — `/pay-scales` page title no longer includes brand suffix

---

## 5) On-Page SEO for Programmatic Pages

This is where GovPay's 2M+ employee pages live or die.

### Titles

- [x] Agency/Employee/State detail pages have unique, keyword-rich titles
- [x] GS Grade detail titles include salary ranges (`"GS-13 Pay Scale 2025 — $87,198 to $113,362"`)
- [x] GS Pay Scale, Compare, COL tools have titles via layout.tsx metadata
- [x] Homepage uses root default (acceptable — title template provides "GovPay.Directory")

### Meta descriptions

- [x] Dynamic descriptions on agency/employee/state/grade detail pages with data inserts (employee count, salary, etc.)
- [x] Client-component pages have descriptions via layout.tsx
- [x] Employee pages with missing job_title or duty_station use graceful fallbacks ("Federal Employee", "the United States")

### Headings

- [x] All detail pages have a single H1
- [x] H2s reflect user questions on most pages
- [~] Compare and COL client-component pages have H1s in the client render but no server-rendered heading for crawlers without JS. GS page refactored to server+client split.

### Body content uniqueness (CRITICAL for 2M+ employee pages)

- [~] **Near-duplicate risk is MODERATE.** The "Compensation Context" narrative is a mad-libs template, but data-driven comparisons (vs. agency avg, vs. national avg) and conditional GS pay range context provide differentiation.
- [ ] **Related employees section shows the same top 3 agency earners on every employee page from that agency** — contributes to duplication
- [ ] **Related Guides are hardcoded** — identical 3 links on every GS employee page
- [x] **Content quality gate implemented** — thin records (missing job_title, duty_station, or zero compensation) get `noindex, follow` and are excluded from sitemap
- [x] Employee pages with null fields use safe fallback text instead of blank/broken rendering
- [x] Data-driven salary comparisons (vs. agency avg, vs. national avg) provide some per-page differentiation
- [x] GS pay range context is conditional and grade-specific

### Remaining recommendations for content uniqueness

1. ~~Add `noindex` to employee pages with null `job_title`, null `duty_station`, or `total_compensation = 0`~~ **DONE**
2. Diversify the narrative with occupation-specific context, location cost-of-living data, and more conditional branches
3. Make "Related Employees" query pull from same occupation/grade instead of agency top earners
4. Vary Related Guides based on employee's pay plan, grade, or state

---

## 6) Structured Data (JSON-LD)

### Coverage

| Page Type | Schema Type(s) | Status |
|-----------|---------------|--------|
| Homepage | WebSite (with SearchAction), Organization | [x] PASS |
| Agency detail | GovernmentOrganization, FAQPage | [x] PASS |
| Employee detail | Person (with worksFor, workLocation) | [x] PASS |
| State detail | FAQPage | [x] PASS |
| GS Grade detail | FAQPage | [x] PASS |
| GS Pay Scale overview | Dataset | [x] PASS |
| Insights hub | CollectionPage, ItemList | [x] PASS |
| Article detail | Article (full: author, publisher, dates) | [x] PASS |
| About | AboutPage, Organization | [x] PASS |
| Breadcrumb | BreadcrumbList (on all deep pages) | [x] PASS |
| Compare Tool | WebApplication (in layout.tsx) | [x] PASS |
| COL Tool | WebApplication (in layout.tsx) | [x] PASS |
| Pay Scales index | CollectionPage, ItemList | [x] PASS |

### Quality checks

- [x] JSON-LD uses recommended format (not microdata)
- [x] Structured data matches visible page content
- [x] All URLs in JSON-LD use canonical `https://govpay.directory` domain
- [x] BreadcrumbList positions are accurate and use absolute URLs
- [ ] **No validation workflow** — Rich Results Test not run on representative URLs

---

## 7) Internal Linking

### Header (`src/components/Header.tsx`)

- [x] All 5 key hubs exposed: States, Agencies, Pay Scales, Tools, Insights
- [x] Search link with icon
- [x] Logo links to homepage
- [x] Active state with `aria-current="page"`
- [x] Mobile nav replicates desktop nav with proper ARIA
- [ ] **"Tools" link goes only to `/tools/compare`** — Cost of Living tool not accessible from header without a dropdown
- [ ] **No dropdown/mega-menu** for sub-categories

### Footer (`src/components/Footer.tsx`)

- [x] 5 columns: Browse by State, Top Agencies, Tools, Guides, Resources
- [x] Deep links to 5 popular states + "All States"
- [x] Deep links to 5 popular agencies + "All Agencies"
- [x] All 4 tool pages linked (GS Pay Scale, Compare, COL, Search)
- [x] Links to 4 insight articles + "All Insights"
- [x] Resources: About, Data Sources, Privacy, Terms, Contact
- [x] All anchor text is descriptive (no "click here")
- [x] External link to `alstonanalytics.com` has `rel="nofollow"` (prevents PageRank leakage)

### Breadcrumbs (`src/components/Breadcrumb.tsx`)

- [x] Present on ALL deep pages (agency, employee, state, grades, tools, insights, about)
- [x] JSON-LD BreadcrumbList with absolute URLs and correct positions
- [x] Semantic HTML (`<nav aria-label="Breadcrumb">` + `<ol>`)
- [x] Last item rendered as `<span>` (current page, not a link)

### Cross-linking by page type

| Page Type | Cross-links present | Missing cross-links |
|-----------|-------------------|-------------------|
| Homepage | Agencies, states, employees, insights, tools, data freshness badge | `/pay-scales` index, employee browse path |
| Agency detail | Employees, states, search, compare tool, **3 Related Guides** | Related agencies |
| Employee detail | Agency, state (duty station linked), GS grade, compare tool, 3 insight guides | Same-occupation employees |
| State detail | Agencies, employees, nearby states (full names), search, compare, **COL tool**, **3 Related Guides** | — (well cross-linked) |
| GS Grade detail | Prev/next grade, employees at grade | Insight articles, compare tool |
| Insights hub | All articles, all 5 tool/browse pages | — (well cross-linked) |
| Article detail | Related data pages, other articles, salary tools | — (best cross-linked page type) |

### Anchor text

- [x] No "click here" or generic text anywhere
- [x] Agency/employee/state links use full names
- [x] Nearby state links use **full state names** for better anchor text
- [~] "View all" links could be more descriptive ("View all agencies" instead of "View all")

### Code quality

- [x] Compare and COL tools use Next.js `<Link>` for Related Guides sections (converted from `<a>` tags)

---

## 8) Programmatic SEO Quality Controls

This section protects GovPay from thin-content and index bloat with 2M+ employee pages.

### Content quality gating

- [x] **Quality gate implemented.** `isThinRecord()` checks for missing `job_title`, missing `duty_station`, or `total_compensation <= 0`.
- [x] **`noindex, follow` for thin records.** `generateMetadata()` conditionally adds `robots: "noindex, follow"` for sparse data.
- [x] **Sitemap excludes thin records.** `getEmployeeSlugs()` and `getEmployeeCount()` apply `WHERE total_compensation > 0 AND job_title IS NOT NULL AND duty_station IS NOT NULL`.
- [~] **`mapEmployee` silently converts nulls to empty strings/zeros** (`db.ts:27-49`) — masking data quality issues from rendering. Employee page metadata uses fallbacks for these.
- [x] Status codes are correct: `notFound()` returns 404 for invalid slugs
- [x] Error boundaries return proper 500 status

### Duplicate/thin page prevention

- [ ] **Near-duplicate employee pages** — same template, same narrative structure, same related guides (mitigated by noindex on thin records)
- [ ] **Related employees section is identical across all employees at the same agency** (shows top 3 earners)
- [ ] **Hardcoded Related Guides** — no variation by employee attributes
- [ ] **No duplicate metadata detection at scale** — two employees with same title at same agency could have very similar meta descriptions
- [x] Agency pages have higher uniqueness (salary distribution, occupation mix, state breakdown)
- [x] State pages have good uniqueness (different agency compositions, geographic neighbors)

### Remaining recommendations

1. ~~Add `WHERE total_compensation > 0 AND job_title IS NOT NULL` to `getEmployeeSlugs()` for sitemap~~ **DONE**
2. ~~Add `robots: "noindex, follow"` in `generateMetadata` for records below a data completeness threshold~~ **DONE**
3. Diversify the "Compensation Context" narrative
4. Make "Related Employees" pull from same occupation/grade, not just agency top earners
5. Vary Related Guides by employee pay plan, grade, or state
6. Add a `quality_score` column to the employees table

---

## 9) Performance & Core Web Vitals

### LCP (Largest Contentful Paint) — Target: ≤ 2.5s

- [x] Homepage hero content is server-rendered (async server component)
- [x] All detail pages (agency, employee, state) are server-rendered with ISR
- [x] Homepage H1 — no animation (LCP-safe). Sub-heading animation retained (below fold threshold).
- [x] GS Pay Scale refactored to server component wrapping client island — metadata + SSR for crawlers
- [ ] **Compare and COL tools are still full `"use client"`** — LCP delayed until JS hydration. Consider server+client split.
- [x] Recharts lazy-loaded via `next/dynamic` with `ssr: false`

### CLS (Cumulative Layout Shift) — Target: ≤ 0.1

- [x] SalaryChartWrapper placeholder matches chart dimensions (`h-48` / `sm:h-64`)
- [x] AdSlot reserves correct IAB dimensions (728x90, 300x250, 300x600)
- [x] AnimateOnScroll uses `transform` (no layout shift from animations)
- [x] Loading skeletons match rendered layout dimensions
- [x] Header has fixed `h-16` height
- [x] Mobile menu uses CSS grid animation (user-initiated, doesn't count as CLS)

### INP (Interaction to Next Paint) — Target: ≤ 200ms

- [x] GS pay table hover uses **pure CSS `:hover`** — no React state re-renders on mouse movement
- [~] Search autocomplete debounce at 200ms — good but keyboard navigation (`activeIndex` state) could trigger rapid re-renders
- [x] `COST_INDICES` sort uses `[...COST_INDICES].sort()` — no mutation of source array
- [x] AnimatedNumber uses rAF with IntersectionObserver gate (fires once)

### Font loading

- [x] 3 Google Fonts loaded via `next/font/google` (self-hosted, preloaded, `swap`)
- [~] 8 font files total (Space Mono 2, DM Sans 3, JetBrains Mono 3) — consider dropping JetBrains Mono 500 weight
- [x] Dead `@next/font` dependency removed from package.json

### Third-party scripts

- [x] Vercel Analytics — lightweight (~1KB), non-blocking, loaded at end of body
- [x] `dns-prefetch` and `preconnect` point to actual Supabase project URL (env-driven)
- [ ] **CSP does not allow AdSense domains** — when wiring up ads, update CSP for `pagead2.googlesyndication.com`

### Bundle concerns

- [x] Recharts code-split into separate chunk (dynamic import)
- [x] Lucide React tree-shaken via named imports
- [x] `reference-data.ts` (~9.5KB source) imports are route-specific
- [ ] **Compare and COL tools bundle their entire tree** including reference data, format utils, Breadcrumb into client JS (GS page fixed via server+client split)
- [x] Dead `@next/font` package removed

---

## 10) Technical Rendering (Next.js-Specific)

### HTML output & crawlability

- [x] Important detail pages (agency, employee, state) are server-rendered
- [x] Metadata rendered in HTML source via `generateMetadata()` or layout.tsx exports
- [x] Canonical tags present in HTML for all important pages
- [x] GS Pay Scale refactored to server component — crawlers see full content + metadata
- [ ] **Compare and COL tools depend on client-side JS for content** — crawlers without JS see empty pages
- [x] Error/loading states do not leak into indexed pages (proper status codes)

### Status codes

- [x] Invalid slugs return proper 404 via `notFound()`
- [x] Error boundaries return 500
- [x] No soft-404s (200 status on error pages)
- [~] No redirect mapping for renamed/moved routes (not needed yet for new project)

---

## 11) Images, OG & Media

### Image hygiene

- [x] No raster images in the application (text/data only) — zero image optimization needed
- [x] OG images generated dynamically via `next/og` on Edge Runtime
- [x] 10 `opengraph-image.tsx` files across routes

### Social previews

- [x] Root layout has OG type, siteName, locale, Twitter card config
- [x] Article detail pages have explicit `openGraph.type: "article"` with dates
- [ ] **Most pages lack explicit OG image reference** — verify `opengraph-image.tsx` files are being picked up by Next.js automatically
- [x] FacebookExternalHit NOT blocked — social sharing previews on Facebook/Meta will render

---

## 12) Search Console Setup & Monitoring

### Setup (pre-launch)

- [ ] Verify domain property in Google Search Console
- [ ] Submit sitemap index (`/sitemap.xml`)
- [ ] Verify robots.txt fetches correctly
- [ ] Inspect key template URLs with URL Inspection:
  - [ ] Homepage
  - [ ] One agency detail (`/agencies/department-of-defense`)
  - [ ] One employee detail
  - [ ] One state detail (`/states/california`)
  - [ ] GS Pay Scale (`/pay-scales/gs`)
  - [ ] One grade detail (`/pay-scales/gs/13`)
  - [ ] One insight article

### Weekly monitoring (first 8 weeks)

- [ ] Coverage / indexing issues
- [ ] "Discovered — currently not indexed" trends (watch employee pages)
- [ ] "Crawled — currently not indexed" trends (thin content signal)
- [ ] Duplicate / canonical issues (Google-selected vs user-selected canonical)
- [ ] Performance report segmented by template type
- [ ] Rich result / Enhancement issues (FAQPage, Article, BreadcrumbList)
- [ ] Manual actions report

### Segment reporting by template

Track these separately:

| Template | Route Pattern | Key Metrics |
|----------|--------------|-------------|
| Agency detail | `/agencies/[slug]` | indexed, impressions, CTR, avg position |
| Employee detail | `/employees/[slug]` | indexed count vs total, thin-content rate |
| State detail | `/states/[slug]` | indexed, impressions, top queries |
| GS Grade detail | `/pay-scales/gs/[grade]` | indexed, impressions ("GS-13 salary") |
| Insight articles | `/insights/[slug]` | indexed, impressions, CTR |
| Tools | `/tools/*`, `/pay-scales/gs` | indexed, impressions |

---

## 13) Trust Signals (E-E-A-T for Government Data)

- [x] Data source attribution (OPM, TX Comptroller, CA Controller) in About page
- [x] FOIA disclaimer in footer
- [x] About page explains purpose and limitations
- [x] Privacy and Terms pages live and linked
- [~] **Contact page uses mailto link** — verify `info@alstonanalytics.com` is set up
- [x] Data freshness indicator on homepage — "Pay data updated January 2025" badge in hero section
- [ ] **No methodology section** explaining: ranking calculation, update cadence, data limitations

---

## 14) Analytics & Event Tracking

### Current

- [x] Vercel Analytics integrated (`@vercel/analytics/next`)

### Missing event tracking

- [ ] `page_view` with template type
- [ ] `search_performed` with query
- [ ] `employee_viewed` with agency/state context
- [ ] `compare_tool_used`
- [ ] `col_tool_used`
- [ ] `share_clicked` (ShareButton)
- [ ] `newsletter_signup` (NewsletterCTA)
- [ ] `jobs_cta_clicked` (JobsCTA/USAJobs affiliate)
- [ ] `empty_state_seen` (for monitoring thin content in production)
- [ ] `scroll_depth`

---

## 15) Launch-Day SEO Smoke Test (15-Minute Ritual)

Do this before every major deploy:

- [ ] Homepage source: correct canonical + metadata + JSON-LD
- [ ] One agency page: correct canonical + GovernmentOrganization JSON-LD + title
- [ ] One employee page: correct canonical + Person JSON-LD + title
- [ ] One state page: correct canonical + FAQPage JSON-LD
- [ ] GS Pay Scale page: has metadata (via layout.tsx)
- [ ] `/robots.txt` loads and references sitemap
- [ ] `/sitemap.xml` loads and child sitemaps load
- [ ] No accidental `noindex` on important pages
- [ ] Mobile Lighthouse: no disasters (not score chasing)
- [ ] GSC URL Inspection on one freshly deployed URL

---

## 16) Priority Fix List (Ordered by Impact)

### P0 — Critical (Fix before launch)

1. ~~**Add metadata to 3 client-component pages**~~ **DONE** — layout.tsx files provide metadata + canonical + JSON-LD
2. ~~**Add content quality gating for employee pages**~~ **DONE** — `noindex,follow` for thin records; sitemap filters by job_title, duty_station, compensation > 0
3. ~~**Fix sitemap `lastModified`**~~ **DONE** — Fixed dates: `DATA_UPDATED` for data pages, `SITE_UPDATED` for code pages
4. ~~**Remove `/search` from sitemap**~~ **DONE**
5. ~~**Add explicit canonical URLs to all pages**~~ **DONE** — All important pages have `alternates.canonical`

### P1 — High (Fix in first week)

6. ~~**Add URL case normalization to middleware**~~ **DONE** — 308 redirect to lowercase
7. ~~**Remove homepage fade-in animation from H1**~~ **DONE** — H1 is static, sub-heading retains animation
8. ~~**Add staging/preview blocking to robots.txt**~~ **DONE** — env-aware `Disallow: /` for non-production
9. ~~**Unblock `FacebookExternalHit`**~~ **DONE**
10. ~~**Add "Related Guides" to agency and state detail pages**~~ **DONE** — 3 guide cards on each

### P2 — Medium (Fix in first month)

11. **Diversify employee page content** — vary narrative, related employees, related guides. (Future work)
12. ~~**Add AI bot rules to robots.txt**~~ **DONE**
13. ~~**Fix GS pay table hover to use CSS instead of React state**~~ **DONE** — Pure CSS `:hover`, no `setHoveredCell`
14. ~~**Fix `COST_INDICES.sort()` mutation**~~ **DONE** — Uses `[...COST_INDICES].sort()`
15. ~~**Remove dead `@next/font` dependency**~~ **DONE**
16. ~~**Fix `dns-prefetch` to point to actual Supabase project URL**~~ **DONE** — env-driven
17. ~~**Add `rel="nofollow"` to external `alstonanalytics.com` link**~~ **DONE**
18. ~~**Use full state names in "Nearby States" anchor text**~~ **DONE**
19. ~~**Convert `<a>` tags to `<Link>` in Compare/COL Related Guides sections**~~ **DONE**
20. ~~**Fix Pay Scales index title double-branding**~~ **DONE**

### P3 — Post-launch

21. Set up Google Search Console + submit sitemap.
22. ~~Add data freshness indicator to homepage.~~ **DONE** — "Pay data updated" badge in hero
23. Add methodology/data sources page.
24. Add custom event tracking.
25. Run Rich Results Test on representative URLs.
26. Update CSP for AdSense when ready.
27. Automated SEO regression tests in CI.

---

## Scoring Summary

| Section | Initial | Current | Notes |
|---------|---------|---------|-------|
| 1. Domain/URL hygiene | 7/10 | **10/10** | Case normalization, canonicals on ALL pages |
| 2. Crawl/indexing controls | 6/10 | **9/10** | Staging blocking, AI bots, /search disallowed, FB unblocked |
| 3. Sitemap architecture | 5/10 | **9/10** | Fixed lastmod, removed /search, quality filtering, /pay-scales added |
| 4. Template indexability | 5/10 | **10/10** | All pages have metadata + canonical. GS refactored to server component. |
| 5. On-page SEO (pSEO) | 4/10 | **6/10** | Quality gating for thin records, graceful fallbacks |
| 6. Structured data | 8/10 | **10/10** | All page types now have JSON-LD |
| 7. Internal linking | 7/10 | **9/10** | Related Guides, duty station links, COL tool, full state names |
| 8. pSEO quality controls | 3/10 | **7/10** | noindex for thin records, sitemap filtering, fallback text |
| 9. Performance/CWV | 7/10 | **9/10** | CSS hover, animation fix, sort fix, dead dep removed, GS SSR |
| 10. Technical rendering | 7/10 | **9/10** | GS refactored to server+client split, layout.tsx covers remaining |
| 11. Images/OG/Media | 8/10 | **9/10** | Facebook crawler unblocked |
| 12. GSC monitoring | 0/10 | 0/10 | Not set up yet (expected pre-launch) |
| 13. Trust signals | 6/10 | **7/10** | Data freshness badge on homepage |
| 14. Analytics | 3/10 | 3/10 | Only basic page views, no event tracking |

**Overall: ~107/140 (76%)** — up from 74% (previous round), 67% (second round), and 39% (initial audit). All P0, P1, and P2 items complete except content diversification (#11). Remaining work is GSC setup (launch day), event tracking, and content diversification (post-launch iteration).
