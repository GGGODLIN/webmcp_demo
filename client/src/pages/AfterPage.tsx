import { useState, type CSSProperties } from "react"
import CampaignForm from "../components/CampaignForm"
import AgentPanel, { type Message } from "../components/AgentPanel"
import {
  DEFAULT_FORM_DATA,
  getAvailableAudiences,
  getAvailablePlacements,
  type CampaignFormData,
  type CampaignType,
  type AudienceType,
  type Gender,
  type Placement,
  type AdFormat,
} from "../types"
import { campaignFormTool } from "../webmcp/tools"

const API_BASE = "http://localhost:3001"

const styles: Record<string, CSSProperties> = {
  page: {
    display: "flex",
    height: "calc(100vh - 52px)",
  },
  formSide: {
    flex: 1,
    overflowY: "auto",
  },
  agentSide: {
    width: 400,
    flexShrink: 0,
  },
  banner: {
    padding: "12px 24px",
    background: "#dcfce7",
    borderBottom: "1px solid #86efac",
    fontSize: 13,
    color: "#166534",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  toolBadge: {
    position: "fixed" as const,
    bottom: 16,
    left: 16,
    background: "#1e293b",
    color: "#fff",
    padding: "8px 16px",
    borderRadius: 8,
    fontSize: 12,
    fontFamily: "monospace",
    zIndex: 50,
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  },
}

const applyToolResult = (input: Record<string, unknown>): CampaignFormData => {
  const campaignType = (input.type as CampaignType) ?? null
  const availableAudiences = campaignType ? getAvailableAudiences(campaignType) : []
  const availablePlacements = campaignType ? getAvailablePlacements(campaignType) : []

  let audiences: AudienceType[] = []
  if (campaignType === "DPA") {
    audiences = ["DPA"]
  } else if (Array.isArray(input.audiences)) {
    audiences = (input.audiences as AudienceType[]).filter(a => availableAudiences.includes(a))
  }

  let placements: Placement[] = []
  if (Array.isArray(input.placements)) {
    placements = (input.placements as Placement[]).filter(p => availablePlacements.includes(p))
  }

  const ageRange: [number, number] = Array.isArray(input.ageRange)
    ? [
        Math.max(18, Math.min(65, input.ageRange[0] as number)),
        Math.max(18, Math.min(65, input.ageRange[1] as number)),
      ]
    : [18, 65]

  return {
    name: (input.name as string) ?? "",
    type: campaignType,
    dailyBudget: (input.dailyBudget as number) ?? 0,
    currency: (input.currency as string) ?? "USD",
    audiences,
    ageRange,
    gender: (input.gender as Gender) ?? "ALL",
    placements,
    adFormat: (input.adFormat as AdFormat) ?? null,
  }
}

const formatToolInput = (input: Record<string, unknown>): string => {
  const lines: string[] = []
  for (const [key, val] of Object.entries(input)) {
    lines.push(`  ${key}: ${JSON.stringify(val)}`)
  }
  return `{\n${lines.join(",\n")}\n}`
}

const AfterPage = () => {
  const [formData, setFormData] = useState<CampaignFormData>(DEFAULT_FORM_DATA)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addMessage = (role: Message["role"], content: string) => {
    setMessages(prev => [...prev, { role, content }])
  }

  const handleSend = async (userMessage: string) => {
    addMessage("user", userMessage)
    setIsLoading(true)

    try {
      addMessage("agent", "🔧 Sending request with WebMCP tool schema...")

      const res = await fetch(`${API_BASE}/api/agent/tool-use`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tools: [campaignFormTool],
          userMessage,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "API request failed")
      }

      const result = await res.json()

      addMessage(
        "agent",
        `✅ AI called tool: ${result.toolName}\n\nParameters:\n${formatToolInput(result.input)}`,
      )

      const newFormData = applyToolResult(result.input)
      setFormData(newFormData)

      addMessage(
        "agent",
        "🎯 Form updated instantly with structured data!\n\n✨ With WebMCP, the AI understands the form schema directly — no HTML parsing, no CSS selector guessing, no errors.",
      )
    } catch (err) {
      addMessage("agent", `❌ Error: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.formSide}>
        <div style={styles.banner}>
          <span>✅</span>
          <span>
            <strong>After WebMCP:</strong> The AI agent receives a structured tool schema and uses function calling.
            Results are precise and reliable.
          </span>
        </div>
        <CampaignForm value={formData} onChange={setFormData} />
      </div>
      <div style={styles.agentSide}>
        <AgentPanel
          messages={messages}
          onSend={handleSend}
          isLoading={isLoading}
        />
      </div>
      <div style={styles.toolBadge}>
        🔌 WebMCP: navigator.modelContext.tools registered
      </div>
    </div>
  )
}

export default AfterPage
