# WebMCP Demo Design

## 目標

建立互動式 demo 網頁，向團隊（前後端混合）介紹 WebMCP 技術。透過 Before/After 兩個頁面對比，展示有無 WebMCP 時 AI Agent 操作表單的差異。

## 情境

簡化版廣告 Campaign 建立表單，取材自 retargeting-api 專案。

## 技術棧

- Frontend: React + Vite + TypeScript
- Backend: Express (代理 AI API)
- AI Model: 不綁定特定 model，支援 Gemini / Claude 等（透過後端抽象層切換）

## 架構

```
webmcp_demo/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.tsx        # 首頁導覽
│   │   │   ├── BeforePage.tsx      # 無 WebMCP
│   │   │   └── AfterPage.tsx       # 有 WebMCP
│   │   ├── components/
│   │   │   ├── CampaignForm.tsx    # 共用 Campaign 表單
│   │   │   └── AgentPanel.tsx      # AI Agent 側邊欄
│   │   └── App.tsx
├── server/
│   └── index.ts                    # Express，代理 AI API
```

## 表單欄位

| 欄位 | 類型 | 用途 |
|---|---|---|
| Campaign Name | text input | 基本欄位 |
| Campaign Type | custom select (PROSPECT / CONVERSIONS / DPA 等) | 連動其他欄位 |
| Daily Budget | number input + 幣別 | 格式限制 |
| Target Audience | custom multi-select (Website / Engagement / Lookalike 等) | 非原生元件，連動 |
| Age Range | dual slider (18-65) | 自訂元件 |
| Gender | radio group (All / Male / Female) | 語意理解 |
| Placement | checkbox group (FB Feed / IG Stories / Messenger 等) | 連動，選項多 |
| Ad Format | card selector (Image / Video / Carousel) | 非原生元件 |

### 連動邏輯

- DPA → Target Audience 鎖定 DPA 受眾，Placement 隱藏部分選項
- PROSPECT → 出現 Lookalike 受眾
- CONVERSIONS → 出現 Website 受眾

## 頁面流程

### Before Page（無 WebMCP）

1. 使用者在 Agent Panel 輸入指令（如「建一個 DPA campaign，預算 500，25-45 歲女性」）
2. 前端將表單 HTML 結構 + 指令送到後端
3. 後端轉發給 AI API，prompt 要求 AI 解析 HTML 並回傳操作步驟
4. 前端逐步執行 AI 回傳的操作（展示解析過程，可能出錯）

### After Page（有 WebMCP）

1. 使用者輸入同樣指令
2. 前端將 WebMCP tool schema + 指令送到後端
3. 後端轉發給 AI API，使用 tool use / function calling
4. 前端收到結構化 tool call 結果，精準填入

## AI 整合

- 後端提供統一 API，前端不直接碰 AI model 細節
- 支援多 model（Gemini / Claude），透過環境變數或設定切換
- Before page：將 HTML 當作 context，讓 AI 回傳 JSON 操作指令
- After page：將 WebMCP tool schema 當作 function/tool definition，讓 AI 回傳 tool call
