"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Add from "@mui/icons-material/Add";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { filterChromeButtonSx } from "@/components/common/FilterButton/filter-button.styles";
import { resolveSx } from "@/utils/resolveSx";
import { Button, DataTable, SearchBar, TablePagination, Typography } from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { EmailTableActions } from "@/features/email/components/EmailTableActions";
import { DistributionWizardShell } from "@/features/distribution-setup";
import { DistributionSaveDraftButton } from "@/features/distribution-setup/components/DistributionWizardDraftActions";
import { DistributionWizardFooter } from "@/features/distribution-setup/components/DistributionWizardFooter";
import { useDistributionWizardNav } from "@/features/distribution-setup/hooks/useDistributionWizardNav";
import { getEmailFormForWebsite } from "@/api/email/email-forms.api";
import { useDistributionDraftSave } from "@/features/distribution-setup/hooks/useDistributionDraftSave";
import { useDistributionSetupDetailQuery } from "@/features/distribution-setup/hooks/useDistributionSetupMutations";
import {
  createDraftRow,
  detailToTableRows,
  draftRowHasData,
  type DistributionTableRow,
} from "@/features/distribution-setup/utils/map-distribution-rows";
import {
  readWizardEmailFormId,
  readWizardSetupId,
  readWizardSubject,
  readWizardTableRows,
  readWizardWebsite,
  writeWizardEmailFormId,
  writeWizardSetupId,
  writeWizardSubject,
  writeWizardTableRows,
} from "@/features/distribution-setup/wizard-storage";
import { useQuery } from "@tanstack/react-query";
import { DISTRIBUTION_ROUTES } from "@/features/distribution-setup/distribution.constants";
import { publishAppToast } from "@/lib/notify";
import {
  distributionWizardDraftNoticeSx,
  distributionWizardDraftFieldSx,
  distributionWizardTablePanelSx,
  distributionWizardTableSearchWrap,
  distributionWizardTableSx,
  distributionWizardTableToolbar,
} from "../wizard.styles";
import {
  integrationsFooterRow,
  integrationsPaginationWrapper,
} from "../../integrations/integrations.styles";

const PAGE_SIZE = 10;

function RowTextField({
  row,
  field,
  theme,
  updateRowField,
}: {
  row: DistributionTableRow;
  field: keyof Pick<DistributionTableRow, "department" | "to" | "cc" | "bcc">;
  theme: AppTheme;
  updateRowField: (id: string, field: keyof DistributionTableRow, value: string) => void;
}) {
  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <TextField
        size="small"
        value={row[field]}
        onChange={(e) => updateRowField(row.id, field, e.target.value)}
        placeholder={
          field === "department"
            ? "Sales"
            : field === "to"
              ? "team@company.com"
              : field === "cc"
                ? "Optional"
                : "Optional"
        }
        fullWidth
        variant="outlined"
        sx={distributionWizardDraftFieldSx(theme)}
      />
    </Box>
  );
}

