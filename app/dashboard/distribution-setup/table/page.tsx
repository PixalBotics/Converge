"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Add from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import MuiLink from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import NextLink from "next/link";
import { useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { filterChromeButtonSx } from "@/components/common/FilterButton/filter-button.styles";
import { resolveSx } from "@/utils/resolveSx";
import { Button, DataTable, SearchBar, TablePagination, Typography } from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { DistributionWizardShell } from "@/components/dashboard/DistributionWizardShell";
import { VisitorInformationPreviewModal } from "@/components/dashboard/VisitorInformationPreviewModal";
import {
  distributionWizardTableSearchWrap,
  distributionWizardTableToolbar,
} from "../wizard.styles";
import {
  integrationsFooterRow,
  integrationsPaginationWrapper,
} from "../../integrations/integrations.styles";

interface DistributionTableRow extends Record<string, unknown> {
  id: string;
  department: string;
  to: string;
  cc: string;
  bcc: string;
  formLabel: string;
  sources: string;
  /** New row from “Add Row”: show empty inputs until filled */
  isDraft?: boolean;
}

function mockDistributionRow(id: string): DistributionTableRow {
  return {
    id,
    department: "Sales",
    to: "sales@company.com",
    cc: "manager@company.com",
    bcc: "admin@company.com",
    formLabel: "Chat Transcript Email",
    sources: "support@abc.com",
  };
}

function createDraftRow(): DistributionTableRow {
  const draftId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : String(Date.now());

  return {
    id: `draft-${draftId}`,
    department: "",
    to: "",
    cc: "",
    bcc: "",
    formLabel: "",
    sources: "",
    isDraft: true,
  };
}

function draftRowHasData(row: DistributionTableRow): boolean {
  return [row.department, row.to, row.cc, row.bcc, row.formLabel, row.sources].some(
    (s) => String(s).trim() !== ""
  );
}

const INITIAL_ROWS: DistributionTableRow[] = Array.from({ length: 15 }, (_, i) =>
  mockDistributionRow(String(i + 1))
);

const PAGE_SIZE = 10;

const TRANSCRIPT_HREF = "/dashboard/distribution-setup/transcript";

function draftFieldSx(theme: AppTheme): SxProps<Theme> {
  return {
    minWidth: { xs: 72, sm: 100 },
    "& .MuiOutlinedInput-root": {
      fontSize: 14,
      backgroundColor: theme.app.dashboard.overlayLight,
    },
    "& .MuiOutlinedInput-input": {
      py: 1,
      color: theme.app.text.primary,
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.app.border.input,
    },
    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.app.border.inputFocus,
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.app.border.inputFocus,
    },
  };
}

