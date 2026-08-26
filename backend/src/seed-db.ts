import { db } from "./config/database.js";

async function seed() {
  try {
    console.log("🚀 Initializing PostgreSQL ERP Schema on remote database...");

    await db.query(`
      CREATE SCHEMA IF NOT EXISTS erp;

      CREATE TABLE IF NOT EXISTS erp.students (
        student_id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE,
        department VARCHAR(100),
        year INT,
        semester INT,
        section VARCHAR(10),
        cgpa NUMERIC(4,2)
      );

      CREATE TABLE IF NOT EXISTS erp.marks (
        mark_id SERIAL PRIMARY KEY,
        student_id INT REFERENCES erp.students(student_id),
        subject_id VARCHAR(50),
        exam_name VARCHAR(50),
        maximum_marks INT DEFAULT 100,
        marks_obtained INT,
        grade VARCHAR(5),
        exam_date DATE
      );

      CREATE TABLE IF NOT EXISTS erp.attendance (
        attendance_id SERIAL PRIMARY KEY,
        student_id INT REFERENCES erp.students(student_id),
        subject_id VARCHAR(50),
        total_classes INT DEFAULT 45,
        attended_classes INT DEFAULT 40,
        last_updated DATE DEFAULT CURRENT_DATE
      );

      CREATE TABLE IF NOT EXISTS erp.fees (
        fee_id SERIAL PRIMARY KEY,
        student_id INT REFERENCES erp.students(student_id),
        fee_type VARCHAR(50),
        total_amount NUMERIC(10,2),
        amount_paid NUMERIC(10,2),
        balance_amount NUMERIC(10,2),
        due_date DATE,
        payment_status VARCHAR(20)
      );

      -- Insert sample student records
      INSERT INTO erp.students (student_id, name, email, department, year, semester, section, cgpa)
      VALUES 
        (101, 'Arun Kumar', 'arun@college.edu', 'Computer Science & Engineering', 3, 6, 'A', 8.75),
        (102, 'Priya Sharma', 'priya@college.edu', 'Information Technology', 3, 6, 'B', 9.10)
      ON CONFLICT (student_id) DO NOTHING;

      -- Insert sample marks
      INSERT INTO erp.marks (student_id, subject_id, exam_name, maximum_marks, marks_obtained, grade, exam_date)
      VALUES
        (101, 'CS601 (Database Systems)', 'Semester Midterm', 100, 88, 'A', '2026-02-15'),
        (101, 'CS602 (Operating Systems)', 'Semester Midterm', 100, 92, 'A+', '2026-02-18'),
        (101, 'CS603 (Computer Networks)', 'Semester Midterm', 100, 79, 'B+', '2026-02-20'),
        (102, 'IT601 (Cloud Computing)', 'Semester Midterm', 100, 95, 'O', '2026-02-15'),
        (102, 'IT602 (Data Structures)', 'Semester Midterm', 100, 90, 'A+', '2026-02-18')
      ON CONFLICT DO NOTHING;

      -- Insert sample attendance
      INSERT INTO erp.attendance (student_id, subject_id, total_classes, attended_classes)
      VALUES
        (101, 'CS601 (Database Systems)', 45, 41),
        (101, 'CS602 (Operating Systems)', 42, 38),
        (101, 'CS603 (Computer Networks)', 40, 36),
        (102, 'IT601 (Cloud Computing)', 45, 44),
        (102, 'IT602 (Data Structures)', 44, 42)
      ON CONFLICT DO NOTHING;

      -- Insert sample fees
      INSERT INTO erp.fees (student_id, fee_type, total_amount, amount_paid, balance_amount, due_date, payment_status)
      VALUES
        (101, 'Semester 6 Tuition Fee', 45000.00, 45000.00, 0.00, '2026-01-10', 'PAID'),
        (101, 'Hostel & Mess Fee', 35000.00, 20000.00, 15000.00, '2026-09-01', 'PARTIAL'),
        (102, 'Semester 6 Tuition Fee', 45000.00, 45000.00, 0.00, '2026-01-10', 'PAID'),
        (102, 'Transport Fee', 12000.00, 12000.00, 0.00, '2026-01-15', 'PAID')
      ON CONFLICT DO NOTHING;
    `);

    console.log("✅ ERP tables and sample student records successfully seeded!");
    
    // Verify count
    const count = await db.query("SELECT COUNT(*) FROM erp.students");
    console.log(`📊 Total students in erp.students: ${count.rows[0].count}`);

  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await db.end();
  }
}

seed();
