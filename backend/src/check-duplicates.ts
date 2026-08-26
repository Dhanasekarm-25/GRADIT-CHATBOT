import { db } from "./config/database.js";

async function checkDuplicates() {
  try {
    const res = await db.query(`
      SELECT 
        s.first_name,
        COUNT(*) as count,
        ARRAY_AGG(s.student_id ORDER BY s.student_id) as ids,
        ARRAY_AGG(
          CASE 
            WHEN s.student_id BETWEEN 1 AND 50 THEN 'MCA A'
            WHEN s.student_id BETWEEN 51 AND 100 THEN 'MCA B'
            WHEN s.student_id BETWEEN 101 AND 150 THEN 'MCA Gen AI A'
            ELSE 'MCA Gen AI B'
          END ORDER BY s.student_id
        ) as classes
      FROM erp.students s
      GROUP BY s.first_name
      HAVING COUNT(*) > 1
      ORDER BY count DESC
      LIMIT 10;
    `);

    console.log("Students with Same First Name:");
    console.table(res.rows);
  } catch (e) {
    console.error(e);
  } finally {
    await db.end();
  }
}

checkDuplicates();
