"use client";

import { useMemo, useState } from "react";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import MoreVert from "@mui/icons-material/MoreVert";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { alpha } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  AddSocialMediaModal,
  Button,
  DashboardCard,
  DataTable,
  DisconnectConfirmModal,
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
} from "./integrations.styles";

interface SocialIntegrationRow extends Record<string, unknown> {
  id: string;
  parentCompany: string;
  childCompany: string;
  website: string;
  platform: string;
  accountName: string;
  connectedDate: string;
}

const TOTAL_ENTRIES = 256_000;
const PAGE_COUNT = 2;

function formatEntries(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

const TABLE_ROWS: SocialIntegrationRow[] = [
  {
    id: "1",
    parentCompany: "Alpha Enterprise",
    childCompany: "Alpha - Retail",
    website: "www.alpha-retail.com",
    platform: "Facebook",
    accountName: "Alpha Retail Page",
    connectedDate: "Jan 12, 2025",
  },
  {
    id: "2",
    parentCompany: "National Group",
    childCompany: "Nation - Media",
    website: "www.nationalmedia.io",
    platform: "Instagram",
    accountName: "@national.media",
    connectedDate: "Jan 10, 2025",
  },
  {
    id: "3",
    parentCompany: "Vertex Holdings",
    childCompany: "Vertex - Labs",
    website: "www.vertexlabs.com",
    platform: "WhatsApp Business",
    accountName: "+1 415 555 0192",
    connectedDate: "Jan 08, 2025",
  },
  {
    id: "4",
    parentCompany: "BluePeak Media",
    childCompany: "BluePeak - Studio",
    website: "www.bluepeak.co",
    platform: "LinkedIn",
    accountName: "BluePeak Company",
    connectedDate: "Jan 05, 2025",
  },
  {
    id: "5",
    parentCompany: "CloudForge",
    childCompany: "CloudForge - Dev",
    website: "www.cloudforge.dev",
    platform: "Facebook",
    accountName: "CloudForge Dev",
    connectedDate: "Jan 03, 2025",
  },
  {
    id: "6",
    parentCompany: "DataNest AI",
    childCompany: "DataNest - Analytics",
    website: "www.datanest.ai",
    platform: "Instagram",
    accountName: "@datanest.ai",
    connectedDate: "Dec 28, 2024",
  },
  {
    id: "7",
    parentCompany: "PixelWorks",
    childCompany: "PixelWorks - Studio",
    website: "www.pixelworks.co",
    platform: "YouTube",
    accountName: "PixelWorks Channel",
    connectedDate: "Dec 22, 2024",
  },
  {
    id: "8",
    parentCompany: "Northwind Labs",
    childCompany: "Northwind - R&D",
    website: "www.northwind.io",
    platform: "X (Twitter)",
    accountName: "@NorthwindLabs",
    connectedDate: "Dec 18, 2024",
  },
];

export default function IntegrationsPage() {
  const theme = useTheme() as AppTheme;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [addSocialOpen, setAddSocialOpen] = useState(false);
  const [disconnectOpen, setDisconnectOpen] = useState(false);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return TABLE_ROWS;
    return TABLE_ROWS.filter((row) =>
      [
        row.parentCompany,
        row.childCompany,
        row.website,
        row.platform,
        row.accountName,
        row.connectedDate,
      ].some((field) => field.toLowerCase().includes(q))
    );
  }, [search]);

  const columns = useMemo<DataTableColumn<SocialIntegrationRow>[]>(
    () => [
      { id: "parentCompany", label: "Parent Company" },
      { id: "childCompany", label: "Child Company" },
      { id: "website", label: "Website", cellVariant: "muted" },
      { id: "platform", label: "Platform" },
      { id: "accountName", label: "Account Name", cellVariant: "muted" },
      { id: "connectedDate", label: "Connected Date", cellVariant: "muted" },
      {
        id: "status",
        label: "Status",
        render: () => (
          <Box
            component="span"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              px: 1.25,
              py: 0.5,
              borderRadius: "9999px",
              bgcolor: alpha(theme.palette.success.main, 0.12),
              border: `1px solid ${alpha(theme.palette.success.main, 0.28)}`,
            }}
          >
            <Box
              component="span"
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: theme.app.dashboard.accentGreen,
                flexShrink: 0,
              }}
            />
            <Typography
              component="span"
              variant="body2"
              sx={{
                color: theme.palette.success.light,
                fontWeight: 600,
                fontSize: "0.8125rem",
              }}
            >
              Online
            </Typography>
          </Box>
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
            All social media integrations.
          </Typography>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 560 }}>
            Connect your Meta Business assets to streamline your workflow and data sync.
          </Typography>
        </Box>
        <Box sx={integrationsHeaderActions}>
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            startIcon={<AutoAwesome sx={{ fontSize: 18 }} />}
            onClick={() => setAddSocialOpen(true)}
          >
            Add Social Media
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
              All social media integrations.
            </Typography>
          </Box>
          <Box sx={integrationsSearchRow}>
            <Box sx={integrationsSearchFieldWrapper}>
              <SearchBar value={search} onChange={setSearch} placeholder="Search anything..." sx={{ minWidth: "100%" }} />
            </Box>
            <FilterButton sx={{ whiteSpace: "nowrap", alignSelf: { xs: "stretch", sm: "center" } }} />
          </Box>
        </Box>

        <DataTable<SocialIntegrationRow>
          columns={columns}
          rows={filteredRows}
          getRowId={(row) => row.id}
          minWidth={1280}
          size="medium"
          actionColumn={{
            label: "Actions",
            render: () => (
              <IconButton
                type="button"
                size="small"
                aria-label="Disconnect integration"
                onClick={() => setDisconnectOpen(true)}
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

      <AddSocialMediaModal open={addSocialOpen} onClose={() => setAddSocialOpen(false)} />

      <DisconnectConfirmModal
        open={disconnectOpen}
        onDismiss={() => setDisconnectOpen(false)}
        onConfirm={() => setDisconnectOpen(false)}
      />
    </Box>
  );
}
