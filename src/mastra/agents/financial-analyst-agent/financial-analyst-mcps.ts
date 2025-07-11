import { MCPClient } from "@mastra/mcp";
 
export const mcp = new MCPClient({
  servers: {
    "yahoo-finance": {
      "command": "uvx",
      "args": ["mcp-yahoo-finance"]
    },
    "duckduckgo": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "mcp/duckduckgo"]
    }
  },
});