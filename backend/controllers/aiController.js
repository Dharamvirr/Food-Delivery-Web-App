import { HumanMessage } from "@langchain/core/messages";
import { Command } from "@langchain/langgraph";
import { foodAgentApp } from "../services/ai/foodAgent.js";
import { ingestMenuToQdrant } from "../services/ai/ingestMenu.js";

/**
 * Helper to safely extract string text from any LangChain message content (string or array)
 */
function extractTextFromContent(content) {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && part.text) return part.text;
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }
  return "";
}

/**
 * Extract dishes from tool outputs if search_menu was called
 */
function extractDishesFromMessages(messages) {
  const dishes = [];
  for (const msg of messages) {
    if (msg._getType?.() === "tool" || msg.name === "search_menu") {
      try {
        const parsed = JSON.parse(msg.content);
        if (parsed.dishes && Array.isArray(parsed.dishes)) {
          for (const d of parsed.dishes) {
            if (!dishes.some((item) => item.name === d.name)) {
              dishes.push(d);
            }
          }
        }
      } catch (e) {}
    }
  }
  return dishes;
}

/**
 * POST /api/ai/chat
 * Multi-turn chat with RAG & automatic HITL interrupt detection
 */
export const chatWithChef = async (req, res) => {
  try {
    const { message, threadId = `session_${Date.now()}`, cartData = {}, userId = null } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ success: false, message: "A valid message is required." });
    }

    const config = { configurable: { thread_id: threadId } };

    // Get previous message count to ensure we only extract dishes from THIS turn
    const preState = await foodAgentApp.getState(config);
    const prevMsgCount = preState.values?.messages?.length || 0;

    // Invoke LangGraph food agent
    const result = await foodAgentApp.invoke(
      {
        messages: [new HumanMessage(message)],
        cartData,
        userId,
      },
      config
    );

    // Check if the graph paused on a Human-In-The-Loop interrupt
    const currentState = await foodAgentApp.getState(config);
    const interrupts = currentState.tasks?.flatMap((t) => t.interrupts || []) || [];

    const lastMsg = result.messages[result.messages.length - 1];
    const replyText = extractTextFromContent(lastMsg?.content) || "Aapke liye yeh shandar options hain! 👨‍🍳";
    
    // Only extract dishes from tool calls executed in the CURRENT turn
    const newMessages = result.messages.slice(prevMsgCount);
    const recommendedDishes = extractDishesFromMessages(newMessages);
    const userName = currentState.values?.userName || null;

    if (interrupts.length > 0) {
      const interruptPayload = interrupts[0].value;
      return res.json({
        success: true,
        text: replyText,
        requiresApproval: true,
        approvalData: interruptPayload,
        threadId,
        userName,
        dishes: recommendedDishes,
      });
    }

    return res.json({
      success: true,
      text: replyText,
      requiresApproval: false,
      threadId,
      userName,
      dishes: recommendedDishes,
    });
  } catch (error) {
    console.error("[AI Controller] chatWithChef error:", error);
    return res.status(500).json({
      success: false,
      message: "Chef Tomato is taking a quick breath. Please try again in a moment!",
      error: error.message,
    });
  }
};

/**
 * POST /api/ai/approve
 * Resumes LangGraph execution with human decision (approved: true/false)
 */
export const resumeApproval = async (req, res) => {
  try {
    const { threadId, approved, notes = "" } = req.body;

    if (!threadId) {
      return res.status(400).json({ success: false, message: "threadId is required to resume." });
    }

    const config = { configurable: { thread_id: threadId } };

    // Resume the interrupted graph with the human decision
    const result = await foodAgentApp.invoke(
      new Command({
        resume: { approved: Boolean(approved), notes },
      }),
      config
    );

    const lastMsg = result.messages[result.messages.length - 1];
    const replyText = extractTextFromContent(lastMsg?.content) || "Action processed.";

    return res.json({
      success: true,
      text: replyText,
      threadId,
      approved: Boolean(approved),
    });
  } catch (error) {
    console.error("[AI Controller] resumeApproval error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not process your approval. Please try again.",
      error: error.message,
    });
  }
};

/**
 * POST /api/ai/seed
 * Admin or dev endpoint to sync menu items into Qdrant Cloud
 */
export const seedQdrant = async (req, res) => {
  try {
    const result = await ingestMenuToQdrant();
    return res.json({ success: true, message: "Qdrant Vector DB seeded successfully", result });
  } catch (error) {
    console.error("[AI Controller] seedQdrant error:", error);
    return res.status(500).json({ success: false, message: "Seeding failed", error: error.message });
  }
};
