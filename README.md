# WebMCP Demo

A demo app that shows the difference between AI agents interacting with web forms **with and without WebMCP**.

Same form, same prompt, two completely different experiences.

## What is WebMCP?

WebMCP lets websites declare their capabilities as **structured tools** that AI agents can discover and call directly — no DOM scraping, no CSS selector guessing, no fragile browser automation.

It works through the browser-native `navigator.modelContext` API (Chrome Canary 146+).

## The Demo

### Before WebMCP (`/before`)

The AI agent has no tool available. It must:

1. Read the page's DOM tree
2. Find each form element one by one
3. Interact with dropdowns, chips, sliders, checkboxes step by step
4. Hope custom components behave as expected

Result: **~10 steps, slow, error-prone**

### After WebMCP (`/after`)

The page registers a `fillCampaignForm` tool via `navigator.modelContext.registerTool()`. The AI agent:

1. Discovers the tool
2. Calls it with structured JSON parameters
3. All fields fill instantly

Result: **1 step, instant, 100% accurate**

## How to Run the Demo

### Prerequisites

- Chrome Canary 146+
- Enable `chrome://flags/#enable-webmcp-testing` and relaunch
- [Model Context Tool Inspector](https://github.com/nicolo-ribaudo/model-context-tool-inspector) Chrome extension
- Claude Chrome extension (or any AI agent with browser access)

### Setup

```bash
cd client && npm install && npm run dev
```

### Demo Flow

#### Step 1: Before (`/before`)

1. Open `http://localhost:5173/before` in Chrome Canary
2. Use Claude Chrome extension to fill the form with this prompt:

> 建立一個 DPA 廣告活動，名稱「夏季促銷」，每日預算 500 美元，女性 25-45 歲，版位 FB_FEED 和 IG_FEED，素材格式 CAROUSEL

3. Watch the agent struggle with DOM automation — multiple steps, possible mistakes with custom UI components

#### Step 2: After (`/after`)

1. Open `http://localhost:5173/after` in Chrome Canary
2. Use Model Context Tool Inspector with the **same prompt**
3. Watch the agent call `fillCampaignForm` in one step — all fields fill instantly and correctly

### Key Takeaways

- Same form, same agent, same prompt — different results
- Before: ~10 steps, slow, error-prone (especially custom UI like chips, range sliders)
- After: 1 step, instant, 100% accurate
- WebMCP lets websites expose structured capabilities to AI agents
- No screen scraping, no CSS selector guessing, no DOM parsing
