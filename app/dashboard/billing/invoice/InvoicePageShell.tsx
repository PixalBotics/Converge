"use client";

import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Link from "next/link";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import { Typography } from "@/components/common";
import { pageWrapper } from "../../companies/overview.styles";
import {
  invoiceBackLinkSx,
  invoicePageHeaderSx,
  invoicePageWrapperSx,
} from "./invoice-shared.styles";

type InvoicePageShellProps = {
  title: string;
  children: ReactNode;
};

export function InvoicePageShell({ title, children }: InvoicePageShellProps) {
  return (
    <Box sx={[pageWrapper, invoicePageWrapperSx]}>
      <Box sx={invoicePageHeaderSx}>
        <Link href="/dashboard/billing" style={{ textDecoration: "none" }}>
          <Box component="span" sx={invoiceBackLinkSx}>
            <ArrowBackRounded sx={{ fontSize: 18 }} />
            Back to Billing
          </Box>
        </Link>
        <Typography variant="regularLarge" fontWeight={700} color="white">
          {title}
        </Typography>
      </Box>
      {children}
    </Box>
  );
}
