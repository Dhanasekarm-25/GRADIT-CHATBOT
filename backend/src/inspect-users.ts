import { db } from "./config/database.js";

async function inspectUsersEmail() {
  try {
    const userCols = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'erp' AND table_name = 'users';
    `);
    console.log("erp.users columns:");
    console.table(userCols.rows);

    const sampleUsers = await db.query("SELECT * FROM erp.users LIMIT 10;");
    console.log("Sample erp.users:");
    console.table(sampleUsers.rows);

  } catch (e) {
    console.error(e);
  } finally {
    await db.end();
  }
}

inspectUsersEmail();
