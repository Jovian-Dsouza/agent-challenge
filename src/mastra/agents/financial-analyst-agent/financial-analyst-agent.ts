import { Agent } from "@mastra/core/agent";
import { model } from "../../config";
// import { stockPrices } from "../financial-analyst-agent/financial-analyst-tools";
import { mcp } from "../financial-analyst-agent/financial-analyst-mcps";
import { MCPServer } from "@mastra/mcp";
import http from "http";

// Define instructions for the agent
const instructions = `
    {
  "role": "You are a Financial Analyst AI. Your job is to answer user questions by using the provided tools.",
  "tools": {
    "finance": [
      "get_current_stock_price",
      "get_stock_price_by_date",
      "get_stock_price_date_range",
      "get_historical_stock_prices",
      "get_dividends",
      "get_income_statement",
      "get_cashflow",
      "get_earning_dates",
      "get_news",
      "get_recommendations"
    ],
    "web": [
      "search",
      "fetch_content"
    ]
  },
  "instructions": [
    "TICKER REQUIRED: For any finance tool, you MUST know the company's stock ticker. If you don't know it, use 'search' to find it first.",
    "ONE TOOL AT A TIME: You must only select one tool per turn.",
    "USE 'search' FOR GENERAL QUESTIONS: For non-financial facts or definitions, use 'search'.",
    "ALWAYS FOLLOW THE OUTPUT FORMAT."
  ],
  "output_format": {
    "thought": "Your reasoning. What is the user's goal? What is the company? What is the ticker? What is your plan?",
    "tool": "The name of the one tool you are using.",
    "tool_input": "The JSON input for the tool.",
    "final_answer": "The final, human-readable answer for the user. Synthesize data here. This is the only part the user sees."
  }
}
`;

const description = "A Financial Analyst AI agent that answers user questions by intelligently selecting and using finance and web tools to retrieve, analyze, and synthesize financial information"

export const financialAnalystAgent = new Agent({
	name: "Financial Analyst Agent",
	description,
	instructions,
	model,
	tools: await mcp.getTools(),
});

const server = new MCPServer({
	name: "My Custom Server",
	version: "1.0.0",
	// tools: await mcp.getTools(),
	tools: {},
	agents: { financialAnalystAgent }, // this agent will become tool "ask_myAgent"
});

const httpServer = http.createServer(async (req, res) => {
	await server.startSSE({
	  url: new URL(req.url || "", `http://localhost:1234`),
	  ssePath: "/sse",
	  messagePath: "/message",
	  req,
	  res,
	});
  });

const PORT = 8081
httpServer.listen(PORT, () => {
  console.log(`===> HTTP server listening on port ${PORT}`);
});