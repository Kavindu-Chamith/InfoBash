-- InfoBash v5.0 registration database schema
-- Run this once against your PostgreSQL database before using the site.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name TEXT NOT NULL UNIQUE,
  batch TEXT NOT NULL,
  captain_name TEXT NOT NULL,
  captain_contact TEXT NOT NULL,
  captain_email TEXT NOT NULL,
  vice_captain_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  position SMALLINT NOT NULL CHECK (position BETWEEN 1 AND 11),
  full_name TEXT NOT NULL,
  student_id TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  UNIQUE (team_id, position)
);

CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_teams_batch ON teams(batch);

-- v5.1: captain accounts, group allocation, match scheduling, team logos
CREATE TABLE IF NOT EXISTS captains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE teams ADD COLUMN IF NOT EXISTS captain_id UUID REFERENCES captains(id) ON DELETE SET NULL;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES groups(id) ON DELETE SET NULL;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS logo BYTEA;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS logo_mime TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_teams_captain_id ON teams(captain_id) WHERE captain_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_teams_group_id ON teams(group_id);

CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage TEXT NOT NULL CHECK (stage IN ('group', 'semifinal', 'final', 'custom')),
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  round SMALLINT NOT NULL DEFAULT 1,
  label TEXT,
  team_a_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  team_b_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  team_a_score SMALLINT,
  team_b_score SMALLINT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed')),
  winner_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ,
  venue TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_matches_group_id ON matches(group_id);
CREATE INDEX IF NOT EXISTS idx_matches_stage ON matches(stage);

-- v5.2: team logos moved to S3 (presigned uploads); legacy logo/logo_mime
-- columns stay in place as a fallback for teams that registered before this.
ALTER TABLE teams ADD COLUMN IF NOT EXISTS logo_s3_key TEXT;

CREATE TABLE IF NOT EXISTS tournament_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Admin users table storing hashed passwords via pgcrypto / crypt
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

