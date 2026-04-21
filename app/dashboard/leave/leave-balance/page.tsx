"use client";

import Box from "@mui/material/Box";
import BarChartRounded from "@mui/icons-material/BarChartRounded";
import NorthEastRounded from "@mui/icons-material/NorthEastRounded";
import type { SxProps, Theme } from "@mui/material/styles";
import { Typography, DashboardCard } from "@/components/common";
import { rolesPageWrapper } from "../../roles/roles.styles";
import { pageWrapper } from "../../companies/overview.styles";
import {
  leaveBalanceAmountSx,
  leaveBalanceCardSx,
  leaveBalanceGridSx,
  leaveBalanceHeaderWrapSx,
  leaveBalanceIconWrapSx,
  leaveBalanceMetaSx,
  leaveBalanceSubtextSx,
} from "./leave-balance.styles";

const LEAVE_BALANCE_CARDS = [
  { id: "total", label: "Total Leaves", amount: "$12,9283", meta: "Awaiting QA", tone: "blue" as const },
  { id: "used", label: "Used Leaves", amount: "$32,9283", meta: "Completed", tone: "orange" as const },
  { id: "remaining", label: "Remaining Leaves", amount: "$34,928", meta: "Chats open", tone: "rose" as const },
];

export default function LeaveBalancePage() {
  return (
    <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>
      <Box sx={leaveBalanceHeaderWrapSx}>
        <Typography variant="regularLarge" fontWeight={700} color="white">
          Leave Balance
        </Typography>
        <Typography variant="body2" sx={leaveBalanceSubtextSx}>
          Generate and distribute licenses to client companies
        </Typography>
      </Box>

      <Box sx={leaveBalanceGridSx}>
        {LEAVE_BALANCE_CARDS.map((card) => (
          <DashboardCard key={card.id} sx={leaveBalanceCardSx}>
            <Box sx={leaveBalanceIconWrapSx(card.tone)}>
              <BarChartRounded sx={{ fontSize: 18 }} />
            </Box>
            <Typography variant="medium" color="white" sx={{ mt: 0.15 }}>
              {card.label}
            </Typography>
            <Typography variant="regularLarge" fontWeight={700} sx={leaveBalanceAmountSx}>
              {card.amount}
            </Typography>
            <Typography variant="small" sx={leaveBalanceMetaSx}>
              <NorthEastRounded sx={{ fontSize: 14, color: "success.main" }} />
              {card.meta}
            </Typography>
          </DashboardCard>
        ))}
      </Box>
    </Box>
  );
}
