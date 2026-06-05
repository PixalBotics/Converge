"use client";

import { InvoiceTwoDocument } from "../InvoiceTwoDocument";
import { InvoicePageShell } from "../InvoicePageShell";

export default function BillingInvoiceTwoPage() {
  return (
    <InvoicePageShell title="Invoice Two">
      <InvoiceTwoDocument />
    </InvoicePageShell>
  );
}
