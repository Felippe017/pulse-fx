CREATE TABLE observations (
  id SERIAL PRIMARY KEY,
  indicator_id INTEGER NOT NULL REFERENCES indicators(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  value NUMERIC(20, 6) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(indicator_id, date)
);

CREATE INDEX idx_observations_indicator_date ON observations(indicator_id, date DESC);
