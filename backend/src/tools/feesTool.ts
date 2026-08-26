import { Role } from "../auth/roles.js";
import { db } from "../config/database.js";

export interface FeesUserContext {
  userId: string;
  role: Role;
}

export async function getStudentFees(
  user: FeesUserContext,
  query: string
) {
  const cleanQuery = String(query || "").trim();
  const isNumeric = !isNaN(Number(cleanQuery)) && cleanQuery !== "";

  const result = await db.query(
    `SELECT 
        f.fee_id,
        f.student_id,
        CONCAT(s.first_name, ' ', COALESCE(s.last_name, '')) AS student_name,
        f.fee_type,
        f.academic_year,
        f.semester,
        f.total_amount,
        f.due_date,
        f.fee_status,
        COALESCE(SUM(fp.amount_paid), 0) AS amount_paid,
        (f.total_amount - COALESCE(SUM(fp.amount_paid), 0)) AS balance_amount
     FROM erp.fees f
     JOIN erp.students s ON f.student_id = s.student_id
     LEFT JOIN erp.users u ON s.user_id = u.user_id
     LEFT JOIN erp.fee_payments fp ON f.fee_id = fp.fee_id
     WHERE 
       ($1::boolean AND f.student_id = $2::int) OR
       LOWER(s.register_number) = LOWER($3) OR
       LOWER(u.email) = LOWER($3) OR
       LOWER(CONCAT(s.first_name, ' ', COALESCE(s.last_name, ''))) ILIKE '%' || LOWER($3) || '%' OR
       LOWER(s.first_name) ILIKE '%' || LOWER($3) || '%'
     GROUP BY f.fee_id, f.student_id, s.first_name, s.last_name, f.fee_type, f.academic_year, f.semester, f.total_amount, f.due_date, f.fee_status
     ORDER BY f.due_date DESC;`,
    [
      isNumeric,
      isNumeric ? Number(cleanQuery) : 0,
      cleanQuery,
    ]
  );

  return result.rows;
}
