"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import BlurOnRounded from "@mui/icons-material/BlurOnRounded";
import type { AppTheme } from "@/theme/theme";
import { useTheme } from "@mui/material/styles";
import { Button, DashboardCard, InputField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { rolesIconBox } from "../roles/roles.styles";
import {
  createInvoiceActionsSx,
  createInvoiceCardHeaderSx,
  createInvoiceCardSx,
  createInvoiceGridThreeSx,
  createInvoiceGridTwoSx,
  createInvoicePageWrapperSx,
  createInvoiceSubtextSx,
} from "../billing/create-invoice/create-invoice.styles";

export default function InvoiceDetailsPage() {
  const theme = useTheme() as AppTheme;
  const [invoiceId, setInvoiceId] = useState("Jeera");
  const [billingType, setBillingType] = useState("rajasaifali125@gmail.com");
  const [website, setWebsite] = useState("+9203139399237");
  const [parentCompany, setParentCompany] = useState("Jeera");
  const [billingPeriod, setBillingPeriod] = useState("rajasaifali125@gmail.com");
  const [dueDate, setDueDate] = useState("+9203139399237");
  const [discount, setDiscount] = useState("Jeera");
  const [totalAmount, setTotalAmount] = useState("rajasaifali125@gmail.com");

  return (
    <Box sx={createInvoicePageWrapperSx}>
      <Box>
        <Typography variant="regularLarge" fontWeight={700} color="white">
          Invoice Details
        </Typography>
        <Typography variant="body2" sx={createInvoiceSubtextSx}>
          Generate and distribute licenses to client companies
        </Typography>
      </Box>

      <DashboardCard sx={createInvoiceCardSx}>
        <Box sx={createInvoiceCardHeaderSx}>
          <Box sx={rolesIconBox}>
            <BlurOnRounded sx={{ fontSize: 18, color: theme.app.dashboard.white95 }} />
          </Box>
          <Typography variant="mediumLarge" color="white" fontWeight={600}>
            Invoice Details
          </Typography>
        </Box>

        <Box sx={createInvoiceGridThreeSx}>
          <InputField label="Invoice ID" value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)} sx={{ "& .MuiFormHelperText-root": { display: "none" } }} />
          <InputField label="Billing Type" value={billingType} onChange={(e) => setBillingType(e.target.value)} sx={{ "& .MuiFormHelperText-root": { display: "none" } }} />
          <InputField label="Website" value={website} onChange={(e) => setWebsite(e.target.value)} sx={{ "& .MuiFormHelperText-root": { display: "none" } }} />
          <InputField label="Parent Company / Reseller" value={parentCompany} onChange={(e) => setParentCompany(e.target.value)} sx={{ "& .MuiFormHelperText-root": { display: "none" } }} />
          <InputField label="Billing Period" value={billingPeriod} onChange={(e) => setBillingPeriod(e.target.value)} sx={{ "& .MuiFormHelperText-root": { display: "none" } }} />
          <InputField label="Due Date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} sx={{ "& .MuiFormHelperText-root": { display: "none" } }} />
        </Box>

        <Box sx={createInvoiceGridTwoSx}>
          <InputField label="Discount" value={discount} onChange={(e) => setDiscount(e.target.value)} sx={{ "& .MuiFormHelperText-root": { display: "none" } }} />
          <InputField label="Total Amount (Auto)" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} sx={{ "& .MuiFormHelperText-root": { display: "none" } }} />
        </Box>

        <Box sx={createInvoiceActionsSx}>
          <Button type="button" variant="secondary">
            Send Reminder
          </Button>
          <Button type="button" variant="secondary">
            Mark as Paid
          </Button>
          <Button type="button" variant="primary" sx={gradientPrimaryButtonSx}>
            Send Invoice
          </Button>
        </Box>
      </DashboardCard>
    </Box>
  );
}
