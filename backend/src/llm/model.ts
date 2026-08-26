import { ChatGroq } from "@langchain/groq";
import { groqApiKey } from "../config/env.js";

export function getLLM() {
  const key = groqApiKey || process.env.GROQ_API_KEY || process.env.groqapi || "";
  if (!key) {
    throw new Error(
      "GROQ_API_KEY is not set in .env. Please configure your Groq API key (GROQ_API_KEY) to enable AI reasoning responses."
    );
  }

  // Use openai/gpt-oss-120b on Groq for ultra-fast deep reasoning
  return new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature: 0.1,
    apiKey: key,
    maxRetries: 2,
  });
}

export const llm = (groqApiKey || process.env.GROQ_API_KEY || process.env.groqapi)
  ? new ChatGroq({
      model: "openai/gpt-oss-120b",
      temperature: 0.1,
      apiKey: groqApiKey || process.env.GROQ_API_KEY || process.env.groqapi,
      maxRetries: 2,
    })
  : (null as any);