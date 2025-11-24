import dotenv from "dotenv";
dotenv.config();

console.log("Raw API KEY =", process.env.CEREBRAS_API_KEY);
console.log("Is Key Loaded =", !!process.env.CEREBRAS_API_KEY);

import callCerebras from "./utils/cerebras.js";

async function teste() {
  const reply = await callCerebras("Hello, are you working?");
  console.log("Cerebras Response:\n", reply);
}

teste();
