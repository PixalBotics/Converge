import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button } from "@/components/common/Button/Button";
import { DashboardCard } from "@/components/common/DashboardCard/DashboardCard";
import { DashboardFilterSection } from "@/components/common/DashboardFilterSection/DashboardFilterSection";
import { FilterButton } from "@/components/common/FilterButton/FilterButton";
import { SearchBar } from "@/components/common/SearchBar/SearchBar";
import { Typography } from "@/components/common/Typography/Typography";
import { dashboardSectionIconBadgeSx } from "@/lib/design-system";

const meta = {
  title: "Design System/DashboardFilterSection",
  component: DashboardFilterSection,
} satisfies Meta<typeof DashboardFilterSection>;

export default meta;

type Story = StoryObj<typeof meta>;

function ToolbarPlayground() {
  const theme = useTheme() as AppTheme;
  const [q, setQ] = useState("");
  return (
    <Box sx={{ maxWidth: 1100, mx: "auto" }}>
      <DashboardCard>
        <DashboardFilterSection
          titleSlot={
            <>
              <Box sx={dashboardSectionIconBadgeSx} aria-hidden>
                <Typography
                  sx={{
                    color: theme.app.dashboard.white95,
                    fontWeight: 800,
                    fontSize: "1rem",
                    lineHeight: 1,
                  }}
                >
                  $
                </Typography>
              </Box>
              <Typography variant="mediumLarge" fontWeight={600} sx={{ color: theme.app.text.primary }}>
                Section title
              </Typography>
            </>
          }
          primarySlot={<SearchBar value={q} onChange={setQ} placeholder="Search…" />}
          filterSlot={<FilterButton />}
          actionSlot={
            <Button type="button" variant="primary" size="compact">
              Add
            </Button>
          }
        />
        <Box sx={{ pt: 2 }}>
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
            Toolbar uses `theme.app` surfaces; primary actions pick up `palette.primary` from backend-driven accent
            merges.
          </Typography>
        </Box>
      </DashboardCard>
    </Box>
  );
}

export const InsideCard: Story = {
  render: () => <ToolbarPlayground />,
};
