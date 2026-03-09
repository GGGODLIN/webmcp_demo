import { useState, useRef, useEffect, type CSSProperties } from "react"
import type {
  CampaignFormData,
  CampaignType,
  AudienceType,
  Placement,
  AdFormat,
  Gender,
} from "../types"
import {
  CAMPAIGN_TYPE_LABELS,
  AUDIENCE_TYPE_LABELS,
  PLACEMENT_LABELS,
  AD_FORMAT_LABELS,
  getAvailableAudiences,
  getAvailablePlacements,
} from "../types"

interface CampaignFormProps {
  value: CampaignFormData
  onChange: (data: CampaignFormData) => void
  highlightChanges?: boolean
}

const styles: Record<string, CSSProperties> = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    padding: 24,
    maxWidth: 560,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 6,
    display: "block",
  },
  input: {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box" as const,
  },
  budgetRow: {
    display: "flex",
    gap: 8,
  },
  dropdown: {
    position: "relative" as const,
  },
  dropdownTrigger: {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    fontSize: 14,
    background: "#fff",
    cursor: "pointer",
    textAlign: "left" as const,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownMenu: {
    position: "absolute" as const,
    top: "100%",
    left: 0,
    right: 0,
    background: "#fff",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    marginTop: 4,
    zIndex: 10,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    maxHeight: 200,
    overflowY: "auto" as const,
  },
  dropdownItem: {
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: 14,
    transition: "background 0.15s",
  },
  chipContainer: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 8,
  },
  chip: {
    padding: "6px 12px",
    borderRadius: 16,
    fontSize: 13,
    cursor: "pointer",
    border: "1px solid #d1d5db",
    background: "#fff",
    transition: "all 0.15s",
  },
  chipActive: {
    background: "#3b82f6",
    color: "#fff",
    borderColor: "#3b82f6",
  },
  sliderContainer: {
    padding: "0 8px",
  },
  sliderTrack: {
    position: "relative" as const,
    height: 6,
    background: "#e5e7eb",
    borderRadius: 3,
    margin: "16px 0",
  },
  sliderFill: {
    position: "absolute" as const,
    height: "100%",
    background: "#3b82f6",
    borderRadius: 3,
  },
  sliderThumb: {
    position: "absolute" as const,
    width: 18,
    height: 18,
    background: "#fff",
    border: "2px solid #3b82f6",
    borderRadius: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    cursor: "grab",
    zIndex: 2,
  },
  sliderLabels: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 12,
    color: "#6b7280",
  },
  radioGroup: {
    display: "flex",
    gap: 16,
  },
  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    cursor: "pointer",
    fontSize: 14,
  },
  checkboxGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    cursor: "pointer",
  },
  cardGroup: {
    display: "flex",
    gap: 12,
  },
  card: {
    flex: 1,
    padding: "16px 12px",
    border: "2px solid #e5e7eb",
    borderRadius: 10,
    textAlign: "center" as const,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  cardActive: {
    borderColor: "#3b82f6",
    background: "#eff6ff",
  },
  cardIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: 500,
  },
  lockedBadge: {
    fontSize: 11,
    color: "#f59e0b",
    fontWeight: 500,
    marginLeft: 8,
  },
}

const AD_FORMAT_ICONS: Record<AdFormat, string> = {
  IMAGE: "🖼️",
  VIDEO: "🎬",
  CAROUSEL: "🎠",
}

