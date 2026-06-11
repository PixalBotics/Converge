"use client";

import { InvoiceThreeDocument } from "../InvoiceThreeDocument";
import { InvoicePageShell } from "../InvoicePageShell";

export default function BillingInvoiceThreePage() {
  return (
    <InvoicePageShell title="Invoice Three">
      <InvoiceThreeDocument />
    </InvoicePageShell>
  );
}
