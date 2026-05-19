"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Radio from "@mui/material/Radio";
import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import BlurOnRounded from "@mui/icons-material/BlurOnRounded";
import FacebookRounded from "@mui/icons-material/FacebookRounded";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, DashboardCard, InputField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { rolesIconBox } from "../roles/roles.styles";
import {
  processPaymentActionsSx,
  processPaymentCardHeaderSx,
  processPaymentCardSx,
  processPaymentFieldsGridSx,
  processPaymentHeaderRowSx,
  processPaymentMethodGridSx,
  processPaymentMethodIconSx,
  processPaymentMethodItemSx,
  processPaymentMethodTopRowSx,
  processPaymentPageWrapperSx,
  processPaymentSubtextSx,
  processPaymentUploadBoxSx,
} from "./process-payment-dashboard.styles";

const METHOD_OPTIONS = [
  { id: "bank-transfer", title: "Bank Transfer", caption: "Manage pages and ad accounts" },
  { id: "wallet", title: "Wallet", caption: "Manage pages and ad accounts" },
  { id: "card", title: "Card", caption: "Manage pages and ad accounts" },
];

export default function ProcessPaymentDashboardPage() {
  const theme = useTheme() as AppTheme;
  const [method, setMethod] = useState("bank-transfer");
  const [bankTransfer, setBankTransfer] = useState("Jeera");
  const [wallet, setWallet] = useState("rajasaifali125@gmail.com");

  return (
    <Box sx={processPaymentPageWrapperSx}>
      <Box sx={processPaymentHeaderRowSx}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} color="white">
            Process Payment
          </Typography>
          <Typography variant="body2" sx={processPaymentSubtextSx}>
            Complete your transaction securely.
          </Typography>
        </Box>
        <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
          <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted }}>
            Total Amount Due
          </Typography>
          <Typography variant="regularLarge" fontWeight={700} color="white">
            $350.75 USD
          </Typography>
        </Box>
      </Box>

      <DashboardCard sx={processPaymentCardSx}>
        <Box sx={processPaymentCardHeaderSx}>
          <Box sx={rolesIconBox}>
            <BlurOnRounded sx={{ fontSize: 18, color: theme.app.dashboard.white95 }} />
          </Box>
          <Typography variant="mediumLarge" color="white" fontWeight={600}>
            Payment Method
          </Typography>
        </Box>
        <Box sx={processPaymentMethodGridSx}>
          {METHOD_OPTIONS.map((opt) => (
            <DashboardCard key={opt.id} sx={processPaymentMethodItemSx}>
              <Box sx={processPaymentMethodTopRowSx}>
                <Box sx={processPaymentMethodIconSx}>
                  <FacebookRounded sx={{ fontSize: 17 }} />
                </Box>
                <Radio
                  checked={method === opt.id}
                  onChange={() => setMethod(opt.id)}
                  size="small"
                  sx={{ p: 0 }}
                />
              </Box>
              <Typography variant="medium" color="white">
                {opt.title}
              </Typography>
              <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted }}>
                {opt.caption}
              </Typography>
            </DashboardCard>
          ))}
        </Box>
      </DashboardCard>

      <DashboardCard sx={processPaymentCardSx}>
        <Box sx={processPaymentCardHeaderSx}>
          <Box sx={rolesIconBox}>
            <BlurOnRounded sx={{ fontSize: 18, color: theme.app.dashboard.white95 }} />
          </Box>
          <Typography variant="mediumLarge" color="white" fontWeight={600}>
            Details
          </Typography>
        </Box>

        <Box sx={processPaymentFieldsGridSx}>
          <InputField label="Bank Transfer" value={bankTransfer} onChange={(e) => setBankTransfer(e.target.value)} sx={{ "& .MuiFormHelperText-root": { display: "none" } }} />
          <Box sx={{ gridColumn: { xs: "1 / -1", md: "2 / -1" } }}>
            <InputField label="Wallet" value={wallet} onChange={(e) => setWallet(e.target.value)} sx={{ "& .MuiFormHelperText-root": { display: "none" } }} />
          </Box>
        </Box>

        <Box>
          <Typography variant="mediumLarge" sx={{ mb: 0.75 }} color="white">
            Upload Receipt
          </Typography>
          <Box sx={processPaymentUploadBoxSx}>
            <CloudUploadOutlined sx={{ fontSize: 22, color: "primary.main" }} />
            <Typography variant="medium">Click to upload video</Typography>
            <Typography variant="small">Max 10 MB files are allowed</Typography>
          </Box>
        </Box>

        <Box sx={processPaymentActionsSx}>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
          <Button type="button" variant="primary" sx={gradientPrimaryButtonSx}>
            Submit Payment
          </Button>
        </Box>
      </DashboardCard>
    </Box>
  );
}
