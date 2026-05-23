"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Add from "@mui/icons-material/Add";
import MailOutline from "@mui/icons-material/MailOutline";
import Box from "@mui/material/Box";
import MuiLink from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import NextLink from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { filterChromeButtonSx } from "@/components/common/FilterButton/filter-button.styles";
import { resolveSx } from "@/utils/resolveSx";
import { Button, DataTable, SearchBar, TablePagination, Typography } from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import {
  DistributionTestEmailModal,
  DistributionWizardShell,
  VisitorInformationPreviewModal,
} from "@/features/distribution-setup";
import { getEmailFormForWebsite } from "@/api/email/email-forms.api";
import {
  useCreateDistributionSetupMutation,
  useDistributionSetupDetailQuery,
  useUpdateDistributionSetupMutation,
} from "@/features/distribution-setup/hooks/useDistributionSetupMutations";
import {
  createDraftRow,
  detailToTableRows,
  draftRowHasData,
  tableRowsToDepartments,
  type DistributionTableRow,
} from "@/features/distribution-setup/utils/map-distribution-rows";
import {
  clearWizardDraft,
  readWizardEmailFormId,
  readWizardMethod,
  readWizardSetupId,
  readWizardSubject,
  readWizardWebsite,
  writeWizardEmailFormId,
  writeWizardSetupId,
  writeWizardSubject,
} from "@/features/distribution-setup/wizard-storage";
import { useQuery } from "@tanstack/react-query";
import { DISTRIBUTION_ROUTES } from "@/features/distribution-setup/distribution.constants";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import {
  distributionWizardTableSearchWrap,
  distributionWizardTableToolbar,
} from "../wizard.styles";
import {
  integrationsFooterRow,
  integrationsPaginationWrapper,
} from "../../integrations/integrations.styles";

