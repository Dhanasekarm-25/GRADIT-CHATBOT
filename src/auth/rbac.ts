import { Role } from "./roles.js";
import {
    Permission,
    ROLE_PERMISSIONS
} from "./permissions.js";

export function hasPermission(
    role: Role,
    permission: Permission
): boolean {

    return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}