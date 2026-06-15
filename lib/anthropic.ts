import Anthropic from "@anthropic-ai/sdk";

const globalForAnthropic = global as unknown as {
  anthropicClient: Anthropic;
};

export const anthropic =
  globalForAnthropic.anthropicClient ||
  new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

if (process.env.NODE_ENV !== "production") {
  globalForAnthropic.anthropicClient = anthropic;
}

export const CLAUDE_MODEL = "claude-sonnet-4-20250514";
