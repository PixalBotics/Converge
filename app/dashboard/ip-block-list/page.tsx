"use client";

import { useCallback, useMemo, useState } from "react";
import Add from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import MuiLink from "@mui/material/Link";
import { alpha } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  Checkbox,
  DashboardCard,
  DataTable,
  EditIpBlockModal,
  FilterButton,
  UnblockIpConfirmModal,
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

interface IpBlockRow extends Record<string, unknown> {
  id: string;
  clientInfo: string;
  website: string;
  ipAddress: string;
  blockedDate: string;
  blockedBy: string;
}

const TOTAL_ENTRIES = 256_000;
const PAGE_COUNT = 2;

function formatEntries(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

function mockIpBlockRow(id: string): IpBlockRow {
  return {
    id,
    clientInfo: "Reseller A",
    website: "abc.pk",
    ipAddress: "192.168.1.1.0",
    blockedDate: "12 Mar 2026",
    blockedBy: "System Admin",
  };
}

const TABLE_ROWS: IpBlockRow[] = Array.from({ length: 18 }, (_, i) => mockIpBlockRow(String(i + 1)));

export default function IpBlockListPage() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editOpen, setEditOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<IpBlockRow | null>(null);
  const [unblockOpen, setUnblockOpen] = useState(false);
  const [unblockRow, setUnblockRow] = useState<IpBlockRow | null>(null);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return TABLE_ROWS;
    return TABLE_ROWS.filter((row) =>
      [row.clientInfo, row.website, row.ipAddress, row.blockedDate, row.blockedBy].some((field) =>
        String(field).toLowerCase().includes(q)
      )
    );
  }, [search]);

  const allFilteredSelected =
    filteredRows.length > 0 && filteredRows.every((r) => selected.has(r.id));
  const someFilteredSelected = filteredRows.some((r) => selected.has(r.id));

  const toggleAll = useCallback(() => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filteredRows.forEach((r) => next.delete(r.id));
      } else {
        filteredRows.forEach((r) => next.add(r.id));
      }
      return next;
    });
  }, [allFilteredSelected, filteredRows]);

  const toggleRow = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleCloseEdit = useCallback(() => {
    setEditOpen(false);
    setEditingRow(null);
  }, []);

  const handleCloseUnblock = useCallback(() => {
    setUnblockOpen(false);
    setUnblockRow(null);
  }, []);

  const columns = useMemo<DataTableColumn<IpBlockRow>[]>(
    () => [
      {
        id: "_select",
        label: "",
        headerRender: () => (
          <Checkbox
            size="small"
            checked={allFilteredSelected}
            indeterminate={someFilteredSelected && !allFilteredSelected}
            onChange={toggleAll}
            inputProps={{ "aria-label": "Select all rows" }}
            sx={{ p: 0 }}
          />
        ),
        render: (_v, row) => (
          <Checkbox
            size="small"
            checked={selected.has(row.id)}
            onChange={() => toggleRow(row.id)}
            inputProps={{ "aria-label": `Select row ${row.id}` }}
            sx={{ p: 0 }}
          />
        ),
      },
      { id: "clientInfo", label: "Client Info" },
      { id: "website", label: "Website", cellVariant: "muted" },
      { id: "ipAddress", label: "IP Address", cellVariant: "muted" },
      { id: "blockedDate", label: "Blocked Date", cellVariant: "muted" },
      { id: "blockedBy", label: "Blocked By", cellVariant: "muted" },
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
              bgcolor: alpha(theme.palette.success.main, theme.palette.mode === "light" ? 0.16 : 0.12),
              border: `1px solid ${alpha(theme.palette.success.main, theme.palette.mode === "light" ? 0.3 : 0.28)}`,
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
                color: theme.palette.mode === "light" ? "#166534" : theme.palette.success.light,
                fontWeight: 600,
                fontSize: "0.8125rem",
              }}
            >
              Active
            </Typography>
          </Box>
        ),
      },
    ],
    [theme, allFilteredSelected, someFilteredSelected, toggleAll, toggleRow, selected]
  );

  return (
    <Box sx={integrationsPageWrapper}>
      <Box sx={integrationsPageHeader}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} color="white" sx={{ mb: 0.5 }}>
            IP Block List
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
            startIcon={<Add sx={{ fontSize: 20 }} />}
            onClick={() => router.push("/dashboard/ip-block-list/add")}
          >
            Add IP Block
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
              IP Block List
            </Typography>
          </Box>
          <Box sx={integrationsSearchRow}>
            <Box sx={integrationsSearchFieldWrapper}>
              <SearchBar value={search} onChange={setSearch} placeholder="Search anything..." sx={{ minWidth: "100%" }} />
            </Box>
            <FilterButton sx={{ whiteSpace: "nowrap", alignSelf: { xs: "stretch", sm: "center" } }} />
          </Box>
        </Box>

        <DataTable<IpBlockRow>
          columns={columns}
          rows={filteredRows}
          getRowId={(row) => row.id}
          minWidth={1280}
          size="medium"
          actionColumn={{
            label: "Action",
            render: (row) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                <MuiLink
                  component="button"
                  type="button"
                  underline="hover"
                  onClick={() => {
                    setEditingRow(row);
                    setEditOpen(true);
                  }}
                  sx={{
                    color: theme.app.text.link,
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    border: "none",
                    background: "none",
                    padding: 0,
                    font: "inherit",
                    textAlign: "left",
                  }}
                >
                  Edit
                </MuiLink>
                <MuiLink
                  component="button"
                  type="button"
                  underline="hover"
                  onClick={() => {
                    setUnblockRow(row);
                    setUnblockOpen(true);
                  }}
                  sx={{
                    color: theme.app.text.link,
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    border: "none",
                    background: "none",
                    padding: 0,
                    font: "inherit",
                    textAlign: "left",
                  }}
                >
                  Unblock
                </MuiLink>
              </Box>
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

      <EditIpBlockModal
        open={editOpen}
        onClose={handleCloseEdit}
        initialIpAddress={editingRow?.ipAddress}
        initialReason="Spam Message Detecd"
        initialStatus="block"
      />

      <UnblockIpConfirmModal
        open={unblockOpen}
        onDismiss={handleCloseUnblock}
        onConfirm={() => {
          if (unblockRow) {
            // Wire unblock API with unblockRow.id / ipAddress when backend is ready
          }
          handleCloseUnblock();
        }}
      />
    </Box>
  );
}
