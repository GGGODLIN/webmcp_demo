import { useState, useEffect, type CSSProperties } from "react"
import CampaignForm from "../components/CampaignForm"
import { DEFAULT_FORM_DATA, type CampaignFormData } from "../types"
import { registerWebMCPTool, unregisterWebMCPTool } from "../webmcp/tools"

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "calc(100vh - 52px)",
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
  badge: {
    position: "fixed" as const,
    bottom: 16,
    left: 16,
    padding: "8px 16px",
    borderRadius: 8,
    fontSize: 12,
    fontFamily: "monospace",
    zIndex: 50,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
  badgeRegistered: {
    background: "#166534",
    color: "#fff",
  },
  badgeUnavailable: {
    background: "#92400e",
    color: "#fff",
  },
}

const AfterPage = () => {
  const [formData, setFormData] = useState<CampaignFormData>(DEFAULT_FORM_DATA)
  const [webmcpStatus, setWebmcpStatus] = useState<"registered" | "unavailable" | "pending">("pending")

  useEffect(() => {
    const registered = registerWebMCPTool(setFormData)
    setWebmcpStatus(registered ? "registered" : "unavailable")
    return () => unregisterWebMCPTool()
  }, [])

  return (
    <div style={styles.page}>
      <div style={styles.banner}>
        <span>WebMCP Enabled</span>
        <span>— Agent discovers and calls the registered tool with structured parameters</span>
      </div>
      <CampaignForm value={formData} onChange={setFormData} highlightChanges />
      {webmcpStatus !== "pending" && (
        <div style={{
          ...styles.badge,
          ...(webmcpStatus === "registered" ? styles.badgeRegistered : styles.badgeUnavailable),
        }}>
          {webmcpStatus === "registered"
            ? "WebMCP: fillCampaignForm registered"
            : "WebMCP: navigator.modelContext not available"}
        </div>
      )}
    </div>
  )
}

export default AfterPage
