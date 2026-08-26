import { db } from "./config/database.js";

async function inspectColumns() {
  try {
    const colRes = await db.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'erp' AND table_name IN ('faculty', 'departments', 'roles')
      ORDER BY table_name, ordinal_position;
    `);
    console.table(colRes.rows);

    const faculty = await db.query("SELECT * FROM erp.faculty;");
    console.log("Faculty rows:");
    console.table(faculty.rows);

    const roles = await db.query("SELECT * FROM erp.roles;");
    console.log("Roles rows:");
    console.table(roles.rows);

  } catch (error) {
    console.error(error);
  } finally {
    await db.end();
  }
}

inspectColumns();
