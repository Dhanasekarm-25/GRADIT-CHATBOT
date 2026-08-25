import { Role } from "../auth/roles.js";
import { Permission } from "../auth/permissions.js";
import { hasPermission } from "../auth/rbac.js";
import { db } from "../config/database.js";

export interface MarksUserContext {
    userId: string;
    role: Role;
}

export function canViewMarks(
    user: MarksUserContext,
    requestedStudentId: string
): boolean {

    // Step 1: Check whether the role
    // has permission to view marks.
    if (
        !hasPermission(
            user.role,
            Permission.VIEW_MARKS
        )
    ) {
        return false;
    }

    // Step 2: Students can only
    // access their own marks.
    if (user.role === Role.STUDENT) {
        return user.userId === requestedStudentId;
    }

    // Step 3: Admin and Faculty
    // can access marks.
    return true;
}


// Get marks from PostgreSQL
export async function getStudentMarks(
    user: MarksUserContext,
    requestedStudentId: string
) {

    // First check permission
    if (!canViewMarks(user, requestedStudentId)) {
        throw new Error("You are not authorized to view these marks.");
    }

    // Get marks from PostgreSQL
    const result = await db.query(
        `SELECT
            student_id,
            subject_id,
            exam_name,
            maximum_marks,
            marks_obtained,
            grade,
            exam_date
         FROM erp.marks
         WHERE student_id = $1
         ORDER BY exam_date`,
        [Number(requestedStudentId)]
    );

    return result.rows;
}