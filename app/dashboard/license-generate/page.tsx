"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import Send from "@mui/icons-material/Send";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  Checkbox,
  DashboardCard,
  DataTable,
  SearchBar,
  SearchSubmitButton,
  SelectField,
  TablePagination,
  ToolbarFilterPopover,
  ToolbarFilterPopoverPanel,
  Typography,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { SendLicenseConfirmModal } from "@/components/common/SendLicenseConfirmModal/SendLicenseConfirmModal";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { GenerateLicenseKeyModal } from "./components/GenerateLicenseKeyModal";
import { pickItemsArray, toIdNameOption } from "@/app/dashboard/user-page/components/add-user-modal.utils";
import {
  useCompaniesSetupResellersQuery,
  usePlatformLicenseKeysQuery,
  useSendPlatformLicenseKeyMutation,
} from "@/lib/hooks";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import {
  resolveSessionParentCompanyId,
  sessionIsNarrowClientRootScope,
  useAuth,
  useResellerListScope,
} from "@/lib/auth";
import { OP } from "@/lib/permissions";
import { extractParentCompaniesFromByResellerTree } from "@/app/dashboard/user-page/components/add-user-modal.utils";
import { useCompaniesByResellerQuery } from "@/lib/hooks";
import {
  licenseGenerateFilterGrid,
  licenseGenerateFooterRow,
  licenseGenerateHeaderActions,
  licenseGeneratePageHeader,
  licenseGeneratePageWrapper,
  licenseGeneratePaginationWrapper,
  licenseGenerateSearchFieldWrapper,
  licenseGenerateSearchRow,
  licenseGenerateTableCard,
  licenseGenerateTableToolbar,
} from "./license-generate.styles";
import {
  extractPlatformLicenseKeyRows,
  extractPlatformLicenseKeysLimit,
  extractPlatformLicenseKeysTotal,
  extractPlatformLicenseKeysTotalPages,
  type PlatformLicenseKeyRow,
} from "./utils";

const DEFAULT_PAGE_LIMIT = 20;

