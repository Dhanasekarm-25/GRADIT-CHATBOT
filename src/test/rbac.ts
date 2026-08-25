import { Role } from "../auth/roles.js";
import { Permission } from "../auth/permissions.js";
import { hasPermission } from "../auth/rbac.js";

console.log(
    "Admin → Fees:",
    hasPermission(Role.ADMIN, Permission.VIEW_FEES)
);

console.log(
    "Faculty → Fees:",
    hasPermission(Role.FACULTY, Permission.VIEW_FEES)
);

console.log(
    "Faculty → Marks:",
    hasPermission(Role.FACULTY, Permission.VIEW_MARKS)
);

console.log(
    "Staff → Marks:",
    hasPermission(Role.STAFF, Permission.VIEW_MARKS)
);