const CustomDropdown = ({
  value,
  options,
  labels,
  placeholder,
  onSelect,
}: {
  value: string | null
  options: string[]
  labels: Record<string, string>
  placeholder: string
  onSelect: (v: string) => void
}) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div ref={ref} style={styles.dropdown} data-component="custom-dropdown">
      <div
        style={styles.dropdownTrigger}
        onClick={() => setOpen(!open)}
        data-role="dropdown-trigger"
      >
        <span>{value ? labels[value] : placeholder}</span>
        <span>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div style={styles.dropdownMenu} data-role="dropdown-menu">
          {options.map(opt => (
            <div
              key={opt}
              style={{
                ...styles.dropdownItem,
                background: opt === value ? "#eff6ff" : undefined,
              }}
              onClick={() => { onSelect(opt); setOpen(false) }}
              onMouseEnter={e => (e.currentTarget.style.background = "#f3f4f6")}
              onMouseLeave={e => (e.currentTarget.style.background = opt === value ? "#eff6ff" : "")}
              data-value={opt}
            >
              {labels[opt]}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const DualRangeSlider = ({
  min,
  max,
  value,
  onChange,
}: {
  min: number
  max: number
  value: [number, number]
  onChange: (v: [number, number]) => void
}) => {
  const trackRef = useRef<HTMLDivElement>(null)

  const getPercent = (v: number) => ((v - min) / (max - min)) * 100

  const handleDrag = (index: 0 | 1) => (e: React.MouseEvent) => {
    e.preventDefault()
    const track = trackRef.current
    if (!track) return

    const onMove = (ev: MouseEvent) => {
      const rect = track.getBoundingClientRect()
      const pct = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width))
      const raw = Math.round(min + pct * (max - min))
      const next: [number, number] = [...value] as [number, number]
      next[index] = raw
      if (next[0] > next[1]) return
      onChange(next)
    }

    const onUp = () => {
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseup", onUp)
    }

    document.addEventListener("mousemove", onMove)
    document.addEventListener("mouseup", onUp)
  }

  return (
    <div style={styles.sliderContainer} data-component="dual-range-slider">
      <div ref={trackRef} style={styles.sliderTrack}>
        <div
          style={{
            ...styles.sliderFill,
            left: `${getPercent(value[0])}%`,
            width: `${getPercent(value[1]) - getPercent(value[0])}%`,
          }}
        />
        <div
          style={{ ...styles.sliderThumb, left: `${getPercent(value[0])}%` }}
          onMouseDown={handleDrag(0)}
          data-role="slider-min"
        />
        <div
          style={{ ...styles.sliderThumb, left: `${getPercent(value[1])}%` }}
          onMouseDown={handleDrag(1)}
          data-role="slider-max"
        />
      </div>
      <div style={styles.sliderLabels}>
        <span>{value[0]}</span>
        <span>{value[1]}</span>
      </div>
    </div>
  )
}

const CampaignForm = ({ value, onChange, highlightChanges }: CampaignFormProps) => {
  const update = <K extends keyof CampaignFormData>(key: K, val: CampaignFormData[K]) => {
    const next = { ...value, [key]: val }

    if (key === "type") {
      const t = val as CampaignType
      const available = getAvailableAudiences(t)
      next.audiences = t === "DPA" ? ["DPA"] : value.audiences.filter(a => available.includes(a))
      const availPlacements = getAvailablePlacements(t)
      next.placements = value.placements.filter(p => availPlacements.includes(p))
    }

    onChange(next)
  }

  const toggleAudience = (a: AudienceType) => {
    if (value.type === "DPA") return
    const next = value.audiences.includes(a)
      ? value.audiences.filter(x => x !== a)
      : [...value.audiences, a]
    update("audiences", next)
  }

  const togglePlacement = (p: Placement) => {
    const next = value.placements.includes(p)
      ? value.placements.filter(x => x !== p)
      : [...value.placements, p]
    update("placements", next)
  }

  const availableAudiences = getAvailableAudiences(value.type)
  const availablePlacements = getAvailablePlacements(value.type)

  const prevValueRef = useRef<CampaignFormData>(value)
  const [highlightedFields, setHighlightedFields] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!highlightChanges) return
    const prev = prevValueRef.current
    const changed = new Set<string>()
    for (const key of Object.keys(value) as (keyof CampaignFormData)[]) {
      if (JSON.stringify(prev[key]) !== JSON.stringify(value[key])) {
        changed.add(key)
      }
    }
    if (changed.size > 0) {
      setHighlightedFields(changed)
      const timer = setTimeout(() => setHighlightedFields(new Set()), 800)
      prevValueRef.current = value
      return () => clearTimeout(timer)
    }
    prevValueRef.current = value
  }, [value, highlightChanges])

  const hl = (field: string): string =>
    highlightChanges && highlightedFields.has(field) ? "field-highlight" : ""

  return (
    <div style={styles.form} data-component="campaign-form">
      <div className={hl("name")}>
        <label style={styles.label}>Campaign Name</label>
        <input
          style={styles.input}
          value={value.name}
          onChange={e => update("name", e.target.value)}
          placeholder="Enter campaign name..."
        />
      </div>

      <div className={hl("type")}>
        <label style={styles.label}>Campaign Type</label>
        <CustomDropdown
          value={value.type}
          options={Object.keys(CAMPAIGN_TYPE_LABELS) as CampaignType[]}
          labels={CAMPAIGN_TYPE_LABELS}
          placeholder="Select campaign type..."
          onSelect={v => update("type", v as CampaignType)}
        />
      </div>

      <div className={hl("dailyBudget")}>
        <label style={styles.label}>Daily Budget</label>
        <div style={styles.budgetRow}>
          <input
            style={{ ...styles.input, flex: 1 }}
            type="number"
            min={0}
            value={value.dailyBudget || ""}
            onChange={e => update("dailyBudget", Number(e.target.value))}
            placeholder="0"
          />
          <CustomDropdown
            value={value.currency}
            options={["USD", "TWD"]}
            labels={{ USD: "USD", TWD: "TWD" }}
            placeholder="Currency"
            onSelect={v => update("currency", v)}
          />
        </div>
      </div>

      <div className={hl("audiences")}>
        <label style={styles.label}>
          Target Audience
          {value.type === "DPA" && <span style={styles.lockedBadge}>🔒 Locked by DPA</span>}
        </label>
        <div style={styles.chipContainer} data-component="audience-chips">
          {availableAudiences.map(a => (
            <span
              key={a}
              style={{
                ...styles.chip,
                ...(value.audiences.includes(a) ? styles.chipActive : {}),
                ...(value.type === "DPA" ? { opacity: 0.7, cursor: "not-allowed" } : {}),
              }}
              onClick={() => toggleAudience(a)}
              data-value={a}
              data-selected={value.audiences.includes(a)}
            >
              {AUDIENCE_TYPE_LABELS[a]}
            </span>
          ))}
        </div>
      </div>

      <div className={hl("ageRange")}>
        <label style={styles.label}>
          Age Range: {value.ageRange[0]} - {value.ageRange[1]}
        </label>
        <DualRangeSlider
          min={18}
          max={65}
          value={value.ageRange}
          onChange={v => update("ageRange", v)}
        />
      </div>

      <div className={hl("gender")}>
        <label style={styles.label}>Gender</label>
        <div style={styles.radioGroup}>
          {(["ALL", "MALE", "FEMALE"] as Gender[]).map(g => (
            <label key={g} style={styles.radioLabel}>
              <input
                type="radio"
                name="gender"
                checked={value.gender === g}
                onChange={() => update("gender", g)}
              />
              {g === "ALL" ? "All" : g === "MALE" ? "Male" : "Female"}
            </label>
          ))}
        </div>
      </div>

      <div className={hl("placements")}>
        <label style={styles.label}>Placements</label>
        <div style={styles.checkboxGrid} data-component="placement-checkboxes">
          {availablePlacements.map(p => (
            <label key={p} style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={value.placements.includes(p)}
                onChange={() => togglePlacement(p)}
              />
              {PLACEMENT_LABELS[p]}
            </label>
          ))}
        </div>
      </div>

      <div className={hl("adFormat")}>
        <label style={styles.label}>Ad Format</label>
        <div style={styles.cardGroup} data-component="ad-format-cards">
          {(Object.keys(AD_FORMAT_LABELS) as AdFormat[]).map(f => (
            <div
              key={f}
              style={{
                ...styles.card,
                ...(value.adFormat === f ? styles.cardActive : {}),
              }}
              onClick={() => update("adFormat", f)}
              data-value={f}
              data-selected={value.adFormat === f}
            >
              <div style={styles.cardIcon}>{AD_FORMAT_ICONS[f]}</div>
              <div style={styles.cardLabel}>{AD_FORMAT_LABELS[f]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CampaignForm
