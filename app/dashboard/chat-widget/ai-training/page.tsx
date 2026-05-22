import { redirect } from "next/navigation";

/** Legacy route — AI training moved under sidebar → AI Training → AI Assistant. */
export default function LegacyChatWidgetAiTrainingPage() {
  redirect("/dashboard/ai-training/assistant");
}
