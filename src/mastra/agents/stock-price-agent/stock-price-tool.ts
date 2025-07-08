import { createTool } from "@mastra/core/tools";
import { z } from "zod";

// // Simple async function that conforms to input and output schema
// const getInfo = async (ctx: string) =>
//   Promise.resolve({ bar: ctx.length, baz: "baz" });

// // Define your tool using the `createtool`
// export const yourTool = createTool({
//   id: "tool-name",
//   description: "Use the `createTool function to create your tool",
//   inputSchema: z.object({
//     foo: z.string().describe("Foo name"),
//   }),
//   outputSchema: z.object({
//     bar: z.number(),
//     baz: z.string(),
//   }),
//   execute: async ({ context }) => {
//     return await getInfo(context.foo);
//   },
// });


const getStockPrice = async (symbol: string) => {
  const data = await fetch(
    `https://mastra-stock-data.vercel.app/api/stock-data?symbol=${symbol}`,
  ).then((r) => r.json());
  return data.prices["4. close"];
};
 
export const stockPrices = createTool({
  id: "Get Stock Price",
  inputSchema: z.object({
    symbol: z.string(),
  }),
  description: `Fetches the last day's closing stock price for a given symbol`,
  execute: async ({ context: { symbol } }) => {
    console.log("Using tool to fetch stock price for", symbol);
    return {
      symbol,
      currentPrice: await getStockPrice(symbol),
    };
  },
});