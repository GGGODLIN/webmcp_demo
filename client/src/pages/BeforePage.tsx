import { useState, useRef, type CSSProperties } from "react"
import CampaignForm from "../components/CampaignForm"
import AgentPanel, { type Message } from "../components/AgentPanel"
import { DEFAULT_FORM_DATA, type CampaignFormData } from "../types"

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
    background: "#fef3c7",
    borderBottom: "1px solid #fcd34d",
    fontSize: 13,
    color: "#92400e",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
}

const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

const executeAction = (
  formRef: React.RefObject<HTMLDivElement | null>,
  action: { selector: string; action: string; value: string },
  formData: CampaignFormData,
  setFormData: (d: CampaignFormData) => void,
) => {
  const el = formRef.current?.querySelector(action.selector) as HTMLElement | null
  if (!el) return false

  if (el instanceof HTMLInputElement) {
    if (el.type === "radio") {
      el.click()
      return true
    }
    if (el.type === "checkbox") {
      el.click()
      return true
    }
    if (el.type === "number") {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, "value"
      )?.set
      nativeInputValueSetter?.call(el, action.value)
      el.dispatchEvent(new Event("input", { bubbles: true }))
      el.dispatchEvent(new Event("change", { bubbles: true }))
      return true
    }
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype, "value"
    )?.set
    nativeInputValueSetter?.call(el, action.value)
    el.dispatchEvent(new Event("input", { bubbles: true }))
    el.dispatchEvent(new Event("change", { bubbles: true }))
    return true
  }

  if (el.dataset.role === "dropdown-trigger" || el.dataset.component === "custom-dropdown") {
    el.click()
    setTimeout(() => {
      const menu = formRef.current?.querySelector("[data-role='dropdown-menu']") as HTMLElement | null
      if (menu) {
        const option = menu.querySelector(`[data-value="${action.value}"]`) as HTMLElement | null
        option?.click()
      }
    }, 200)
    return true
  }

  if (el.dataset.value) {
    el.click()
    return true
  }

  el.click()
  return true
}

const BeforePage = () => {
  const [formData, setFormData] = useState<CampaignFormData>(DEFAULT_FORM_DATA)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)

  const addMessage = (role: Message["role"], content: string) => {
    setMessages(prev => [...prev, { role, content }])
  }

  const handleSend = async (userMessage: string) => {
    addMessage("user", userMessage)
    setIsLoading(true)

    try {
      const html = formRef.current?.innerHTML ?? ""

      addMessage("agent", "📋 Capturing form HTML and sending to AI for analysis...")

      const res = await fetch(`${API_BASE}/api/agent/html-parse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html, userMessage }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "API request failed")
      }

      const result = await res.json()

      addMessage("agent", `🤔 AI Analysis:\n${result.thinking}`)

      if (result.actions && Array.isArray(result.actions)) {
        addMessage("agent", `📝 Found ${result.actions.length} actions to execute...`)

        for (let i = 0; i < result.actions.length; i++) {
          const action = result.actions[i]
          await delay(800)

          const success = executeAction(formRef, action, formData, setFormData)
          const status = success ? "✅" : "❌"
          addMessage(
            "agent",
            `${status} Step ${i + 1}: ${action.action} "${action.selector}" → "${action.value}"`,
          )
        }

        addMessage("agent", "🏁 Done! Check the form to see if the AI filled it correctly.\n\n⚠️ Note: Without WebMCP, the AI had to guess CSS selectors from raw HTML. Results may be inaccurate.")
      }
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
          <span>⚠️</span>
          <span>
            <strong>Before WebMCP:</strong> The AI agent receives raw HTML and must parse it to understand the form structure.
            This approach is fragile and error-prone.
          </span>
        </div>
        <div ref={formRef}>
          <CampaignForm value={formData} onChange={setFormData} />
        </div>
      </div>
      <div style={styles.agentSide}>
        <AgentPanel
          messages={messages}
          onSend={handleSend}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}

export default BeforePage
