import { llm } from "./llm/model.js";

const response = await llm.invoke(
  "You are a College ERP assistant. Say hello in one short sentence."
);

console.log(response.content);