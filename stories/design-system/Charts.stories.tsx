import type { Meta, StoryObj } from "@storybook/react";
import Stack from "@mui/material/Stack";
import { RevenueLineChart } from "@/components/common/Charts/RevenueLineChart";
import { DepartmentPieChart } from "@/components/common/Charts/DepartmentPieChart";
import { ChatAnalyticsBarChart } from "@/components/common/Charts/ChatAnalyticsBarChart";
import { ChatVolumeChart } from "@/components/common/Charts/ChatVolumeChart";

const meta = {
  title: "Design System/Charts",
} satisfies Meta;

export default meta;

const revenueData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  value: 180 + Math.sin(i / 3) * 40,
  value2: 160 + Math.cos(i / 4) * 30,
}));

const pieData = [
  { name: "Sales", value: 38, color: "#6366f1" },
  { name: "Support", value: 32, color: "#22c55e" },
  { name: "Ops", value: 20, color: "#f97316" },
  { name: "Other", value: 10, color: "#94a3b8" },
];

const barData = [
  { name: "Mon", value: 12000, fill: "first" as const },
  { name: "Tue", value: 19000, fill: "second" as const },
  { name: "Wed", value: 15000, fill: "first" as const },
  { name: "Thu", value: 22000, fill: "second" as const },
];

const volumeData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  value: 40 + ((i * 7) % 55),
}));

export const RevenueLine: StoryObj = {
  render: () => (
    <Stack spacing={3}>
      <RevenueLineChart data={revenueData} height={280} />
    </Stack>
  ),
};

export const DepartmentPie: StoryObj = {
  render: () => <DepartmentPieChart data={pieData} height={300} />,
};

export const ChatAnalyticsBars: StoryObj = {
  render: () => <ChatAnalyticsBarChart data={barData} height={260} yDomain={[0, 25000]} />,
};

export const ChatVolume: StoryObj = {
  render: () => <ChatVolumeChart data={volumeData} height={260} />,
};
