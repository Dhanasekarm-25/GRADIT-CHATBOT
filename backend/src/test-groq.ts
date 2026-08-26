import { ChatGroq } from "@langchain/groq";
import { groqApiKey } from "./config/env.js";

async function testActiveModels() {
  const models = ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "groq/compound", "qwen/qwen3.6-27b"];
  for (const m of models) {
    try {
      const chat = new ChatGroq({
        apiKey: groqApiKey,
        model: m,
        temperature: 0.1,
      });
      const res = await chat.invoke("Respond with: Groq connection successful!");
      console.log(`✅ Model "${m}" SUCCESS:`, res.content);
    } catch (e: any) {
      console.log(`❌ Model "${m}":`, e.message);
    }
  }
}

testActiveModels();
