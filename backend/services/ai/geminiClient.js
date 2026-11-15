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

export const isGeminiConfigured = Boolean(apiKey);

if (!isGeminiConfigured) {
  console.warn("⚠️ Warning: GEMINI_API_KEY is not set. AI Concierge is running in standby mode until configured.");
}

// Fallback key prevents constructor error at import/boot time if key is not yet set in deployment
const effectiveKey = apiKey || "STANDBY_KEY_NOT_CONFIGURED";

// Gemini Chat Model (using gemini-2.5-flash for speed, quota & tool-calling)
export const geminiChatModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: effectiveKey,
  temperature: 0.7,
});

// Gemini Embeddings Model (768 dimensions)
export const geminiEmbeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001",
  apiKey: effectiveKey,
});
