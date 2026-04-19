"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import type { ParentCompanyChildDetail } from "@/api/types/companies.types";
import { Button, Typography } from "@/components/common";
import { useParentCompanyQuery } from "@/lib/hooks/query";
import { normalizePocsFromCarrier } from "@/lib/companies/parent-detail-pocs";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { CompanyPocSummaryBlock } from "./CompanyPocSummaryBlock";
import { pageHeaderRow, pageWrapper } from "../overview.styles";
import { departmentsCard } from "../../website-assigning/website-assigning.styles";

function formatDate(iso?: string) {
  if (!iso?.trim()) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function detailCardSx(theme: AppTheme) {
  return {
    ...departmentsCard,
    p: { xs: 2, sm: 2.75 },
    borderRadius: "16px",
    border: `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.95)}`,
    bgcolor: alpha(theme.app.dashboard.white95, 0.035),
    boxShadow: `0 12px 40px ${alpha("#000", 0.25)}`,
  };
}

export function CompanyParentDetailPageClient() {
  const theme = useTheme() as AppTheme;
  const params = useParams<{ parentId: string }>();
  const parentId = decodeURIComponent(String(params?.parentId ?? "")).trim();

  const parentQuery = useParentCompanyQuery(parentId, { enabled: parentId.length > 0 });
  const detail = parentQuery.data?.success ? parentQuery.data.data : undefined;
  const parent = detail?.parentCompany;

  const editHref =
    parentId.length > 0
      ? `/dashboard/companies/${encodeURIComponent(parentId)}/edit?step=1`
      : "/dashboard/companies";

  const errorMessage = !parentQuery.isError
    ? null
    : extractApiErrorMessageForToast(parentQuery.error) ?? "Could not load company.";

  if (!parentId) {
    return (
      <Box sx={pageWrapper}>
        <Typography color="white">Missing parent company.</Typography>
        <Button component={Link} href="/dashboard/companies" variant="secondary">
          Back to companies
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={pageWrapper}>
      <Box sx={pageHeaderRow}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, maxWidth: 720 }}>
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
              Parent company · Overview
            </Typography>
            <Typography variant="regularLarge" fontWeight={700} color="white" sx={{ lineHeight: 1.25 }}>
              {parent?.name ?? (parentQuery.isLoading ? "Loading…" : "—")}
            </Typography>
            {parent?.reseller?.name ? (
              <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mt: 1, lineHeight: 1.55 }}>
                Client of reseller{" "}
                <Box component="span" sx={{ color: theme.app.dashboard.white95, fontWeight: 500 }}>
                  {parent.reseller.name}
                </Box>
              </Typography>
            ) : null}
          </Box>
        </Box>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.25, alignItems: "center" }}>
          <Button component={Link} href={editHref} variant="secondary" size="small">
            Edit
          </Button>
        </Box>
      </Box>

      {parentQuery.isLoading ? (
        <Typography sx={{ color: theme.app.dashboard.textMuted }}>Loading…</Typography>
      ) : null}

      {errorMessage ? (
        <Typography sx={{ color: "rgba(248,113,113,0.95)" }}>{errorMessage}</Typography>
      ) : null}

      {detail && parent ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr 320px" },
            gap: 2.5,
            alignItems: "start",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box sx={detailCardSx(theme)}>
              <Typography
                sx={{
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  color: theme.app.dashboard.textMuted,
                  mb: 1.75,
                }}
              >
                Reseller
              </Typography>
              <Typography variant="body1" sx={{ color: theme.app.dashboard.white95, fontWeight: 600 }}>
                {parent.reseller?.name ?? "—"}
              </Typography>
              <Box
                sx={{
                  mt: 2,
                  pt: 2,
                  borderTop: `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.8)}`,
                }}
              >
                <CompanyPocSummaryBlock rows={normalizePocsFromCarrier(parent)} />
              </Box>
            </Box>

            <Box sx={detailCardSx(theme)}>
              <Typography
                sx={{
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  color: theme.app.dashboard.textMuted,
                  mb: 1.75,
                }}
              >
                Child companies
              </Typography>
              {detail.children.length === 0 ? (
                <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                  No child companies under this parent.
                </Typography>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {detail.children.map((child: ParentCompanyChildDetail, index: number) => (
                    <Box
                      key={child.id}
                      sx={{
                        py: 2,
                        borderTop:
                          index > 0 ? `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.55)}` : "none",
                      }}
                    >
                      <Typography sx={{ color: theme.app.dashboard.white95, fontWeight: 600, mb: 0.5 }}>
                        {child.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                        {child.email} · {child.phone}
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mt: 0.75, lineHeight: 1.5 }}>
                        {child.address}
                      </Typography>
                      <Box sx={{ mt: 1.75 }}>
                        <CompanyPocSummaryBlock title="Contact" rows={normalizePocsFromCarrier(child)} />
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>

          <Box sx={{ ...detailCardSx(theme), position: { lg: "sticky" }, top: { lg: 16 } }}>
            <Typography
              sx={{
                fontSize: "0.6875rem",
                fontWeight: 600,
                letterSpacing: "0.06em",
                color: theme.app.dashboard.textMuted,
                mb: 1.5,
              }}
            >
              Snapshot
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box>
                <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block" }}>
                  Children
                </Typography>
                <Typography sx={{ color: theme.app.dashboard.white95, fontWeight: 600, fontSize: "1.5rem" }}>
                  {detail.counts?.children ?? detail.children.length}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block" }}>
                  Parent updated
                </Typography>
                <Typography variant="body2" sx={{ color: theme.app.dashboard.white95 }}>
                  {formatDate(parent.updatedAt)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block" }}>
                  Parent created
                </Typography>
                <Typography variant="body2" sx={{ color: theme.app.dashboard.white95 }}>
                  {formatDate(parent.createdAt)}
                </Typography>
              </Box>
            </Box>
            <Button component={Link} href={editHref} variant="primary" fullWidth sx={{ mt: 2.5 }}>
              Edit company
            </Button>
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}
