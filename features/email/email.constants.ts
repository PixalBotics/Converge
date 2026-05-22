import type { EmailProviderCode, EmailTemplateBlockKey } from "./types";

export const EMAIL_BASE_PATH = "/dashboard/email";

export const EMAIL_CONFIGURATION_LABEL = "Email configuration";

export const EMAIL_BREADCRUMB = `Settings → ${EMAIL_CONFIGURATION_LABEL}`;

export const EMAIL_ROUTES = {
  connection: `${EMAIL_BASE_PATH}/connection`,
  resellerMail: `${EMAIL_BASE_PATH}/connection/reseller`,
  platformMail: `${EMAIL_BASE_PATH}/connection/platform`,
  platformAssignment: `${EMAIL_BASE_PATH}/connection/assignment`,
  design: `${EMAIL_BASE_PATH}/design`,
  distribution: `${EMAIL_BASE_PATH}/distribution`,
  form: `${EMAIL_BASE_PATH}/form`,
} as const;

export function resellerOwnMailEditPath(resellerId: string): string {
  return `${EMAIL_ROUTES.resellerMail}?edit=${encodeURIComponent(resellerId.trim())}`;
}

export const EMAIL_RECOMMENDED_PROVIDER_CODE = "sendgrid_api";

export const PROVIDER_CODE_LABELS: Record<string, string> = {
  resend_api: "Resend",
  sendgrid_api: "SendGrid",
  sendgrid: "SendGrid",
  mailgun_api: "Mailgun",
  microsoft365: "Microsoft 365",
  custom_smtp: "Custom SMTP",
  smtp: "Custom SMTP",
};

export const PROVIDER_KIND_LABELS: Record<string, string> = {
  smtp: "SMTP",
  api: "API",
};

export const EMAIL_TEMPLATE_BLOCK_LABELS: Record<EmailTemplateBlockKey, string> = {
  visitor_info: "Visitor information",
  chat_info: "Chat information",
  acquisition: "Acquisition",
  transcript: "Transcript",
  visitor_journey: "Visitor journey",
  footer: "Footer",
};

export const DEFAULT_TEMPLATE_BLOCKS: EmailTemplateBlockKey[] = [
  "visitor_info",
  "chat_info",
  "acquisition",
  "transcript",
  "visitor_journey",
  "footer",
];

export const MASKED_SECRET_VALUE = "********";

export const GMAIL_SMTP_TIP =
  "Use a Gmail App Password with Custom SMTP (host smtp.gmail.com, port 587, TLS).";
