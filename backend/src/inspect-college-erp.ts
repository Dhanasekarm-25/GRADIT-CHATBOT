import pg from "pg";
import { config } from "./config/env.js";

async function inspectCollegeErpData() {
  const pool = new pg.Pool({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
  });

  try {
    console.log("Checking erp.students in college_erp database...\n");

    const totalStudents = await pool.query("SELECT COUNT(*) FROM erp.students;");
    console.log("Total students in erp.students:", totalStudents.rows[0].count);

    const sampleStudents = await pool.query(`
      SELECT student_id, register_number, first_name, last_name, gender 
      FROM erp.students 
      WHERE student_id IN (1, 50, 51, 100, 101, 150, 151, 200)
      ORDER BY student_id;
    `);
    console.log("Sample students across ID range:");
    console.table(sampleStudents.rows);

    const classes = await pool.query("SELECT * FROM erp.classes ORDER BY class_id;");
    console.log("Classes table in college_erp:");
    console.table(classes.rows);

    const studentClasses = await pool.query(`
      SELECT c.class_id, c.class_name, COUNT(sc.student_id) as count
      FROM erp.classes c
      LEFT JOIN erp.student_classes sc ON c.class_id = sc.class_id
      GROUP BY c.class_id, c.class_name
      ORDER BY c.class_id;
    `);
    console.log("Student-Classes mapping in college_erp:");
    console.table(studentClasses.rows);

    const faculty = await pool.query("SELECT * FROM erp.faculty ORDER BY faculty_id;");
    console.log("Faculty table in college_erp:");
    console.table(faculty.rows);

  } catch (e: any) {
    console.error("Error:", e.message);
  } finally {
    await pool.end();
  }
}

inspectCollegeErpData();
