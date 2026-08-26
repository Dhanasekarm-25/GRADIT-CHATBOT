import { ChatGroq } from "@langchain/groq";
import { groqApiKey } from "./config/env.js";

const models = ["openai/gpt-oss-120b", "openai/gpt-oss-120b", "groq/compound", "qwen/qwen3.6-27b"];

async function benchmarkLatency() {
  console.log("Benchmarking Groq Models Latency...\n");
  for (const m of models) {
    try {
      const start = Date.now();
      const chat = new ChatGroq({
        apiKey: groqApiKey,
        model: m,
        temperature: 0.1,
        maxTokens: 300,
      });
      const res = await chat.invoke("Output in 5 words: Student marks recorded successfully.");
      const duration = Date.now() - start;
      console.log(`⚡ Model "${m}": Latency = ${duration}ms | Output: "${res.content.trim()}"`);
    } catch (e: any) {
      console.log(`❌ Model "${m}": ${e.message}`);
    }
  }
}

benchmarkLatency();
