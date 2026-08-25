import { ChatOpenRouter } from "@langchain/openrouter";
import { apiKey } from "../config/env.js";

export const llm = new ChatOpenRouter({
  model: "openai/gpt-oss-120b",
  temperature: 0,
  maxTokens: 300,
  apiKey
});