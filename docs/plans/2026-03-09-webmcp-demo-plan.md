# WebMCP Demo Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rewrite the demo app so Claude Code acts as the agent operating the same campaign form with and without WebMCP, making the contrast immediately visible.

**Architecture:** Two pages sharing the same `CampaignForm` component. `/before` has no WebMCP — agent must use browser automation. `/after` registers a WebMCP tool via `navigator.modelContext.registerTool()` — agent calls it in one step. Highlight effect on both pages shows field changes visually.

**Tech Stack:** React, React Router, Vite, TypeScript, WebMCP browser API (Chrome Canary 146+)

---

### Task 1: Add highlight CSS animation

**Files:**
- Modify: `client/src/index.css`

**Step 1: Add highlight keyframe and class**

Append to `client/src/index.css`:

```css
@keyframes field-highlight {
  0% { box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.6); }
  100% { box-shadow: 0 0 0 3px transparent; }
}

.field-highlight {
  animation: field-highlight 800ms ease-out;
}
```

**Step 2: Verify**

Run: dev server, confirm CSS loads without errors.

---

### Task 2: Add highlight support to CampaignForm

**Files:**
- Modify: `client/src/components/CampaignForm.tsx`

**Step 1: Add `highlightChanges` prop and previous-value tracking**

Add to `CampaignFormProps`:

```typescript
interface CampaignFormProps {
  value: CampaignFormData
  onChange: (data: CampaignFormData) => void
  highlightChanges?: boolean
}
```

Add inside `CampaignForm` component body, before `return`:

```typescript
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
    return () => clearTimeout(timer)
  }
  prevValueRef.current = value
}, [value, highlightChanges])

useEffect(() => {
  prevValueRef.current = value
}, [value])

const hl = (field: string): string =>
  highlightChanges && highlightedFields.has(field) ? "field-highlight" : ""
```

**Step 2: Apply highlight class to each field wrapper**

Wrap each form field's outer `<div>` with the `className={hl("fieldName")}` pattern. Example for the name field:

```tsx
<div className={hl("name")}>
  <label style={styles.label}>Campaign Name</label>
  <input ... />
</div>
```

Apply the same pattern to all fields: `name`, `type`, `dailyBudget` (including currency), `audiences`, `ageRange`, `gender`, `placements`, `adFormat`.

**Step 3: Verify**

Open the form, change a value — the changed field should flash green briefly.

---

### Task 3: Add WebMCP type declarations and registration

**Files:**
- Modify: `client/src/webmcp/tools.ts`

**Step 1: Add TypeScript type declarations**

Add at top of file:

```typescript
import type { CampaignFormData } from "../types"

interface WebMCPToolDescriptor {
  name: string
  description: string
  inputSchema: Record<string, unknown>
  execute: (params: Record<string, unknown>) => { content: { type: string; text: string }[] }
}

interface ModelContext {
  registerTool: (tool: WebMCPToolDescriptor) => void
  unregisterTool: (name: string) => void
}

declare global {
  interface Navigator {
    modelContext?: ModelContext
  }
}
```

**Step 2: Add applyToolResult helper**

Move the `applyToolResult` logic from current AfterPage.tsx into tools.ts as a shared export:

```typescript
import {
  getAvailableAudiences,
  getAvailablePlacements,
  DEFAULT_FORM_DATA,
  type CampaignFormData,
  type CampaignType,
  type AudienceType,
  type Gender,
  type Placement,
  type AdFormat,
} from "../types"

export const applyToolResult = (input: Record<string, unknown>): CampaignFormData => {
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
```

**Step 3: Add registerWebMCPTool / unregisterWebMCPTool**

