"use client";

import { useEffect, useState } from "react";
import { Button, FormModal, SelectField } from "@/components/common";
import { currentUtcMonth } from "../utils/report-params";

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: new Date(2000, i, 1).toLocaleString("en-US", { month: "long" }),
}));

function yearOptions(): { value: string; label: string }[] {
  const current = new Date().getUTCFullYear();
  return Array.from({ length: 4 }, (_, i) => {
    const y = current - i;
    return { value: String(y), label: String(y) };
  });
}

export type GenerateReportModalProps = {
  open: boolean;
  onClose: () => void;
  configLabel?: string;
  onSubmit: (body: { month: number; year: number; sendEmail: boolean }) => Promise<void>;
  submitting: boolean;
};

export function GenerateReportModal({
  open,
  onClose,
  configLabel,
  onSubmit,
  submitting,
}: GenerateReportModalProps) {
  const defaults = currentUtcMonth();
  const [year, setYear] = useState(String(defaults.year));
  const [month, setMonth] = useState(String(defaults.month));
  const [sendEmail, setSendEmail] = useState("no");

  useEffect(() => {
    if (!open) return;
    const d = currentUtcMonth();
    setYear(String(d.year));
    setMonth(String(d.month));
    setSendEmail("no");
  }, [open]);

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title="Generate report"
      description={configLabel ? `Configuration: ${configLabel}` : undefined}
      maxWidth={480}
      primaryButtonLabel={submitting ? "Generating…" : "Generate"}
      primaryButtonDisabled={submitting}
      onSave={() =>
        void onSubmit({
          year: Number(year) || defaults.year,
          month: Number(month) || defaults.month,
          sendEmail: sendEmail === "yes",
        })
      }
    >
      <SelectField label="Year" value={year} onChange={setYear} options={yearOptions()} />
      <SelectField label="Month" value={month} onChange={setMonth} options={MONTH_OPTIONS} />
      <SelectField
        label="Send email to saved recipients"
        value={sendEmail}
        onChange={setSendEmail}
        options={[
          { value: "no", label: "No — download only" },
          { value: "yes", label: "Yes — email recipients" },
        ]}
      />
    </FormModal>
  );
}
