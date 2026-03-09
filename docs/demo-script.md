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
