import type { Meta, StoryObj } from "@storybook/react";
import Box from "@mui/material/Box";
import { LoadingScreen } from "@/components/common/LoadingScreen/LoadingScreen";

const meta = {
  title: "Design System/LoadingScreen",
  component: LoadingScreen,
} satisfies Meta<typeof LoadingScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Inline: Story = {
  args: {
    message: "Loading workspace…",
    fullPage: false,
  },
  decorators: [
    (S) => (
      <Box sx={{ height: 280, position: "relative" }}>
        <S />
      </Box>
    ),
  ],
};

export const FullPage: Story = {
  args: {
    message: "Preparing your dashboard…",
    fullPage: true,
  },
};

/** Matches Next.js `app/dashboard/loading.tsx` — no auth gradient, inherits shell. */
export const EmbeddedInDashboardShell: Story = {
  args: {
    message: "Loading…",
    embedded: true,
  },
  decorators: [
    (S) => (
      <Box
        sx={{
          height: 420,
          display: "flex",
          flexDirection: "column",
          bgcolor: "action.hover",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <S />
      </Box>
    ),
  ],
};
