export interface ToolSchema {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}

export interface HtmlParseResult {
  thinking: string
  actions: Array<{ selector: string; action: string; value: string }>
}

export interface ToolCallResult {
  toolName: string
  input: Record<string, unknown>
}

export interface AiProvider {
  parseHtml(html: string, userMessage: string): Promise<HtmlParseResult>
  toolUse(tools: ToolSchema[], userMessage: string): Promise<ToolCallResult>
}
