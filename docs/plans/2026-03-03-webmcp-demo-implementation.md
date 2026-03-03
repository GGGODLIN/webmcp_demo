# WebMCP Demo Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 建立 Before/After 對比的互動式 demo，展示 WebMCP 讓 AI Agent 操作表單的優勢。

**Architecture:** React + Vite 前端搭配 Express 後端代理 AI API。前端兩個頁面共用同一個 Campaign 表單元件，差異在於 AI Agent 拿到的資訊（raw HTML vs WebMCP tool schema）。後端抽象 AI model 層，支援 Gemini / Claude 切換。

**Tech Stack:** React, Vite, TypeScript, Express, Google Gemini API (default) / Claude API

---

### Task 1: 專案初始化 — client (Vite + React)

**Files:**
- Create: `client/` (via Vite scaffold)
- Create: `client/src/App.tsx`

**Step 1: Scaffold Vite React TS 專案**

```bash
cd /Users/linhancheng/Desktop/work/webmcp_demo
npm create vite@latest client -- --template react-ts
cd client && npm install
```

**Step 2: 安裝 routing 依賴**

```bash
cd /Users/linhancheng/Desktop/work/webmcp_demo/client
npm install react-router-dom
```

**Step 3: 設定基本 routing**

`client/src/App.tsx`:
```tsx
import { BrowserRouter, Routes, Route, Link } from "react-router-dom"

const HomePage = () => (
  <div>
    <h1>WebMCP Demo</h1>
    <nav>
      <Link to="/before">Before WebMCP</Link>
      <Link to="/after">After WebMCP</Link>
    </nav>
  </div>
)

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/before" element={<div>Before Page (TODO)</div>} />
      <Route path="/after" element={<div>After Page (TODO)</div>} />
    </Routes>
  </BrowserRouter>
)

export default App
```

**Step 4: 確認可以跑起來**

```bash
cd /Users/linhancheng/Desktop/work/webmcp_demo/client
npm run dev
```

Expected: 瀏覽器開啟，看到首頁有兩個連結。

**Step 5: Commit**

```bash
git add client/
git commit -m "feat: scaffold client with Vite React TS and routing"
```

---

### Task 2: 專案初始化 — server (Express)

**Files:**
- Create: `server/package.json`
- Create: `server/index.ts`
- Create: `server/tsconfig.json`

**Step 1: 初始化 server 專案**

```bash
cd /Users/linhancheng/Desktop/work/webmcp_demo
mkdir server && cd server
npm init -y
npm install express cors dotenv
npm install -D typescript @types/express @types/cors @types/node tsx
```

**Step 2: 建立 tsconfig.json**

`server/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "dist",
    "rootDir": "."
  },
  "include": ["*.ts"]
}
```

**Step 3: 建立 Express server**

`server/index.ts`:
```ts
import express from "express"
import cors from "cors"
import dotenv from "dotenv"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.get("/health", (_req, res) => {
  res.json({ status: "ok" })
})

const PORT = process.env.PORT ?? 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

在 `server/package.json` 加入 `"type": "module"` 和 scripts：
```json
{
  "type": "module",
  "scripts": {
    "dev": "tsx watch index.ts"
  }
}
```

**Step 4: 確認 server 可以跑起來**

```bash
cd /Users/linhancheng/Desktop/work/webmcp_demo/server
npm run dev
# 另一個 terminal: curl http://localhost:3001/health
```

Expected: `{"status":"ok"}`

**Step 5: 建立 .env 範例**

`server/.env.example`:
```
PORT=3001
AI_PROVIDER=gemini
GEMINI_API_KEY=your-key-here
ANTHROPIC_API_KEY=your-key-here
```

**Step 6: 建立 .gitignore**

`server/.gitignore`:
```
node_modules
dist
.env
```

**Step 7: Commit**

```bash
git add server/
git commit -m "feat: scaffold Express server with health endpoint"
```

---

### Task 3: Campaign 表單元件

**Files:**
- Create: `client/src/components/CampaignForm.tsx`
- Create: `client/src/types.ts`

**Step 1: 定義型別**

`client/src/types.ts`:
```ts
export type CampaignType = "PROSPECT" | "CONVERSIONS" | "DPA" | "TRAFFIC" | "LOYALTY"

