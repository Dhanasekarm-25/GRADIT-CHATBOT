import { Role } from "../auth/roles.js";
import { db } from "../config/database.js";

export interface MarksUserContext {
  userId: string;
  role: Role;
}

// Get marks from PostgreSQL with Subject details (Supports ID, Register Number, Email, Name)
export async function getStudentMarks(
  user: MarksUserContext,
  query: string
) {
  const cleanQuery = String(query || "").trim();
  const isNumeric = !isNaN(Number(cleanQuery)) && cleanQuery !== "";

  const result = await db.query(
    `SELECT 
        m.mark_id,
        m.student_id,
        CONCAT(s.first_name, ' ', COALESCE(s.last_name, '')) AS student_name,
        s.register_number,
        COALESCE(sub.subject_code, CAST(m.subject_id AS VARCHAR)) AS subject_code,
        COALESCE(sub.subject_name, 'Subject #' || m.subject_id) AS subject_name,
        m.exam_name,
        m.maximum_marks,
        m.marks_obtained,
        m.grade,
        m.exam_date
     FROM erp.marks m
     JOIN erp.students s ON m.student_id = s.student_id
     LEFT JOIN erp.users u ON s.user_id = u.user_id
     LEFT JOIN erp.subjects sub ON m.subject_id = sub.subject_id
     WHERE 
       ($1::boolean AND m.student_id = $2::int) OR
       LOWER(s.register_number) = LOWER($3) OR
       LOWER(u.email) = LOWER($3) OR
       LOWER(CONCAT(s.first_name, ' ', COALESCE(s.last_name, ''))) ILIKE '%' || LOWER($3) || '%' OR
       LOWER(s.first_name) ILIKE '%' || LOWER($3) || '%'
     ORDER BY m.exam_date DESC;`,
    [
      isNumeric,
      isNumeric ? Number(cleanQuery) : 0,
      cleanQuery,
    ]
  );

  return result.rows;
}