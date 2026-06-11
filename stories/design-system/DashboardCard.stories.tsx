import type { Meta, StoryObj } from "@storybook/react";
import { DashboardCard } from "@/components/common/DashboardCard/DashboardCard";
import { Typography } from "@/components/common/Typography/Typography";

const meta = {
  title: "Design System/DashboardCard",
  component: DashboardCard,
} satisfies Meta<typeof DashboardCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithContent: Story = {
  render: () => (
    <DashboardCard sx={{ maxWidth: 480, p: 3 }}>
      <Typography variant="mediumLarge" fontWeight={600}>
        Card surface
      </Typography>
      <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
        Uses dashboard chrome tokens (border, radius, background).
      </Typography>
    </DashboardCard>
  ),
};
