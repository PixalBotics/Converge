import { redirect } from "next/navigation";

export default function LegacyEmailFeedbackRedirect() {
  redirect("/dashboard/feedback");
}
