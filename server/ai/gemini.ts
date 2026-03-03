import { GoogleGenerativeAI, type FunctionDeclarationSchema, SchemaType } from "@google/generative-ai"
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
}

HTML:
`

const convertJsonSchemaToGemini = (schema: Record<string, unknown>): Record<string, unknown> => {
  const convert = (s: Record<string, unknown>): Record<string, unknown> => {
    const result: Record<string, unknown> = {}

    const typeMap: Record<string, SchemaType> = {
      string: SchemaType.STRING,
      number: SchemaType.NUMBER,
      integer: SchemaType.INTEGER,
      boolean: SchemaType.BOOLEAN,
      array: SchemaType.ARRAY,
      object: SchemaType.OBJECT,
    }

    if (s.type && typeof s.type === "string") {
      result.type = typeMap[s.type] ?? SchemaType.STRING
    }

    if (s.description) result.description = s.description
    if (s.enum) result.enum = s.enum

    if (s.properties && typeof s.properties === "object") {
      const props: Record<string, unknown> = {}
      for (const [key, val] of Object.entries(s.properties as Record<string, Record<string, unknown>>)) {
        props[key] = convert(val)
      }
      result.properties = props
    }

    if (s.required) result.required = s.required

    if (s.items && typeof s.items === "object") {
      result.items = convert(s.items as Record<string, unknown>)
    }

    return result
  }

  return convert(schema)
}

export class GeminiProvider implements AiProvider {
  private client: GoogleGenerativeAI

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey)
  }

  async parseHtml(html: string, userMessage: string): Promise<HtmlParseResult> {
    const model = this.client.getGenerativeModel({ model: "gemini-2.0-flash" })
    const prompt = `${HTML_PARSE_PROMPT}${html}\n\nUser request: ${userMessage}`

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
    const parsed = JSON.parse(cleaned) as HtmlParseResult
    return parsed
  }

  async toolUse(tools: ToolSchema[], userMessage: string): Promise<ToolCallResult> {
    const functionDeclarations = tools.map(t => ({
      name: t.name,
      description: t.description,
      parameters: convertJsonSchemaToGemini(t.inputSchema) as unknown as FunctionDeclarationSchema,
    }))

    const model = this.client.getGenerativeModel({
      model: "gemini-2.0-flash",
      tools: [{ functionDeclarations }],
    })

    const result = await model.generateContent(userMessage)
    const call = result.response.functionCalls()?.[0]

    if (!call) {
      throw new Error("Gemini did not return a function call")
    }

    return {
      toolName: call.name,
      input: (call.args ?? {}) as Record<string, unknown>,
    }
  }
}
