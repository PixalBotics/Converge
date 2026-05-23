import type { EmailTemplateBlock } from "../types";
import type { EmailAgentFeedbackPreview } from "./email-html-builder";
import { buildEmailHtml } from "./email-html-builder";
import { normalizeEmailTheme, type EmailTemplateTheme } from "./email-theme";

export function buildClientEmailPreviewHtml(input: {
  primaryColor: string;
  theme: EmailTemplateTheme | unknown;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  blocks: EmailTemplateBlock[];
  platformHeaderUrl?: string;
  feedback?: EmailAgentFeedbackPreview;
}): string {
  const theme = normalizeEmailTheme(input.theme);
  const accent = input.primaryColor?.trim() || "#1a57a5";
  const platformHeaderUrl =
    input.platformHeaderUrl?.trim() || "/uploads/platform/email-header.png";

  return buildEmailHtml({
    theme,
    accent,
    logoUrl: input.logoUrl,
    bannerUrl: input.bannerUrl,
    platformHeaderUrl,
    blocks: input.blocks.map((b) => ({
      blockKey: b.blockKey,
      enabled: b.enabled,
      sortOrder: b.sortOrder,
      styleJson: (b.styleJson as Record<string, unknown> | null) ?? null,
    })),
    sample: {
      visitorEmail: "visitor@example.com",
      visitorPhone: "+1 555 0100",
      location: "Garden Grove, California, United States of America",
      website: "www.example.com",
      chatTime: "09:39:01 PST",
      agentName: "Scott",
      duration: "7m 54s",
      browser: "Chrome 144.0",
      visitorId: "60643686",
      device: "Desktop",
      ip: "172.88.93.143",
      leadSource: "Organic",
      chatOrigin: "Website",
      referrer: "https://www.example.com/contact",
      chatId: "567550",
      transcript: [
        { who: "Scott", line: "Welcome! How can I help you today?" },
        { who: "Visitor", line: "I have a question about your services." },
      ],
      journey: [
        "https://www.example.com/about (02/26/26 09:38 PST)",
        "https://www.example.com/contact (02/26/26 09:39 PST)",
      ],
      additionalNotes: "",
    },
    feedback: input.feedback,
  });
}
