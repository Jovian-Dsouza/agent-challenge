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

// Subagent for Dividend Analysis
const dividendAnalysisAgent = new Agent({
    name: "Dividend Analysis Agent",
    model,
    instructions: `
      You are a dividend analysis specialist. Analyze dividend payment data and provide insights.
  
      ANALYSIS FRAMEWORK:
      1. Dividend Yield & Growth Analysis
      2. Payment Consistency & Reliability
      3. Dividend Sustainability Assessment
      4. Income Investment Perspective
  
      Provide specific data points and actionable insights for income-focused investors. Provide concise output in less than 400 words
    `,
  });

  const cashFlowAnalysisAgent = new Agent({
    name: "Cash Flow Analysis Agent",
    model,
    instructions: `
      You are a cash flow analysis specialist. Analyze cash generation, capital allocation, and financial flexibility.
  
      ANALYSIS FRAMEWORK:
      1. Operating Cash Flow Analysis
      2. Free Cash Flow Generation
      3. Capital Allocation Strategy
      4. Financial Flexibility Assessment
  
      Output
      • Overall Assessment: [Excellent/Good/Fair/Poor]
      • Cash Generation: [Strong/Moderate/Weak]
      • Capital Efficiency: [High/Medium/Low]
      • Financial Stability: [Strong/Moderate/Weak]
      
      Emphasize cash generation quality and capital allocation effectiveness. Provide concise output in less than 400 words
    `,
  });

  const newsAnalysisAgent = new Agent({
    name: "News Analysis Agent",
    model,
    instructions: `
      You are a financial news analysis specialist. Analyze recent news for market impact and investment implications. 
  
      ANALYSIS FRAMEWORK:
      1. News Sentiment Analysis
      2. Market Impact Assessment
      3. Strategic Implications
      4. Timeline and Materiality
  
      Focus on material news items and their potential impact on stock performance. Provide concise output in less than 400 words
    `,
  });

  const incomeStatementAgent = new Agent({
    name: "Income Statement Analysis Agent",
    model,
    instructions: `
      You are an income statement analysis specialist. Analyze revenue, profitability, and operational efficiency.
  
      ANALYSIS FRAMEWORK:
      1. Revenue Growth & Trends
      2. Profitability Analysis
      3. Operational Efficiency
      4. Year-over-Year Comparisons
      
      Focus on trends, margins, and operational efficiency indicators. Provide concise output in less than 400 words
    `,
  });


  const earningsAnalysisAgent = new Agent({
    name: "Earnings Analysis Agent",
    model,
    instructions: `
      You are an earnings analysis specialist. Analyze earnings performance, estimates, and surprises.
  
      ANALYSIS FRAMEWORK:
      1. Earnings Performance Analysis
      2. Estimate vs. Actual Comparison
      3. Earnings Surprise History
      4. Future Earnings Outlook
      
      Focus on earnings trends, surprise patterns, and forward-looking indicators. Provide concise output in less than 400 words
    `,
  });

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

async function fetchYahooFinanceData(tools: any, key: string, symbol: string ) : Promise<string> {
    const result = await tools[`yahoo-finance_${key}`].execute({
        context: { symbol },
      });
    // console.log(key, " -> ", result)
    if(result.content[0].text){
        return result.content[0].text
    }
    return "N/A"
}

const fetchStockData = createStep({
  id: "fetch-stock-data",
  description: "Fetches current stock price and basic market data",
  inputSchema: z.object({
    ticker: z.string().describe("The stock ticker symbol"),
  }),
  outputSchema: z.object({
    ticker: z.string(),
    currentStockPrice: z.string(),
    dividends: z.string(),
    incomeStatement: z.string(),
    cashFlow: z.string(),
    news: z.string(),
    recommendations: z.string(),
    earnings: z.string()
  }),
  execute: async ({ inputData }) => {
    if (!inputData || !inputData.ticker) {
      throw new Error("Input data not found");
    }
    const { ticker } = inputData
    const tools = await mcp.getTools();

    try {
      const currentStockPrice = await fetchYahooFinanceData(tools, 'get_current_stock_price', ticker)
      const dividends = await fetchYahooFinanceData(tools, 'get_dividends', ticker)
      const incomeStatement = await fetchYahooFinanceData(tools, 'get_income_statement', ticker)
      const cashFlow = await fetchYahooFinanceData(tools, 'get_cashflow', ticker)
      const news = await fetchYahooFinanceData(tools, 'get_news', ticker)
      const recommendations = await fetchYahooFinanceData(tools, 'get_recommendations', ticker)
      const earnings = await fetchYahooFinanceData(tools, 'get_earning_dates', ticker)

      return {
        ticker,
        currentStockPrice,
        dividends,
        incomeStatement,
        cashFlow,
        news,
        recommendations,
        earnings
      };
    } catch (error: any) {
      throw new Error(
        `Failed to fetch stock data for ${ticker}: ${error.message}`
      );
    }
  },
});

function removeThinkTags(input: string): string {
    return input.replace(/<think>[\s\S]*?<\/think>/g, "");
  }

async function analyzeData(agent: any, data: string) {
    if (data === "" || data === "N/A") {
        return ("N/A")
    }
    const prompt = `Here is the data: ${data}`;
    const response = await agent.stream([
    {
        role: "user",
        content: prompt,
    },
    ]);

    let responseStr = "";
    for await (const chunk of response.textStream) {
    responseStr += chunk;
    }
    let filtered = removeThinkTags(responseStr);
    return filtered
}


const analyzeStockData = createStep({
    id: "analyze-stock-data",
    description: "Analyzes the stock data",
    inputSchema: z.object({
        ticker: z.string(),
        currentStockPrice: z.string(),
        dividends: z.string(),
        incomeStatement: z.string(),
        cashFlow: z.string(),
        news: z.string(),
        recommendations: z.string(),
        earnings: z.string()
    }),
    outputSchema: z.object({
      ticker: z.string(),
      currentStockPrice: z.string(),
      dividends: z.string(),
      incomeStatement: z.string(),
      cashFlow: z.string(),
      news: z.string(),
      recommendations: z.string(),
      earnings: z.string()
    }),
    execute: async ({ inputData }) => {
      if (!inputData || !inputData.ticker) {
        throw new Error("Input data not found");
      }
      const { ticker, currentStockPrice, dividends, incomeStatement, cashFlow, news, recommendations, earnings } = inputData

      console.log("dividends", dividends.length)
      console.log("incomeStatement", incomeStatement.length)
      console.log("cashFlow", cashFlow.length)
      console.log("news", news.length)
      console.log("recommendations", recommendations.length)
      console.log("earnings", earnings.length)



    const dividendAnalysis = await analyzeData(dividendAnalysisAgent, dividends)
    const newsAnalysis = await analyzeData(newsAnalysisAgent, news)
    const incomeStatementAnalysis = await analyzeData(incomeStatementAgent, incomeStatement)
    const cashFlowAnalysis = await analyzeData(cashFlowAnalysisAgent, cashFlow)
    const earningsAnalysis = await analyzeData(earningsAnalysisAgent, earnings)

      
      try {
  
        return {
          ticker,
          currentStockPrice,
          dividends: dividendAnalysis,
          incomeStatement: incomeStatementAnalysis,
          cashFlow: cashFlowAnalysis,
          new: newsAnalysis,
          recommendations,
          earnings: earningsAnalysis
        };
      } catch (error: any) {
        throw new Error(
          `Failed to analyze stock data for ${ticker}: ${error.message}`
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
    .then(fetchStockData)
    .then(analyzeStockData);

financialAnalysisWorkflow.commit();

export { financialAnalysisWorkflow };
