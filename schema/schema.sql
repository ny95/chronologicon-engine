CREATE DATABASE IF NOT EXISTS chronologicon
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE chronologicon;

CREATE TABLE IF NOT EXISTS historical_events (
  event_id CHAR(36) NOT NULL,
  event_name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  start_date DATETIME(3) NOT NULL,
  end_date DATETIME(3) NOT NULL,
  duration_minutes INT NOT NULL,
  parent_event_id CHAR(36) NULL,
  metadata JSON NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (event_id),
  CONSTRAINT fk_historical_events_parent
    FOREIGN KEY (parent_event_id)
    REFERENCES historical_events(event_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT chk_historical_events_dates CHECK (end_date > start_date),
  CONSTRAINT chk_historical_events_duration CHECK (duration_minutes > 0)
);

CREATE INDEX idx_historical_events_start_date ON historical_events(start_date);
CREATE INDEX idx_historical_events_end_date ON historical_events(end_date);
CREATE INDEX idx_historical_events_parent_event_id ON historical_events(parent_event_id);
CREATE INDEX idx_historical_events_event_name ON historical_events(event_name);

CREATE TABLE IF NOT EXISTS ingestion_jobs (
  job_id VARCHAR(128) NOT NULL,
  status ENUM('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'QUEUED',
  file_path VARCHAR(2048) NOT NULL,
  processed_lines INT NOT NULL DEFAULT 0,
  error_lines INT NOT NULL DEFAULT 0,
  total_lines INT NOT NULL DEFAULT 0,
  errors JSON NOT NULL,
  start_time DATETIME(3) NULL,
  end_time DATETIME(3) NULL,
  failure_reason TEXT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (job_id)
);
