import {
  getAvailableAudiences,
  getAvailablePlacements,
  type CampaignFormData,
  type CampaignType,
  type AudienceType,
  type Gender,
  type Placement,
  type AdFormat,
} from "../types"

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

export const campaignFormTool = {
  name: "fillCampaignForm",
  description: `Fill the campaign creation form with structured data. Handles field validation and linking logic automatically.

Rules:
- If type is "DPA", audiences must be ["DPA"] (auto-locked).
- If type is "PROSPECT", audience option "LOOKALIKE" becomes available.
- If type is "CONVERSIONS", audience option "WEBSITE" becomes available.
- If type is "DPA", placement "MESSENGER_INBOX" is not available.
- ageRange must be [min, max] where 18 <= min <= max <= 65.
- dailyBudget must be a positive number.`,
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Campaign name",
      },
      type: {
        type: "string",
        enum: ["PROSPECT", "CONVERSIONS", "DPA", "TRAFFIC", "LOYALTY"],
        description: "Campaign type",
      },
      dailyBudget: {
        type: "number",
        minimum: 1,
        description: "Daily budget amount",
      },
      currency: {
        type: "string",
        enum: ["USD", "TWD"],
        description: "Budget currency. Defaults to USD.",
      },
      audiences: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "WEBSITE",
            "ENGAGEMENT",
            "ENGAGEMENT_IG",
            "LOOKALIKE",
            "DPA",
            "SHOPIFY_CUSTOMERS",
            "ABANDONED_CHECKOUT",
          ],
        },
        description: "Target audience types",
      },
      ageRange: {
        type: "array",
        items: { type: "number" },
        minItems: 2,
        maxItems: 2,
        description: "Age range [min, max], must be between 18 and 65",
      },
      gender: {
        type: "string",
        enum: ["ALL", "MALE", "FEMALE"],
        description: "Target gender",
      },
      placements: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "FB_FEED",
            "FB_STORIES",
            "FB_REELS",
            "FB_MARKETPLACE",
            "IG_FEED",
            "IG_STORIES",
            "IG_REELS",
            "IG_EXPLORE",
            "MESSENGER_INBOX",
          ],
        },
        description: "Ad placements",
      },
      adFormat: {
        type: "string",
        enum: ["IMAGE", "VIDEO", "CAROUSEL"],
        description: "Ad creative format",
      },
    },
    required: ["name", "type", "dailyBudget"],
  },
}

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
