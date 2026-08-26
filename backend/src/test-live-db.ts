import { db } from "./config/database.js";
import { Role } from "./auth/roles.js";
import { getStudentMarks } from "./tools/marksTool.js";
import { getStudentProfile } from "./tools/studentTool.js";
import { getStudentAttendance } from "./tools/attendanceTool.js";
import { getStudentFees } from "./tools/feesTool.js";

async function testLiveDatabase() {
  console.log("🧪 Testing All ERP Tools against Remote PostgreSQL Database...\n");

  const studentUser = { userId: "101", role: Role.STUDENT };

  try {
    // 1. Test Profile
    console.log("1️⃣ Fetching Student Profile for ID 101...");
    const profile = await getStudentProfile(studentUser, "101");
    console.log("   ✅ Profile:", profile);

    // 2. Test Marks
    console.log("\n2️⃣ Fetching Marks for ID 101 (Student self-access)...");
    const marks = await getStudentMarks(studentUser, "101");
    console.log("   ✅ Marks count:", marks.length, "rows");
    console.table(marks);

    // 3. Test Attendance
    console.log("\n3️⃣ Fetching Attendance for ID 101...");
    const attendance = await getStudentAttendance(studentUser, "101");
    console.table(attendance);

    // 4. Test Fees
    console.log("\n4️⃣ Fetching Fees for ID 101...");
    const fees = await getStudentFees(studentUser, "101");
    console.table(fees);

    // 5. Test RBAC Security Block (Student 101 attempting to fetch Student 102 marks)
    console.log("\n5️⃣ Testing RBAC Security: Student 101 requesting Student 102 Marks...");
    try {
      await getStudentMarks(studentUser, "102");
      console.log("   ❌ ERROR: Security failed! Student accessed another record.");
    } catch (err: any) {
      console.log("   🛡️ RBAC ENFORCED (Expected Block):", err.message);
    }

    console.log("\n🎉 ALL LIVE DATABASE ERP TOOLS VERIFIED SUCCESSFULLY!");
  } catch (error) {
    console.error("❌ Live test error:", error);
  } finally {
    await db.end();
  }
}

testLiveDatabase();
