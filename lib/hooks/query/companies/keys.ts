type Params = Record<string, unknown> | undefined;

export const companiesKeys = {
  all: ["companies"] as const,
  list: (params?: Params) => [...companiesKeys.all, "list", params] as const,
  byReseller: (resellerId: string, params?: Params) =>
    [...companiesKeys.all, "by-reseller", resellerId, params] as const,
  setupResellers: () => [...companiesKeys.all, "setup", "resellers"] as const,
  setupDraft: (draftId: string) =>
    [...companiesKeys.all, "setup", "draft", draftId] as const,
  parent: (id: string) => [...companiesKeys.all, "parent", id] as const,
  detail: (id: string) => [...companiesKeys.all, "detail", id] as const,
};
