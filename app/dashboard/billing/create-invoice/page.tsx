"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import BlurOnRounded from "@mui/icons-material/BlurOnRounded";
import type { SxProps, Theme } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import Link from "next/link";
import type { AppTheme } from "@/theme/theme";
import { Button, DashboardCard, InputField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { rolesIconBox } from "../../roles/roles.styles";
import {
  createInvoiceActionsSx,
  createInvoiceCardHeaderSx,
  createInvoiceCardSx,
  createInvoiceGridThreeSx,
  createInvoiceGridTwoSx,
  createInvoiceHeaderActionsSx,
  createInvoiceHeaderSx,
  createInvoicePageWrapperSx,
  createInvoiceSubtextSx,
} from "./create-invoice.styles";

export default function CreateInvoicePage() {
  const theme = useTheme() as AppTheme;
  const [reseller, setReseller] = useState("Joera");
  const [parentCompany, setParentCompany] = useState("rajasafialf125@gmail.com");
  const [childCompany, setChildCompany] = useState("+9203139399237");
  const [website, setWebsite] = useState("Your Address Here");
  const [invoiceId, setInvoiceId] = useState("Joera");
  const [billingPeriod, setBillingPeriod] = useState("rajasafialf125@gmail.com");
  const [totalChats, setTotalChats] = useState("+9203139399237");
  const [billableChats, setBillableChats] = useState("Joera");
  const [costPerChat, setCostPerChat] = useState("rajasafialf125@gmail.com");
  const [extraCharges, setExtraCharges] = useState("+9203139399237");
  const [discount, setDiscount] = useState("Joera");
  const [totalAmount, setTotalAmount] = useState("rajasafialf125@gmail.com");

  return (
    <Box sx={createInvoicePageWrapperSx}>
      <Box sx={createInvoiceHeaderSx}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} color="white">
            Create Invoice
          </Typography>
          <Typography variant="body2" sx={createInvoiceSubtextSx}>
            Generate and distribute licenses to client companies
          </Typography>
        </Box>
        <Box sx={createInvoiceHeaderActionsSx}>
          <Button type="button" component={Link} href="/dashboard/billing/client-invoice" variant="primary" sx={gradientPrimaryButtonSx}>
            Client
          </Button>
          <Button type="button" component={Link} href="/dashboard/billing/create-invoice" variant="primary" sx={gradientPrimaryButtonSx}>
            Reseller
          </Button>
        </Box>
      </Box>

      <DashboardCard sx={createInvoiceCardSx}>
        <Box sx={createInvoiceCardHeaderSx}>
          <Box sx={rolesIconBox}>
            <BlurOnRounded sx={{ fontSize: 18, color: theme.app.dashboard.white95 }} />
          </Box>
          <Typography variant="mediumLarge" color="white" fontWeight={600}>
            Client Details
          </Typography>
        </Box>

        <Box sx={createInvoiceGridThreeSx}>
          <InputField label="Reseller" value={reseller} onChange={(e) => setReseller(e.target.value)} sx={{ "& .MuiFormHelperText-root": { display: "none" } }} />
          <InputField label="Parent Company" value={parentCompany} onChange={(e) => setParentCompany(e.target.value)} sx={{ "& .MuiFormHelperText-root": { display: "none" } }} />
          <InputField label="Child Company" value={childCompany} onChange={(e) => setChildCompany(e.target.value)} sx={{ "& .MuiFormHelperText-root": { display: "none" } }} />
        </Box>
        <InputField label="Website (Required)" value={website} onChange={(e) => setWebsite(e.target.value)} sx={{ "& .MuiFormHelperText-root": { display: "none" } }} />
      </DashboardCard>

      <DashboardCard sx={createInvoiceCardSx}>
        <Box sx={createInvoiceCardHeaderSx}>
          <Box sx={rolesIconBox}>
            <BlurOnRounded sx={{ fontSize: 18, color: theme.app.dashboard.white95 }} />
          </Box>
          <Typography variant="mediumLarge" color="white" fontWeight={600}>
            Billing
          </Typography>
        </Box>

        <Box sx={createInvoiceGridThreeSx}>
          <InputField label="Invoice ID" value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)} sx={{ "& .MuiFormHelperText-root": { display: "none" } }} />
          <InputField label="Billing Period (From - To)" value={billingPeriod} onChange={(e) => setBillingPeriod(e.target.value)} sx={{ "& .MuiFormHelperText-root": { display: "none" } }} />
          <InputField label="Total Chats" value={totalChats} onChange={(e) => setTotalChats(e.target.value)} sx={{ "& .MuiFormHelperText-root": { display: "none" } }} />
          <InputField label="Billable Chats" value={billableChats} onChange={(e) => setBillableChats(e.target.value)} sx={{ "& .MuiFormHelperText-root": { display: "none" } }} />
          <InputField label="Cost Per Chat" value={costPerChat} onChange={(e) => setCostPerChat(e.target.value)} sx={{ "& .MuiFormHelperText-root": { display: "none" } }} />
          <InputField label="Extra Charges" value={extraCharges} onChange={(e) => setExtraCharges(e.target.value)} sx={{ "& .MuiFormHelperText-root": { display: "none" } }} />
        </Box>

        <Box sx={createInvoiceGridTwoSx}>
          <InputField label="Discount" value={discount} onChange={(e) => setDiscount(e.target.value)} sx={{ "& .MuiFormHelperText-root": { display: "none" } }} />
          <InputField label="Total Amount (Auto)" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} sx={{ "& .MuiFormHelperText-root": { display: "none" } }} />
        </Box>

        <Box sx={createInvoiceActionsSx}>
          <Button type="button" variant="secondary">
            Send Invoice
          </Button>
          <Button type="button" variant="primary" sx={gradientPrimaryButtonSx}>
            Save
          </Button>
        </Box>
      </DashboardCard>
    </Box>
  );
}
