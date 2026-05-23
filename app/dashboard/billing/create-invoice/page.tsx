"use client";

import { useState } from "react";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import Send from "@mui/icons-material/Send";
import Box from "@mui/material/Box";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  DashboardCard,
  InputField,
  SelectField,
  Typography,
} from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  billingCardLastSx,
  billingCardSx,
  billingCardTitleRow,
  billingFooterRow,
  billingFormGrid2,
  billingFormGrid3,
  billingFormGridDiscount,
  billingHeaderActionsSx,
  billingPageHeader,
  billingPageWrapper,
  billingPartyToggleSx,
  billingSectionIconBox,
  billingSendButtonSx,
  billingSubtextSx,
} from "../billing.styles";
import { createInvoicePageWrapperSx } from "./create-invoice.styles";

const RESELLER_OPTIONS = [{ label: "Jeera", value: "jeera" }];
const PARENT_OPTIONS = [{ label: "rajasaifali125@gmail.com", value: "parent-1" }];
const CHILD_OPTIONS = [{ label: "+920313939237", value: "child-1" }];
const PAYMENT_METHOD_OPTIONS = [
  { label: "Bank Transfer", value: "bank-transfer" },
  { label: "Credit Card", value: "credit-card" },
  { label: "PayPal", value: "paypal" },
  { label: "Wire Transfer", value: "wire-transfer" },
];

function BillingSectionHeader({ title, theme }: { title: string; theme: AppTheme }) {
  return (
    <Box sx={billingCardTitleRow}>
      <Box sx={billingSectionIconBox} aria-hidden>
        <Typography
          sx={{
            color: theme.app.dashboard.white95,
            fontWeight: 700,
            fontSize: "1.1rem",
            lineHeight: 1,
          }}
        >
          $
        </Typography>
      </Box>
      <Typography variant="mediumLarge" color="white" fontWeight={600}>
        {title}
      </Typography>
    </Box>
  );
}

function BillingFieldsSection({
  theme,
  invoiceId,
  setInvoiceId,
  billingPeriod,
  setBillingPeriod,
  totalChats,
  setTotalChats,
  billableChats,
  setBillableChats,
  costPerChat,
  setCostPerChat,
  extraCharges,
  setExtraCharges,
  discount,
  setDiscount,
  totalAmount,
  setTotalAmount,
}: {
  theme: AppTheme;
  invoiceId: string;
  setInvoiceId: (v: string) => void;
  billingPeriod: string;
  setBillingPeriod: (v: string) => void;
  totalChats: string;
  setTotalChats: (v: string) => void;
  billableChats: string;
  setBillableChats: (v: string) => void;
  costPerChat: string;
  setCostPerChat: (v: string) => void;
  extraCharges: string;
  setExtraCharges: (v: string) => void;
  discount: string;
  setDiscount: (v: string) => void;
  totalAmount: string;
  setTotalAmount: (v: string) => void;
}) {
  return (
    <DashboardCard sx={billingCardLastSx}>
      <BillingSectionHeader title="Billing" theme={theme} />

      <Box sx={billingFormGrid3}>
        <InputField label="Invoice ID" value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)} />
        <InputField
          label="Billing Period (From - To)"
          value={billingPeriod}
          onChange={(e) => setBillingPeriod(e.target.value)}
        />
        <InputField label="Total Chats" value={totalChats} onChange={(e) => setTotalChats(e.target.value)} />
      </Box>

      <Box sx={billingFormGrid3}>
        <InputField label="Billable Chats" value={billableChats} onChange={(e) => setBillableChats(e.target.value)} />
        <InputField label="Cost Per Chat" value={costPerChat} onChange={(e) => setCostPerChat(e.target.value)} />
        <InputField label="Extra Charges" value={extraCharges} onChange={(e) => setExtraCharges(e.target.value)} />
      </Box>

      <Box sx={billingFormGridDiscount}>
        <InputField label="Discount" value={discount} onChange={(e) => setDiscount(e.target.value)} />
        <InputField
          label="Total Amount (Auto)"
          value={totalAmount}
          onChange={(e) => setTotalAmount(e.target.value)}
        />
      </Box>

      <Box sx={billingFooterRow}>
        <Button type="button" variant="outlined" sx={billingSendButtonSx}>
          Send Invoice
        </Button>
        <Button type="button" variant="primary" sx={gradientPrimaryButtonSx}>
          Save
        </Button>
      </Box>
    </DashboardCard>
  );
}

