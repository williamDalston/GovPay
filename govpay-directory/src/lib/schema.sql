-- GovPay.Directory Database Schema
-- PostgreSQL (Supabase/Neon compatible)

-- Agencies
CREATE TABLE agencies (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(500) NOT NULL,
    abbreviation VARCHAR(20),
    parent_agency_id INTEGER REFERENCES agencies(id),
    employee_count INTEGER DEFAULT 0,
    avg_salary DECIMAL(12, 2),
    median_salary DECIMAL(12, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agencies_slug ON agencies(slug);
CREATE INDEX idx_agencies_name ON agencies USING gin(to_tsvector('english', name));

-- States
CREATE TABLE states (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    abbreviation CHAR(2) NOT NULL,
    employee_count INTEGER DEFAULT 0,
    avg_salary DECIMAL(12, 2)
);

-- Occupations (OPM Occupation Series)
CREATE TABLE occupations (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    employee_count INTEGER DEFAULT 0,
    avg_salary DECIMAL(12, 2)
);

CREATE INDEX idx_occupations_code ON occupations(code);

-- Employees (main data table)
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    external_id VARCHAR(100), -- source record identifier
    slug VARCHAR(500) UNIQUE NOT NULL,
    first_name VARCHAR(200) NOT NULL,
    last_name VARCHAR(200) NOT NULL,
    full_name VARCHAR(400) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    job_title VARCHAR(500),
    agency_id INTEGER REFERENCES agencies(id),
    sub_agency VARCHAR(500),
    duty_station VARCHAR(500),
    state_id INTEGER REFERENCES states(id),
    pay_plan VARCHAR(10),
    grade VARCHAR(10),
    step VARCHAR(5),
    base_salary DECIMAL(12, 2),
    total_compensation DECIMAL(12, 2),
    occupation_id INTEGER REFERENCES occupations(id),
    fiscal_year INTEGER NOT NULL DEFAULT 2025,
    data_source VARCHAR(50) DEFAULT 'OPM', -- OPM, STATE, MUNICIPAL, BLS
    raw_data JSONB, -- original record for reference
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance-critical indexes
CREATE INDEX idx_employees_slug ON employees(slug);
CREATE INDEX idx_employees_agency ON employees(agency_id);
CREATE INDEX idx_employees_state ON employees(state_id);
CREATE INDEX idx_employees_occupation ON employees(occupation_id);
CREATE INDEX idx_employees_grade ON employees(pay_plan, grade);
CREATE INDEX idx_employees_salary ON employees(total_compensation DESC);
CREATE INDEX idx_employees_year ON employees(fiscal_year);
CREATE INDEX idx_employees_name_search ON employees USING gin(
    to_tsvector('english', first_name || ' ' || last_name || ' ' || COALESCE(job_title, ''))
);

-- GS Pay Scale Table
CREATE TABLE gs_pay_scales (
    id SERIAL PRIMARY KEY,
    fiscal_year INTEGER NOT NULL,
    grade INTEGER NOT NULL,
    step INTEGER NOT NULL,
    base_pay DECIMAL(12, 2) NOT NULL,
    UNIQUE(fiscal_year, grade, step)
);

-- Locality Pay Areas
CREATE TABLE locality_areas (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(500) NOT NULL,
    adjustment_rate DECIMAL(6, 4) NOT NULL, -- e.g., 1.3275 for DC
    fiscal_year INTEGER NOT NULL,
    UNIQUE(slug, fiscal_year)
);

-- ETL Pipeline Tracking
CREATE TABLE etl_runs (
    id SERIAL PRIMARY KEY,
    source VARCHAR(50) NOT NULL, -- OPM, STATE_TX, MUNICIPAL_NYC, BLS
    status VARCHAR(20) DEFAULT 'running', -- running, completed, failed
    records_processed INTEGER DEFAULT 0,
    records_inserted INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    errors JSONB DEFAULT '[]',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Content generation tracking (for AI narratives)
CREATE TABLE generated_content (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL, -- employee, agency, state, occupation
    entity_id INTEGER NOT NULL,
    content_type VARCHAR(50) NOT NULL, -- narrative, summary, comparison
    content TEXT NOT NULL,
    model VARCHAR(100), -- gpt-4o-mini, etc.
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_generated_content_entity ON generated_content(entity_type, entity_id);

-- Sitemap tracking
CREATE TABLE sitemap_pages (
    id SERIAL PRIMARY KEY,
    url VARCHAR(1000) UNIQUE NOT NULL,
    page_type VARCHAR(50) NOT NULL,
    last_modified TIMESTAMPTZ DEFAULT NOW(),
    indexed BOOLEAN DEFAULT FALSE,
    impressions_90d INTEGER DEFAULT 0,
    noindex BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_sitemap_pages_type ON sitemap_pages(page_type);
CREATE INDEX idx_sitemap_pages_noindex ON sitemap_pages(noindex) WHERE noindex = FALSE;

-- Materialized view for agency stats (refresh periodically)
CREATE MATERIALIZED VIEW agency_stats AS
SELECT
    a.id AS agency_id,
    a.slug,
    a.name,
    COUNT(e.id) AS employee_count,
    ROUND(AVG(e.total_compensation), 2) AS avg_salary,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY e.total_compensation) AS median_salary,
    MAX(e.total_compensation) AS max_salary,
    MIN(e.total_compensation) AS min_salary
FROM agencies a
LEFT JOIN employees e ON e.agency_id = a.id
GROUP BY a.id, a.slug, a.name;

CREATE UNIQUE INDEX idx_agency_stats_id ON agency_stats(agency_id);

-- Materialized view for state stats
CREATE MATERIALIZED VIEW state_stats AS
SELECT
    s.id AS state_id,
    s.slug,
    s.name,
    COUNT(e.id) AS employee_count,
    ROUND(AVG(e.total_compensation), 2) AS avg_salary,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY e.total_compensation) AS median_salary
FROM states s
LEFT JOIN employees e ON e.state_id = s.id
GROUP BY s.id, s.slug, s.name;

CREATE UNIQUE INDEX idx_state_stats_id ON state_stats(state_id);
