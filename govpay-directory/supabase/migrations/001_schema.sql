-- GovPay.Directory — Database Schema
-- Run this migration against your Supabase project to set up all required
-- tables, indexes, and RPC functions.

-- Extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =========================================================================
-- Tables
-- =========================================================================

CREATE TABLE IF NOT EXISTS agencies (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  abbreviation TEXT,
  employee_count INTEGER DEFAULT 0,
  avg_salary  NUMERIC(12, 2) DEFAULT 0,
  median_salary NUMERIC(12, 2) DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS states (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  abbreviation TEXT NOT NULL,
  employee_count INTEGER DEFAULT 0,
  avg_salary  NUMERIC(12, 2) DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS occupations (
  id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code  TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS employees (
  id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug                TEXT NOT NULL UNIQUE,
  first_name          TEXT NOT NULL,
  last_name           TEXT NOT NULL,
  full_name           TEXT NOT NULL,
  job_title           TEXT,
  duty_station        TEXT,
  pay_plan            TEXT,
  grade               TEXT,
  step                TEXT,
  base_salary         NUMERIC(12, 2),
  total_compensation  NUMERIC(12, 2),
  fiscal_year         INTEGER NOT NULL,
  agency_id           BIGINT REFERENCES agencies(id),
  state_id            BIGINT REFERENCES states(id),
  occupation_id       BIGINT REFERENCES occupations(id),
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

-- =========================================================================
-- Indexes
-- =========================================================================

CREATE INDEX IF NOT EXISTS idx_employees_slug ON employees (slug);
CREATE INDEX IF NOT EXISTS idx_employees_agency ON employees (agency_id);
CREATE INDEX IF NOT EXISTS idx_employees_state ON employees (state_id);
CREATE INDEX IF NOT EXISTS idx_employees_compensation ON employees (total_compensation DESC);
CREATE INDEX IF NOT EXISTS idx_employees_fiscal_year ON employees (fiscal_year);
CREATE INDEX IF NOT EXISTS idx_employees_pay_plan_grade ON employees (pay_plan, grade);

-- Trigram index for full-text autocomplete search
CREATE INDEX IF NOT EXISTS idx_employees_name_trgm ON employees USING gin (full_name gin_trgm_ops);

-- Full-text search index
ALTER TABLE employees ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (to_tsvector('english', coalesce(full_name, ''))) STORED;
CREATE INDEX IF NOT EXISTS idx_employees_fts ON employees USING gin (fts);

-- =========================================================================
-- RPC Functions
-- =========================================================================

-- Average salary across all employees
CREATE OR REPLACE FUNCTION get_avg_salary()
RETURNS NUMERIC AS $$
  SELECT COALESCE(AVG(total_compensation), 0) FROM employees;
$$ LANGUAGE sql STABLE;

-- Top occupations for a given agency
CREATE OR REPLACE FUNCTION get_agency_top_occupations(agency_id_param BIGINT)
RETURNS TABLE(title TEXT, count BIGINT, avg_salary NUMERIC) AS $$
  SELECT
    o.title,
    COUNT(*) AS count,
    AVG(e.total_compensation) AS avg_salary
  FROM employees e
  JOIN occupations o ON o.id = e.occupation_id
  WHERE e.agency_id = agency_id_param
  GROUP BY o.title
  ORDER BY count DESC
  LIMIT 10;
$$ LANGUAGE sql STABLE;

-- State breakdown for a given agency
CREATE OR REPLACE FUNCTION get_agency_state_breakdown(agency_id_param BIGINT)
RETURNS TABLE(state TEXT, state_slug TEXT, count BIGINT) AS $$
  SELECT
    s.name AS state,
    s.slug AS state_slug,
    COUNT(*) AS count
  FROM employees e
  JOIN states s ON s.id = e.state_id
  WHERE e.agency_id = agency_id_param
  GROUP BY s.name, s.slug
  ORDER BY count DESC;
$$ LANGUAGE sql STABLE;

-- Agencies present in a given state
CREATE OR REPLACE FUNCTION get_state_agencies(state_id_param BIGINT)
RETURNS TABLE(name TEXT, slug TEXT, count BIGINT) AS $$
  SELECT
    a.name,
    a.slug,
    COUNT(*) AS count
  FROM employees e
  JOIN agencies a ON a.id = e.agency_id
  WHERE e.state_id = state_id_param
  GROUP BY a.name, a.slug
  ORDER BY count DESC;
$$ LANGUAGE sql STABLE;

-- Global salary distribution across 8 buckets
CREATE OR REPLACE FUNCTION get_salary_distribution()
RETURNS TABLE(range TEXT, count BIGINT) AS $$
  SELECT range, count FROM (
    VALUES
      ('$20k-$40k',   (SELECT COUNT(*) FROM employees WHERE total_compensation >= 20000 AND total_compensation < 40000)),
      ('$40k-$60k',   (SELECT COUNT(*) FROM employees WHERE total_compensation >= 40000 AND total_compensation < 60000)),
      ('$60k-$80k',   (SELECT COUNT(*) FROM employees WHERE total_compensation >= 60000 AND total_compensation < 80000)),
      ('$80k-$100k',  (SELECT COUNT(*) FROM employees WHERE total_compensation >= 80000 AND total_compensation < 100000)),
      ('$100k-$120k', (SELECT COUNT(*) FROM employees WHERE total_compensation >= 100000 AND total_compensation < 120000)),
      ('$120k-$150k', (SELECT COUNT(*) FROM employees WHERE total_compensation >= 120000 AND total_compensation < 150000)),
      ('$150k-$200k', (SELECT COUNT(*) FROM employees WHERE total_compensation >= 150000 AND total_compensation < 200000)),
      ('$200k+',      (SELECT COUNT(*) FROM employees WHERE total_compensation >= 200000))
  ) AS t(range, count);
$$ LANGUAGE sql STABLE;

-- Refresh denormalized stats on the agencies table
CREATE OR REPLACE FUNCTION refresh_agency_stats()
RETURNS VOID AS $$
  UPDATE agencies a SET
    employee_count = sub.cnt,
    avg_salary = sub.avg_comp,
    median_salary = sub.med_comp,
    updated_at = now()
  FROM (
    SELECT
      agency_id,
      COUNT(*) AS cnt,
      AVG(total_compensation) AS avg_comp,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY total_compensation) AS med_comp
    FROM employees
    GROUP BY agency_id
  ) sub
  WHERE a.id = sub.agency_id;
$$ LANGUAGE sql VOLATILE;

-- Refresh denormalized stats on the states table
CREATE OR REPLACE FUNCTION refresh_state_stats()
RETURNS VOID AS $$
  UPDATE states s SET
    employee_count = sub.cnt,
    avg_salary = sub.avg_comp,
    updated_at = now()
  FROM (
    SELECT
      state_id,
      COUNT(*) AS cnt,
      AVG(total_compensation) AS avg_comp
    FROM employees
    GROUP BY state_id
  ) sub
  WHERE s.id = sub.state_id;
$$ LANGUAGE sql VOLATILE;

-- =========================================================================
-- Row-Level Security (optional — enable per table as needed)
-- =========================================================================

-- Allow public read access to all tables (data is public record)
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE states ENABLE ROW LEVEL SECURITY;
ALTER TABLE occupations ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON agencies FOR SELECT USING (true);
CREATE POLICY "Public read access" ON states FOR SELECT USING (true);
CREATE POLICY "Public read access" ON occupations FOR SELECT USING (true);
CREATE POLICY "Public read access" ON employees FOR SELECT USING (true);