export default function LicenseGeneratePage() {
  const theme = useTheme() as AppTheme;
  const { hasOperational, isPlatformAdmin, user } = useAuth();
  const { canFilterByResellerId, sessionResellerId } = useResellerListScope();
  const isNarrowClientScope = useMemo(
    () => sessionIsNarrowClientRootScope(isPlatformAdmin, user),
    [isPlatformAdmin, user],
  );
  const sessionParentCompanyId = useMemo(
    () => resolveSessionParentCompanyId(user?.parentCompanyId),
    [user?.parentCompanyId],
  );
  const canSendLicense =
    hasOperational(OP.license.send) || hasOperational(OP.license.admin);
  const canGenerateLicense =
    hasOperational(OP.license.generate) || hasOperational(OP.license.admin);
  const showResellerColumn = canFilterByResellerId;
  const showResellerFilter = canFilterByResellerId;
  const showParentCompanyFilter = canFilterByResellerId && !isNarrowClientScope;
  const sendLicenseMutation = useSendPlatformLicenseKeyMutation();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [sendTargets, setSendTargets] = useState<PlatformLicenseKeyRow[]>([]);
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const [mode, setMode] = useState<"issued" | "missing">("issued");
  const [filterResellerId, setFilterResellerId] = useState("");
  const [filterParentCompanyId, setFilterParentCompanyId] = useState("");
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  const resellersQuery = useCompaniesSetupResellersQuery({ enabled: showResellerFilter });
  const effectiveResellerId = showResellerFilter
    ? filterResellerId.trim()
    : sessionResellerId.trim();
  const companiesByResellerQuery = useCompaniesByResellerQuery(
    effectiveResellerId,
    { view: "tree", sortBy: "name", sortOrder: "asc", all: true },
    { enabled: showParentCompanyFilter && effectiveResellerId.length > 0 },
  );
  const resellerOptions = useMemo(() => {
    return pickItemsArray(resellersQuery.data)
      .map((row) => toIdNameOption(row))
      .filter((o): o is { value: string; label: string } => o !== null);
  }, [resellersQuery.data]);
  const resellerFilterOptions = useMemo(() => {
    const all = { value: "", label: "All resellers" };
    if (resellerOptions.length > 0) return [all, ...resellerOptions];
    return [{ value: "", label: resellersQuery.isLoading ? "Loading resellers…" : "No resellers available" }];
  }, [resellerOptions, resellersQuery.isLoading]);

  const parentCompanyFilterOptions = useMemo(() => {
    if (!effectiveResellerId) return [{ value: "", label: "All parent companies" }];
    const extracted = extractParentCompaniesFromByResellerTree(companiesByResellerQuery.data).map((o) => ({
      value: o.value,
      label: o.label,
    }));
    if (extracted.length > 0) return [{ value: "", label: "All parent companies" }, ...extracted];
    return [
      {
        value: "",
        label: companiesByResellerQuery.isLoading ? "Loading parent companies…" : "No parent companies available",
      },
    ];
  }, [effectiveResellerId, companiesByResellerQuery.data, companiesByResellerQuery.isLoading]);

  const effectiveParentCompanyId = isNarrowClientScope
    ? sessionParentCompanyId
    : filterParentCompanyId.trim();

  const listParams = useMemo(() => {
    const params: Record<string, string | number> = {
      mode,
      page,
      limit: DEFAULT_PAGE_LIMIT,
    };
    const q = search.trim();
    if (q) params.search = q;
    if (effectiveResellerId) params.resellerId = effectiveResellerId;
    if (effectiveParentCompanyId) params.parentCompanyId = effectiveParentCompanyId;
    return params;
  }, [mode, page, search, effectiveResellerId, effectiveParentCompanyId]);

  const licenseKeysQuery = usePlatformLicenseKeysQuery(listParams, { scope: "license-generate-page" });

  const rows = useMemo(() => extractPlatformLicenseKeyRows(licenseKeysQuery.data), [licenseKeysQuery.data]);
  const totalEntries = useMemo(() => extractPlatformLicenseKeysTotal(licenseKeysQuery.data), [licenseKeysQuery.data]);
  const pageCount = useMemo(() => extractPlatformLicenseKeysTotalPages(licenseKeysQuery.data), [licenseKeysQuery.data]);
  const pageLimit = useMemo(
    () => extractPlatformLicenseKeysLimit(licenseKeysQuery.data) ?? DEFAULT_PAGE_LIMIT,
    [licenseKeysQuery.data],
  );

  const start = rows.length > 0 ? (page - 1) * pageLimit + 1 : 0;
  const end = (page - 1) * pageLimit + rows.length;
  const isLoading = licenseKeysQuery.isLoading || licenseKeysQuery.isFetching;

  useEffect(() => {
    // Clear applied search when SearchBar cross is used.
    if (searchInput.trim().length > 0) return;
    if (!search.trim()) return;
    setSearch("");
    setPage(1);
  }, [searchInput, search]);

  useEffect(() => {
    if (showResellerFilter || !sessionResellerId.trim()) return;
    setFilterResellerId(sessionResellerId);
  }, [showResellerFilter, sessionResellerId]);

  useEffect(() => {
    setPage(1);
  }, [search, effectiveResellerId, effectiveParentCompanyId, mode]);

  useEffect(() => {
    if (!showParentCompanyFilter) return;
    setFilterParentCompanyId("");
  }, [filterResellerId, showParentCompanyFilter]);

  useEffect(() => {
    setPage((p) => (p > pageCount ? pageCount : p));
  }, [pageCount]);

  const toggleRow = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    const ids = rows.map((r) => r.id);
    setSelected((prev) => {
      const allOn = ids.length > 0 && ids.every((id) => prev.has(id));
      if (allOn) return new Set();
      return new Set(ids);
    });
  }, [rows]);

  const allSelected =
    rows.length > 0 && rows.every((r) => selected.has(r.id));
  const someSelected = selected.size > 0 && !allSelected;

  const openSendModal = useCallback((targets: PlatformLicenseKeyRow[]) => {
    if (!canSendLicense) {
      publishAppToast({ variant: "error", message: "You do not have permission to send license emails." });
      return;
    }
    const issued = targets.filter((row) => row.licenseKey && row.licenseKey !== "—");
    if (!issued.length) {
      publishAppToast({ variant: "error", message: "Select a company with an issued license key." });
      return;
    }
    setSendTargets(issued);
    setSendModalOpen(true);
  }, [canSendLicense]);

  const handleConfirmSend = useCallback(async () => {
    if (!sendTargets.length || sendLicenseMutation.isPending) return;

    let totalAttempted = 0;
    let totalSent = 0;
    const failures: string[] = [];

    for (const row of sendTargets) {
      try {
        const result = await sendLicenseMutation.mutateAsync({
          parentCompanyId: row.parentCompanyId,
          audience: "poc",
        });
        totalAttempted += result.data.attempted;
        totalSent += result.data.sent;
        if (result.data.attempted === 0) {
          failures.push(`${row.parentCompany}: no POC users found`);
        } else if (result.data.sent === 0) {
          failures.push(`${row.parentCompany}: mail could not be delivered`);
        }
      } catch (err) {
        const msg = extractApiErrorMessageForToast(err) ?? "Send failed.";
        failures.push(`${row.parentCompany}: ${msg}`);
      }
    }

    setSendModalOpen(false);
    setSendTargets([]);
    setSelected(new Set());

    if (totalSent > 0) {
      publishAppToast({
        variant: "success",
        message:
          sendTargets.length === 1
            ? `License email sent to ${totalSent} POC user(s).`
            : `License emails sent (${totalSent} of ${totalAttempted} recipient(s) across ${sendTargets.length} companies).`,
      });
    } else {
      publishAppToast({
        variant: "error",
        message: failures[0] ?? "Could not send license email. Check platform/reseller mail settings.",
      });
    }
  }, [sendLicenseMutation, sendTargets]);

  const sendModalDescription =
    sendTargets.length === 1
      ? `Send the license key for ${sendTargets[0]?.parentCompany ?? "this client root"} to its POC contact(s)?`
      : `Send license keys for ${sendTargets.length} selected parent companies to their POC contact(s)?`;

  const columns = useMemo<DataTableColumn<PlatformLicenseKeyRow>[]>(
    () => [
      {
        id: "select",
        label: "",
        headerRender: () => (
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected}
            onChange={toggleAll}
            inputProps={{ "aria-label": "Select all rows" }}
          />
        ),
        render: (_, row) => (
          <Checkbox
            checked={selected.has(row.id)}
            onChange={() => toggleRow(row.id)}
            inputProps={{ "aria-label": `Select ${row.parentCompany}` }}
          />
        ),
      },
      { id: "parentCompany", label: "Parent Company" },
      ...(showResellerColumn
        ? [{ id: "reseller", label: "Reseller", cellVariant: "muted" as const }]
        : []),
      { id: "licenseKey", label: "License Key" },
      { id: "createdAt", label: "Created", cellVariant: "muted" },
    ],
    [allSelected, someSelected, toggleAll, toggleRow, selected, showResellerColumn]
  );

  return (
    <Box sx={licenseGeneratePageWrapper}>
      <Box sx={licenseGeneratePageHeader}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} color="white" sx={{ mb: 0.5 }}>
            License Generate
          </Typography>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 480 }}>
            License keys for your clients.
          </Typography>
        </Box>
        <Box sx={licenseGenerateHeaderActions}>
          <Button
            variant="outlined"
            type="button"
            startIcon={<Send sx={{ fontSize: 18 }} />}
            disabled={!canSendLicense || selected.size === 0 || mode !== "issued" || sendLicenseMutation.isPending}
            onClick={() => {
              const targets = rows.filter((row) => selected.has(row.id));
              openSendModal(targets);
            }}
          >
            Send Selected
          </Button>
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            startIcon={<AutoAwesome sx={{ fontSize: 18 }} />}
            disabled={!canGenerateLicense}
            onClick={() => setGenerateModalOpen(true)}
          >
            Generate License
          </Button>
        </Box>
      </Box>

      <GenerateLicenseKeyModal
        open={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        onGenerated={() => {
          void licenseKeysQuery.refetch();
        }}
        lockedResellerId={showResellerFilter ? undefined : sessionResellerId}
        lockedParentCompanyId={isNarrowClientScope ? sessionParentCompanyId : undefined}
        hideResellerPicker={!showResellerFilter}
        hideParentCompanyPicker={isNarrowClientScope}
      />

      <SendLicenseConfirmModal
        open={sendModalOpen}
        onDismiss={() => {
          if (sendLicenseMutation.isPending) return;
          setSendModalOpen(false);
          setSendTargets([]);
        }}
        onConfirm={() => {
          void handleConfirmSend();
        }}
        description={sendModalDescription}
        confirmDisabled={sendLicenseMutation.isPending}
        confirmLabel={sendLicenseMutation.isPending ? "Sending…" : "Yes – Send License"}
      />

      <DashboardCard sx={licenseGenerateTableCard}>
        <Box sx={licenseGenerateTableToolbar}>
          <Typography variant="mediumLarge" color="white" fontWeight={600}>
            License Keys
          </Typography>
          <Box sx={licenseGenerateSearchRow}>
            <Box sx={licenseGenerateSearchFieldWrapper}>
              <SearchBar
                value={searchInput}
                onChange={setSearchInput}
                placeholder="Search company or key…"
                sx={{ minWidth: "100%" }}
              />
            </Box>
            <SearchSubmitButton
              disabled={searchInput.trim() === search.trim()}
              onClick={() => setSearch(searchInput)}
            />
            <ToolbarFilterPopover
              open={filterPopoverOpen}
              onOpenChange={setFilterPopoverOpen}
              active={Boolean(
                mode !== "issued" ||
                  (showResellerFilter && filterResellerId.trim()) ||
                  (showParentCompanyFilter && filterParentCompanyId.trim()),
              )}
            >
              <ToolbarFilterPopoverPanel
                footer={
                  <>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setMode("issued");
                        setFilterResellerId(showResellerFilter ? "" : sessionResellerId);
                        setFilterParentCompanyId("");
                        setSearchInput("");
                        setSearch("");
                        setPage(1);
                      }}
                    >
                      Clear filters
                    </Button>
                    <Button type="button" variant="primary" sx={gradientPrimaryButtonSx} onClick={() => setFilterPopoverOpen(false)}>
                      Done
                    </Button>
                  </>
                }
              >
                <Box sx={licenseGenerateFilterGrid}>
                  <SelectField
                    label="Mode"
                    value={mode}
                    onChange={(v) => setMode(v === "missing" ? "missing" : "issued")}
                    options={[
                      { value: "issued", label: "Issued" },
                      { value: "missing", label: "Missing" },
                    ]}
                  />
                  {showResellerFilter ? (
                    <SelectField
                      label="Client Of (Reseller)"
                      value={filterResellerId}
                      onChange={(v) => {
                        setFilterResellerId(v);
                        setFilterParentCompanyId("");
                      }}
                      options={resellerFilterOptions}
                      menuMaxRows={6}
                    />
                  ) : null}
                  {showParentCompanyFilter ? (
                    <SelectField
                      label="Parent Company"
                      value={filterParentCompanyId}
                      onChange={setFilterParentCompanyId}
                      options={parentCompanyFilterOptions}
                      menuMaxRows={7}
                      disabled={!effectiveResellerId}
                    />
                  ) : null}
                </Box>
              </ToolbarFilterPopoverPanel>
            </ToolbarFilterPopover>
          </Box>
        </Box>

        <DataTable<PlatformLicenseKeyRow>
          columns={columns}
          rows={rows}
          isLoading={isLoading}
          getRowId={(row) => row.id}
          minWidth={980}
          actionColumn={{
            label: "Action",
            render: (row) =>
              canSendLicense && mode === "issued" && row.licenseKey !== "—" ? (
                <Link
                  component="button"
                  type="button"
                  onClick={() => openSendModal([row])}
                  disabled={sendLicenseMutation.isPending}
                  sx={{
                    color: theme.app.text.primary,
                    textDecoration: "underline",
                    cursor: "pointer",
                    fontSize: 14,
                    background: "none",
                    border: "none",
                    fontFamily: "inherit",
                    p: 0,
                  }}
                >
                  Send Mail
                </Link>
              ) : (
                <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
                  —
                </Typography>
              ),
          }}
        />

        <Box sx={licenseGenerateFooterRow}>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
            {isLoading
              ? "Loading license keys..."
              : licenseKeysQuery.isError
                ? "Could not load license keys."
                : `Showing data ${start} to ${end} of ${totalEntries} entries`}
          </Typography>
          <Box sx={licenseGeneratePaginationWrapper}>
            <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
          </Box>
        </Box>
      </DashboardCard>
    </Box>
  );
}
