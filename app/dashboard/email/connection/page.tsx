import { redirect } from "next/navigation";
import { EMAIL_ROUTES } from "@/features/email/email.constants";

export default function EmailConnectionIndexPage() {
  redirect(EMAIL_ROUTES.resellerMail);
}
