"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import type { CompaniesData, CompanyTreeParent, PaginatedCompaniesTreeData } from "@/api/types/companies.types";
import { Button, Typography } from "@/components/common";
import { useCompaniesByResellerQuery } from "@/lib/hooks/query";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { pageHeaderRow, pageWrapper } from "../overview.styles";
import { departmentsCard } from "../../website-assigning/website-assigning.styles";

function isTreeData(d: CompaniesData): d is PaginatedCompaniesTreeData {
  return "view" in d && d.view === "tree";
}

function detailCardSx(theme: AppTheme) {
  return {
    ...departmentsCard,
    p: { xs: 2, sm: 2.5 },
    borderRadius: "14px",
    border: `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.95)}`,
    bgcolor: alpha(theme.app.dashboard.white95, 0.035),
  };
}

export function CompanyResellerDetailPageClient() {
  const theme = useTheme() as AppTheme;
  const params = useParams<{ resellerId: string }>();
  const resellerId = decodeURIComponent(String(params?.resellerId ?? "")).trim();

  const listQuery = useCompaniesByResellerQuery(
    resellerId,
    { view: "tree", limit: 100 },
    { enabled: resellerId.length > 0 },
  );

  const raw = listQuery.data?.success ? listQuery.data.data : undefined;
  const tree = raw && isTreeData(raw) ? raw : undefined;
  const block = tree?.items?.[0];
  const reseller = block?.reseller;
  const parentCompanies: CompanyTreeParent[] = block?.parentCompanies ?? [];

  const errorMessage = !listQuery.isError
    ? null
    : extractApiErrorMessageForToast(listQuery.error) ?? "Could not load reseller.";

  if (!resellerId) {
    return (
      <Box sx={pageWrapper}>
        <Typography color="white">Missing reseller.</Typography>
        <Button component={Link} href="/dashboard/companies" variant="secondary">
          Back to companies
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={pageWrapper}>
      <Box sx={{ ...pageHeaderRow, alignItems: "flex-start" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, maxWidth: 640 }}>
          <Button
            component={Link}
            href="/dashboard/companies"
            variant="secondary"
            sx={{ alignSelf: "flex-start", minWidth: 0, px: 2 }}
          >
            ← All companies
          </Button>
          <Box>
            <Typography
              component="p"
              sx={{
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: theme.app.dashboard.textMuted,
                mb: 0.75,
              }}
            >
              Reseller · Overview
            </Typography>
            <Typography variant="regularLarge" fontWeight={700} color="white" sx={{ lineHeight: 1.25 }}>
              {reseller?.name ?? (listQuery.isLoading ? "Loading…" : "—")}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mt: 1, lineHeight: 1.55 }}>
              {parentCompanies.length}{" "}
              {parentCompanies.length === 1 ? "parent company" : "parent companies"} linked under this client.
            </Typography>
          </Box>
        </Box>
      </Box>

      {listQuery.isLoading ? (
        <Typography sx={{ color: theme.app.dashboard.textMuted }}>Loading…</Typography>
      ) : null}

      {errorMessage ? (
        <Typography sx={{ color: "rgba(248,113,113,0.95)" }}>{errorMessage}</Typography>
      ) : null}

      {!listQuery.isLoading && reseller && parentCompanies.length === 0 ? (
        <Typography sx={{ color: theme.app.dashboard.textMuted }}>
          No parent companies found for this reseller.
        </Typography>
      ) : null}

      {parentCompanies.length > 0 ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
            gap: 2,
          }}
        >
          {parentCompanies.map((p) => {
            const childN = Array.isArray(p.childCompanies) ? p.childCompanies.length : 0;
            const detailHref = `/dashboard/companies/parent/${encodeURIComponent(p.id)}/detail`;
            const editHref = `/dashboard/companies/${encodeURIComponent(p.id)}/edit?step=1`;
            return (
              <Box key={p.id} sx={detailCardSx(theme)}>
                <Typography sx={{ color: theme.app.dashboard.white95, fontWeight: 600, fontSize: "1.05rem", mb: 0.5 }}>
                  {p.name}
                </Typography>
                <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 2 }}>
                  {childN === 0
                    ? "No child companies"
                    : childN === 1
                      ? "1 child company"
                      : `${childN} child companies`}
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  <Button component={Link} href={detailHref} variant="secondary" size="small">
                    Detail
                  </Button>
                  <Button component={Link} href={editHref} variant="primary" size="small">
                    Edit
                  </Button>
                </Box>
              </Box>
            );
          })}
        </Box>
      ) : null}
    </Box>
  );
}
