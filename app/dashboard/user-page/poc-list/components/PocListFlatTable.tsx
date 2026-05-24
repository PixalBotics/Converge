"use client";

import { useMemo } from "react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Link from "@mui/material/Link";
import { DataTable, type DataTableColumn } from "@/components/common";
import type { AppTheme } from "@/theme/theme";
import type { PocListRow } from "../page";

function pocInitials(name: string): string {
  const parts = name
    .split(/\s+/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return "P";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

type Props = {
  theme: AppTheme;
  rows: PocListRow[];
};

export function PocListFlatTable({ theme, rows }: Props) {
  const columns = useMemo<DataTableColumn<PocListRow>[]>(
    () => [
      {
        id: "pocName",
        label: "POC",
        render: (_value, row) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                fontSize: 12,
                fontWeight: 700,
                bgcolor: theme.app.dashboard.buttonIndigo,
              }}
            >
              {pocInitials(row.pocName)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Box component="span" sx={{ color: "white", fontWeight: 600, fontSize: 14 }}>
                {row.pocName}
              </Box>
            </Box>
          </Box>
        ),
      },
      {
        id: "pocEmail",
        label: "Email",
        render: (value) => {
          const email = String(value ?? "").trim();
          if (!email || email === "—") return "—";
          return (
            <Link href={`mailto:${email}`} sx={{ color: theme.app.dashboard.accentBlue, fontSize: 14 }}>
              {email}
            </Link>
          );
        },
      },
      { id: "childCompanyName", label: "Child company" },
      { id: "parentCompanyName", label: "Parent", cellVariant: "muted" },
      { id: "resellerName", label: "Reseller", cellVariant: "muted" },
      { id: "departmentName", label: "Department", cellVariant: "muted" },
    ],
    [theme],
  );

  return (
    <Box sx={{ width: "100%", overflowX: "auto" }}>
      <DataTable<PocListRow>
        columns={columns}
        rows={rows}
        getRowId={(r) => r.companyContactId}
        minWidth={960}
      />
    </Box>
  );
}
