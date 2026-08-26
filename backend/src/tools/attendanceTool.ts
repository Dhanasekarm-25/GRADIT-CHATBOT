import { Role } from "../auth/roles.js";
import { db } from "../config/database.js";

export interface AttendanceUserContext {
  userId: string;
  role: Role;
}

export async function getStudentAttendance(
  user: AttendanceUserContext,
  query: string
) {
  const cleanQuery = String(query || "").trim();
  const isNumeric = !isNaN(Number(cleanQuery)) && cleanQuery !== "";

  // Summary by subject
  const summaryResult = await db.query(
    `SELECT 
        a.student_id,
        CONCAT(s.first_name, ' ', COALESCE(s.last_name, '')) AS student_name,
        COALESCE(sub.subject_code, 'SUB' || a.subject_id) AS subject_code,
        COALESCE(sub.subject_name, 'Subject #' || a.subject_id) AS subject_name,
        COUNT(*) AS total_sessions,
        SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) AS attended_sessions,
        SUM(CASE WHEN a.status = 'ABSENT' THEN 1 ELSE 0 END) AS absent_sessions,
        ROUND((SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END)::numeric / NULLIF(COUNT(*), 0)::numeric) * 100, 2) AS attendance_percentage
     FROM erp.attendance a
     JOIN erp.students s ON a.student_id = s.student_id
     LEFT JOIN erp.users u ON s.user_id = u.user_id
     LEFT JOIN erp.subjects sub ON a.subject_id = sub.subject_id
     WHERE 
       ($1::boolean AND a.student_id = $2::int) OR
       LOWER(s.register_number) = LOWER($3) OR
       LOWER(u.email) = LOWER($3) OR
       LOWER(CONCAT(s.first_name, ' ', COALESCE(s.last_name, ''))) ILIKE '%' || LOWER($3) || '%' OR
       LOWER(s.first_name) ILIKE '%' || LOWER($3) || '%'
     GROUP BY a.student_id, s.first_name, s.last_name, sub.subject_code, sub.subject_name, a.subject_id
     ORDER BY sub.subject_name;`,
    [
      isNumeric,
      isNumeric ? Number(cleanQuery) : 0,
      cleanQuery,
    ]
  );

  return summaryResult.rows;
}