export default function DistributionTablePage() {
  const theme = useTheme() as AppTheme;
  const [rows, setRows] = useState<DistributionTableRow[]>(() => [...INITIAL_ROWS]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [visitorPreviewOpen, setVisitorPreviewOpen] = useState(true);

  const dismissVisitorPreview = useCallback(() => {
    setVisitorPreviewOpen(false);
  }, []);

  const updateRowField = useCallback((id: string, field: keyof DistributionTableRow, value: string) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  }, []);

  const handleAddRow = useCallback(() => {
    setRows((prev) => [createDraftRow(), ...prev]);
  }, []);

  /** Draft row: Add click saves row into table when at least one field has text */
  const handleCommitDraftRow = useCallback((id: string) => {
    setRows((prev) => {
      const row = prev.find((r) => r.id === id);
      if (!row?.isDraft || !draftRowHasData(row)) return prev;
      return prev.map((r) => (r.id === id ? { ...r, isDraft: false } : r));
    });
  }, []);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      [row.department, row.to, row.cc, row.bcc, row.sources, row.formLabel].some((cell) =>
        String(cell).toLowerCase().includes(q)
      )
    );
  }, [rows, search]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, page]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const rangeStart = filteredRows.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, filteredRows.length);

  const columns = useMemo<DataTableColumn<DistributionTableRow>[]>(
    () => [
      {
        id: "department",
        label: "Department",
        render: (_v, row) =>
          row.isDraft ? (
            <TextField
              size="small"
              value={row.department}
              onChange={(e) => updateRowField(row.id, "department", e.target.value)}
              placeholder=""
              fullWidth
              variant="outlined"
              sx={draftFieldSx(theme)}
            />
          ) : (
            row.department
          ),
      },
      {
        id: "to",
        label: "To",
        cellVariant: "muted",
        render: (_v, row) =>
          row.isDraft ? (
            <TextField
              size="small"
              value={row.to}
              onChange={(e) => updateRowField(row.id, "to", e.target.value)}
              placeholder=""
              fullWidth
              variant="outlined"
              sx={draftFieldSx(theme)}
            />
          ) : (
            row.to
          ),
      },
      {
        id: "cc",
        label: "CC",
        cellVariant: "muted",
        render: (_v, row) =>
          row.isDraft ? (
            <TextField
              size="small"
              value={row.cc}
              onChange={(e) => updateRowField(row.id, "cc", e.target.value)}
              placeholder=""
              fullWidth
              variant="outlined"
              sx={draftFieldSx(theme)}
            />
          ) : (
            row.cc
          ),
      },
      {
        id: "bcc",
        label: "BCC",
        cellVariant: "muted",
        render: (_v, row) =>
          row.isDraft ? (
            <TextField
              size="small"
              value={row.bcc}
              onChange={(e) => updateRowField(row.id, "bcc", e.target.value)}
              placeholder=""
              fullWidth
              variant="outlined"
              sx={draftFieldSx(theme)}
            />
          ) : (
            row.bcc
          ),
      },
      {
        id: "formLabel",
        label: "Form / CRM Form",
        render: (_v, row) =>
          row.isDraft ? (
            <TextField
              size="small"
              value={row.formLabel}
              onChange={(e) => updateRowField(row.id, "formLabel", e.target.value)}
              placeholder=""
              fullWidth
              variant="outlined"
              sx={draftFieldSx(theme)}
            />
          ) : row.formLabel ? (
            <MuiLink
              component={NextLink}
              href={TRANSCRIPT_HREF}
              underline="hover"
              sx={{
                color: theme.app.dashboard.accentGreen,
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              {row.formLabel}
            </MuiLink>
          ) : (
            "—"
          ),
      },
      {
        id: "sources",
        label: "Sources",
        cellVariant: "muted",
        render: (_v, row) =>
          row.isDraft ? (
            <TextField
              size="small"
              value={row.sources}
              onChange={(e) => updateRowField(row.id, "sources", e.target.value)}
              placeholder=""
              fullWidth
              variant="outlined"
              sx={draftFieldSx(theme)}
            />
          ) : (
            row.sources
          ),
      },
    ],
    [theme, updateRowField]
  );

  const actionColumn = useMemo(
    () => ({
      label: "Add",
      render: (row: DistributionTableRow) =>
        row.isDraft ? (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
            <Button
              type="button"
              variant="primary"
              disabled={!draftRowHasData(row)}
              onClick={() => handleCommitDraftRow(row.id)}
              sx={{
                ...(resolveSx(gradientPrimaryButtonSx, theme) as object),
                minWidth: 72,
                py: 0.75,
                px: 1.5,
                fontSize: 13,
              }}
            >
              Add
            </Button>
          </Box>
        ) : (
          "—"
        ),
    }),
    [handleCommitDraftRow, theme]
  );

  return (
    <>
      <VisitorInformationPreviewModal open={visitorPreviewOpen} onClose={dismissVisitorPreview} />
    <DistributionWizardShell
      step={3}
      cardTitle="Distribution Table"
      subtitle="Connect your workflows with industry-leading CRM sync functionality."
      footer={null}
      cardHeaderRight={
        <Box sx={distributionWizardTableToolbar}>
          <Box sx={distributionWizardTableSearchWrap}>
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search anything..."
              sx={{ minWidth: 0, width: "100%", maxWidth: 400 }}
            />
          </Box>
          <Button
            type="button"
            variant="outlined"
            startIcon={<Add sx={{ fontSize: 20 }} />}
            sx={{ ...resolveSx(filterChromeButtonSx, theme), flexShrink: 0 }}
            onClick={handleAddRow}
          >
            Add Row
          </Button>
        </Box>
      }
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0, width: "100%" }}>
        <DataTable<DistributionTableRow>
          columns={columns}
          rows={paginatedRows}
          getRowId={(row) => row.id}
          actionColumn={actionColumn}
          minWidth={1120}
          size="medium"
        />
        <Box sx={integrationsFooterRow}>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
            Showing data {rangeStart} to {rangeEnd} of {filteredRows.length} entries
          </Typography>
          <Box sx={integrationsPaginationWrapper}>
            <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
          </Box>
        </Box>
      </Box>
    </DistributionWizardShell>
    </>
  );
}
