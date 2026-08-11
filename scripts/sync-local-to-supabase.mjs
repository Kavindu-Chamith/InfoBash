import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Pool } from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnvConfig() {
  const env = {};
  const envPath = path.join(__dirname, "..", ".env.local");
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
      if (!line || line.trim().startsWith("#")) continue;
      const i = line.indexOf("=");
      if (i === -1) continue;
      const key = line.slice(0, i).trim();
      const value = line.slice(i + 1).trim();
      if (!env[key]) env[key] = value;
    }
  }
  return { ...env, ...process.env };
}

// Tables in order of foreign key dependency
const TABLES = [
  "groups",
  "captains",
  "teams",
  "players",
  "matches",
  "tournament_settings",
  "admin_users"
];

async function sync() {
  const env = loadEnvConfig();
  const localUrl = env.LOCAL_DATABASE_URL || env.LOCAL_DB_URL;
  const targetUrl = env.DATABASE_URL || env.SUPABASE_DATABASE_URL;

  if (!targetUrl) {
    throw new Error("Target DATABASE_URL is not defined in environment or .env.local.");
  }
  if (!localUrl) {
    throw new Error(
      "LOCAL_DATABASE_URL is not set. Please define LOCAL_DATABASE_URL in .env.local or environment to specify the source database."
    );
  }

  console.log("Starting data migration from Local PostgreSQL to Target Database...\n");

  const cleanLocal = localUrl.replace(/([?&])sslmode=[^&]*/gi, "");
  const cleanTarget = targetUrl.replace(/([?&])sslmode=[^&]*/gi, "");

  const localPool = new Pool({
    connectionString: cleanLocal,
    ssl: cleanLocal.includes("localhost") ? false : { rejectUnauthorized: false }
  });

  const supabasePool = new Pool({
    connectionString: cleanTarget,
    ssl: cleanTarget.includes("localhost") ? false : { rejectUnauthorized: false }
  });

  try {
    for (const table of TABLES) {
      console.log(`Processing table: ${table}...`);
      
      // 1. Check if table exists in local
      const existsCheck = await localPool.query(
        `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1`,
        [table]
      );
      if (existsCheck.rows.length === 0) {
        console.log(`  Table ${table} does not exist in local database. Skipping.`);
        continue;
      }

      // 2. Fetch all rows from local
      const localData = await localPool.query(`SELECT * FROM "${table}"`);
      console.log(`  Found ${localData.rows.length} rows in local "${table}".`);

      if (localData.rows.length === 0) continue;

      const columns = Object.keys(localData.rows[0]);
      const quotedCols = columns.map(c => `"${c}"`).join(", ");

      // 3. Insert rows into Target DB
      let inserted = 0;
      for (const row of localData.rows) {
        const values = columns.map(c => row[c]);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
        
        // Handle table-specific conflict targets
        let query;
        if (table === "tournament_settings") {
          const updateSets = columns
            .filter(c => c !== "key")
            .map(c => `"${c}" = EXCLUDED."${c}"`)
            .join(", ");
          query = `
            INSERT INTO "${table}" (${quotedCols})
            VALUES (${placeholders})
            ON CONFLICT ("key") DO UPDATE SET ${updateSets || '"key" = EXCLUDED."key"'}
          `;
        } else if (table === "admin_users") {
          query = `
            INSERT INTO "${table}" (${quotedCols})
            VALUES (${placeholders})
            ON CONFLICT ("username") DO UPDATE SET "password_hash" = EXCLUDED."password_hash"
          `;
        } else if (table === "groups") {
          query = `
            INSERT INTO "${table}" (${quotedCols})
            VALUES (${placeholders})
            ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name"
          `;
        } else if (table === "captains") {
          query = `
            INSERT INTO "${table}" (${quotedCols})
            VALUES (${placeholders})
            ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name", "email" = EXCLUDED."email", "password_hash" = EXCLUDED."password_hash"
          `;
        } else if (table === "teams") {
          query = `
            INSERT INTO "${table}" (${quotedCols})
            VALUES (${placeholders})
            ON CONFLICT ("id") DO UPDATE SET "team_name" = EXCLUDED."team_name"
          `;
        } else if (table === "players") {
          query = `
            INSERT INTO "${table}" (${quotedCols})
            VALUES (${placeholders})
            ON CONFLICT ("id") DO NOTHING
          `;
        } else if (columns.includes("id")) {
          query = `
            INSERT INTO "${table}" (${quotedCols})
            VALUES (${placeholders})
            ON CONFLICT ("id") DO NOTHING
          `;
        } else {
          query = `
            INSERT INTO "${table}" (${quotedCols})
            VALUES (${placeholders})
            ON CONFLICT DO NOTHING
          `;
        }

        await supabasePool.query(query, values);
        inserted++;
      }
      console.log(`  Successfully synced ${inserted} rows into target "${table}".\n`);
    }

    console.log("=== Verification of Row Counts in Target DB ===");
    for (const table of TABLES) {
      try {
        const countRes = await supabasePool.query(`SELECT COUNT(*) FROM "${table}"`);
        console.log(`  - ${table}: ${countRes.rows[0].count} rows`);
      } catch (err) {
        console.log(`  - ${table}: (table check error: ${err.message})`);
      }
    }
    console.log("\nMigration completed successfully!");
  } catch (err) {
    console.error("Migration Error:", err);
  } finally {
    await localPool.end();
    await supabasePool.end();
  }
}

sync();
