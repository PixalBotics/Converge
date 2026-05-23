"use client";

import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import { distributionWizardPageWrapper } from "./wizard.styles";

/** Distribution is its own sidebar area — not nested under Email hub tabs. */
export default function DistributionSetupLayout({ children }: { children: ReactNode }) {
  return <Box sx={distributionWizardPageWrapper}>{children}</Box>;
}