export type AudienceType = "WEBSITE" | "ENGAGEMENT" | "ENGAGEMENT_IG" | "LOOKALIKE" | "DPA" | "SHOPIFY_CUSTOMERS" | "ABANDONED_CHECKOUT"

export type Placement = "FB_FEED" | "FB_STORIES" | "FB_REELS" | "FB_MARKETPLACE" | "IG_FEED" | "IG_STORIES" | "IG_REELS" | "IG_EXPLORE" | "MESSENGER_INBOX"

export type AdFormat = "IMAGE" | "VIDEO" | "CAROUSEL"

export type Gender = "ALL" | "MALE" | "FEMALE"

export interface CampaignFormData {
  name: string
  type: CampaignType | null
  dailyBudget: number
  currency: string
  audiences: AudienceType[]
  ageRange: [number, number]
  gender: Gender
  placements: Placement[]
  adFormat: AdFormat | null
}
```

**Step 2: 建立 CampaignForm 元件**

`client/src/components/CampaignForm.tsx`:

元件需求：
- 接收 `value: CampaignFormData` 和 `onChange: (data: CampaignFormData) => void`
- Campaign Type 用自訂 styled dropdown（不是原生 select）
- Target Audience 用 custom multi-select chips
- Age Range 用 dual range slider
- Placement 用 checkbox group，依 campaign type 連動顯示/隱藏
- Ad Format 用 card selector（圖片 icon + 文字）
- 連動邏輯：
  - DPA → audiences 鎖定 ["DPA"]，隱藏 MESSENGER placement
  - PROSPECT → audiences 選項加入 LOOKALIKE
  - CONVERSIONS → audiences 選項加入 WEBSITE

完整實作程式碼由執行者依以上 spec 撰寫，使用 CSS modules 或 inline styles（demo 用途不需 UI library）。

**Step 3: 確認元件可以渲染**

在 BeforePage 暫時引入 CampaignForm，確認表單可以正常操作、連動邏輯正確。

**Step 4: Commit**

```bash
git add client/src/
git commit -m "feat: add CampaignForm component with field linking logic"
```

---

### Task 4: AgentPanel 元件

**Files:**
- Create: `client/src/components/AgentPanel.tsx`

**Step 1: 建立 AgentPanel 元件**

`client/src/components/AgentPanel.tsx`:

元件需求：
- 側邊欄 UI，固定在頁面右側
- 上方：訊息列表（顯示 user 指令和 agent 回應過程）
- 下方：input 輸入框 + 送出按鈕
- Props:
  - `onSend: (message: string) => void` — 使用者送出訊息
  - `messages: Array<{ role: "user" | "agent"; content: string }>` — 訊息列表
  - `isLoading: boolean` — 是否正在等待 AI 回應
- Agent 回應用打字機效果逐步顯示

**Step 2: 確認元件可以渲染**

暫時塞假資料確認 UI 正常。

**Step 3: Commit**

```bash
git add client/src/components/AgentPanel.tsx
git commit -m "feat: add AgentPanel sidebar component"
```

---

### Task 5: Before Page — AI 解析 HTML 模式

**Files:**
- Create: `client/src/pages/BeforePage.tsx`
- Modify: `server/index.ts` — 新增 `/api/agent/html-parse` endpoint

**Step 1: 建立後端 endpoint**

在 `server/index.ts` 新增 POST `/api/agent/html-parse`:
- 接收 `{ html: string, userMessage: string }`
- 將 HTML + user message 組成 prompt 送給 AI
- Prompt 大致為：「以下是一個表單的 HTML 結構，使用者要求：{userMessage}。請分析 HTML 並回傳 JSON，格式為 `{ actions: [{ selector: string, action: "fill" | "click" | "select", value: string }] }`」
- 回傳 AI 的回應

**Step 2: 建立前端 BeforePage**

`client/src/pages/BeforePage.tsx`:
- 左側：CampaignForm
- 右側：AgentPanel
- 使用者送出訊息後：
  1. 用 `ref` 抓取表單的 `innerHTML`
  2. POST 到 `/api/agent/html-parse`
  3. 收到 AI 回傳的 actions
  4. 逐步執行 actions（每步之間加延遲，讓使用者看到過程）
  5. 在 AgentPanel 顯示 AI 的「思考過程」和每步操作

**Step 3: 測試完整流程**

輸入「建一個 DPA campaign，預算 500，目標 25-45 歲女性」，確認 AI 有回應且嘗試填表。

**Step 4: Commit**

```bash
git add client/src/pages/BeforePage.tsx server/index.ts
git commit -m "feat: implement Before page with HTML parsing AI agent"
```

---

### Task 6: After Page — WebMCP tool use 模式

**Files:**
- Create: `client/src/pages/AfterPage.tsx`
- Create: `client/src/webmcp/tools.ts` — WebMCP tool schema 定義
- Modify: `server/index.ts` — 新增 `/api/agent/tool-use` endpoint

**Step 1: 定義 WebMCP tool schema**

`client/src/webmcp/tools.ts`:
- 定義 `fillCampaignForm` tool 的 JSON schema
- Schema 包含所有表單欄位、型別、enum 限制、連動規則描述
- 這就是 WebMCP `navigator.modelContext.registerTool()` 會暴露的東西

```ts
export const campaignFormTool = {
  name: "fillCampaignForm",
  description: "Fill the campaign creation form with structured data. Handles field validation and linking logic automatically.",
  inputSchema: {
    type: "object",
    properties: {
      name: { type: "string", description: "Campaign name" },
      type: { type: "string", enum: ["PROSPECT", "CONVERSIONS", "DPA", "TRAFFIC", "LOYALTY"] },
      dailyBudget: { type: "number", minimum: 1 },
      currency: { type: "string", enum: ["USD", "TWD"], default: "USD" },
      audiences: { type: "array", items: { type: "string", enum: ["WEBSITE", "ENGAGEMENT", "LOOKALIKE", "DPA", "SHOPIFY_CUSTOMERS"] } },
      ageRange: { type: "array", items: { type: "number" }, minItems: 2, maxItems: 2 },
      gender: { type: "string", enum: ["ALL", "MALE", "FEMALE"] },
      placements: { type: "array", items: { type: "string", enum: ["FB_FEED", "FB_STORIES", "FB_REELS", "IG_FEED", "IG_STORIES", "IG_REELS", "MESSENGER_INBOX"] } },
      adFormat: { type: "string", enum: ["IMAGE", "VIDEO", "CAROUSEL"] }
    },
    required: ["name", "type", "dailyBudget"]
  }
}
```

**Step 2: 建立後端 endpoint**

在 `server/index.ts` 新增 POST `/api/agent/tool-use`:
- 接收 `{ tools: ToolSchema[], userMessage: string }`
- 將 tools 作為 function/tool definition 送給 AI（Gemini 用 function calling，Claude 用 tool use）
- 回傳 AI 的 tool call 結果

**Step 3: 建立前端 AfterPage**

`client/src/pages/AfterPage.tsx`:
- 左側：CampaignForm（加上 WebMCP tool 註冊的視覺提示）
- 右側：AgentPanel
- 使用者送出訊息後：
  1. 將 tool schema + user message POST 到 `/api/agent/tool-use`
  2. 收到結構化的 tool call 結果
  3. 直接用結果更新 CampaignForm 的 state（一次到位）
  4. 在 AgentPanel 顯示 tool call 的結構化內容

**Step 4: 測試完整流程**

同樣指令，確認 After page 能一次精準填入所有欄位。

**Step 5: Commit**

```bash
git add client/src/pages/AfterPage.tsx client/src/webmcp/ server/index.ts
git commit -m "feat: implement After page with WebMCP tool use agent"
```

---

### Task 7: AI Provider 抽象層

**Files:**
- Create: `server/ai/types.ts`
- Create: `server/ai/gemini.ts`
- Create: `server/ai/claude.ts`
- Create: `server/ai/index.ts`
- Modify: `server/index.ts` — 使用抽象層

**Step 1: 定義共用介面**

`server/ai/types.ts`:
```ts
export interface AiProvider {
  parseHtml(html: string, userMessage: string): Promise<HtmlParseResult>
  toolUse(tools: ToolSchema[], userMessage: string): Promise<ToolCallResult>
}

