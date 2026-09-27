CREATE TABLE sync_log (
  id SERIAL PRIMARY KEY,
  indicator_id INTEGER NOT NULL REFERENCES indicators(id) ON DELETE CASCADE,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) NOT NULL DEFAULT 'success',  -- 'success' | 'error'
  observations_count INTEGER DEFAULT 0,
  error_message TEXT
);

CREATE INDEX idx_sync_log_indicator_synced ON sync_log(indicator_id, synced_at DESC);
