import { Role } from "../auth/roles.js";
import {
    canViewStudent,
    UserContext
} from "../tools/studentTool.js";


const admin: UserContext = {
    userId: "ADM001",
    role: Role.ADMIN
};

const faculty: UserContext = {
    userId: "FAC001",
    role: Role.FACULTY
};

const staff: UserContext = {
    userId: "STF001",
    role: Role.STAFF
};

const student: UserContext = {
    userId: "STU001",
    role: Role.STUDENT
};


// Admin
console.log(
    "Admin → Student:",
    canViewStudent(
        admin,
        "STU002"
    )
);


// Faculty
console.log(
    "Faculty → Student:",
    canViewStudent(
        faculty,
        "STU002"
    )
);


// Staff
console.log(
    "Staff → Student:",
    canViewStudent(
        staff,
        "STU002"
    )
);


// Student → Own record
console.log(
    "Student → Own record:",
    canViewStudent(
        student,
        "STU001"
    )
);


// Student → Other record
console.log(
    "Student → Other record:",
    canViewStudent(
        student,
        "STU002"
    )
);