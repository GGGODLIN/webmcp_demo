import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { createAiProvider } from "./ai/index.js"
import type { ToolSchema } from "./ai/index.js"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json({ limit: "2mb" }))

const ai = createAiProvider()

app.get("/health", (_req, res) => {
  res.json({ status: "ok" })
})

app.post("/api/agent/html-parse", async (req, res) => {
  try {
    const { html, userMessage } = req.body as { html: string; userMessage: string }

    if (!html || !userMessage) {
      res.status(400).json({ error: "html and userMessage are required" })
      return
    }

    const result = await ai.parseHtml(html, userMessage)
    res.json(result)
  } catch (err) {
    console.log(`html-parse error: ${JSON.stringify(err)}`)
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" })
  }
})

app.post("/api/agent/tool-use", async (req, res) => {
  try {
    const { tools, userMessage } = req.body as { tools: ToolSchema[]; userMessage: string }

    if (!tools || !userMessage) {
      res.status(400).json({ error: "tools and userMessage are required" })
      return
    }

    const result = await ai.toolUse(tools, userMessage)
    res.json(result)
  } catch (err) {
    console.log(`tool-use error: ${JSON.stringify(err)}`)
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" })
  }
})

const PORT = process.env.PORT ?? 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${JSON.stringify(PORT)}`)
})
