"use client";

import { useSearchParams, useRouter } from "next/navigation";
import SmartToyOutlined from "@mui/icons-material/SmartToyOutlined";
import LinearProgress from "@mui/material/LinearProgress";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { publishAppToast } from "@/lib/notify";
import { useCreateAiChatbotSourceMutation } from "@/lib/hooks/query/ai-knowledge";
import { AiTrainingPageShell } from "./AiTrainingPageShell";
import { AiTrainingChatbotAddForm, type ChatbotTrainingMethod } from "./AiTrainingChatbotAddForm";
import { aiTrainingListHref, aiTrainingManageHref } from "./ai-training-routes";
import { toastMessageForCreateResult } from "./ai-training-kb.utils";
import { useAiTrainingHierarchy } from "./use-ai-training-hierarchy";

export function AiTrainingChatbotAddPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialWebsiteId = searchParams.get("websiteId") ?? undefined;
  const initialMethod = (searchParams.get("method") as ChatbotTrainingMethod | null) ?? undefined;

  const hierarchy = useAiTrainingHierarchy();
  const createChatbot = useCreateAiChatbotSourceMutation();
  const listHref = aiTrainingListHref("chatbot");

  const handleSubmit = async (payload: {
    websiteId: string;
    sourceType: string;
    sourceRef: string;
    title?: string;
  }) => {
    try {
      const result = await createChatbot.mutateAsync(payload);
      const toast = toastMessageForCreateResult(result);
      publishAppToast({ variant: toast.variant, message: toast.message });
      router.push(aiTrainingManageHref("chatbot", payload.websiteId));
    } catch (e) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(e) ?? "Could not create training content.",
      });
      throw e;
    }
  };

  return (
    <AiTrainingPageShell
      title="Add chatbot training"
      subtitle="Import site pages or FAQs so the visitor widget can answer from your website content."
      icon={<SmartToyOutlined sx={{ color: "primary.main", fontSize: 28 }} />}
      backHref={listHref}
      backLabel="All trained websites"
    >
      {createChatbot.isPending ? <LinearProgress sx={{ borderRadius: 1 }} /> : null}
      <AiTrainingChatbotAddForm
        hierarchy={hierarchy}
        createBusy={createChatbot.isPending}
        onSubmit={handleSubmit}
        initialWebsiteId={initialWebsiteId}
        initialMethod={initialMethod}
        onCancelHref={listHref}
      />
    </AiTrainingPageShell>
  );
}