export interface HtmlParseResult {
  thinking: string
  actions: Array<{ selector: string; action: string; value: string }>
}

export interface ToolCallResult {
  toolName: string
  input: Record<string, unknown>
}

export interface ToolSchema {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}
```

**Step 2: 實作 Gemini provider**

`server/ai/gemini.ts`:
- 使用 `@google/generative-ai` SDK
- `parseHtml`: 用 generateContent，prompt 要求回傳 JSON
- `toolUse`: 用 function calling 功能

**Step 3: 實作 Claude provider**

`server/ai/claude.ts`:
- 使用 `@anthropic-ai/sdk`
- `parseHtml`: 用 messages API，prompt 要求回傳 JSON
- `toolUse`: 用 tool use 功能

**Step 4: 建立 factory**

`server/ai/index.ts`:
```ts
import { GeminiProvider } from "./gemini.js"
import { ClaudeProvider } from "./claude.js"
import type { AiProvider } from "./types.js"

export const createAiProvider = (): AiProvider => {
  const provider = process.env.AI_PROVIDER ?? "gemini"
  switch (provider) {
    case "gemini": return new GeminiProvider(process.env.GEMINI_API_KEY!)
    case "claude": return new ClaudeProvider(process.env.ANTHROPIC_API_KEY!)
    default: throw new Error(`Unknown AI provider: ${provider}`)
  }
}
```

**Step 5: 更新 server/index.ts 使用抽象層**

**Step 6: 測試切換 provider**

切換 `.env` 的 `AI_PROVIDER`，確認兩個 provider 都能正常運作。

**Step 7: Commit**

```bash
git add server/ai/ server/index.ts
git commit -m "feat: add AI provider abstraction layer (Gemini + Claude)"
```

---

### Task 8: HomePage 與整體 UI 打磨

**Files:**
- Modify: `client/src/pages/HomePage.tsx`
- Modify: `client/src/App.tsx`

**Step 1: 建立 HomePage**

首頁需求：
- 標題：WebMCP Demo
- 簡短說明 WebMCP 是什麼（2-3 句）
- 兩張 card：Before / After，點擊進入對應頁面
- Before card：描述「AI Agent 靠解析 HTML 操作表單」
- After card：描述「AI Agent 透過 WebMCP tool schema 操作表單」

**Step 2: 加全域 layout**

- 頂部 nav bar（Logo + Home / Before / After 連結）
- 統一的 page container

**Step 3: 確認整體 UX 流暢**

從首頁進入 Before → 操作 → 返回 → 進入 After → 操作。

**Step 4: Commit**

```bash
git add client/src/
git commit -m "feat: add HomePage and polish overall UI layout"
```

---

### Task 9: Root level 設定

**Files:**
- Create: `/package.json` (root)
- Create: `/.gitignore`
- Create: `/README.md`

**Step 1: 建立 root package.json**

```json
{
  "name": "webmcp-demo",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm run dev:client\" \"npm run dev:server\"",
    "dev:client": "cd client && npm run dev",
    "dev:server": "cd server && npm run dev"
  },
  "devDependencies": {
    "concurrently": "^9.0.0"
  }
}
```

**Step 2: 建立 .gitignore**

```
node_modules
.env
dist
```

**Step 3: 建立 README**

說明如何啟動、設定 API key、使用方式。

**Step 4: Commit**

```bash
git add package.json .gitignore README.md
git commit -m "feat: add root project setup with concurrent dev script"
```
