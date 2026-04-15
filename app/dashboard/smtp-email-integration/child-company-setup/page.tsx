import { redirect } from "next/navigation";

/** Renamed to SMTP Configuration — keep route for old links */
export default function SmtpEmailChildCompanySetupRedirectPage() {
  redirect("/dashboard/smtp-email-integration/smtp-configuration");
}
