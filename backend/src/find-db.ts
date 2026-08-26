import pg from "pg";
import { config } from "./config/env.js";

const dbsToTest = ["college_erp", "postgres", "gradit_erp"];

async function findCorrectDatabase() {
  for (const dbName of dbsToTest) {
    const pool = new pg.Pool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: dbName,
      connectionTimeoutMillis: 3000,
    });

    try {
      const res = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'erp'
      `);
      console.log(`\n📦 Database "${dbName}": Found ${res.rows.length} tables in 'erp' schema:`, res.rows.map(r => r.table_name));

      if (res.rows.length > 0) {
        const studentCount = await pool.query("SELECT COUNT(*) FROM erp.students;");
        console.log(`   -> Total Students in "${dbName}":`, studentCount.rows[0].count);
      }
    } catch (err: any) {
      console.log(`❌ Database "${dbName}": Error: ${err.message}`);
    } finally {
      await pool.end();
    }
  }
}

findCorrectDatabase();
