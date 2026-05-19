"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import BlurOnRounded from "@mui/icons-material/BlurOnRounded";
import BarChartRounded from "@mui/icons-material/BarChartRounded";
import NorthEastRounded from "@mui/icons-material/NorthEastRounded";
import type { SxProps, Theme } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, DashboardCard, InputField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { rolesIconBox, rolesPageWrapper } from "../roles/roles.styles";
import { pageWrapper } from "../companies/overview.styles";
import {
  payToPlatformActionsSx,
  payToPlatformAmountSx,
  payToPlatformCardHeaderSx,
  payToPlatformCardSx,
  payToPlatformGridThreeSx,
  payToPlatformHeaderWrapSx,
  payToPlatformMetaSx,
  payToPlatformStatCardSx,
  payToPlatformStatIconWrapSx,
  payToPlatformStatsGridSx,
  payToPlatformSubtextSx,
  payToPlatformUploadBoxSx,
} from "./pay-to-platform-dashboard.styles";

const PAY_TO_PLATFORM_STATS = [
  { id: "total", label: "Total Payable", amount: "$12,9283", meta: "Awaiting QA", tone: "blue" as const },
  { id: "paid", label: "Paid", amount: "$32,9283", meta: "Completed", tone: "orange" as const },
  { id: "remaining", label: "Remaining", amount: "$34,928", meta: "Chats open", tone: "rose" as const },
];

export default function PayToPlatformDashboardPage() {
  const theme = useTheme() as AppTheme;
  const [invoiceSelect, setInvoiceSelect] = useState("Jeera");
  const [amount, setAmount] = useState("rajasaifali125@gmail.com");
  const [paymentMethod, setPaymentMethod] = useState("+9203139399237");
  const [transactionId, setTransactionId] = useState("Jeera");

  return (
    <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>
      <Box sx={payToPlatformHeaderWrapSx}>
        <Typography variant="regularLarge" fontWeight={700} color="white">
          Pay to Platform
        </Typography>
        <Typography variant="body2" sx={payToPlatformSubtextSx}>
          Generate and distribute licenses to client companies
        </Typography>
      </Box>

      <Box sx={payToPlatformStatsGridSx}>
        {PAY_TO_PLATFORM_STATS.map((card) => (
          <DashboardCard key={card.id} sx={payToPlatformStatCardSx}>
            <Box sx={payToPlatformStatIconWrapSx(card.tone)}>
              <BarChartRounded sx={{ fontSize: 18 }} />
            </Box>
            <Typography variant="medium" color="white" sx={{ mt: 0.15 }}>
              {card.label}
            </Typography>
            <Typography variant="regularLarge" fontWeight={700} sx={payToPlatformAmountSx}>
              {card.amount}
            </Typography>
            <Typography variant="small" sx={payToPlatformMetaSx}>
              <NorthEastRounded sx={{ fontSize: 14, color: "success.main" }} />
              {card.meta}
            </Typography>
          </DashboardCard>
        ))}
      </Box>

      <DashboardCard sx={payToPlatformCardSx}>
        <Box sx={payToPlatformCardHeaderSx}>
          <Box sx={rolesIconBox}>
            <BlurOnRounded sx={{ fontSize: 18, color: theme.app.dashboard.white95 }} />
          </Box>
          <Typography variant="mediumLarge" color="white" fontWeight={600}>
            Pay Out Detail
          </Typography>
        </Box>

        <Box sx={payToPlatformGridThreeSx}>
          <InputField label="Invoice Select" value={invoiceSelect} onChange={(e) => setInvoiceSelect(e.target.value)} sx={{ "& .MuiFormHelperText-root": { display: "none" } }} />
          <InputField label="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} sx={{ "& .MuiFormHelperText-root": { display: "none" } }} />
          <InputField label="Payment Method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} sx={{ "& .MuiFormHelperText-root": { display: "none" } }} />
        </Box>

        <InputField label="Transaction ID" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} sx={{ "& .MuiFormHelperText-root": { display: "none" } }} />

        <Box>
          <Typography variant="mediumLarge" sx={{ mb: 0.75 }} color="white">
            Upload Receipt
          </Typography>
          <Box sx={payToPlatformUploadBoxSx}>
            <CloudUploadOutlined sx={{ fontSize: 22, color: "primary.main" }} />
            <Typography variant="medium">Click to upload video</Typography>
            <Typography variant="small">Max 10 MB files are allowed</Typography>
          </Box>
        </Box>

        <Box sx={payToPlatformActionsSx}>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
          <Button type="button" variant="primary" sx={gradientPrimaryButtonSx}>
            Submit Payout
          </Button>
        </Box>
      </DashboardCard>
    </Box>
  );
}
