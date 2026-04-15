type Params = Record<string, unknown> | undefined;

export const websiteAssignmentsKeys = {
  all: ["website-assignments"] as const,
  websites: (params?: Params) =>
    [...websiteAssignmentsKeys.all, "websites", params] as const,
  website: (websiteId: string) =>
    [...websiteAssignmentsKeys.all, "website", websiteId] as const,
  userWebsites: (userId: string, params?: Params) =>
    [...websiteAssignmentsKeys.all, "user", userId, "websites", params] as const,
};
