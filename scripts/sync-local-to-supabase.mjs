import { Pool } from "pg";

const LOCAL_URL = "postgresql://postgres:Nobody0212%23@localhost:5432/infobash";
const SUPABASE_URL = "postgresql://postgres.bkvyxrqrsrhamoxoqfsz:Bba5CSW1Y3044Yir@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

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
  console.log("Starting data migration from Local PostgreSQL to Supabase...\n");

  const localPool = new Pool({ connectionString: LOCAL_URL, ssl: false });
  const supabasePool = new Pool({
    connectionString: SUPABASE_URL,
    ssl: { rejectUnauthorized: false }
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

      // 3. Insert rows into Supabase
      let inserted = 0;
      for (const row of localData.rows) {
        const values = columns.map(c => row[c]);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
        
        // For tables with a primary key, we can do ON CONFLICT DO UPDATE or DO NOTHING
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
        } else if (columns.includes("id")) {
          const updateSets = columns
            .filter(c => c !== "id")
            .map(c => `"${c}" = EXCLUDED."${c}"`)
            .join(", ");
          query = `
            INSERT INTO "${table}" (${quotedCols})
            VALUES (${placeholders})
            ON CONFLICT ("id") DO UPDATE SET ${updateSets || '"id" = EXCLUDED."id"'}
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
      console.log(`  Successfully synced ${inserted} rows into Supabase "${table}".\n`);
    }

    console.log("=== Verification of Row Counts in Supabase ===");
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
