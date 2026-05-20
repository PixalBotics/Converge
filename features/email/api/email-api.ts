/**
 * Typed email HTTP client — wraps shared axios instance with Bearer JWT.
 * Implementation: `@/api/email/email.api.ts`.
 */
export {
  deletePlatformEmailSettings,
  deletePlatformMailAssignment,
  deleteResellerEmailLogo,
  deleteResellerOwnMailSettings,
  getEmailProviderFormSchema,
  getPlatformEmailSettings,
  getPlatformMailAssignment,
  getResellerEmailTemplateDraft,
  getResellerEmailTemplateDraftPreview,
  getResellerEmailTemplatePublished,
  getResellerEmailTemplatePublishedPreview,
  getResellerOwnMailSettings,
  listEmailProviders,
  listPlatformMailAssignments,
  listResellerOwnMailSettings,
  publishResellerEmailTemplateDraft,
  testPlatformEmailSettings,
  testResellerOwnMailSettings,
  updatePlatformEmailSettings,
  updatePlatformMailAssignment,
  updateResellerEmailTemplateDraft,
  updateResellerOwnMailSettings,
  uploadResellerEmailLogo,
} from "@/api/email/email.api";
