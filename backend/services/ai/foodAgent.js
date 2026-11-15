import dns from "node:dns";
try {
  dns.setDefaultResultOrder("ipv4first");
} catch (e) {}

import {
  StateGraph,
  START,
  END,
  Annotation,
  MemorySaver,
  interrupt,
  Command,
  addMessages,
} from "@langchain/langgraph";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { SystemMessage, AIMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import { geminiChatModel } from "./geminiClient.js";
import { searchMenuTool, viewCartTool, requestOrderActionTool, saveUserNameTool } from "./tools.js";

const tools = [searchMenuTool, viewCartTool, requestOrderActionTool, saveUserNameTool];
const toolNode = new ToolNode(tools);

// Define Conversation & Action State
export const FoodAgentState = Annotation.Root({
  messages: Annotation({
    reducer: addMessages,
    default: () => [],
  }),
  userName: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  cartData: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => ({}),
  }),
  userId: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  pendingAction: Annotation({
    reducer: (x, y) => (y !== undefined ? y : x),
    default: () => null,
  }),
  approvalResult: Annotation({
    reducer: (x, y) => (y !== undefined ? y : x),
    default: () => null,
  }),
});

// System prompt defining Chef Tomato AI personality & guidance
const SYSTEM_PROMPT = `You are "Chef Tomato AI", the friendly, charismatic master chef and autonomous food concierge for the Tomato Food Delivery app.

CRITICAL RULES FOR CONVERSATION FLOW:

1. 👋 CASUAL GREETINGS & SMALL TALK (NO PREMATURE PRODUCT DUMPING):
   - When the user gives a casual greeting (e.g. "hi", "hello", "hey", "kaise ho", "namaste", "what's up"):
     * DO NOT call 'search_menu'!
     * DO NOT dump product cards or dish lists!
     * Greet the customer warmly, ask how their day is going, and ask for their name or what flavor/food they might be in the mood for today.
     * Keep it natural, charming, and conversational.

2. 👤 NAME EXTRACTION & PERSONALIZATION:
   - When the user introduces themselves or mentions their name (e.g., "Mera naam Rahul hai", "I am Rahul", "Rahul here", "Call me Priya"):
     * Call the 'save_user_name' tool with their name.
     * Greet them warmly by name in your reply: "Arey Rahul ji / Hi Rahul! Bahut badhiya laga aapse milkar! 👨‍🍳 Aaj aapke liye kya banayein?"
     * Once you know their name, ALWAYS address them personally by their name in subsequent turns (e.g., "Hi Rahul!", "Bilkul Rahul, yeh dekhiye...").

3. 🍕 DISH SEARCH, SORTING & COUNT (RAG - ONLY WHEN ASKED):
   - Call the 'search_menu' tool ONLY when the customer asks for food, recommendations, menu items, cravings, or meal ideas.
   - SORTING INSTRUCTION: If the customer asks for sorted dishes:
     * "saste se mehnga", "cheapest first", "price low to high", "ascending": ALWAYS pass sort_by: "price_asc" to the tool!
     * "mehnge se sasta", "expensive first", "price high to low", "descending": ALWAYS pass sort_by: "price_desc" to the tool!
   - COUNT LIMIT: If the customer specifies a quantity (e.g. "3 product de", "only 2 dishes", "top 4"):
     * ALWAYS pass limit: <number> to 'search_menu' (e.g. limit: 3).
   - In your text response, ALWAYS present the dishes in the exact same sorted order returned by the tool. Mention their prices in ₹ and describe why they are delicious.

4. 🛒 CART & SENSITIVE ORDER ACTIONS (HUMAN-IN-THE-LOOP):
   - If the user asks to place an order, checkout their cart, clear their cart, or finalize an order (e.g., "checkout my cart", "place order with cash on delivery", "clear my cart"):
     DO NOT execute silently! You MUST call the 'request_order_action' tool.
   - This tool pauses execution and sends a Human-in-the-Loop Confirmation Card to the user.
   - Once the human approves, the order or cart action is executed safely.

5. 💬 TONE & LANGUAGE:
   - Match the user's language style naturally (English, Hindi, or Hinglish).
   - Enthusiastic, warm, hospitable, and polite with emojis (👨‍🍳, 🍕, 🥗, 🛵, 🧀).
   - If asked about non-food or out-of-context topics (e.g. coding, politics), politely steer the conversation back to food and dining.`;

