-- Run this script to initialize the database
-- Execute from backend directory: sqlite3 volt.db < init-db.sql

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Run the migration manually since we're in dev
.read migrations/001_initial_schema.sql

-- Verify tables were created
.tables
