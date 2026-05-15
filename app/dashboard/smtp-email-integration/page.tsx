"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import { Button, SelectField } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { SmtpEmailWizardShell } from "@/features/smtp-email";
import { distributionWizardFormGrid3 } from "../distribution-setup/wizard.styles";
import { SmtpChipTagField } from "./SmtpChipTagField";

const CLIENT_OPTIONS = [{ label: "Jeera", value: "jeera" }];
const PARENT_OPTIONS = [{ label: "ABC Holding", value: "abc-holding" }];
const SITE_OPTIONS = ["ABC Lahore", "ABC Karachi", "ABC Faisalabad"];

export default function SmtpEmailOrganizationSelectionPage() {
  const router = useRouter();
  const [clientOf, setClientOf] = useState("jeera");
  const [parentCompany, setParentCompany] = useState("abc-holding");
  const [childSites, setChildSites] = useState<string[]>(["ABC Lahore", "ABC Karachi"]);
  const [websiteSites, setWebsiteSites] = useState<string[]>(["ABC Lahore", "ABC Karachi"]);

  return (
    <SmtpEmailWizardShell
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
            onClick={() => router.push("/dashboard/smtp-email-integration/smtp-configuration")}
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
        <SmtpChipTagField
          label="Child Company"
          values={childSites}
          onChange={setChildSites}
          options={SITE_OPTIONS}
        />
      </Box>
      <SmtpChipTagField
        label="Website"
        values={websiteSites}
        onChange={setWebsiteSites}
        options={SITE_OPTIONS}
      />
    </SmtpEmailWizardShell>
  );
}
