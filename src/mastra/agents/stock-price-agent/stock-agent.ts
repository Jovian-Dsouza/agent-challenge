import { Agent } from "@mastra/core/agent";
import { model } from "../../config";
import { stockPrices } from "../stock-price-agent/stock-price-tool";

// Define Agent Name
const name = "Stock Agent";

// Define instructions for the agent
const instructions = `
      You are a helpful assistant that provides current stock prices. When asked about a stock, use the stock price tool to fetch the stock price.
`;

export const stockAgent = new Agent({
	name,
	instructions,
	model,
	tools: { stockPrices },
});
