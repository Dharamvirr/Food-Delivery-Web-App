import { QdrantClient } from "@qdrant/js-client-rest";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

const COLLECTION_NAME = "tomato_dishes";
const VECTOR_SIZE = 3072; // gemini embedding dimension

export const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
  checkCompatibility: false,
});

/**
 * Ensure tomato_dishes collection exists with 3072-dim cosine distance
 */
export async function ensureCollection(forceRecreate = false) {
  try {
    const collections = await qdrantClient.getCollections();
    const exists = collections.collections.some((c) => c.name === COLLECTION_NAME);

    if (exists && forceRecreate) {
      console.log(`[Qdrant] Deleting old collection '${COLLECTION_NAME}'...`);
      await qdrantClient.deleteCollection(COLLECTION_NAME);
    }

    if (!exists || forceRecreate) {
      console.log(`[Qdrant] Creating collection '${COLLECTION_NAME}' (dim=${VECTOR_SIZE})...`);
      await qdrantClient.createCollection(COLLECTION_NAME, {
        vectors: {
          size: VECTOR_SIZE,
          distance: "Cosine",
        },
      });
      console.log(`[Qdrant] Collection '${COLLECTION_NAME}' created successfully.`);
    } else {
      console.log(`[Qdrant] Collection '${COLLECTION_NAME}' already exists.`);
    }
  } catch (err) {
    console.error("[Qdrant] ensureCollection error:", err.message);
    throw err;
  }
}

/**
 * Upsert list of points into Qdrant
 */
export async function upsertPoints(points) {
  try {
    await ensureCollection();
    const res = await qdrantClient.upsert(COLLECTION_NAME, {
      wait: true,
      points,
    });
    return res;
  } catch (err) {
    console.error("[Qdrant] upsertPoints error:", err.message);
    throw err;
  }
}

/**
 * Search Qdrant vector store
 */
export async function searchPoints(vector, limit = 4, filter = null) {
  try {
    await ensureCollection();
    const queryParams = {
      query: vector,
      limit,
      with_payload: true,
    };
    if (filter) {
      queryParams.filter = filter;
    }
    const response = await qdrantClient.query(COLLECTION_NAME, queryParams);
    return response.points || [];
  } catch (err) {
    console.error("[Qdrant] searchPoints error:", err.message);
    return [];
  }
}

export { COLLECTION_NAME };
