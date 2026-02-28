-- Salary distribution for a specific agency (by agency_id)
-- Uses a single table scan with CASE for efficiency
CREATE OR REPLACE FUNCTION get_agency_salary_distribution(agency_id_param BIGINT)
RETURNS TABLE(range TEXT, count BIGINT) AS $$
  SELECT range, count FROM (
    SELECT
      SUM(CASE WHEN total_compensation >= 20000 AND total_compensation < 40000 THEN 1 ELSE 0 END) AS bucket_20_40,
      SUM(CASE WHEN total_compensation >= 40000 AND total_compensation < 60000 THEN 1 ELSE 0 END) AS bucket_40_60,
      SUM(CASE WHEN total_compensation >= 60000 AND total_compensation < 80000 THEN 1 ELSE 0 END) AS bucket_60_80,
      SUM(CASE WHEN total_compensation >= 80000 AND total_compensation < 100000 THEN 1 ELSE 0 END) AS bucket_80_100,
      SUM(CASE WHEN total_compensation >= 100000 AND total_compensation < 120000 THEN 1 ELSE 0 END) AS bucket_100_120,
      SUM(CASE WHEN total_compensation >= 120000 AND total_compensation < 150000 THEN 1 ELSE 0 END) AS bucket_120_150,
      SUM(CASE WHEN total_compensation >= 150000 AND total_compensation < 200000 THEN 1 ELSE 0 END) AS bucket_150_200,
      SUM(CASE WHEN total_compensation >= 200000 THEN 1 ELSE 0 END) AS bucket_200_plus
    FROM employees
    WHERE agency_id = agency_id_param
  ) agg
  CROSS JOIN LATERAL (
    VALUES
      ('$20k-$40k', agg.bucket_20_40),
      ('$40k-$60k', agg.bucket_40_60),
      ('$60k-$80k', agg.bucket_60_80),
      ('$80k-$100k', agg.bucket_80_100),
      ('$100k-$120k', agg.bucket_100_120),
      ('$120k-$150k', agg.bucket_120_150),
      ('$150k-$200k', agg.bucket_150_200),
      ('$200k+', agg.bucket_200_plus)
  ) AS t(range, count);
$$ LANGUAGE sql STABLE;

-- Fuzzy search for employees using trigram similarity
-- Handles typos, alternate spellings, and missing middle names
-- e.g., "John Smith" matches "John Michael Smith"
CREATE OR REPLACE FUNCTION search_employees_fuzzy(search_term TEXT, result_limit INT DEFAULT 5)
RETURNS TABLE(
  slug TEXT,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  agency_name TEXT,
  similarity REAL
) AS $$
  SELECT 
    e.slug,
    e.first_name,
    e.last_name,
    e.full_name,
    a.name AS agency_name,
    -- Use best similarity score from full_name or first+last combo
    GREATEST(
      similarity(e.full_name, search_term),
      similarity(e.first_name || ' ' || e.last_name, search_term)
    ) AS similarity
  FROM employees e
  LEFT JOIN agencies a ON a.id = e.agency_id
  WHERE 
    -- Match against full name (includes middle name)
    e.full_name % search_term
    OR e.full_name ILIKE '%' || search_term || '%'
    -- Match against first + last only (ignores middle name)
    OR (e.first_name || ' ' || e.last_name) % search_term
    -- Match first name OR last name separately (for single-word searches)
    OR e.first_name % search_term
    OR e.last_name % search_term
  ORDER BY 
    GREATEST(
      similarity(e.full_name, search_term),
      similarity(e.first_name || ' ' || e.last_name, search_term)
    ) DESC,
    e.total_compensation DESC
  LIMIT result_limit;
$$ LANGUAGE sql STABLE;

-- Salary distribution for a specific state (by state_id)
CREATE OR REPLACE FUNCTION get_state_salary_distribution(state_id_param BIGINT)
RETURNS TABLE(range TEXT, count BIGINT) AS $$
  SELECT range, count FROM (
    VALUES
      ('$20k-$40k',   (SELECT COUNT(*) FROM employees WHERE state_id = state_id_param AND total_compensation >= 20000 AND total_compensation < 40000)),
      ('$40k-$60k',   (SELECT COUNT(*) FROM employees WHERE state_id = state_id_param AND total_compensation >= 40000 AND total_compensation < 60000)),
      ('$60k-$80k',   (SELECT COUNT(*) FROM employees WHERE state_id = state_id_param AND total_compensation >= 60000 AND total_compensation < 80000)),
      ('$80k-$100k',  (SELECT COUNT(*) FROM employees WHERE state_id = state_id_param AND total_compensation >= 80000 AND total_compensation < 100000)),
      ('$100k-$120k', (SELECT COUNT(*) FROM employees WHERE state_id = state_id_param AND total_compensation >= 100000 AND total_compensation < 120000)),
      ('$120k-$150k', (SELECT COUNT(*) FROM employees WHERE state_id = state_id_param AND total_compensation >= 120000 AND total_compensation < 150000)),
      ('$150k-$200k', (SELECT COUNT(*) FROM employees WHERE state_id = state_id_param AND total_compensation >= 150000 AND total_compensation < 200000)),
      ('$200k+',      (SELECT COUNT(*) FROM employees WHERE state_id = state_id_param AND total_compensation >= 200000))
  ) AS t(range, count);
$$ LANGUAGE sql STABLE;
