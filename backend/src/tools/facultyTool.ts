import { db } from "../config/database.js";

export async function getFacultyAndClassTeachers(query?: string) {
  const cleanQuery = String(query || "").trim().toLowerCase();

  const sql = `
    SELECT 
      f.faculty_id,
      f.employee_id,
      CONCAT(f.first_name, ' ', COALESCE(f.last_name, '')) AS full_name,
      f.department,
      f.designation,
      c.class_name AS assigned_class_teacher_for,
      c.program_name,
      c.section
    FROM erp.faculty f
    LEFT JOIN erp.classes c ON f.faculty_id = c.class_teacher_id
    WHERE 
      $1 = '' OR
      LOWER(f.first_name) ILIKE '%' || $1 || '%' OR
      LOWER(f.last_name) ILIKE '%' || $1 || '%' OR
      LOWER(f.department) ILIKE '%' || $1 || '%' OR
      LOWER(f.designation) ILIKE '%' || $1 || '%' OR
      LOWER(COALESCE(c.class_name, '')) ILIKE '%' || $1 || '%'
    ORDER BY f.faculty_id ASC;
  `;

  const result = await db.query(sql, [cleanQuery]);
  return result.rows;
}

export async function getAttendanceSessionsAndTeachers(classNameOrSubject?: string) {
  const query = String(classNameOrSubject || "").trim().toLowerCase();

  const sql = `
    SELECT 
      c.class_name,
      sub.subject_code,
      sub.subject_name,
      CONCAT(f.first_name, ' ', COALESCE(f.last_name, '')) AS faculty_name,
      f.department,
      f.designation,
      c.academic_year
    FROM erp.classes c
    JOIN erp.faculty f ON c.class_teacher_id = f.faculty_id
    LEFT JOIN erp.subjects sub ON 1=1
    WHERE 
      $1 = '' OR
      LOWER(c.class_name) ILIKE '%' || $1 || '%' OR
      LOWER(sub.subject_name) ILIKE '%' || $1 || '%' OR
      LOWER(sub.subject_code) ILIKE '%' || $1 || '%' OR
      LOWER(f.first_name) ILIKE '%' || $1 || '%'
    ORDER BY c.class_id, sub.subject_id
    LIMIT 10;
  `;

  const result = await db.query(sql, [query]);
  return result.rows;
}
