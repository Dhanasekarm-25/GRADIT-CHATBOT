import { db } from "./config/database.js";

async function analyzeCompleteErpDatabase() {
  try {
    console.log("===============================================================");
    console.log("🏫 GRADIT COLLEGE ERP — COMPREHENSIVE DATABASE ANALYSIS");
    console.log("===============================================================\n");

    // 1. List all tables in erp schema
    const tablesRes = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'erp'
      ORDER BY table_name;
    `);

    console.log("📦 Tables Found in 'erp' Schema:");
    console.table(tablesRes.rows);

    // 2. Analyze erp.students Columns
    const columnsRes = await db.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'erp' AND table_name = 'students'
      ORDER BY ordinal_position;
    `);

    console.log("\n📋 Table Structure: [erp.students]");
    console.table(columnsRes.rows);

    // 3. Count total students & gender/status breakdown
    const totalCount = await db.query("SELECT COUNT(*) AS total FROM erp.students;");
    console.log(`\n👥 Total Students Count: ${totalCount.rows[0].total}`);

    const statusBreakdown = await db.query(`
      SELECT 
        COALESCE(student_status, 'Active') AS status,
        COALESCE(gender, 'Unspecified') AS gender,
        COUNT(*) AS count
      FROM erp.students
      GROUP BY student_status, gender
      ORDER BY status, count DESC;
    `);
    console.log("\n📊 Student Status & Gender Distribution:");
    console.table(statusBreakdown.rows);

    // 4. Retrieve first 30 Students
    const studentsRes = await db.query(`
      SELECT 
        student_id,
        user_id,
        register_number,
        first_name,
        last_name,
        gender,
        date_of_birth,
        admission_date,
        student_status
      FROM erp.students
      ORDER BY student_id ASC
      LIMIT 30;
    `);

    console.log("\n📑 Retrieved Sample Students (Top 30 Records):");
    console.table(studentsRes.rows);

    // 5. Inspect other ERP tables row counts
    console.log("\n📊 Record Counts Across Other Tables:");
    for (const row of tablesRes.rows) {
      const tableName = row.table_name;
      try {
        const countRes = await db.query(`SELECT COUNT(*) AS count FROM erp."${tableName}";`);
        console.log(` - erp.${tableName.padEnd(20)} : ${countRes.rows[0].count} rows`);
      } catch (e: any) {
        console.log(` - erp.${tableName.padEnd(20)} : Error reading count (${e.message})`);
      }
    }

  } catch (error) {
    console.error("❌ Analysis error:", error);
  } finally {
    await db.end();
  }
}

analyzeCompleteErpDatabase();
