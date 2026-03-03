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
