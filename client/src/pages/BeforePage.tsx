import { useState, type CSSProperties } from "react"
import CampaignForm from "../components/CampaignForm"
import { DEFAULT_FORM_DATA, type CampaignFormData } from "../types"

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "calc(100vh - 52px)",
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

const BeforePage = () => {
  const [formData, setFormData] = useState<CampaignFormData>(DEFAULT_FORM_DATA)

  return (
    <div style={styles.page}>
      <div style={styles.banner}>
        <span>No WebMCP</span>
        <span>— Agent must read the DOM and interact with elements one by one</span>
      </div>
      <CampaignForm value={formData} onChange={setFormData} highlightChanges />
    </div>
  )
}

export default BeforePage
