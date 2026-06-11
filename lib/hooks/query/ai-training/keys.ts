export const aiTrainingKeys = {
  all: ["ai-training"] as const,
  behavior: (websiteId: string) =>
    [...aiTrainingKeys.all, "behavior", websiteId] as const,
  testContext: (websiteId: string) =>
    [...aiTrainingKeys.all, "test-context", websiteId] as const,
  automationFlow: (websiteId: string, variant: string) =>
    [...aiTrainingKeys.all, "automation-flow", websiteId, variant] as const,
};
