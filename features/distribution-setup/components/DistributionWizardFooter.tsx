"use client";

import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import { Button } from "@/components/common";
import { distributionWizardFooterActionsSx } from "../styles/distribution-wizard-ui.styles";

export type DistributionWizardFooterProps = {
  onBack: () => void;
  backLabel?: string;
  children?: ReactNode;
};

/** Wizard footer — Back left, primary actions grouped on the right (same card, no floating bar). */
export function DistributionWizardFooter({
  onBack,
  backLabel = "Back",
  children,
}: DistributionWizardFooterProps) {
  return (
    <>
      <Button type="button" variant="secondary" onClick={onBack}>
        {backLabel}
      </Button>
      {children ? (
        <Box sx={distributionWizardFooterActionsSx}>{children}</Box>
      ) : null}
    </>
  );
}
