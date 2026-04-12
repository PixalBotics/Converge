"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, SelectField } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { CrmIntegrationWizardShell } from "@/components/dashboard/CrmIntegrationWizardShell";

const CRM_OPTIONS = [
  { label: "Zoho CRM", value: "zoho" },
  { label: "HubSpot", value: "hubspot" },
  { label: "Salesforce", value: "salesforce" },
];

export default function CrmSelectionPage() {
  const router = useRouter();
  const [crm, setCrm] = useState("zoho");

  return (
    <CrmIntegrationWizardShell
      step={2}
      cardTitle="CRM Selection"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={() => router.push("/dashboard/crm-integration")}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            onClick={() => router.push("/dashboard/crm-integration/hubspot-connection-fields")}
          >
            Next
          </Button>
        </>
      }
    >
      <SelectField label="CRM Selection" value={crm} onChange={setCrm} options={CRM_OPTIONS} />
    </CrmIntegrationWizardShell>
  );
}
