import Anthropic from "@anthropic-ai/sdk"
import type { AiProvider, HtmlParseResult, ToolCallResult, ToolSchema } from "./types.js"

const HTML_PARSE_PROMPT = `You are an AI agent that operates web forms by analyzing raw HTML.
Given the HTML structure below, determine what form actions to take based on the user's request.

IMPORTANT: You must respond with valid JSON only, no markdown or extra text.
Response format:
{
  "thinking": "your analysis of the HTML and what you plan to do",
  "actions": [
    { "selector": "CSS selector", "action": "fill | click | select", "value": "value to set" }
  ]
}`

export class ClaudeProvider implements AiProvider {
  private client: Anthropic

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey })
  }

  async parseHtml(html: string, userMessage: string): Promise<HtmlParseResult> {
    const message = await this.client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `${HTML_PARSE_PROMPT}\n\nHTML:\n${html}\n\nUser request: ${userMessage}`,
        },
      ],
    })

    const textBlock = message.content.find(b => b.type === "text")
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("Claude did not return text content")
    }

    const cleaned = textBlock.text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
    const parsed = JSON.parse(cleaned) as HtmlParseResult
    return parsed
  }

  async toolUse(tools: ToolSchema[], userMessage: string): Promise<ToolCallResult> {
    const anthropicTools = tools.map(t => ({
      name: t.name,
      description: t.description,
      input_schema: t.inputSchema as Anthropic.Tool["input_schema"],
    }))

    const message = await this.client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      tools: anthropicTools,
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
    })

    const toolBlock = message.content.find(b => b.type === "tool_use")
    if (!toolBlock || toolBlock.type !== "tool_use") {
      throw new Error("Claude did not return a tool use block")
    }

    return {
      toolName: toolBlock.name,
      input: (toolBlock.input ?? {}) as Record<string, unknown>,
    }
  }
}