// 1. Agent LLM Node
async function callModel(state) {
  const modelWithTools = geminiChatModel.bindTools(tools);

  // Look for any newly saved user name in tool messages
  let currentUserName = state.userName;
  for (const msg of state.messages) {
    if (msg._getType?.() === "tool") {
      try {
        const parsed = JSON.parse(msg.content);
        if (parsed.status === "NAME_SAVED" && parsed.name) {
          currentUserName = parsed.name;
        }
      } catch (e) {}
    }
  }

  // Prepend personalized system prompt
  const nameDirective = currentUserName
    ? `\n\nCURRENT CUSTOMER: The customer's name is "${currentUserName}". ALWAYS address them personally by name (e.g., "Hi ${currentUserName}!", "Haan ${currentUserName} bhai...", "Sure ${currentUserName}!").`
    : `\n\nCURRENT CUSTOMER: Name not known yet. If they mention their name, remember to call 'save_user_name'.`;

  const personalizedPrompt = SYSTEM_PROMPT + nameDirective;

  let messages = state.messages.filter((m) => m._getType?.() !== "system" && m.name !== "system");
  messages = [new SystemMessage(personalizedPrompt), ...messages];

  const response = await modelWithTools.invoke(messages);
  return { messages: [response], userName: currentUserName };
}

// 2. Router after Tool Execution: Check if request_order_action was called
function checkPendingApproval(state) {
  const lastMessage = state.messages[state.messages.length - 1];

  // Check if any tool message returned an AWAITING_APPROVAL status
  if (lastMessage && lastMessage._getType?.() === "tool") {
    try {
      const content = JSON.parse(lastMessage.content);
      if (content.requiresApproval && content.status === "AWAITING_APPROVAL") {
        return "humanApprovalNode";
      }
    } catch (e) {}
  }

  return "agentNode";
}

// 3. Human-In-The-Loop (HITL) Node using LangGraph interrupt()
async function humanApprovalNode(state) {
  const lastMessage = state.messages[state.messages.length - 1];
  let actionData = {
    actionType: "CONFIRM_ACTION",
    summary: "Confirmation required to proceed",
    totalAmount: 0,
    items: [],
  };

  try {
    const parsed = JSON.parse(lastMessage.content);
    actionData = parsed;
  } catch (e) {}

  // ⏸️ INTERRUPT GRAPH EXECUTION - Wait for Human Approval
  const humanResponse = interrupt({
    type: "HUMAN_APPROVAL_REQUIRED",
    actionType: actionData.actionType,
    summary: actionData.summary,
    totalAmount: actionData.totalAmount,
    items: actionData.items,
    timestamp: new Date().toISOString(),
  });

  // When resumed, humanResponse contains { approved: true/false, notes: "..." }
  const isApproved = humanResponse?.approved === true;

  let followUpText = "";
  if (isApproved) {
    followUpText = `✅ **Action Approved by Customer!** ${actionData.summary} has been confirmed and scheduled for execution! Our kitchen has received your instruction. 🛵✨`;
  } else {
    followUpText = `❌ **Action Cancelled:** You chose not to proceed with "${actionData.summary}". Your cart and orders remain unchanged. What else can I get cooking for you?`;
  }

  return {
    approvalResult: isApproved ? "APPROVED" : "REJECTED",
    pendingAction: null,
    messages: [new AIMessage(followUpText)],
  };
}

// Build the LangGraph StateGraph
const workflow = new StateGraph(FoodAgentState)
  .addNode("agentNode", callModel)
  .addNode("toolsNode", toolNode)
  .addNode("humanApprovalNode", humanApprovalNode)
  .addEdge(START, "agentNode")
  .addConditionalEdges("agentNode", toolsCondition, {
    tools: "toolsNode",
    __end__: END,
  })
  .addConditionalEdges("toolsNode", checkPendingApproval, {
    humanApprovalNode: "humanApprovalNode",
    agentNode: "agentNode",
  })
  .addEdge("humanApprovalNode", END);

// In-Memory Checkpointer for session thread persistence
export const checkpointer = new MemorySaver();

// Compile Graph with Checkpointer
export const foodAgentApp = workflow.compile({
  checkpointer: checkpointer,
});
