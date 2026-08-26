import "dotenv/config";

export const groqApiKey =
  process.env.GROQ_API_KEY || process.env.groqapi || process.env.GROQAPI || "";
export const apiKey = groqApiKey;

export const config = {
  port: Number(process.env.PORT) || 5000,
  groqApiKey,
  db: {
    host: (process.env.DB_HOST || "localhost").trim(),
    port: Number(process.env.DB_PORT) || 5432,
    user: (process.env.DB_USER || "postgres").trim(),
    password: (process.env.DB_PASSWORD || "").trim(),
    database: (process.env.DB_NAME || "college_erp").trim(),
  },
};