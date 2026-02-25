-- GovPay.Directory — Postgres Functions
-- Run this AFTER schema.sql in the Supabase SQL editor

-- Average salary across all employees
CREATE OR REPLACE FUNCTION get_avg_salary()
RETURNS NUMERIC AS $$
  SELECT COALESCE(ROUND(AVG(total_compensation), 0), 0) FROM employees;
$$ LANGUAGE sql STABLE;

-- Top occupations for an agency
CREATE OR REPLACE FUNCTION get_agency_top_occupations(agency_id_param INTEGER)
RETURNS TABLE (title VARCHAR, count BIGINT, avg_salary NUMERIC) AS $$
  SELECT o.title, COUNT(*) as count, ROUND(AVG(e.total_compensation), 0) as avg_salary
  FROM employees e
  JOIN occupations o ON o.id = e.occupation_id
  WHERE e.agency_id = agency_id_param
  GROUP BY o.title
  ORDER BY count DESC
  LIMIT 5;
$$ LANGUAGE sql STABLE;

-- State breakdown for an agency
CREATE OR REPLACE FUNCTION get_agency_state_breakdown(agency_id_param INTEGER)
RETURNS TABLE (state VARCHAR, state_slug VARCHAR, count BIGINT) AS $$
  SELECT s.name as state, s.slug as state_slug, COUNT(*) as count
  FROM employees e
  JOIN states s ON s.id = e.state_id
  WHERE e.agency_id = agency_id_param
  GROUP BY s.name, s.slug
  ORDER BY count DESC
  LIMIT 10;
$$ LANGUAGE sql STABLE;

-- Agencies present in a state
CREATE OR REPLACE FUNCTION get_state_agencies(state_id_param INTEGER)
RETURNS TABLE (name VARCHAR, slug VARCHAR, count BIGINT) AS $$
  SELECT a.name, a.slug, COUNT(*) as count
  FROM employees e
  JOIN agencies a ON a.id = e.agency_id
  WHERE e.state_id = state_id_param
  GROUP BY a.name, a.slug
  ORDER BY count DESC;
$$ LANGUAGE sql STABLE;

-- Salary distribution histogram
CREATE OR REPLACE FUNCTION get_salary_distribution()
RETURNS TABLE (range TEXT, count BIGINT) AS $$
  SELECT
    CASE
      WHEN total_compensation < 40000 THEN '$20k-$40k'
      WHEN total_compensation < 60000 THEN '$40k-$60k'
      WHEN total_compensation < 80000 THEN '$60k-$80k'
      WHEN total_compensation < 100000 THEN '$80k-$100k'
      WHEN total_compensation < 120000 THEN '$100k-$120k'
      WHEN total_compensation < 150000 THEN '$120k-$150k'
      WHEN total_compensation < 200000 THEN '$150k-$200k'
      ELSE '$200k+'
    END as range,
    COUNT(*) as count
  FROM employees
  GROUP BY range
  ORDER BY MIN(total_compensation);
$$ LANGUAGE sql STABLE;

-- Row Level Security: public read access
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE states ENABLE ROW LEVEL SECURITY;
ALTER TABLE occupations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gs_pay_scales ENABLE ROW LEVEL SECURITY;
ALTER TABLE locality_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON employees FOR SELECT USING (true);
CREATE POLICY "Public read" ON agencies FOR SELECT USING (true);
CREATE POLICY "Public read" ON states FOR SELECT USING (true);
CREATE POLICY "Public read" ON occupations FOR SELECT USING (true);
CREATE POLICY "Public read" ON gs_pay_scales FOR SELECT USING (true);
CREATE POLICY "Public read" ON locality_areas FOR SELECT USING (true);
