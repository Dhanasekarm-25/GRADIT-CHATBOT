import { db } from "./config/database.js";

async function queryRealStudentFullData() {
  try {
    console.log("==================================================================");
    console.log("🎓 RETRIEVING COMPLETE REAL STUDENT DATA FOR STUDENT ID 1 & 2");
    console.log("==================================================================\n");

    // 1. Student Profile with Class info
    const profileRes = await db.query(`
      SELECT 
        s.student_id,
        s.register_number,
        s.first_name,
        s.last_name,
        s.gender,
        s.date_of_birth,
        s.admission_date,
        s.student_status,
        c.class_name,
        c.program_name,
        c.semester,
        c.section,
        c.academic_year
      FROM erp.students s
      LEFT JOIN erp.student_classes sc ON s.student_id = sc.student_id
      LEFT JOIN erp.classes c ON sc.class_id = c.class_id
      WHERE s.student_id IN (1, 2, 3, 4, 5)
      ORDER BY s.student_id;
    `);

    console.log("👤 Profiles:");
    console.table(profileRes.rows);

    // 2. Marks with Subjects
    const marksRes = await db.query(`
      SELECT 
        m.mark_id,
        m.student_id,
        sub.subject_code,
        sub.subject_name,
        m.exam_name,
        m.maximum_marks,
        m.marks_obtained,
        m.grade,
        m.exam_date
      FROM erp.marks m
      LEFT JOIN erp.subjects sub ON m.subject_id = sub.subject_id
      WHERE m.student_id IN (1, 2)
      ORDER BY m.student_id, m.exam_date;
    `);

    console.log("\n📊 Real Marks:");
    console.table(marksRes.rows);

    // 3. Attendance
    const attRes = await db.query(`
      SELECT 
        a.attendance_id,
        a.student_id,
        sub.subject_name,
        a.attendance_date,
        a.period_number,
        a.status
      FROM erp.attendance a
      LEFT JOIN erp.subjects sub ON a.subject_id = sub.subject_id
      WHERE a.student_id IN (1, 2)
      LIMIT 10;
    `);

    console.log("\n📅 Attendance Sample:");
    console.table(attRes.rows);

    // 4. Fees & Payments
    const feesRes = await db.query(`
      SELECT 
        f.fee_id,
        f.student_id,
        f.fee_type,
        f.academic_year,
        f.semester,
        f.total_amount,
        f.due_date,
        f.fee_status,
        COALESCE(SUM(fp.amount_paid), 0) AS total_paid,
        (f.total_amount - COALESCE(SUM(fp.amount_paid), 0)) AS balance_due
      FROM erp.fees f
      LEFT JOIN erp.fee_payments fp ON f.fee_id = fp.fee_id
      WHERE f.student_id IN (1, 2)
      GROUP BY f.fee_id, f.student_id, f.fee_type, f.academic_year, f.semester, f.total_amount, f.due_date, f.fee_status;
    `);

    console.log("\n💳 Fees & Payments:");
    console.table(feesRes.rows);

  } catch (error) {
    console.error("❌ Query error:", error);
  } finally {
    await db.end();
  }
}

queryRealStudentFullData();