```typescript
export const registerWebMCPTool = (
  onUpdate: (data: CampaignFormData) => void,
): boolean => {
  if (!navigator.modelContext) return false

  navigator.modelContext.registerTool({
    ...campaignFormTool,
    execute(params: Record<string, unknown>) {
      const newData = applyToolResult(params)
      onUpdate(newData)
      return {
        content: [{
          type: "text",
          text: `Campaign form filled successfully: ${JSON.stringify(newData)}`,
        }],
      }
    },
  })
  return true
}

export const unregisterWebMCPTool = () => {
  navigator.modelContext?.unregisterTool(campaignFormTool.name)
}
```

---

### Task 4: Rewrite BeforePage

**Files:**
- Rewrite: `client/src/pages/BeforePage.tsx`

**Step 1: Write new BeforePage**

```tsx
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
```

---

### Task 5: Rewrite AfterPage

**Files:**
- Rewrite: `client/src/pages/AfterPage.tsx`

**Step 1: Write new AfterPage with WebMCP registration**

```tsx
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
```

---

### Task 6: Update HomePage

**Files:**
- Modify: `client/src/pages/HomePage.tsx`

**Step 1: Update descriptions to reflect new demo flow**

Change the card descriptions:

Before card desc:
```
No WebMCP tools registered. The AI agent must read the DOM tree, locate form elements, and fill them one by one using browser automation.
```

After card desc:
```
WebMCP tool registered via navigator.modelContext. The AI agent discovers the tool and fills the entire form with one structured call.
```

Update the tech badge text:
```
Chrome Canary 146+ · WebMCP · React + Vite
```

---

### Task 7: Simplify App.tsx

**Files:**
- Modify: `client/src/App.tsx`

**Step 1: Remove unused imports and always show nav**

Remove `HomePage` conditional nav hiding (always show nav bar). The app structure stays the same but NavBar is always visible. Remove the `isHome` check in `Layout`.

---

### Task 8: Delete unused files

**Files:**
- Delete: `client/src/components/AgentPanel.tsx`

**Step 1: Delete AgentPanel**

```bash
rm client/src/components/AgentPanel.tsx
```

**Step 2: Verify no remaining imports**

Search for `AgentPanel` in all client source files — should find zero results.

---

### Task 9: Create demo prompt file

**Files:**
- Create: `docs/demo-script.md`

**Step 1: Write demo script**

```markdown
# WebMCP Demo Script

## Setup

1. Open Chrome Canary 146+
2. Enable `chrome://flags/#enable-webmcp-testing`
3. Relaunch browser
4. Start dev server: open Claude Code, run preview

## Demo Prompt

Use this exact prompt for both Before and After pages:

> 建立一個 DPA 廣告活動，名稱「夏季促銷」，每日預算 500 美元，女性 25-45 歲，版位 FB_FEED 和 IG_FEED，素材格式 CAROUSEL

## Flow

### 1. Before (`/before`)

1. Open `/before` in Chrome Canary
2. In Claude Code, paste the prompt
3. Watch Claude struggle with DOM automation:
   - Reading the page structure
   - Finding each form element
   - Filling fields one by one
   - Possibly making mistakes with custom components (dropdowns, chips, sliders)

### 2. After (`/after`)

1. Open `/after` in Chrome Canary
2. In Claude Code, paste the same prompt
3. Watch Claude call the WebMCP tool in one step:
   - Discovers `fillCampaignForm` tool
   - Calls it with structured JSON parameters
   - All fields fill instantly and correctly

## Key Talking Points

- Same form, same agent, same prompt — different results
- Before: ~10 steps, slow, error-prone (especially custom UI like chips, range sliders)
- After: 1 step, instant, 100% accurate
- WebMCP lets websites declare their capabilities as structured tools
- No screen scraping, no CSS selector guessing, no DOM parsing
```

---

### Task 10: Verify everything works

**Step 1: Start dev server and check both pages**

Run dev server, navigate to `/`, `/before`, `/after`. Confirm:
- Nav bar shows on all pages
- Before page: form renders, no WebMCP badge
- After page: form renders, WebMCP badge shows status
- Highlight effect works on field changes
- No console errors
