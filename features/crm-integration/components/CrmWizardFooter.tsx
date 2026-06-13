"use client";

import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import { Button } from "@/components/common";
import { crmWizardFooterActionsSx } from "../styles/crm-wizard-ui.styles";

export type CrmWizardFooterProps = {
  onBack?: () => void;
  backLabel?: string;
  children?: ReactNode;
};

export function CrmWizardFooter({ onBack, backLabel = "Back", children }: CrmWizardFooterProps) {
  return (
    <>
      {onBack ? (
        <Button type="button" variant="secondary" onClick={onBack}>
          {backLabel}
        </Button>
      ) : (
        <span />
      )}
      {children ? <Box sx={crmWizardFooterActionsSx}>{children}</Box> : null}
    </>
  );
}
