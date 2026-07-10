import { redirect } from "next/navigation";

/** Stripe configuration lives on the payment setup page. */
export default function Page() {
  redirect("/dashboard/billing/payments");
}
