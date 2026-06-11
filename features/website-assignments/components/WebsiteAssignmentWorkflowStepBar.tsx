"use client";

import NextLink from "next/link";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { assignmentStepChipSx, assignmentStepRowSx } from "../styles/website-assignment-ui.styles";

export type WebsiteAssignmentWorkflowVariant = "assign-hub" | "scheduling-hub" | "scheduling-editor";

const WORKFLOWS = {
  "assign-hub": [
    { n: 1, label: "Service scheduling", href: "/dashboard/website-assigning/service-schedules" },
    { n: 2, label: "Assign agents", href: "/dashboard/website-assigning" },
  ],
  "scheduling-hub": [
    { n: 1, label: "Service scheduling", href: "/dashboard/website-assigning/service-schedules" },
    { n: 2, label: "Assign agents", href: "/dashboard/website-assigning" },
  ],
  "scheduling-editor": [
    { n: 1, label: "Mode & policy" },
    { n: 2, label: "Service hours" },
    { n: 3, label: "Visitor topics" },
  ],
} as const;

export function WebsiteAssignmentWorkflowStepBar({
  variant,
  activeStep,
}: {
  variant: WebsiteAssignmentWorkflowVariant;
  activeStep: number;
}) {
  const steps = WORKFLOWS[variant];

  return (
    <Box sx={{ ...assignmentStepRowSx, mb: 2.5 }}>
      {steps.map((step) => {
        const chip = (
          <Chip
            key={step.n}
            label={`${step.n}. ${step.label}`}
            size="small"
            sx={assignmentStepChipSx(activeStep >= step.n)}
          />
        );
        if ("href" in step && step.href) {
          const isLinkTarget = activeStep !== step.n;
          return isLinkTarget ? (
            <Box
              key={step.n}
              component={NextLink}
              href={step.href}
              sx={{ textDecoration: "none" }}
            >
              {chip}
            </Box>
          ) : (
            <Box key={step.n}>{chip}</Box>
          );
        }
        return <Box key={step.n}>{chip}</Box>;
      })}
    </Box>
  );
}
