import type { Meta, StoryObj } from "@storybook/react";
import Box from "@mui/material/Box";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import { DataNotFoundPlaceholder, MetricCard } from "@/components/layout/dashboard";

const meta = {
  title: "Dashboard/Placeholders & metrics",
} satisfies Meta;

export default meta;

export const DataNotFound: StoryObj = {
  render: () => (
    <Box sx={{ borderRadius: 2, overflow: "hidden" }}>
      <DataNotFoundPlaceholder />
    </Box>
  ),
};

export const MetricCardExample: StoryObj = {
  render: () => (
    <Box sx={{ maxWidth: 320 }}>
      <MetricCard
        title="Active conversations"
        value="1,284"
        subtitle="vs last week"
        icon={<PeopleAltOutlined />}
        iconBgColor="rgba(99, 102, 241, 0.25)"
      />
    </Box>
  ),
};
