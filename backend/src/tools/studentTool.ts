import { Role } from "../auth/roles.js";
import { db } from "../config/database.js";

export interface StudentUserContext {
  userId: string;
  role: Role;
}

export type UserContext = StudentUserContext;

/**
 * Flexible student lookup by ID, Register Number, Email, or Name for all users
 */
export async function getStudentProfile(
  user: StudentUserContext,
  query: string,
  classFilter?: string
) {
  const cleanQuery = String(query || "").trim();
  const isNumeric = !isNaN(Number(cleanQuery)) && cleanQuery !== "";

  let sql = `
    SELECT 
      s.student_id,
      s.user_id,
      s.register_number,
      s.first_name,
      s.last_name,
      CONCAT(s.first_name, ' ', COALESCE(s.last_name, '')) AS full_name,
      COALESCE(u.email, 'student' || LPAD(s.student_id::text, 3, '0') || '@collegeerp.com') AS email,
      s.gender,
      s.date_of_birth,
      s.admission_date,
      s.student_status,
      CASE 
        WHEN s.student_id BETWEEN 1 AND 50 THEN 'MCA A'
        WHEN s.student_id BETWEEN 51 AND 100 THEN 'MCA B'
        WHEN s.student_id BETWEEN 101 AND 150 THEN 'MCA Gen AI A'
        ELSE 'MCA Gen AI B'
      END AS class_name,
      CASE 
        WHEN s.student_id <= 100 THEN 'Master of Computer Applications'
        ELSE 'MCA Generative AI & Data Science'
      END AS program_name,
      1 AS semester,
      CASE 
        WHEN s.student_id BETWEEN 1 AND 50 THEN 'A'
        WHEN s.student_id BETWEEN 51 AND 100 THEN 'B'
        WHEN s.student_id BETWEEN 101 AND 150 THEN 'A'
        ELSE 'B'
      END AS section
    FROM erp.students s
    LEFT JOIN erp.users u ON s.user_id = u.user_id
    WHERE 
      (
        ($1::boolean AND s.student_id = $2::int) OR
        LOWER(s.register_number) = LOWER($3) OR
        LOWER(u.email) = LOWER($3) OR
        LOWER(CONCAT(s.first_name, ' ', COALESCE(s.last_name, ''))) ILIKE '%' || LOWER($3) || '%' OR
        LOWER(s.first_name) ILIKE '%' || LOWER($3) || '%'
      )
  `;

  const params: any[] = [
    isNumeric,
    isNumeric ? Number(cleanQuery) : 0,
    cleanQuery,
  ];

  if (classFilter && classFilter !== "all") {
    if (classFilter === "MCA A") {
      sql += ` AND s.student_id BETWEEN 1 AND 50`;
    } else if (classFilter === "MCA B") {
      sql += ` AND s.student_id BETWEEN 51 AND 100`;
    } else if (classFilter === "MCA Gen AI A") {
      sql += ` AND s.student_id BETWEEN 101 AND 150`;
    } else if (classFilter === "MCA Gen AI B") {
      sql += ` AND s.student_id BETWEEN 151 AND 200`;
    }
  }

  sql += ` ORDER BY s.student_id ASC LIMIT 10;`;

  const result = await db.query(sql, params);

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows.length === 1 ? result.rows[0] : result.rows;
}