import pg from "pg";
import { config } from "./config/env.js";

async function checkNames() {
  const pool = new pg.Pool({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
  });

  try {
    const res = await pool.query(`
      SELECT student_id, register_number, first_name, last_name, gender 
      FROM erp.students 
      WHERE first_name ILIKE '%chandr%' OR last_name ILIKE '%chandr%' OR first_name ILIKE '%chan%'
      ORDER BY student_id;
    `);
    console.log("Found students matching 'chan':");
    console.table(res.rows);

    const allFirstNames = await pool.query(`
      SELECT DISTINCT first_name FROM erp.students ORDER BY first_name;
    `);
    console.log("Distinct first names in database:", allFirstNames.rows.map(r => r.first_name).join(", "));

  } catch (e: any) {
    console.error("Error:", e.message);
  } finally {
    await pool.end();
  }
}

checkNames();
