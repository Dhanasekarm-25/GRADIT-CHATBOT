export enum Permission {
    VIEW_STUDENT = "view_student",
    VIEW_MARKS = "view_marks",
    VIEW_ATTENDANCE = "view_attendance",
    VIEW_FEES = "view_fees"
}

import { Role } from "./roles.js";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    [Role.ADMIN]: [
        Permission.VIEW_STUDENT,
        Permission.VIEW_MARKS,
        Permission.VIEW_ATTENDANCE,
        Permission.VIEW_FEES
    ],

    [Role.FACULTY]: [
        Permission.VIEW_STUDENT,
        Permission.VIEW_MARKS,
        Permission.VIEW_ATTENDANCE
    ],

    [Role.STAFF]: [
        Permission.VIEW_STUDENT,
        Permission.VIEW_FEES
    ],

    [Role.STUDENT]: [
        Permission.VIEW_STUDENT,
        Permission.VIEW_MARKS,
        Permission.VIEW_ATTENDANCE,
        Permission.VIEW_FEES
    ]
};