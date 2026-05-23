"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { DashboardCard, SelectField, Typography } from "@/components/common";
import { emailCard } from "../styles/email-page.styles";
import { useCompaniesSetupResellersQuery } from "@/lib/hooks";
import { pickItemsArray, toIdNameOption } from "@/app/dashboard/user-page/components/add-user-modal.utils";
import { useEmailResellerScope } from "../context/EmailResellerScopeContext";

export function ResellerSelectPanel({ mode = "design" }: { mode?: "design" | "form" }) {
  const { setResellerId } = useEmailResellerScope();
  const [draft, setDraft] = useState("");
  const resellersQuery = useCompaniesSetupResellersQuery({ enabled: true });

  const resellerOptions = useMemo(() => {
    return pickItemsArray(resellersQuery.data)
      .map((row) => toIdNameOption(row))
      .filter((o): o is { value: string; label: string } => o !== null);
  }, [resellersQuery.data]);

  const selectOptions = useMemo(() => {
    if (resellerOptions.length > 0) return resellerOptions;
    return [
      {
        value: "",
        label: resellersQuery.isLoading ? "Loading resellers…" : "No resellers available",
      },
    ];
  }, [resellerOptions, resellersQuery.isLoading]);

  return (
    <DashboardCard sx={emailCard}>
      <Typography variant="mediumLarge" fontWeight={600} sx={{ mb: 0.75 }}>
        Select reseller
      </Typography>
      <Typography variant="medium" sx={{ color: "rgba(255,255,255,0.65)", mb: 2, maxWidth: 560 }}>
        {mode === "design"
          ? "Choose a reseller to edit email design and branding."
          : "Choose a reseller to continue."}
      </Typography>
      {resellersQuery.isLoading ? (
        <Skeleton variant="rounded" height={48} />
      ) : (
        <Box sx={{ maxWidth: 420 }}>
          <SelectField
            label="Reseller"
            value={draft}
            onChange={(value) => {
              setDraft(value);
              if (!value.trim()) return;
              setResellerId(value);
            }}
            options={selectOptions}
          />
        </Box>
      )}
    </DashboardCard>
  );
}
