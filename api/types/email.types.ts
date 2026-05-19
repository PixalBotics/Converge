import type { ApiEnvelope } from "./auth.types";

export type EmailProviderCode =
  | "sendgrid"
  | "sendgrid_api"
  | "microsoft365"
  | "smtp"
  | (string & {});

export type EmailFieldType = "text" | "password" | "number" | "select" | "boolean";

export interface EmailProviderFieldSchema {
  /** Canonical field id for PUT `fields` map (API may send `fieldKey` instead). */
  key: string;
  fieldKey?: string;
  label: string;
  type: EmailFieldType;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  helpText?: string;
  options?: { label: string; value: string }[];
}

export type EmailProviderKind = "smtp" | "api";

export interface EmailProvider {
  id: string;
  code: EmailProviderCode;
  name: string;
  description?: string;
  providerType?: EmailProviderKind;
  type?: EmailProviderKind;
}

export interface EmailProviderFormSchema {
  provider: EmailProvider;
  fields: EmailProviderFieldSchema[];
}

/** Platform + reseller own mail (GET/PUT). */
export interface MailProviderSettings {
  emailProviderId: string | null;
  fromEmail: string | null;
  fromName: string | null;
  isEnabled: boolean;
  fields: Record<string, string>;
  lastTestedAt?: string | null;
  lastTestStatus?: "success" | "failed" | null;
  lastTestedBy?: string | null;
  updatedAt?: string | null;
  updatedBy?: string | null;
  /** Present when API nests `emailProvider` on GET (not sent on PUT). */
  providerName?: string | null;
  providerCode?: string | null;
  providerKind?: EmailProviderKind | null;
}

export type PlatformEmailSettings = MailProviderSettings;
export type ResellerOwnMailSettings = MailProviderSettings;

export interface MailProviderSettingsBody {
  emailProviderId: string;
  fromEmail: string;
  fromName?: string;
  isEnabled?: boolean;
  fields: Record<string, string>;
}

export type PlatformEmailSettingsBody = MailProviderSettingsBody;
export type ResellerOwnMailSettingsBody = MailProviderSettingsBody;

export interface ResellerOwnMailListItem extends Record<string, unknown> {
  resellerId: string;
  resellerName: string;
  provider?: string | null;
  providerName?: string | null;
  providerCode?: string | null;
  emailProviderId?: string | null;
  fromEmail?: string | null;
  isEnabled: boolean;
  lastTestStatus?: "success" | "failed" | null;
  lastTestedAt?: string | null;
}

export interface PlatformMailAssignment {
  resellerId?: string;
  fromEmail?: string | null;
  fromName?: string | null;
  isEnabled: boolean;
  updatedAt?: string | null;
  updatedBy?: string | null;
  emailProviderId?: string | null;
  providerName?: string | null;
  providerCode?: string | null;
  providerKind?: EmailProviderKind | null;
}

export interface PlatformMailAssignmentListItem extends Record<string, unknown> {
  id: string;
  resellerId: string;
  resellerName: string;
  fromEmail?: string | null;
  fromName?: string | null;
  isEnabled: boolean;
  emailProviderId?: string | null;
  providerName?: string | null;
  providerCode?: string | null;
  providerKind?: EmailProviderKind | null;
  lastTestStatus?: "success" | "failed" | null;
  lastTestedAt?: string | null;
  updatedAt?: string | null;
}

export interface PlatformMailAssignmentBody {
  fromEmail?: string;
  fromName?: string;
  isEnabled?: boolean;
}

export interface EmailTestBody {
  toEmail?: string;
}

export interface EmailTestResult {
  success: boolean;
  message?: string;
  testedAt?: string;
}

export type EmailTemplateBlockKey =
  | "visitor_info"
  | "chat_info"
  | "acquisition"
  | "transcript"
  | "visitor_journey"
  | "footer";

export interface EmailTemplateBlock {
  blockKey: EmailTemplateBlockKey;
  enabled: boolean;
  sortOrder: number;
}

export interface EmailTemplateDraft {
  name: string;
  primaryColor?: string | null;
  blocks: EmailTemplateBlock[];
  logoUrl?: string | null;
  updatedAt?: string | null;
  updatedBy?: string | null;
  publishedAt?: string | null;
}

export interface EmailTemplateDraftBody {
  name: string;
  primaryColor?: string;
  blocks: EmailTemplateBlock[];
}

export interface EmailPreviewData {
  html: string;
}

export type EmailProvidersEnvelope = ApiEnvelope<EmailProvider[]>;
export type EmailProviderFormSchemaEnvelope = ApiEnvelope<EmailProviderFormSchema>;
export type PlatformEmailSettingsEnvelope = ApiEnvelope<PlatformEmailSettings>;
export type ResellerOwnMailSettingsEnvelope = ApiEnvelope<ResellerOwnMailSettings>;
export type ResellerOwnMailListEnvelope = ApiEnvelope<ResellerOwnMailListItem[]>;
export type PlatformMailAssignmentEnvelope = ApiEnvelope<PlatformMailAssignment>;
export type PlatformMailAssignmentListEnvelope = ApiEnvelope<PlatformMailAssignmentListItem[]>;
export type EmailTestResultEnvelope = ApiEnvelope<EmailTestResult>;
export type EmailTemplateDraftEnvelope = ApiEnvelope<EmailTemplateDraft>;
export type EmailPreviewEnvelope = ApiEnvelope<EmailPreviewData>;
