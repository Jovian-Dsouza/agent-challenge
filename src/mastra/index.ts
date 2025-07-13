import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { financialAnalystAgent } from "./agents/financial-analyst-agent/financial-analyst-agent";
import { financialAnalysisWorkflow } from "./agents/financial-analyst-agent/financial-analyst-workflow";

export const mastra = new Mastra({
	workflows: { financialAnalysisWorkflow }, // can be deleted later
	agents: { financialAnalystAgent },
	logger: new PinoLogger({
		name: "Mastra",
		level: "info",
	}),
	server: {
		port: 8080,
		timeout: 10000,
	},
});
