import { GeminiProvider } from "./gemini.js"
import { ClaudeProvider } from "./claude.js"
import type { AiProvider } from "./types.js"

export type { AiProvider, HtmlParseResult, ToolCallResult, ToolSchema } from "./types.js"

export const createAiProvider = (): AiProvider => {
  const provider = process.env.AI_PROVIDER ?? "gemini"
  switch (provider) {
    case "gemini":
      return new GeminiProvider(process.env.GEMINI_API_KEY!)
    case "claude":
      return new ClaudeProvider(process.env.ANTHROPIC_API_KEY!)
    default:
      throw new Error(`Unknown AI provider: ${provider}`)
  }
}