const PAGE_SIZE = 10;
const TRANSCRIPT_HREF = DISTRIBUTION_ROUTES.transcript;

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const setupIdFromUrl = searchParams.get("setupId")?.trim() || null;
  const setupId = setupIdFromUrl ?? readWizardSetupId();

  const detailQuery = useDistributionSetupDetailQuery(setupId);
  const createMutation = useCreateDistributionSetupMutation();
  const updateMutation = useUpdateDistributionSetupMutation(setupId ?? "");

  const [rows, setRows] = useState<DistributionTableRow[]>(() => [createDraftRow()]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [visitorPreviewOpen, setVisitorPreviewOpen] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [testEmailOpen, setTestEmailOpen] = useState(false);

  const websiteIdForForm = detailQuery.data?.websiteId ?? readWizardWebsite()?.websiteId ?? "";
  const formQuery = useQuery({
    queryKey: ["email-form", websiteIdForForm],
    queryFn: () => getEmailFormForWebsite(websiteIdForForm),
    enabled: Boolean(websiteIdForForm),
  });

  const methodUsesEmail =
    (detailQuery.data?.method ?? readWizardMethod()).toLowerCase() === "email" ||
    (detailQuery.data?.method ?? readWizardMethod()).toLowerCase() === "both";

  useEffect(() => {
    if (setupIdFromUrl) {
      writeWizardSetupId(setupIdFromUrl);
    }
  }, [setupIdFromUrl]);

  useEffect(() => {
    if (!setupId) {
      const website = readWizardWebsite();
      if (!website?.websiteId) {
        router.replace(DISTRIBUTION_ROUTES.configure);
      }
      return;
    }
    if (detailQuery.data && !hydrated) {
      setRows(detailToTableRows(detailQuery.data));
      if (detailQuery.data.subject) writeWizardSubject(detailQuery.data.subject);
      if (detailQuery.data.emailConfigurationId) {
        writeWizardEmailFormId(detailQuery.data.emailConfigurationId);
      }
      setHydrated(true);
    }
  }, [setupId, detailQuery.data, hydrated, router]);

  const dismissVisitorPreview = useCallback(() => {
    setVisitorPreviewOpen(false);
  }, []);

  const updateRowField = useCallback((id: string, field: keyof DistributionTableRow, value: string) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  }, []);

  const handleAddRow = useCallback(() => {
    setRows((prev) => [createDraftRow(), ...prev]);
  }, []);

  const handleCommitDraftRow = useCallback((id: string) => {
    setRows((prev) => {
      const row = prev.find((r) => r.id === id);
      if (!row?.isDraft || !draftRowHasData(row)) return prev;
      return prev.map((r) => (r.id === id ? { ...r, isDraft: false } : r));
    });
  }, []);

  const handleSave = async () => {
    const websiteId = detailQuery.data?.websiteId ?? readWizardWebsite()?.websiteId;
    if (!websiteId) {
      publishAppToast({ variant: "error", message: "Select a website before saving." });
      router.push(DISTRIBUTION_ROUTES.configure);
      return;
    }

    const departments = tableRowsToDepartments(rows);
    if (departments.length === 0) {
      publishAppToast({
        variant: "error",
        message: "Add at least one department with recipients.",
      });
      return;
    }

    const body = {
      websiteId,
      method: detailQuery.data?.method ?? readWizardMethod(),
      subject: (detailQuery.data?.subject ?? readWizardSubject()) || undefined,
      emailConfigurationId:
        detailQuery.data?.emailConfigurationId ??
        readWizardEmailFormId() ??
        formQuery.data?.id ??
        undefined,
      isActive: true,
      departments,
    };

    try {
      if (setupId) {
        await updateMutation.mutateAsync(body);
        publishAppToast({ variant: "success", message: "Distribution setup saved." });
      } else {
        const created = await createMutation.mutateAsync(body);
        writeWizardSetupId(created.id);
        publishAppToast({ variant: "success", message: "Distribution setup created." });
      }
      clearWizardDraft();
      router.push(DISTRIBUTION_ROUTES.home);
    } catch (err) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(err, "Could not save distribution setup."),
      });
    }
  };

  const saving = createMutation.isPending || updateMutation.isPending;

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      [row.department, row.to, row.cc, row.bcc, row.sources, row.formLabel].some((cell) =>
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
              placeholder="Sales"
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
              placeholder="a@company.com"
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
              fullWidth
              variant="outlined"
              sx={draftFieldSx(theme)}
            />
          ) : (
            row.sources || "—"
          ),
      },
    ],
    [theme, updateRowField],
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
    [handleCommitDraftRow, theme],
  );

  const testDepartments = useMemo(
    () =>
      rows
        .filter((r) => !r.isDraft && r.department.trim())
        .map((r) => ({
          name: r.department.trim(),
          to: r.to.split(/[,;]/)[0]?.trim() ?? "",
        })),
    [rows],
  );

  if (setupId && detailQuery.isLoading) {
    return (
      <DistributionWizardShell step={3} cardTitle="Distribution table" footer={null}>
        <Typography sx={{ py: 2, color: theme.app.dashboard.textMuted }}>Loading setup…</Typography>
      </DistributionWizardShell>
    );
  }

  return (
    <>
      <DistributionTestEmailModal
        open={testEmailOpen}
        onClose={() => setTestEmailOpen(false)}
        websiteId={websiteIdForForm}
        subject={detailQuery.data?.subject ?? readWizardSubject()}
        emailConfigurationId={
          detailQuery.data?.emailConfigurationId ?? readWizardEmailFormId() ?? formQuery.data?.id
        }
        fields={formQuery.data?.fields ?? []}
        departments={testDepartments}
      />
      <VisitorInformationPreviewModal open={visitorPreviewOpen} onClose={dismissVisitorPreview} />
      <DistributionWizardShell
        step={3}
        cardTitle="Distribution table"
        subtitle="Departments and recipient lists for this website."
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => router.push(DISTRIBUTION_ROUTES.home)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              sx={gradientPrimaryButtonSx}
              disabled={saving}
              onClick={() => void handleSave()}
            >
              {saving ? "Saving…" : "Save distribution"}
            </Button>
          </>
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
            {methodUsesEmail ? (
              <Button
                type="button"
                variant="outlined"
                startIcon={<MailOutline sx={{ fontSize: 20 }} />}
                sx={{ ...resolveSx(filterChromeButtonSx, theme), flexShrink: 0 }}
                disabled={!websiteIdForForm}
                onClick={() => setTestEmailOpen(true)}
              >
                Send test email
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outlined"
              startIcon={<Add sx={{ fontSize: 20 }} />}
              sx={{ ...resolveSx(filterChromeButtonSx, theme), flexShrink: 0 }}
              onClick={handleAddRow}
            >
              Add row
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
