"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import { Button, InputField, SelectField } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { CrmIntegrationWizardShell } from "@/features/crm-integration";
import { distributionWizardFormGrid3 } from "../distribution-setup/wizard.styles";

const CLIENT_OPTIONS = [{ label: "Jeera", value: "jeera" }];
const PARENT_OPTIONS = [{ label: "ABC Holding", value: "abc-holding" }];

export default function CrmOrganizationSelectionPage() {
  const router = useRouter();
  const [clientOf, setClientOf] = useState("jeera");
  const [parentCompany, setParentCompany] = useState("abc-holding");
  const [childCompany, setChildCompany] = useState("ABC Holding");
  const [website, setWebsite] = useState("Jeera");

  return (
    <CrmIntegrationWizardShell
      step={1}
      cardTitle="Organization Selection"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={() => router.push("/dashboard")}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            onClick={() => router.push("/dashboard/crm-integration/crm-selection")}
          >
            Next
          </Button>
        </>
      }
    >
      <Box sx={distributionWizardFormGrid3}>
        <SelectField label="Client Of" value={clientOf} onChange={setClientOf} options={CLIENT_OPTIONS} />
        <SelectField
          label="Parent Company"
          value={parentCompany}
          onChange={setParentCompany}
          options={PARENT_OPTIONS}
        />
        <InputField
          label="Child Company"
          name="childCompany"
          value={childCompany}
          onChange={(e) => setChildCompany(e.target.value)}
        />
      </Box>
      <InputField label="Website" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} />
    </CrmIntegrationWizardShell>
  );
}
