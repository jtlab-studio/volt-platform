-- Add migration script here
-- Users table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Races table
CREATE TABLE races (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    gpx_data TEXT NOT NULL, -- JSON data
    distance_km REAL NOT NULL,
    elevation_gain_m REAL NOT NULL,
    elevation_loss_m REAL NOT NULL,
    itra_effort_distance REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Synthesis results table
CREATE TABLE synthesis_results (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    reference_race_id TEXT NOT NULL,
    bbox_geometry TEXT NOT NULL, -- JSON data
    results TEXT NOT NULL, -- JSON array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reference_race_id) REFERENCES races(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_races_user_id ON races(user_id);
CREATE INDEX idx_synthesis_results_user_id ON synthesis_results(user_id);
CREATE INDEX idx_synthesis_results_reference_race_id ON synthesis_results(reference_race_id);