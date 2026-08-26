import "dotenv/config";
import { db } from "./config/database.js";

try {
    const result = await db.query(
        "SELECT NOW() AS current_time"
    );

    console.log("✅ PostgreSQL connected!");
    console.log("Database time:", result.rows[0].current_time);

} catch (error) {

    console.error("❌ PostgreSQL connection failed");
    console.error(error);

} finally {

    await db.end();
}