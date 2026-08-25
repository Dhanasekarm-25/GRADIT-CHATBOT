import { Role } from "../auth/roles.js";
import {
    canViewMarks,
    MarksUserContext
} from "../tools/marksTool.js";


const admin: MarksUserContext = {
    userId: "ADM001",
    role: Role.ADMIN
};

const faculty: MarksUserContext = {
    userId: "FAC001",
    role: Role.FACULTY
};

const staff: MarksUserContext = {
    userId: "STF001",
    role: Role.STAFF
};

const student: MarksUserContext = {
    userId: "STU001",
    role: Role.STUDENT
};


// Admin
console.log(
    "Admin → Marks:",
    canViewMarks(
        admin,
        "STU002"
    )
);


// Faculty
console.log(
    "Faculty → Marks:",
    canViewMarks(
        faculty,
        "STU002"
    )
);


// Staff
console.log(
    "Staff → Marks:",
    canViewMarks(
        staff,
        "STU002"
    )
);


// Student → Own marks
console.log(
    "Student → Own marks:",
    canViewMarks(
        student,
        "STU001"
    )
);


// Student → Other student's marks
console.log(
    "Student → Other marks:",
    canViewMarks(
        student,
        "STU002"
    )
);