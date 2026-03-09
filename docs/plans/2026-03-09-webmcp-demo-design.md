# WebMCP Demo Design

## Overview

A demo app comparing AI agent interaction with a complex ad campaign form — with and without WebMCP. The same agent (Claude Code via Chrome browser tools) operates both pages, making the contrast immediately visible.

## What We Keep

- `CampaignForm` component (complex form with dropdowns, chips, range sliders, radio buttons, checkboxes, card selects)
- `types.ts` (form types + business logic helpers)
- `webmcp/tools.ts` (tool schema)

## What We Remove

- `AgentPanel` component
- Server API endpoints (`/api/agent/html-parse`, `/api/agent/tool-use`)
- All existing page components (rewrite)

## Pages

### `/before` — No WebMCP

- Top banner: "No WebMCP — Agent must interact via DOM"
- CampaignForm with highlight effect on field changes
- No WebMCP tool registered
- Agent (Claude Code) must use browser automation: `read_page` → `find` → `form_input` / `computer`

### `/after` — WebMCP Enabled

- Top banner: "WebMCP Enabled — Tool registered"
- CampaignForm with highlight effect on field changes
- On mount: `navigator.modelContext.registerTool()` with `fillCampaignForm` tool
- `execute` function updates React state directly
- Bottom badge showing tool registration status (green = registered, yellow = API not available)
- Agent (Claude Code) calls tool via `javascript_tool` → one call, instant fill

### Navigation

- Simple top nav bar: Before | After
- Form resets on page switch

## Highlight Effect

- CampaignForm accepts `highlightChanges?: boolean` prop
- On value change, the changed field gets a brief green border flash (~500ms CSS transition)
- Use `useRef` to track previous values and detect which fields changed

## WebMCP Integration

```typescript
// Feature detection
if ("modelContext" in navigator) {
  navigator.modelContext.registerTool({
    name: "fillCampaignForm",
    description: "...",
    inputSchema: { ... },
    execute(params) {
      // update React state
      // return result
    }
  })
}
```

On unmount: `navigator.modelContext.unregisterTool("fillCampaignForm")`

## Demo Flow

### Demo Prompt

Use this prompt for both Before and After pages:

> 建立一個 DPA 廣告活動，名稱「夏季促銷」，每日預算 500 美元，女性 25-45 歲，版位 FB_FEED 和 IG_FEED，素材格式 CAROUSEL

### Before (`/before`)

1. Open `/before` in Chrome Canary
2. In Claude Code, give the prompt above
3. Claude uses browser automation step by step:
   - `read_page` to understand form structure
   - `find` to locate each field
   - `form_input` / `computer` to fill each field one by one
4. Audience sees: slow, multi-step, possibly incorrect

### After (`/after`)

1. Open `/after` in Chrome Canary
2. In Claude Code, give the same prompt
3. Claude uses `javascript_tool` to call the registered WebMCP tool
4. One call, all fields filled instantly
5. Audience sees: fast, accurate, reliable

## Tech Stack

- Frontend: React, React Router, Vite, TypeScript
- Server: Express (kept for potential use, but not required for demo)
- Browser: Chrome Canary 146+ with WebMCP flag enabled
