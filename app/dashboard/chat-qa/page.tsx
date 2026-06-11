import { redirect } from "next/navigation";

export default function LegacyChatQaPage() {
  redirect("/dashboard/qa/inbox");
}
