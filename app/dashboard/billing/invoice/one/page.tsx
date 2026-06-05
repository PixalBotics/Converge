"use client";

import { InvoiceOneDocument } from "../InvoiceOneDocument";
import { InvoicePageShell } from "../InvoicePageShell";

export default function BillingInvoiceOnePage() {
  return (
    <InvoicePageShell title="Invoice One">
      <InvoiceOneDocument />
    </InvoicePageShell>
  );
}
