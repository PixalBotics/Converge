"use client";

import { useEffect, useMemo, useState } from "react";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import NextLink from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { SxProps, Theme } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  DashboardCard,
  DataTable,
  Typography,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import type { WebsiteAssignmentScopeItem } from "@/api/types/website-assignments.types";
import { useWebsiteAssignmentsWebsitesQuery } from "@/lib/hooks";
import {
  websiteAssignmentFooterRow,
  websiteAssignmentHeaderActions,
  websiteAssignmentPageHeader,
  websiteAssignmentPageWrapper,
  websiteAssignmentTableCard,
} from "../../../website-assigning.styles";

const NONE = "none";
const NO_CHILD = "__none__";
const PAGE_LIMIT = 50;

type SiteRow = {
  id: string;
  websiteName: string;
  websiteUrl: string;
  assignedCount: number;
  isFullyAssigned: boolean;
};

function itemToRow(item: WebsiteAssignmentScopeItem): SiteRow {
  return {
    id: item.websiteId,
    websiteName: item.name || "—",
    websiteUrl: item.url || "—",
    assignedCount: item.assignedCount ?? 0,
    isFullyAssigned: Boolean(item.isFullyAssigned),
  };
}

export default function WebsiteSitesByOrgPage() {
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const [page, setPage] = useState(1);
  const params = useParams<{ parentCompanyId: string; childCompanyId: string }>();
  const parentRaw = typeof params?.parentCompanyId === "string" ? params.parentCompanyId : "";
  const childRaw = typeof params?.childCompanyId === "string" ? params.childCompanyId : "";

  const parentCompanyId = parentRaw && parentRaw !== NONE ? decodeURIComponent(parentRaw) : "";
  const childCompanyId =
    childRaw && childRaw !== NO_CHILD && childRaw !== NONE ? decodeURIComponent(childRaw) : "";

  const queryEnabled = parentCompanyId.length > 0 || childCompanyId.length > 0;

  useEffect(() => {
    setPage(1);
  }, [parentCompanyId, childCompanyId]);

  const { data, isLoading, isFetching } = useWebsiteAssignmentsWebsitesQuery(
    {
      page,
      limit: PAGE_LIMIT,
      ...(parentCompanyId ? { parentCompanyId } : {}),
      ...(childCompanyId ? { childCompanyId } : {}),
    },
    { enabled: queryEnabled },
  );

  const payload = data?.data;
  const itemsRaw = payload?.items;
  const items = useMemo(() => (Array.isArray(itemsRaw) ? itemsRaw : []), [itemsRaw]);
  const total = payload?.total ?? items.length;
  const totalPages = Math.max(1, payload?.totalPages ?? 1);
  const rangeStart = items.length === 0 ? 0 : (page - 1) * PAGE_LIMIT + 1;
  const rangeEnd = items.length === 0 ? 0 : (page - 1) * PAGE_LIMIT + items.length;

  const headerTitles = useMemo(() => {
    const first = items[0];
    return {
      parent: first?.parentCompanyName?.trim() || (parentCompanyId ? parentCompanyId : "—"),
      child: first?.childCompanyName?.trim() || (childCompanyId ? childCompanyId : "—"),
      reseller: first?.resellerName?.trim() || "—",
    };
  }, [items, parentCompanyId, childCompanyId]);

  const rows = useMemo(() => items.map(itemToRow), [items]);

  const columns = useMemo<DataTableColumn<SiteRow>[]>(
    () => [
      {
        id: "websiteName",
        label: "Website",
        render: (_, row) => (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.35, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} sx={{ color: theme.app.text.primary }}>
              {row.websiteName}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: theme.app.dashboard.textMuted, wordBreak: "break-all", lineHeight: 1.45 }}
            >
              {row.websiteUrl}
            </Typography>
          </Box>
        ),
      },
      {
        id: "assignedCount",
        label: "Agents",
        render: (value) => (
          <Typography variant="body2" fontWeight={600} sx={{ color: theme.app.text.primary }}>
            {String(value ?? 0)}
          </Typography>
        ),
      },
    ],
    [theme],
  );

  if (!queryEnabled) {
    router.replace("/dashboard/website-assigning");
    return null;
  }

  return (
    <Box sx={websiteAssignmentPageWrapper}>
      <Box sx={websiteAssignmentPageHeader}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} sx={{ color: theme.app.text.primary, mb: 0.5 }}>
            Websites for this organization
          </Typography>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 720 }}>
            Client: {headerTitles.reseller} · Parent: {headerTitles.parent} · Child: {headerTitles.child}
          </Typography>
        </Box>
        <Box sx={websiteAssignmentHeaderActions}>
          <Button
            type="button"
            variant="outlined"
            component={NextLink}
            href="/dashboard/website-assigning"
            startIcon={<ArrowBack sx={{ fontSize: 18 }} />}
          >
            Back to assignment
          </Button>
        </Box>
      </Box>

      <DashboardCard sx={websiteAssignmentTableCard}>
        <Typography variant="mediumLarge" color="white" fontWeight={600} sx={{ mb: 1.5 }}>
          All websites ({total})
        </Typography>
        <DataTable<SiteRow>
          columns={columns}
          rows={rows}
          isLoading={isLoading || isFetching}
          getRowId={(row) => row.id}
          minWidth={640}
          actionColumn={{
            label: "Detail",
            render: (row) => (
              <Link
                component={NextLink}
                href={`/dashboard/website-assigning/website/${encodeURIComponent(row.id)}`}
                sx={{
                  color: theme.palette.primary.main,
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 500,
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Website detail
              </Link>
            ),
          }}
        />
        <Box sx={[websiteAssignmentFooterRow, { flexWrap: "wrap", alignItems: "center" }] as SxProps<Theme>}>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
            {isLoading || isFetching
              ? "Loading…"
              : total === 0
                ? "No websites."
                : `Row ${rangeStart}–${rangeEnd} of ${total} · Page ${page} of ${totalPages}.`}
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button type="button" variant="outlined" size="small" disabled={page <= 1 || isLoading} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Previous
            </Button>
            <Button
              type="button"
              variant="outlined"
              size="small"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </Box>
        </Box>
      </DashboardCard>
    </Box>
  );
}
