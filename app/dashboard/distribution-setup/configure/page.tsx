"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import { Button, InputField, SelectField } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { DistributionWizardShell } from "@/components/dashboard/DistributionWizardShell";
import { distributionWizardFormGrid3 } from "../wizard.styles";

const CLIENT_OPTIONS = [{ label: "Jeera", value: "jeera" }];
const PARENT_OPTIONS = [{ label: "ABC Holding", value: "abc" }];

export default function ConfigureDistributionPage() {
  const router = useRouter();
  const [clientOf, setClientOf] = useState("jeera");
  const [parentCompany, setParentCompany] = useState("abc");
  const [childCompany, setChildCompany] = useState("ABC Holding");
  const [website, setWebsite] = useState("Jeera");

  return (
    <DistributionWizardShell
      step={1}
      cardTitle="Configure Distribution"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={() => router.push("/dashboard/distribution-setup")}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            onClick={() => router.push("/dashboard/distribution-setup/settings")}
          >
            Next
          </Button>
        </>
      }
    >
      <Box sx={distributionWizardFormGrid3}>
        <SelectField label="Client Of" value={clientOf} onChange={setClientOf} options={CLIENT_OPTIONS} />
        <SelectField label="Parent Company" value={parentCompany} onChange={setParentCompany} options={PARENT_OPTIONS} />
        <InputField
          label="Child Company"
          name="childCompany"
          value={childCompany}
          onChange={(e) => setChildCompany(e.target.value)}
        />
      </Box>
      <InputField label="Website" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} />
    </DistributionWizardShell>
  );
}
