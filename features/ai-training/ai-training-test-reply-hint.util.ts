import type { AiTrainingTestRespondResult } from "@/api/ai-training/ai-training.api";

/** Short label shown under bot bubbles in the test chat template. */
export function formatTestReplyHint(result: AiTrainingTestRespondResult): string | undefined {
  if (result.variant === "assistant") {
    return "Assistant · from training data";
  }

  const replyStep = result.pipeline?.find((s) => s.id === "reply");
  const detail = replyStep?.detail?.toLowerCase() ?? "";

  if (result.replySource === "llm") {
    const kbCount = result.knowledgeMatches?.length ?? 0;
    return kbCount > 0
      ? `AI answer · ${kbCount} training match${kbCount === 1 ? "" : "es"}`
      : "AI answer · training data";
  }

  if (result.replySource === "template") {
    if (detail.includes("preset fallback") || detail.includes("preset low-confidence")) {
      return "Preset · fallback message";
    }
    if (detail.includes("training excerpt") || detail.includes("weak llm replaced")) {
      return "Training excerpt · weak AI answer replaced";
    }
    if (result.intent === "talk_to_agent" || detail.includes("escalation")) {
      return "Preset · talk to agent";
    }
    if (detail.includes("greeting")) {
      return "Preset · welcome message";
    }
    if (detail.includes("fallback")) {
      return "Preset · fallback (low KB match)";
    }
    return "Preset · bot settings";
  }

  return undefined;
}
