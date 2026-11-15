import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { geminiEmbeddings } from "./geminiClient.js";
import { searchPoints } from "./qdrantService.js";

/**
 * Tool 1: RAG Menu Search via Qdrant with Deterministic Sorting & Limiting
 */
export const searchMenuTool = tool(
  async ({ query, max_price, category, sort_by = "relevance", limit = 3 }) => {
    try {
      const vector = await geminiEmbeddings.embedQuery(query || "delicious food");
      // Retrieve a generous candidate pool from Qdrant to allow accurate filtering and sorting
      const points = await searchPoints(vector, 10);

      let filtered = points.map((p) => p.payload);

      if (max_price) {
        filtered = filtered.filter((item) => item.price <= max_price);
      }

      if (category && category !== "All") {
        filtered = filtered.filter(
          (item) => item.category?.toLowerCase() === category.toLowerCase()
        );
      }

      // Deterministic Price Sorting
      if (sort_by === "price_asc") {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sort_by === "price_desc") {
        filtered.sort((a, b) => b.price - a.price);
      }

      // Deterministic Count Limiting
      const finalCount = limit && limit > 0 ? limit : 3;
      filtered = filtered.slice(0, finalCount);

      if (filtered.length === 0) {
        return JSON.stringify({
          message: `No dishes found matching "${query}" within the criteria.`,
          dishes: points.slice(0, 2).map((p) => p.payload),
        });
      }

      const sortDescription =
        sort_by === "price_asc"
          ? " (sorted cheapest to most expensive)"
          : sort_by === "price_desc"
          ? " (sorted most expensive to cheapest)"
          : "";

      return JSON.stringify({
        message: `Found ${filtered.length} dishes matching "${query}"${sortDescription}:`,
        dishes: filtered.map((d) => ({
          dishId: d.dishId,
          name: d.name,
          category: d.category,
          price: d.price,
          image: d.image,
          description: d.description,
        })),
      });
    } catch (err) {
      console.error("searchMenuTool error:", err.message);
      return JSON.stringify({ error: "Failed to search menu catalog." });
    }
  },
  {
    name: "search_menu",
    description:
      "Search the restaurant's menu for dishes using semantic RAG search with deterministic price sorting and count limit.",
    schema: z.object({
      query: z.string().describe("The user's food craving, category, dish name, or 'all dishes' if broad search."),
      max_price: z.number().optional().describe("Maximum budget per dish in INR (e.g. 180, 250)."),
      category: z.string().optional().describe("Category filter like Salad, Rolls, Deserts, Sandwich, Cake, Pure Veg, Pasta, Noodles."),
      sort_by: z
        .enum(["price_asc", "price_desc", "relevance"])
        .optional()
        .describe("Sort order: 'price_asc' for cheapest first (saste se mehnga/ascending), 'price_desc' for most expensive first (mehnge se sasta/descending), or 'relevance'."),
      limit: z
        .number()
        .optional()
        .describe("Exact number of dishes to return (e.g. 3 if user asks for 3 products, default is 3)."),
    }),
  }
);

/**
 * Tool 2: View current cart summary
 */
export const viewCartTool = tool(
  async ({ cartSummary }) => {
    return JSON.stringify({
      message: "Current cart contents retrieved.",
      cart: cartSummary || "Your cart is currently empty.",
    });
  },
  {
    name: "view_cart",
    description: "View the customer's current cart items, total amount, and item counts.",
    schema: z.object({
      cartSummary: z.string().optional().describe("Summary of cart if available in session"),
    }),
  }
);

/**
 * Tool 3: Save user name when introduced
 */
export const saveUserNameTool = tool(
  async ({ name }) => {
    const cleanName = name.trim();
    return JSON.stringify({
      status: "NAME_SAVED",
      name: cleanName,
      message: `Customer name successfully noted as '${cleanName}'. Address them warmly by this name from now on.`,
    });
  },
  {
    name: "save_user_name",
    description:
      "Call this tool whenever the customer mentions or introduces their name (e.g., 'Mera naam Rahul hai', 'I am Rahul', 'Call me Priya', 'Rahul here').",
    schema: z.object({
      name: z.string().describe("The extracted first or preferred name of the customer."),
    }),
  }
);

/**
 * Tool 4: Request sensitive/mutating order action (Requires Human-in-the-Loop Approval)
 */
export const requestOrderActionTool = tool(
  async ({ actionType, summary, items, totalAmount }) => {
    return JSON.stringify({
      status: "AWAITING_APPROVAL",
      actionType,
      summary,
      items: items || [],
      totalAmount: totalAmount || 0,
      requiresApproval: true,
      message: `I need your confirmation before proceeding: ${summary}. Please confirm below.`,
    });
  },
  {
    name: "request_order_action",
    description:
      "Propose an order mutation or sensitive checkout action (e.g. checkout, clearing cart, placing order with cash on delivery). This will trigger a Human-in-the-Loop confirmation prompt to the user before execution.",
    schema: z.object({
      actionType: z.enum(["CHECKOUT", "CLEAR_CART", "PLACE_ORDER"]).describe("Type of sensitive action proposed."),
      summary: z.string().describe("Human-readable explanation of what will happen (e.g. 'Place COD Order for 2x Cheese Pasta worth ₹460')."),
      items: z.array(z.string()).optional().describe("Names or IDs of food items involved."),
      totalAmount: z.number().optional().describe("Calculated total amount in INR."),
    }),
  }
);
