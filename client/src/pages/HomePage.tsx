import { Link } from "react-router-dom"
import type { CSSProperties } from "react"

const styles: Record<string, CSSProperties> = {
  container: {
    maxWidth: 800,
    margin: "0 auto",
    padding: "60px 24px",
    textAlign: "center",
  },
  title: {
    fontSize: 42,
    fontWeight: 700,
    marginBottom: 12,
    color: "#111827",
  },
  subtitle: {
    fontSize: 18,
    color: "#6b7280",
    lineHeight: 1.6,
    maxWidth: 600,
    margin: "0 auto 48px",
  },
  highlight: {
    color: "#3b82f6",
    fontWeight: 600,
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 24,
    maxWidth: 700,
    margin: "0 auto",
  },
  card: {
    padding: 32,
    borderRadius: 16,
    border: "2px solid #e5e7eb",
    textDecoration: "none",
    color: "inherit",
    transition: "all 0.2s",
    textAlign: "left" as const,
  },
  cardBefore: {
    borderColor: "#fbbf24",
    background: "#fffbeb",
  },
  cardAfter: {
    borderColor: "#34d399",
    background: "#ecfdf5",
  },
  cardIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 600,
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 1.5,
  },
  cardArrow: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: 500,
    color: "#3b82f6",
  },
  techBadge: {
    display: "inline-block",
    padding: "4px 12px",
    background: "#f3f4f6",
    borderRadius: 20,
    fontSize: 12,
    color: "#6b7280",
    marginTop: 48,
  },
}

const HomePage = () => (
  <div style={styles.container}>
    <h1 style={styles.title}>WebMCP Demo</h1>
    <p style={styles.subtitle}>
      See how <span style={styles.highlight}>WebMCP</span> transforms AI agent interactions with web forms.
      Compare the fragile HTML-parsing approach vs. structured tool schema approach side by side.
    </p>

    <div style={styles.cards}>
      <Link to="/before" style={{ ...styles.card, ...styles.cardBefore }}>
        <div style={styles.cardIcon}>⚠️</div>
        <div style={styles.cardTitle}>Before WebMCP</div>
        <div style={styles.cardDesc}>
          No WebMCP tools registered. The AI agent must read the DOM tree, locate form elements, and fill them one by one using browser automation.
        </div>
        <div style={styles.cardArrow}>Try it →</div>
      </Link>

      <Link to="/after" style={{ ...styles.card, ...styles.cardAfter }}>
        <div style={styles.cardIcon}>✅</div>
        <div style={styles.cardTitle}>After WebMCP</div>
        <div style={styles.cardDesc}>
          WebMCP tool registered via navigator.modelContext. The AI agent discovers the tool and fills the entire form with one structured call.
        </div>
        <div style={styles.cardArrow}>Try it →</div>
      </Link>
    </div>

    <div style={styles.techBadge}>
      Chrome Canary 146+ · WebMCP · React + Vite
    </div>
  </div>
)

export default HomePage
