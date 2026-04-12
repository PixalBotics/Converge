"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Add from "@mui/icons-material/Add";
import MoreVert from "@mui/icons-material/MoreVert";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { alpha } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  DashboardCard,
  DataTable,
  FilterButton,
  SearchBar,
  TablePagination,
  Typography,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  integrationsCardTitleRow,
  integrationsCardToolbar,
  integrationsFooterRow,
  integrationsHeaderActions,
  integrationsMainCardSx,
  integrationsPageHeader,
  integrationsPageWrapper,
  integrationsPaginationWrapper,
  integrationsSearchFieldWrapper,
  integrationsSearchRow,
  integrationsSectionIconBox,
} from "../integrations/integrations.styles";

interface WidgetRow extends Record<string, unknown> {
  id: string;
  clientOf: string;
  parentCompany: string;
  childCompany: string;
  website: string;
  widgetType: string;
  department: string;
  status: "Active" | "Inactive";
  scriptStatus: "Installed" | "Pending";
}

const TOTAL_ENTRIES = 256_000;
const PAGE_COUNT = 2;

function formatEntries(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

const TABLE_ROWS: WidgetRow[] = Array.from({ length: 18 }, (_, i) => ({
  id: String(i + 1),
  clientOf: "Raja Saif",
  parentCompany: "Global Industries",
  childCompany: "Acme Tech",
  website: "actech.com",
  widgetType: "Chat",
  department: "Sales",
  status: "Active",
  scriptStatus: "Installed",
}));

export default function ChatWidgetPage() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return TABLE_ROWS;
    return TABLE_ROWS.filter((row) =>
      [
        row.clientOf,
        row.parentCompany,
        row.childCompany,
        row.website,
        row.widgetType,
        row.department,
        row.status,
        row.scriptStatus,
      ].some((field) => String(field).toLowerCase().includes(q))
    );
  }, [search]);

  const columns = useMemo<DataTableColumn<WidgetRow>[]>(
    () => [
      { id: "clientOf", label: "Client Of" },
      { id: "parentCompany", label: "Parent Company", cellVariant: "muted" },
      { id: "childCompany", label: "Child Company", cellVariant: "muted" },
      { id: "website", label: "Website", cellVariant: "muted" },
      { id: "widgetType", label: "Widget Type", cellVariant: "muted" },
      { id: "department", label: "Department", cellVariant: "muted" },
      {
        id: "status",
        label: "Status",
        render: (_v, row) => (
          <Box
            component="span"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              px: 1.1,
              py: 0.45,
              borderRadius: "9999px",
              bgcolor: alpha(theme.palette.success.main, 0.12),
              border: `1px solid ${alpha(theme.palette.success.main, 0.28)}`,
              lineHeight: 1,
            }}
          >
            <Box
              component="span"
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                bgcolor: theme.app.dashboard.accentGreen,
                flexShrink: 0,
              }}
            />
            <Typography component="span" variant="body2" sx={{ color: theme.palette.success.light, fontWeight: 600, fontSize: "0.75rem" }}>
              {row.status}
            </Typography>
          </Box>
        ),
      },
      {
        id: "scriptStatus",
        label: "Script Status",
        render: (_v, row) => (
          <Typography component="span" variant="body2" sx={{ color: theme.app.dashboard.accentGreen, fontWeight: 600 }}>
            {row.scriptStatus}
          </Typography>
        ),
      },
    ],
    [theme]
  );

  return (
    <Box sx={integrationsPageWrapper}>
      <Box sx={integrationsPageHeader}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} color="white" sx={{ mb: 0.5 }}>
            Widget Management
          </Typography>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 640 }}>
            Connect your Meta Business assets to streamline your workflow and data sync.
          </Typography>
        </Box>
        <Box sx={integrationsHeaderActions}>
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            startIcon={<Add sx={{ fontSize: 20 }} />}
            onClick={() => router.push("/dashboard/chat-widget/add")}
          >
            Add Widget
          </Button>
        </Box>
      </Box>

      <DashboardCard sx={integrationsMainCardSx}>
        <Box sx={integrationsCardToolbar}>
          <Box sx={integrationsCardTitleRow}>
            <Box sx={integrationsSectionIconBox} aria-hidden>
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
            <Typography variant="mediumLarge" color="white" fontWeight={600} sx={{ textAlign: "left" }}>
              All Widgets
            </Typography>
          </Box>
          <Box sx={integrationsSearchRow}>
            <Box sx={integrationsSearchFieldWrapper}>
              <SearchBar value={search} onChange={setSearch} placeholder="Search anything..." sx={{ minWidth: "100%" }} />
            </Box>
            <FilterButton sx={{ whiteSpace: "nowrap", alignSelf: { xs: "stretch", sm: "center" } }} />
          </Box>
        </Box>

        <DataTable<WidgetRow>
          columns={columns}
          rows={filteredRows}
          getRowId={(row) => row.id}
          minWidth={1380}
          size="medium"
          actionColumn={{
            label: "Actions",
            render: () => (
              <IconButton
                type="button"
                size="small"
                aria-label="Widget row actions"
                sx={{ color: theme.app.dashboard.iconMuted, "&:hover": { color: theme.app.text.primary } }}
              >
                <MoreVert fontSize="small" />
              </IconButton>
            ),
          }}
        />

        <Box sx={integrationsFooterRow}>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
            Showing data 1 to {filteredRows.length} of {formatEntries(TOTAL_ENTRIES)} entries
          </Typography>
          <Box sx={integrationsPaginationWrapper}>
            <TablePagination page={page} pageCount={PAGE_COUNT} onPageChange={setPage} />
          </Box>
        </Box>
      </DashboardCard>
    </Box>
  );
}