export default function DistributionTablePage() {
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const searchParams = useSearchParams();
  const setupIdFromUrl = searchParams.get("setupId")?.trim() || null;
  const setupId = setupIdFromUrl ?? readWizardSetupId();

  const detailQuery = useDistributionSetupDetailQuery(setupId);
  const { publishSetup, saveDraftToServer, saving } = useDistributionDraftSave(setupId);

  const [rows, setRows] = useState<DistributionTableRow[]>(() => {
    const stored = readWizardTableRows();
    return stored?.length ? stored : [createDraftRow()];
  });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hydrated, setHydrated] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const websiteIdForForm = detailQuery.data?.websiteId ?? readWizardWebsite()?.websiteId ?? "";
  const formQuery = useQuery({
    queryKey: ["email-form", websiteIdForForm],
    queryFn: () => getEmailFormForWebsite(websiteIdForForm),
    enabled: Boolean(websiteIdForForm),
  });

  useEffect(() => {
    if (setupIdFromUrl) {
      writeWizardSetupId(setupIdFromUrl);
    }
  }, [setupIdFromUrl]);

  useEffect(() => {
    const website = readWizardWebsite();
    if (!website?.websiteId) {
      router.replace(DISTRIBUTION_ROUTES.configure);
      return;
    }
    if (hydrated) return;

    if (!setupId) {
      const fromSession = readWizardTableRows();
      setRows(fromSession?.length ? fromSession : [createDraftRow()]);
      setHydrated(true);
      return;
    }

    if (detailQuery.data) {
      const fromApi = detailToTableRows(detailQuery.data);
      const fromSession = readWizardTableRows();
      const useSession =
        fromSession?.length &&
        detailQuery.data.departments.length === 0 &&
        fromSession.some((r) => r.department.trim() || r.to.trim());
      setRows(useSession ? fromSession : fromApi);
      if (detailQuery.data.subject) writeWizardSubject(detailQuery.data.subject);
      if (detailQuery.data.emailConfigurationId) {
        writeWizardEmailFormId(detailQuery.data.emailConfigurationId);
      }
      setHydrated(true);
    }
  }, [setupId, detailQuery.data, hydrated, router]);

  useEffect(() => {
    if (hydrated) writeWizardTableRows(rows);
  }, [rows, hydrated]);

  const saveOverrides = useMemo(
    () => ({
      subject: detailQuery.data?.subject ?? readWizardSubject(),
      emailConfigurationId:
        detailQuery.data?.emailConfigurationId ??
        readWizardEmailFormId() ??
        formQuery.data?.id,
      tableRows: rows,
    }),
    [detailQuery.data, formQuery.data?.id, rows],
  );

  const updateRowField = useCallback((id: string, field: keyof DistributionTableRow, value: string) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  }, []);

  const handleAddRow = useCallback(() => {
    setRows((prev) => [createDraftRow(), ...prev]);
  }, []);

  const handleCommitRow = useCallback((id: string) => {
    setRows((prev) => {
      const row = prev.find((r) => r.id === id);
      if (!row || !draftRowHasData(row)) return prev;
      return prev.map((r) => (r.id === id ? { ...r, isDraft: false } : r));
    });
    setEditingId(null);
  }, []);

  const handleRemoveRow = useCallback((id: string) => {
    setRows((prev) => {
      const next = prev.filter((r) => r.id !== id);
      return next.length ? next : [createDraftRow()];
    });
    setEditingId(null);
  }, []);

  const { goBack, goToStep, saving: navSaving } = useDistributionWizardNav({
    currentStep: 4,
    setupId,
    saveOverrides,
  });

  const handlePublish = async () => {
    const websiteId = detailQuery.data?.websiteId ?? readWizardWebsite()?.websiteId;
    if (!websiteId) {
      publishAppToast({ variant: "error", message: "Select a website before publishing." });
      router.push(DISTRIBUTION_ROUTES.configure);
      return;
    }

    const rowsForPublish = rows
      .filter((r) => draftRowHasData(r))
      .map((r) => (r.isDraft ? { ...r, isDraft: false } : r));
    writeWizardTableRows(rowsForPublish);
    setRows(rowsForPublish);

    const savedId = await publishSetup({
      setupId: setupId ?? readWizardSetupId(),
      method: "email",
      subject: saveOverrides.subject,
      emailConfigurationId: saveOverrides.emailConfigurationId,
      tableRows: rowsForPublish,
      syncDepartments: true,
    });

    if (!savedId) return;
    router.push(DISTRIBUTION_ROUTES.home);
  };

  const handleTestDelivery = async () => {
    const savedId = await saveDraftToServer(saveOverrides);
    const id = savedId ?? readWizardSetupId() ?? setupId;
    if (!id) {
      publishAppToast({
        variant: "error",
        message: "Complete step 2 (Email method) so the draft is saved, then try Test delivery.",
      });
      return;
    }
    goToStep(5);
  };

  const footerBusy = saving || navSaving;

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      [row.department, row.to, row.cc, row.bcc].some((cell) =>
        String(cell).toLowerCase().includes(q),
      ),
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

  const renderCell = useCallback(
    (
      row: DistributionTableRow,
      field: keyof Pick<DistributionTableRow, "department" | "to" | "cc" | "bcc">,
    ) => {
      const editable = row.isDraft || editingId === row.id;
      if (editable) {
        return <RowTextField row={row} field={field} theme={theme} updateRowField={updateRowField} />;
      }

      if (field === "department") {
        return (
          <Typography
            variant="medium"
            sx={{
              color: theme.app.dashboard.white95,
              fontWeight: 600,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {row.department || "—"}
          </Typography>
        );
      }

      return row[field] || "—";
    },
    [editingId, theme, updateRowField],
  );

  const columns = useMemo<DataTableColumn<DistributionTableRow>[]>(
    () => [
      {
        id: "department",
        label: "Department",
        render: (_v, row) => renderCell(row, "department"),
      },
      { id: "to", label: "To", cellVariant: "muted", render: (_v, row) => renderCell(row, "to") },
      { id: "cc", label: "CC", cellVariant: "muted", render: (_v, row) => renderCell(row, "cc") },
      { id: "bcc", label: "BCC", cellVariant: "muted", render: (_v, row) => renderCell(row, "bcc") },
    ],
    [renderCell],
  );

  const actionColumn = useMemo(
    () => ({
      label: "Actions",
      align: "right" as const,
      render: (row: DistributionTableRow) => {
        if (row.isDraft) {
          return (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 0.75,
              }}
            >
              <Chip
                label="Draft"
                size="small"
                sx={{
                  height: 20,
                  fontSize: 10,
                  fontWeight: 700,
                  bgcolor: `${theme.palette.warning.main}22`,
                  color: theme.palette.warning.light,
                }}
              />
              <Button
                type="button"
                variant="primary"
                disabled={!draftRowHasData(row)}
                onClick={() => handleCommitRow(row.id)}
                sx={{
                  ...(resolveSx(gradientPrimaryButtonSx, theme) as object),
                  minWidth: 84,
                  py: 0.75,
                  px: 1.75,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Add row
              </Button>
            </Box>
          );
        }
        if (editingId === row.id) {
          return (
            <Box sx={{ display: "flex", gap: 0.75, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <Button
                type="button"
                variant="primary"
                size="small"
                disabled={!draftRowHasData(row)}
                onClick={() => handleCommitRow(row.id)}
                sx={{ ...(resolveSx(gradientPrimaryButtonSx, theme) as object), fontSize: 12 }}
              >
                Save
              </Button>
              <Button type="button" variant="secondary" size="small" onClick={() => setEditingId(null)}>
                Cancel
              </Button>
            </Box>
          );
        }
        return (
          <EmailTableActions
            editLabel={`Edit ${row.department || "row"}`}
            deleteLabel={`Remove ${row.department || "row"}`}
            onEdit={() => setEditingId(row.id)}
            onDelete={() => handleRemoveRow(row.id)}
          />
        );
      },
    }),
    [editingId, handleCommitRow, handleRemoveRow, theme],
  );

  if (setupId && detailQuery.isLoading && !hydrated) {
    return (
      <DistributionWizardShell step={4} cardTitle="Distribution table">
        <Typography sx={{ py: 2, color: theme.app.dashboard.textMuted }}>Loading setup…</Typography>
      </DistributionWizardShell>
    );
  }

  return (
    <>
      <DistributionWizardShell
        step={4}
        cardTitle="Distribution table"
        subtitle="Departments and recipient lists for this website."
        footer={
          <DistributionWizardFooter onBack={goBack}>
            <DistributionSaveDraftButton
              step={4}
              setupId={setupId}
              subject={saveOverrides.subject}
              emailConfigurationId={saveOverrides.emailConfigurationId}
              tableRows={rows}
              disabled={footerBusy}
            />
            <Button
              type="button"
              variant="outlined"
              sx={{ ...resolveSx(filterChromeButtonSx, theme), flexShrink: 0 }}
              disabled={footerBusy}
              onClick={handleTestDelivery}
            >
              Test delivery
            </Button>
            <Button
              type="button"
              variant="primary"
              sx={{ ...gradientPrimaryButtonSx, flexShrink: 0 }}
              disabled={footerBusy}
              onClick={() => void handlePublish()}
            >
              {saving ? "Publishing…" : "Publish"}
            </Button>
          </DistributionWizardFooter>
        }
        cardHeaderRight={
          <Box sx={distributionWizardTableToolbar}>
            <Box sx={distributionWizardTableSearchWrap}>
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search departments or emails…"
                sx={{ minWidth: 0, width: "100%", maxWidth: 400 }}
              />
            </Box>
            <Button
              type="button"
              variant="primary"
              startIcon={<Add sx={{ fontSize: 20 }} />}
              sx={{ ...gradientPrimaryButtonSx, flexShrink: 0 }}
              onClick={handleAddRow}
            >
              Add row
            </Button>
          </Box>
        }
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0, width: "100%" }}>
          {detailQuery.data && !detailQuery.data.isActive ? (
            <Box sx={distributionWizardDraftNoticeSx}>
              <InfoOutlined sx={{ fontSize: 18, mt: 0.15, flexShrink: 0 }} />
              <span>
                Save draft to update the list, or Publish to activate. Use Test delivery after the
                setup is saved (draft or published).
              </span>
            </Box>
          ) : null}
          <Box sx={distributionWizardTablePanelSx}>
            <DataTable<DistributionTableRow>
              columns={columns}
              rows={paginatedRows}
              getRowId={(row) => row.id}
              actionColumn={actionColumn}
              minWidth={920}
              size="medium"
              tableSx={distributionWizardTableSx}
              scrollY={false}
              emptyState={{
                title: search.trim() ? "No matching departments" : "No distribution rows yet",
                description: search.trim()
                  ? "Try a different search term or clear the filter."
                  : "Add a department row with To, CC, and BCC recipients for this website.",
              }}
            />
          </Box>
          <Box sx={integrationsFooterRow}>
            <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
              {filteredRows.length === 0
                ? "0 entries"
                : `Showing ${rangeStart}–${rangeEnd} of ${filteredRows.length} entr${filteredRows.length === 1 ? "y" : "ies"}`}
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
