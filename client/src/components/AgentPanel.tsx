import { useState, useRef, useEffect, type CSSProperties } from "react"

export interface Message {
  role: "user" | "agent"
  content: string
}

interface AgentPanelProps {
  messages: Message[]
  onSend: (message: string) => void
  isLoading: boolean
}

const styles: Record<string, CSSProperties> = {
  panel: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    borderLeft: "1px solid #e5e7eb",
    background: "#fafafa",
  },
  header: {
    padding: "16px 20px",
    borderBottom: "1px solid #e5e7eb",
    fontWeight: 600,
    fontSize: 15,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  bubble: {
    maxWidth: "85%",
    padding: "10px 14px",
    borderRadius: 12,
    fontSize: 14,
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  userBubble: {
    alignSelf: "flex-end",
    background: "#3b82f6",
    color: "#fff",
    borderBottomRightRadius: 4,
  },
  agentBubble: {
    alignSelf: "flex-start",
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderBottomLeftRadius: 4,
  },
  inputRow: {
    display: "flex",
    gap: 8,
    padding: 16,
    borderTop: "1px solid #e5e7eb",
  },
  input: {
    flex: 1,
    padding: "10px 14px",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    fontSize: 14,
    outline: "none",
  },
  sendBtn: {
    padding: "10px 20px",
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
  },
  sendBtnDisabled: {
    background: "#93c5fd",
    cursor: "not-allowed",
  },
  loadingDots: {
    alignSelf: "flex-start",
    padding: "10px 14px",
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    borderBottomLeftRadius: 4,
    fontSize: 14,
    color: "#9ca3af",
  },
  emptyState: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#9ca3af",
    fontSize: 14,
    textAlign: "center",
    padding: 32,
  },
}

const TypingIndicator = () => {
  const [dots, setDots] = useState("")

  useEffect(() => {
    const id = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".")
    }, 400)
    return () => clearInterval(id)
  }, [])

  return <div style={styles.loadingDots}>Thinking{dots}</div>
}

const AgentPanel = ({ messages, onSend, isLoading }: AgentPanelProps) => {
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return
    onSend(trimmed)
    setInput("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <span>🤖</span>
        <span>AI Agent</span>
      </div>

      <div style={styles.messages}>
        {messages.length === 0 && !isLoading && (
          <div style={styles.emptyState}>
            Tell the AI agent what campaign you want to create.
            <br /><br />
            Example: "Create a DPA campaign with $500 daily budget targeting women aged 25-45"
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.bubble,
              ...(msg.role === "user" ? styles.userBubble : styles.agentBubble),
            }}
          >
            {msg.content}
          </div>
        ))}

        {isLoading && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      <div style={styles.inputRow}>
        <input
          style={styles.input}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tell the AI what to do..."
          disabled={isLoading}
        />
        <button
          style={{
            ...styles.sendBtn,
            ...(isLoading || !input.trim() ? styles.sendBtnDisabled : {}),
          }}
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default AgentPanel
