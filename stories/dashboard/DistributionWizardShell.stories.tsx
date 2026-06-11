import type { Meta, StoryObj } from "@storybook/react";
import Box from "@mui/material/Box";
import { Typography } from "@/components/common/Typography/Typography";
import { DistributionWizardShell } from "@/features/distribution-setup";

const demoChild = (
  <Typography variant="body2" sx={{ mt: 2, color: "rgba(255,255,255,0.72)" }}>
    Placeholder content for this step.
  </Typography>
);

/**
 * Use `render` + primitive `args` so Controls can sync (see Storybook Controls docs:
 * JSX in args is not fully supported for control sync).
 */
const meta = {
  title: "Dashboard/DistributionWizardShell",
  component: DistributionWizardShell,
  decorators: [
    (Story) => (
      <Box sx={{ maxWidth: 1040, mx: "auto", width: "100%" }}>
        <Story />
      </Box>
    ),
  ],
  argTypes: {
    step: {
      control: { type: "select" },
      options: [1, 2, 3],
    },
    cardTitle: { control: "text" },
    subtitle: { control: "text" },
    children: { table: { disable: true } },
    footer: { control: false },
    cardHeaderRight: { control: false },
  },
  args: {
    step: 1,
    cardTitle: "Configure regions",
    subtitle:
      "Connect your workflow with industry-leading CRM platforms in minutes.",
    children: demoChild,
  },
  render: (args) => <DistributionWizardShell {...args} />,
} satisfies Meta<typeof DistributionWizardShell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Step1Configure: Story = {
  args: { step: 1, children: demoChild },
};

export const Step2Settings: Story = {
  args: { step: 2, children: demoChild },
};

export const Step3Table: Story = {
  args: { step: 3, cardTitle: "Distribution table", footer: null, children: demoChild },
};
