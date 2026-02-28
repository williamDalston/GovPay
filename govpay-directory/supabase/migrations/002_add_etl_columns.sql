-- Add columns needed by ETL scripts for data tracking and deduplication

-- External ID for tracking original source records
ALTER TABLE employees ADD COLUMN IF NOT EXISTS external_id TEXT;

-- Data source identifier (STATE_TX, STATE_CA, OPM_FEDSCOPE, etc.)
ALTER TABLE employees ADD COLUMN IF NOT EXISTS data_source TEXT;

-- Index on external_id for upsert performance
CREATE INDEX IF NOT EXISTS idx_employees_external_id ON employees (external_id);

-- Index on data_source for filtering by source
CREATE INDEX IF NOT EXISTS idx_employees_data_source ON employees (data_source);
