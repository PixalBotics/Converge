"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { AddCircleIcon } from "@/components/common/icons";
import { Typography, Button } from "@/components/common";
import {
  useCompaniesListQuery,
  useCompanySetupDraftsListQuery,
} from "@/lib/hooks/query";
import { setStoredCompanySetupDraftId } from "@/lib/companies/setup-draft.utils";
import { parseCompanySetupDraftsList } from "@/lib/companies/setup-drafts-list.utils";
import { CompaniesStatsCards } from "./components/CompaniesStatsCards";
import { CompaniesTableSection } from "./components/CompaniesTableSection";
import { CompanySetupWizardModal } from "./components/CompanySetupWizardModal";
import { CompanySetupDraftsModal } from "./components/CompanySetupDraftsModal";
import { buildCompaniesTableRows } from "./utils";
import { pageWrapper, pageHeaderRow } from "./overview.styles";
import { departmentsAddButton } from "../website-assigning/website-assigning.styles";
import { useAuth } from "@/lib/auth";
import { canCompaniesModuleAction } from "@/lib/permissions";

export default function CompaniesPage() {
  const theme = useTheme() as AppTheme;
  const { hasPage, hasOperational } = useAuth();
  const canCreateCompany = canCompaniesModuleAction(hasPage, hasOperational, "create");
  const canUpdateCompany = canCompaniesModuleAction(hasPage, hasOperational, "update");
  const canViewCompanyDetail = canCompaniesModuleAction(hasPage, hasOperational, "detail");
  const canViewCompanyList = canCompaniesModuleAction(hasPage, hasOperational, "list");
  const canOpenCompanyDraft = canCreateCompany || canUpdateCompany;
  const [searchInput, setSearchInput] = useState("");
  /** Applied search sent to the companies list API (Search button). */
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;
  const [setupWizardOpen, setSetupWizardOpen] = useState(false);
  const [setupDraftId, setSetupDraftId] = useState<string | null>(null);
  const [draftsModalOpen, setDraftsModalOpen] = useState(false);

  const draftsListQuery = useCompanySetupDraftsListQuery({
    enabled: canOpenCompanyDraft,
  });
  const draftRows = useMemo(
    () => parseCompanySetupDraftsList(draftsListQuery.data),
    [draftsListQuery.data],
  );
  const hasDrafts = draftRows.length > 0;

  useEffect(() => {
    setStoredCompanySetupDraftId(null);
  }, []);

  useEffect(() => {
    if (searchInput.trim().length > 0) return;
    if (!search.trim()) return;
    setSearch("");
    setPage(1);
  }, [searchInput, search]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const { data: companiesResponse, isLoading: isCompaniesLoading } = useCompaniesListQuery({
    page,
    limit,
    search: search.trim() || undefined,
    view: "tree",
  });

  const companiesData = companiesResponse?.data;
  const pageCount = companiesData?.totalPages ?? 1;
  const totalEntries = companiesData?.total ?? 0;
  const treeMeta =
    companiesData && "view" in companiesData && companiesData.view === "tree"
      ? companiesData.meta
      : null;

  const tableRows = useMemo(() => buildCompaniesTableRows(companiesData), [companiesData]);

  const handleStartSetup = useCallback(() => {
    setStoredCompanySetupDraftId(null);
    setSetupDraftId(null);
    setSetupWizardOpen(true);
  }, []);

  const handleOpenDraftFlow = () => {
    setDraftsModalOpen(true);
  };

  const handleResumeDraft = (id: string) => {
    setSetupDraftId(id);
    setSetupWizardOpen(true);
    setDraftsModalOpen(false);
  };

  const handleCloseSetupWizard = (_reason: "completed" | "dismissed") => {
    setSetupWizardOpen(false);
    setSetupDraftId(null);
    void draftsListQuery.refetch();
  };

  return (
    <Box sx={pageWrapper}>
      <Box sx={pageHeaderRow}>
        <Typography variant="regularLarge" fontWeight={700} color="white">
          All Companies
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.25, alignItems: "center" }}>
          {canOpenCompanyDraft ? (
            <Button
              variant="secondary"
              sx={{ minWidth: 120, borderRadius: "9999px", py: 1.25, px: 2.5 }}
              onClick={handleOpenDraftFlow}
              disabled={setupWizardOpen || draftsModalOpen}
            >
              <Typography component="span" variant="medium" color="inherit">
                Draft{hasDrafts ? ` (${draftRows.length})` : ""}
              </Typography>
            </Button>
          ) : null}
          {canCreateCompany ? (
            <Button
              variant="primary"
              sx={departmentsAddButton}
              onClick={handleStartSetup}
              disabled={setupWizardOpen}
            >
              <AddCircleIcon width={16} height={16} />
              <Typography component="span" variant="medium" color="inherit">
                Add Reseller / Company
              </Typography>
            </Button>
          ) : null}
        </Box>
      </Box>

      {hasDrafts ? (
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mt: -1 }}>
          In-progress setups are in Draft — use Resume there. Add Reseller / Company always starts a
          new setup.
        </Typography>
      ) : null}

      <CompaniesStatsCards
        theme={theme}
        resellerCount={treeMeta?.resellerCount ?? 0}
        parentCompanyCount={treeMeta?.parentCompanyCount ?? 0}
        childCompanyCount={treeMeta?.childCompanyCount ?? 0}
      />

      <CompaniesTableSection
        theme={theme}
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        appliedSearch={search}
        onSearchSubmit={() => {
          setSearch(searchInput.trim());
          setPage(1);
        }}
        rows={tableRows}
        isLoading={isCompaniesLoading}
        page={page}
        pageCount={pageCount}
        totalEntries={totalEntries}
        limit={limit}
        onPageChange={setPage}
        canViewCompanyDetail={canViewCompanyDetail}
        canViewCompanyList={canViewCompanyList}
        canUpdateCompany={canUpdateCompany}
      />

      <CompanySetupDraftsModal
        open={draftsModalOpen}
        onClose={() => setDraftsModalOpen(false)}
        onResume={handleResumeDraft}
        onStartNew={() => {
          setDraftsModalOpen(false);
          handleStartSetup();
        }}
        startingNew={false}
      />

      <CompanySetupWizardModal
        key={setupDraftId ?? "company-setup-closed"}
        open={setupWizardOpen}
        draftId={setupDraftId}
        onClose={handleCloseSetupWizard}
      />
    </Box>
  );
}
