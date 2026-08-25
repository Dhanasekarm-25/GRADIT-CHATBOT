import { Role } from "../auth/roles.js";
import { Permission } from "../auth/permissions.js";
import { hasPermission } from "../auth/rbac.js";

export interface UserContext {
    userId: string;
    role: Role;
}

export function canViewStudent(
    user: UserContext,
    requestedStudentId: string
): boolean {

    if (
        !hasPermission(
            user.role,
            Permission.VIEW_STUDENT
        )
    ) {
        return false;
    }

    if (user.role === Role.STUDENT) {
        return user.userId === requestedStudentId;
    }

    return true;
}