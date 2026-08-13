import { pool } from "@/lib/db";

let isInitialized = false;

export async function initDatabaseSchema() {
  if (isInitialized) return;

  try {
    // 1. Ensure Extension
    await pool.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`).catch(() => {});

    // 2. Ensure Captains Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS captains (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    // 3. Ensure Groups Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS groups (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    // 4. Ensure Teams Table Columns
    await pool.query(`
      ALTER TABLE teams ADD COLUMN IF NOT EXISTS captain_id UUID REFERENCES captains(id) ON DELETE SET NULL;
      ALTER TABLE teams ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES groups(id) ON DELETE SET NULL;
      ALTER TABLE teams ADD COLUMN IF NOT EXISTS logo BYTEA;
      ALTER TABLE teams ADD COLUMN IF NOT EXISTS logo_mime TEXT;
      ALTER TABLE teams ADD COLUMN IF NOT EXISTS logo_s3_key TEXT;
      ALTER TABLE players ADD COLUMN IF NOT EXISTS card TEXT;
    `).catch(() => {});

    // 5. Ensure Matches Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS matches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        stage TEXT NOT NULL DEFAULT 'group',
        group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
        round SMALLINT NOT NULL DEFAULT 1,
        label TEXT,
        team_a_id UUID REFERENCES teams(id) ON DELETE SET NULL,
        team_b_id UUID REFERENCES teams(id) ON DELETE SET NULL,
        team_a_score SMALLINT,
        team_b_score SMALLINT,
        team_a_wickets SMALLINT,
        team_b_wickets SMALLINT,
        team_a_overs TEXT,
        team_b_overs TEXT,
        status TEXT NOT NULL DEFAULT 'scheduled',
        winner_id UUID REFERENCES teams(id) ON DELETE SET NULL,
        scheduled_at TIMESTAMPTZ,
        venue TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    // 6. Ensure Matches Table Columns & Constraints
    await pool.query(`
      ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_stage_check;
      ALTER TABLE matches ADD COLUMN IF NOT EXISTS team_a_wickets SMALLINT;
      ALTER TABLE matches ADD COLUMN IF NOT EXISTS team_b_wickets SMALLINT;
      ALTER TABLE matches ADD COLUMN IF NOT EXISTS team_a_overs TEXT;
      ALTER TABLE matches ADD COLUMN IF NOT EXISTS team_b_overs TEXT;
    `).catch(() => {});

    // 7. Ensure Tournament Settings Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tournament_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed default settings if empty
    await pool.query(`
      INSERT INTO tournament_settings (key, value)
      VALUES ('activeRound', 'round1'), ('matchesPublished', 'true')
      ON CONFLICT (key) DO NOTHING;
    `).catch(() => {});

    isInitialized = true;
  } catch (err) {
    console.error("Database auto-initialization error:", err);
  }
}
