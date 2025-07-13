import { MCPClient } from "@mastra/mcp";
 
export const mcp = new MCPClient({
  servers: {
    "yahoo-finance": {
      "command": "uvx",
      "args": ["mcp-yahoo-finance"]
    },
    "duckduckgo": {
      "command": "uvx",
      "args": ["duckduckgo-mcp-server"]
    }
  },
});