"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import { Button } from "@/components/common";

type Props = {
  href?: string;
  label?: string;
  sx?: object;
};

export function BillingBackButton({
  href = "/dashboard/billing",
  label = "← Back to billing",
  sx,
}: Props) {
  return (
    <Box sx={{ mb: 1.5, ...sx }}>
      <Button component={Link} href={href} variant="secondary" size="small">
        {label}
      </Button>
    </Box>
  );
}
