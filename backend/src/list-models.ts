import { groqApiKey } from "./config/env.js";

async function listGroqModels() {
  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
      },
    });
    const data = await res.json();
    console.log("Active Groq models on your account:");
    if (data.data) {
      console.table(data.data.map((m: any) => ({ id: m.id, owned_by: m.owned_by, active: m.active })));
    } else {
      console.log(data);
    }
  } catch (e: any) {
    console.error("Error:", e.message);
  }
}

listGroqModels();
