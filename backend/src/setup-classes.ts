import { db } from "./config/database.js";

async function updateStudentClasses() {
  try {
    await db.query(`
      UPDATE erp.student_classes SET class_id = 1 WHERE student_id BETWEEN 1 AND 50;
      UPDATE erp.student_classes SET class_id = 2 WHERE student_id BETWEEN 51 AND 100;
      UPDATE erp.student_classes SET class_id = 3 WHERE student_id BETWEEN 101 AND 150;
      UPDATE erp.student_classes SET class_id = 4 WHERE student_id BETWEEN 151 AND 200;
    `);

    const result = await db.query(`
      SELECT 
        c.class_id,
        c.class_name,
        c.program_name,
        COUNT(sc.student_id) AS student_count,
        MIN(sc.student_id) AS min_id,
        MAX(sc.student_id) AS max_id
      FROM erp.classes c
      JOIN erp.student_classes sc ON c.class_id = sc.class_id
      GROUP BY c.class_id, c.class_name, c.program_name
      ORDER BY c.class_id;
    `);

    console.log("✅ Updated 50 Students Per Class Distribution:");
    console.table(result.rows);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await db.end();
  }
}

updateStudentClasses();
