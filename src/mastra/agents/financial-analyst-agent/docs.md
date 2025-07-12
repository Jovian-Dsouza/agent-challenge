# Financial Analyst Agent Documentation

## 1. Problem Statement

The objective of this project is to develop a sophisticated **Financial Analyst AI Agent** capable of answering natural language questions from users. The agent must intelligently utilize specialized toolkits to retrieve and synthesize information.

The agent is powered by a compact (7B) language model, which requires a highly structured and concise system prompt to guide its behavior. The core task is to engineer this prompt to define:
- The agent's role
- Its available tools
- Its operational instructions
- A strict output format

### Core Capabilities
The agent must be able to:
- **Parse User Intent:** Understand the user's question.
- **Select the Right Tool:** Choose between a Financial Data Toolkit (for specific data like stock prices) and a Web Search Toolkit (for general information or finding stock tickers).
- **Execute Methodically:** Follow a step-by-step reasoning process.
- **Provide Clear Answers:** Synthesize the retrieved data into a final, human-readable response.

---

## 2. Agent Configuration (`json-prompt-v1`)

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

## 3. Key Components

- **role:** Defines the persona of the agent.
- **tools:** Lists the available functions, categorized into `finance` and `web` toolkits.
- **instructions:** Provides the core, non-negotiable rules the agent must follow. This is critical for ensuring reliable behavior (e.g., always finding a stock ticker before using a finance tool).
- **output_format:** Specifies the mandatory structure for the agent's response. This includes its internal monologue (`thought`) and the tool it decides to use, ensuring its actions are transparent and predictable. The `final_answer` is the only part intended for the end-user.