import type { AiTrainingKbVariant } from "./ai-training-kb.utils";

const BASE: Record<AiTrainingKbVariant, string> = {
  chatbot: "/dashboard/ai-training/chatbot",
  assistant: "/dashboard/ai-training/assistant",
};

export function aiTrainingListHref(variant: AiTrainingKbVariant): string {
  return BASE[variant];
}

export function aiTrainingAddHref(variant: AiTrainingKbVariant, websiteId?: string): string {
  const base = `${BASE[variant]}/add`;
  if (!websiteId?.trim()) return base;
  return `${base}?websiteId=${encodeURIComponent(websiteId.trim())}`;
}

export function aiTrainingManageHref(
  variant: AiTrainingKbVariant,
  websiteId: string,
  options?: { panel?: "test" },
): string {
  if (options?.panel === "test") {
    return aiTrainingTestStudioHref(variant, websiteId);
  }
  const base = `${BASE[variant]}/manage?websiteId=${encodeURIComponent(websiteId.trim())}`;
  return base;
}

export function aiTrainingTestStudioHref(
  variant: AiTrainingKbVariant,
  websiteId: string,
): string {
  return `${BASE[variant]}/test?websiteId=${encodeURIComponent(websiteId.trim())}`;
}
