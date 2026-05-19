export const emailKeys = {
  all: ["email"] as const,
  providers: () => [...emailKeys.all, "providers"] as const,
  providerSchema: (providerId: string) => [...emailKeys.all, "provider-schema", providerId] as const,
  platformSettings: () => [...emailKeys.all, "platform-settings"] as const,
  resellerOwnMailList: () => [...emailKeys.all, "reseller-own-mail-list"] as const,
  resellerOwnMail: (resellerId: string) => [...emailKeys.all, "reseller-own-mail", resellerId] as const,
  platformAssignmentList: () => [...emailKeys.all, "platform-assignment-list"] as const,
  platformAssignment: (resellerId: string) =>
    [...emailKeys.all, "platform-assignment", resellerId] as const,
  templateDraft: (resellerId: string) => [...emailKeys.all, "template-draft", resellerId] as const,
  templateDraftPreview: (resellerId: string) =>
    [...emailKeys.all, "template-draft-preview", resellerId] as const,
  templatePublishedPreview: (resellerId: string) =>
    [...emailKeys.all, "template-published-preview", resellerId] as const,
  templatePublished: (resellerId: string) =>
    [...emailKeys.all, "template-published", resellerId] as const,
};
