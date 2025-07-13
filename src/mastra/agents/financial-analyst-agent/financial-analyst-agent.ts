import { Agent } from "@mastra/core/agent";
import { model } from "../../config";
import { instructions, description } from "../financial-analyst-agent/financial-analyst-prompt";
import { mcp } from "../financial-analyst-agent/financial-analyst-mcps";
import { MCPServer } from "@mastra/mcp";
import http from "http";


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
	tools: await mcp.getTools(),
	// tools: {},
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