import dns from "node:dns";
try {
  dns.setDefaultResultOrder("ipv4first");
} catch (e) {}

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load .env from backend directory
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config(); // fallback to cwd

import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.warn("⚠️ Warning: GEMINI_API_KEY is missing from environment variables.");
}

// Gemini Chat Model (using gemini-3.5-flash-lite for blazing fast speed, high free-tier quota & tool-calling)
export const geminiChatModel = new ChatGoogleGenerativeAI({
  model: "gemini-3.5-flash-lite",
  apiKey: apiKey,
  temperature: 0.7,
});

// Gemini Embeddings Model (768 dimensions)
export const geminiEmbeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001",
  apiKey: apiKey,
});
