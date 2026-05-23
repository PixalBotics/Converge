import type { Meta, StoryObj } from "@storybook/react";
import Box from "@mui/material/Box";
import { Typography } from "@/components/common/Typography/Typography";
import { AddIpBlockWizardShell } from "@/features/ip-block";
import { CrmIntegrationWizardShell } from "@/features/crm-integration";
import { SmtpEmailWizardShell } from "@/features/smtp-email";
import { WidgetFlowShell } from "@/features/chat-widget";

const meta = {
  title: "Dashboard/Wizard shells",
} satisfies Meta;

export default meta;

const placeholder = (
  <Typography variant="body2" sx={{ mt: 2, color: "rgba(255,255,255,0.72)" }}>
    Step content goes here — forms, tables, or validation summaries.
  </Typography>
);

export const WidgetFlowWithStepper: StoryObj = {
  render: () => (
    <Box sx={{ maxWidth: 1040, mx: "auto" }}>
      <WidgetFlowShell
        pageTitle="Widget marketplace"
        subtitle="Install and configure dashboard widgets for your workspace."
        cardTitle="Browse catalog"
        stepper={{ labels: ["Pick widget", "Configure", "Review"], currentStep: 1 }}
        footer={<Typography variant="caption">Footer actions</Typography>}
      >
        {placeholder}
      </WidgetFlowShell>
    </Box>
  ),
};

export const AddIpBlockStep1: StoryObj = {
  render: () => (
    <Box sx={{ maxWidth: 1040, mx: "auto" }}>
      <AddIpBlockWizardShell step={1} cardTitle="IP address" footer={null}>
        {placeholder}
      </AddIpBlockWizardShell>
    </Box>
  ),
};

export const CrmIntegrationStep2: StoryObj = {
  render: () => (
    <Box sx={{ maxWidth: 1040, mx: "auto" }}>
      <CrmIntegrationWizardShell step={2} cardTitle="Choose CRM" footer={null}>
        {placeholder}
      </CrmIntegrationWizardShell>
    </Box>
  ),
};

export const SmtpEmailStep1: StoryObj = {
  render: () => (
    <Box sx={{ maxWidth: 1040, mx: "auto" }}>
      <SmtpEmailWizardShell step={1} cardTitle="Server host" footer={null}>
        {placeholder}
      </SmtpEmailWizardShell>
    </Box>
  ),
};