export default function CreateInvoicePage() {
  const theme = useTheme() as AppTheme;
  const [party, setParty] = useState<"client" | "reseller">("client");

  const [reseller, setReseller] = useState("jeera");
  const [parentCompany, setParentCompany] = useState("parent-1");
  const [childCompany, setChildCompany] = useState("child-1");
  const [clientWebsite, setClientWebsite] = useState("");

  const [resellerName, setResellerName] = useState("Jeera");
  const [resellerWebsite, setResellerWebsite] = useState("rajasaifali125@gmail.com");

  const [paymentMethod, setPaymentMethod] = useState("bank-transfer");
  const [bankName, setBankName] = useState("Borcelle");
  const [accountNumber, setAccountNumber] = useState("123-456-7890");
  const [accountHolder, setAccountHolder] = useState("Morgan Maxwell");

  const [invoiceId, setInvoiceId] = useState("Jeera");
  const [billingPeriod, setBillingPeriod] = useState("rajasaifali125@gmail.com");
  const [totalChats, setTotalChats] = useState("+920313939237");
  const [billableChats, setBillableChats] = useState("Jeera");
  const [costPerChat, setCostPerChat] = useState("rajasaifali125@gmail.com");
  const [extraCharges, setExtraCharges] = useState("+920313939237");
  const [discount, setDiscount] = useState("Jeera");
  const [totalAmount, setTotalAmount] = useState("rajasaifali125@gmail.com");

  const isClient = party === "client";

  const billingFields = (
    <BillingFieldsSection
      theme={theme}
      invoiceId={invoiceId}
      setInvoiceId={setInvoiceId}
      billingPeriod={billingPeriod}
      setBillingPeriod={setBillingPeriod}
      totalChats={totalChats}
      setTotalChats={setTotalChats}
      billableChats={billableChats}
      setBillableChats={setBillableChats}
      costPerChat={costPerChat}
      setCostPerChat={setCostPerChat}
      extraCharges={extraCharges}
      setExtraCharges={setExtraCharges}
      discount={discount}
      setDiscount={setDiscount}
      totalAmount={totalAmount}
      setTotalAmount={setTotalAmount}
    />
  );

  return (
    <Box sx={[billingPageWrapper, createInvoicePageWrapperSx] as const}>
      <Box sx={billingPageHeader}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} color="white" sx={{ mb: 0.5 }}>
            Create Invoice
          </Typography>
          <Typography variant="medium" sx={billingSubtextSx}>
            Generate and distribute licenses to client companies
          </Typography>
        </Box>

        <Box sx={billingHeaderActionsSx}>
          <ToggleButtonGroup
            exclusive
            value={party}
            onChange={(_e, value) => {
              if (value === "client" || value === "reseller") setParty(value);
            }}
            sx={billingPartyToggleSx}
            aria-label="Client or reseller"
          >
            <ToggleButton value="client">
              <AutoAwesome sx={{ fontSize: 16 }} />
              Client
            </ToggleButton>
            <ToggleButton value="reseller">
              <Send sx={{ fontSize: 16 }} />
              Reseller
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {isClient ? (
        <>
          <DashboardCard sx={billingCardSx}>
            <BillingSectionHeader title="Client Details" theme={theme} />
            <Box sx={billingFormGrid3}>
              <SelectField
                label="Reseller"
                value={reseller}
                onChange={setReseller}
                options={RESELLER_OPTIONS}
              />
              <SelectField
                label="Parent Company"
                value={parentCompany}
                onChange={setParentCompany}
                options={PARENT_OPTIONS}
              />
              <SelectField
                label="Child Company"
                value={childCompany}
                onChange={setChildCompany}
                options={CHILD_OPTIONS}
              />
            </Box>
            <InputField
              label="Website (Required)"
              placeholder="Your Address Here"
              value={clientWebsite}
              onChange={(e) => setClientWebsite(e.target.value)}
            />
          </DashboardCard>

          <DashboardCard sx={billingCardSx}>
            <BillingSectionHeader title="Billing Method" theme={theme} />
            <Box sx={billingFormGrid3}>
              <SelectField
                label="Payment Method"
                value={paymentMethod}
                onChange={setPaymentMethod}
                options={PAYMENT_METHOD_OPTIONS}
              />
              <InputField label="Bank Name" value={bankName} onChange={(e) => setBankName(e.target.value)} />
              <InputField
                label="Account Number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </Box>
            <InputField
              label="Account Holder Name"
              placeholder="Account holder full name"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
            />
          </DashboardCard>

          {billingFields}
        </>
      ) : (
        <>
          <DashboardCard sx={billingCardSx}>
            <BillingSectionHeader title="Reseller Details" theme={theme} />
            <Box sx={billingFormGrid2}>
              <InputField
                label="Reseller Name"
                value={resellerName}
                onChange={(e) => setResellerName(e.target.value)}
              />
              <InputField
                label="Website (Recommended)"
                value={resellerWebsite}
                onChange={(e) => setResellerWebsite(e.target.value)}
              />
            </Box>
          </DashboardCard>

          {billingFields}
        </>
      )}
    </Box>
  );
}
