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

export const DEFAULT_FORM_DATA: CampaignFormData = {
  name: "",
  type: null,
  dailyBudget: 0,
  currency: "USD",
  audiences: [],
  ageRange: [18, 65],
  gender: "ALL",
  placements: [],
  adFormat: null,
}

export const CAMPAIGN_TYPE_LABELS: Record<CampaignType, string> = {
  PROSPECT: "Prospecting",
  CONVERSIONS: "Conversions",
  DPA: "Dynamic Product Ads",
  TRAFFIC: "Traffic",
  LOYALTY: "Loyalty",
}

export const AUDIENCE_TYPE_LABELS: Record<AudienceType, string> = {
  WEBSITE: "Website Visitors",
  ENGAGEMENT: "FB Engagement",
  ENGAGEMENT_IG: "IG Engagement",
  LOOKALIKE: "Lookalike",
  DPA: "DPA Audience",
  SHOPIFY_CUSTOMERS: "Shopify Customers",
  ABANDONED_CHECKOUT: "Abandoned Checkout",
}

export const PLACEMENT_LABELS: Record<Placement, string> = {
  FB_FEED: "Facebook Feed",
  FB_STORIES: "Facebook Stories",
  FB_REELS: "Facebook Reels",
  FB_MARKETPLACE: "Facebook Marketplace",
  IG_FEED: "Instagram Feed",
  IG_STORIES: "Instagram Stories",
  IG_REELS: "Instagram Reels",
  IG_EXPLORE: "Instagram Explore",
  MESSENGER_INBOX: "Messenger Inbox",
}

export const AD_FORMAT_LABELS: Record<AdFormat, string> = {
  IMAGE: "Image",
  VIDEO: "Video",
  CAROUSEL: "Carousel",
}

export const getAvailableAudiences = (type: CampaignType | null): AudienceType[] => {
  const base: AudienceType[] = ["ENGAGEMENT", "ENGAGEMENT_IG", "SHOPIFY_CUSTOMERS", "ABANDONED_CHECKOUT"]

  if (type === "DPA") return ["DPA"]
  if (type === "PROSPECT") return [...base, "LOOKALIKE"]
  if (type === "CONVERSIONS") return [...base, "WEBSITE"]
  return base
}

export const getAvailablePlacements = (type: CampaignType | null): Placement[] => {
  const all: Placement[] = ["FB_FEED", "FB_STORIES", "FB_REELS", "FB_MARKETPLACE", "IG_FEED", "IG_STORIES", "IG_REELS", "IG_EXPLORE", "MESSENGER_INBOX"]

  if (type === "DPA") return all.filter(p => p !== "MESSENGER_INBOX")
  return all
}
