import { Agent } from "@mastra/core/agent";
import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { model } from "../../config";
import { mcp } from "../financial-analyst-agent/financial-analyst-mcps";

// Create a specialized agent for ticker resolution
const tickerResolverAgent = new Agent({
  name: "Ticker Resolver Agent",
  model,
  instructions: `
      You are a financial ticker resolution specialist. Your job is to determine the correct stock ticker symbol for a given company name or input.
  
      RULES:
      1. If given a valid ticker symbol (2-5 uppercase letters), return it as-is
      2. If given a company name, search for the ticker symbol using the search tool
      3. Always return ONLY the ticker symbol in uppercase
      4. If uncertain, use the search tool to find the correct ticker
      5. Look for official stock exchange listings
  
      EXAMPLES:
      - Input: "Apple" → Output: "AAPL"
      - Input: "Microsoft Corporation" → Output: "MSFT"
      - Input: "TSLA" → Output: "TSLA"
      - Input: "Google" → Output: "GOOGL"
      - Input: "Amazon.com Inc" → Output: "AMZN"
      - Input: "Johnson & Johnson" → Output: "JNJ"
  
      Return only the ticker symbol, nothing else. Do not include explanations or additional text.
    `,
  tools: await mcp.getTools(),
});

/**
 * Resolves a company name or input to its correct stock ticker symbol
 * @param {string} input - Company name or potential ticker symbol
 * @returns {Promise<string>} - The resolved ticker symbol in uppercase
 */
async function resolveTickerSymbol(input: string) {
  if (!input || typeof input !== "string") {
    throw new Error("Invalid input: must be a non-empty string");
  }

  const cleanInput = input.trim();

  // Check if input is already a valid ticker (2-5 uppercase letters)
  const tickerRegex = /^[A-Z]{2,5}$/;
  if (tickerRegex.test(cleanInput)) {
    console.log(`Input "${cleanInput}" is already a valid ticker symbol`);
    return cleanInput;
  }

  try {
    console.log(`Resolving ticker for: "${cleanInput}"`);

    const prompt = `Find the stock ticker symbol for: ${cleanInput}`;

    const response = await tickerResolverAgent.stream([
      {
        role: "user",
        content: prompt,
      },
    ]);

    let tickerResponse = "";
    for await (const chunk of response.textStream) {
      tickerResponse += chunk;
    }

    // Extract ticker from response (remove any extra text)
    const tickerMatch = tickerResponse.match(/([A-Z]{2,5})/);
    const ticker = tickerMatch ? tickerMatch[1] : cleanInput.toUpperCase();

    console.log(`Resolved ticker: "${cleanInput}" → "${ticker}"`);
    return ticker;
  } catch (error: any) {
    console.warn(
      `Failed to resolve ticker for "${cleanInput}": ${error.message}`
    );
    console.warn(`Falling back to uppercase: "${cleanInput.toUpperCase()}"`);
    return cleanInput.toUpperCase();
  }
}

const fetchTicker = createStep({
  id: "fetch-ticker",
  description: "Fetches current stock ticker from user input",
  inputSchema: z.object({
    ticker: z.string().describe("The stock ticker symbol or company name"),
  }),
  outputSchema: z.object({
    ticker: z.string(),
  }),
  execute: async ({ inputData }) => {
    if (
      !inputData ||
      !inputData.ticker ||
      typeof inputData.ticker !== "string"
    ) {
      throw new Error("Invalid input: must be a non-empty string");
    }

    const cleanInput = inputData.ticker.trim();
    const tickerRegex = /^[A-Z]{2,5}$/;
    if (tickerRegex.test(cleanInput)) {
      console.log(`Input "${cleanInput}" is already a valid ticker symbol`);
      return { ticker: cleanInput };
    }

    try {
      console.log(`Resolving ticker for: "${cleanInput}"`);

      const prompt = `Find the stock ticker symbol for: ${cleanInput}`;

      const response = await tickerResolverAgent.stream([
        {
          role: "user",
          content: prompt,
        },
      ]);

      let tickerResponse = "";
      for await (const chunk of response.textStream) {
        tickerResponse += chunk;
      }

      // Extract ticker from response (remove any extra text)
      const tickerMatch = tickerResponse.match(/([A-Z]{2,5})/);
      const ticker = tickerMatch ? tickerMatch[1] : cleanInput.toUpperCase();

      console.log(`Resolved ticker: "${cleanInput}" → "${ticker}"`);
      return { ticker };
    } catch (error: any) {
      console.warn(
        `Failed to resolve ticker for "${cleanInput}": ${error.message}`
      );
      console.warn(`Falling back to uppercase: "${cleanInput.toUpperCase()}"`);
      return { ticker: cleanInput.toUpperCase()};
    }
  },
});

const fetchStockData = createStep({
  id: "fetch-stock-data",
  description: "Fetches current stock price and basic market data",
  inputSchema: z.object({
    ticker: z.string().describe("The stock ticker symbol"),
  }),
  outputSchema: z.object({
    ticker: z.string(),
    stockPrice: z.string(),
  }),
  execute: async ({ inputData }) => {
    if (!inputData || !inputData.ticker) {
      throw new Error("Input data not found");
    }
    const { ticker } = inputData
    const tools = await mcp.getTools();

    try {
      const stockPriceResult = await tools['yahoo-finance_get_current_stock_price'].execute({
        context: { symbol: ticker },
      });
      console.log("stockPriceResult:", stockPriceResult);

      return {
        ticker,
        stockPrice: stockPriceResult.content[0].text
      };
    } catch (error: any) {
      throw new Error(
        `Failed to fetch stock data for ${ticker}: ${error.message}`
      );
    }
  },
});

const financialAnalysisWorkflow = createWorkflow({
  id: "financial-analysis-workflow",
  inputSchema: z.object({
    ticker: z
      .string()
      .describe("The stock ticker symbol or company name to analyze"),
  }),
  outputSchema: z.object({
    analysis: z.string(),
  }),
})
    .then(fetchTicker)
    .then(fetchStockData);

financialAnalysisWorkflow.commit();

export { financialAnalysisWorkflow };
