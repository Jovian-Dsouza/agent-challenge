# Financial Analyst AI Agent

## TLDR

🚀 Build a Financial Analyst AI Agent that summarizes stock data from Yahoo Finance & web search results!
🤖 Uses a multi-agent workflow to analyze & synthesize insights.
🔗 Exposes an MCP tool—call the agent directly from Claude Desktop for seamless integration!

---

## Demo & Social Links

- **YouTube Demo:** [https://youtu.be/WPeOlIcG7ec](https://youtu.be/WPeOlIcG7ec)
- **X (Twitter) Post:** [https://x.com/DsouzaJovian/status/1944684073445945515](https://x.com/DsouzaJovian/status/1944684073445945515)

---

## Overview

The **Financial Analyst AI Agent** is an advanced AI-powered assistant designed to answer natural language financial questions. It leverages specialized toolkits to retrieve, analyze, and synthesize financial data, providing clear, actionable insights to users.

---

## Multi-Agent Workflow Architecture

The Financial Analyst Agent uses a robust, multi-step workflow (see `financial-analyst-workflow.ts`) that chains together several specialized sub-agents and tool calls:

- **Ticker Resolution:**
  - Resolves company names or ambiguous input to a valid stock ticker using a dedicated Ticker Resolver Agent and web search if needed.
- **Data Fetching:**
  - Retrieves real-time and historical stock data, dividends, income statements, cash flow, news, recommendations, and earnings from Yahoo Finance via MCP tools.
- **Specialized Analysis:**
  - Sub-agents analyze each data type:
    - Dividend Analysis Agent
    - Cash Flow Analysis Agent
    - News Analysis Agent
    - Income Statement Analysis Agent
    - Earnings Analysis Agent
- **Synthesis & Summarization:**
  - A Summary Agent reads all analyses and produces a concise summary and actionable insights for the end user.

This workflow ensures:
- Accurate ticker resolution (even from company names)
- Modular, expert-level analysis for each financial aspect
- Clear, actionable output for investors and analysts

---

## Example Usage

- "What was Apple's stock price on January 1, 2023?"
- "Show me the latest earnings for Tesla."
- "Get the dividend history for Microsoft."
- "Find the stock ticker for Alphabet Inc."

---

## Problem Statement

The objective of this project is to develop a sophisticated **Financial Analyst AI Agent** capable of answering natural language questions from users. The agent must intelligently utilize specialized toolkits to retrieve and synthesize information.

The agent is powered by a compact (7B) language model, which requires a highly structured and concise system prompt to guide its behavior. The core task is to engineer this prompt to define:
- The agent's role
- Its available tools
- Its operational instructions
- A strict output format

### Core Capabilities
The agent can:
- **Parse User Intent:** Understand the user's question.
- **Select the Right Tool:** Choose between a Financial Data Toolkit (for specific data like stock prices) and a Web Search Toolkit (for general information or finding stock tickers).
- **Execute Methodically:** Follow a step-by-step reasoning process.
- **Provide Clear Answers:** Synthesize the retrieved data into a final, human-readable response.

---

## Agent Configuration

```json
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
}
```

---

## Key Components

- **role:** Defines the persona of the agent.
- **tools:** Lists the available functions, categorized into `finance` and `web` toolkits.
- **instructions:** Provides the core, non-negotiable rules the agent must follow. This is critical for ensuring reliable behavior (e.g., always finding a stock ticker before using a finance tool).
- **output_format:** Specifies the mandatory structure for the agent's response. This includes its internal monologue (`thought`) and the tool it decides to use, ensuring its actions are transparent and predictable. The `final_answer` is the only part intended for the end-user.

---

## Features

- Real-time and historical stock price retrieval
- Dividend and earnings data
- Company financial statements (income, cashflow)
- News and recommendations
- Web search for tickers and general info
- Step-by-step reasoning and transparent tool usage

---

## Setup Instructions

1. **Install dependencies:**
   ```sh
   pnpm install
   # or
   npm install
   ```
2. **Run the development server:**
   ```sh
   pnpm run dev
   # or
   npm run dev
   ```
3. **Access the agent:**
   Open [http://localhost:8080](http://localhost:8080) in your browser.

### LLM Endpoint
- By default, uses a local [Ollama](https://ollama.com) LLM.
- You can also use the Nosana endpoint:
  - `MODEL_NAME_AT_ENDPOINT=qwen2.5:1.5b`
  - `API_BASE_URL=https://dashboard.nosana.com/jobs/GPVMUckqjKR6FwqnxDeDRqbn34BH7gAa5xWnWuNH1drf`

---

## Docker & Nosana Deployment

1. **Build Docker image:**
   ```sh
   docker build -t joviandsouza/agent-challenge:latest .
   ```
2. **Run locally:**
   ```sh
   docker run -p 8080:8080 -p 8081:8081 joviandsouza/agent-challenge:latest
   ```
3. **Push to Docker Hub:**
   ```sh
   docker push joviandsouza/agent-challenge:latest
   ```
4. **Deploy on Nosana:**
   - Edit `nos_job_def/nosana_mastra.json` and set your image name.
   - Use [Nosana CLI](https://github.com/nosana-ci/nosana-cli) or [Nosana Dashboard](https://dashboard.nosana.com/deploy) to deploy.

---

## License

MIT
