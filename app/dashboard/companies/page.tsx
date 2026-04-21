"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { AddCircleIcon } from "@/components/dashboard/icons/AddCircleIcon";
import { FormModal, InputField, Typography, Button } from "@/components/common";
import {
  useCompaniesListQuery,
  useCompanySetupDraftLatestQuery,
  useCreateCompanySetupDraftMutation,
} from "@/lib/hooks/query";
import { publishAppToast } from "@/lib/notify";
import {
  extractCompanySetupDraftId,
  extractCompanySetupDraftIdFromLatest,
  getStoredCompanySetupDraftId,
  setStoredCompanySetupDraftId,
} from "@/lib/companies/setup-draft.utils";
import { CompaniesStatsCards } from "./components/CompaniesStatsCards";
import { CompaniesTableSection } from "./components/CompaniesTableSection";
import { CompanySetupWizardModal } from "./components/CompanySetupWizardModal";
import { buildCompaniesTableRows } from "./utils";
import { pageWrapper, pageHeaderRow } from "./overview.styles";
import { departmentsAddButton } from "../website-assigning/website-assigning.styles";

export default function CompaniesPage() {
  const theme = useTheme() as AppTheme;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;
  const [setupWizardOpen, setSetupWizardOpen] = useState(false);
  const [setupDraftId, setSetupDraftId] = useState<string | null>(null);
  const [resumeDraftModalOpen, setResumeDraftModalOpen] = useState(false);
  const [resumeDraftIdInput, setResumeDraftIdInput] = useState("");
  const [storedDraftAvailable, setStoredDraftAvailable] = useState(false);

  const refreshStoredDraftFlag = useCallback(() => {
    setStoredDraftAvailable(!!getStoredCompanySetupDraftId());
  }, []);

  useEffect(() => {
    refreshStoredDraftFlag();
  }, [refreshStoredDraftFlag]);

  const createDraftMutation = useCreateCompanySetupDraftMutation();
  const latestDraftQuery = useCompanySetupDraftLatestQuery();

  /** Sync browser draft id with server latest in-progress run (GET `/companies/setup/draft/latest`). */
  useEffect(() => {
    if (!latestDraftQuery.isSuccess) return;
    const id = extractCompanySetupDraftIdFromLatest(latestDraftQuery.data);
    if (!id) return;
    setStoredCompanySetupDraftId(id);
    refreshStoredDraftFlag();
  }, [latestDraftQuery.isSuccess, latestDraftQuery.data, refreshStoredDraftFlag]);

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

  const handleStartSetup = () => {
    createDraftMutation.mutate(
      {},
      {
        onSuccess: (data) => {
          const id = extractCompanySetupDraftId(data);
          if (!id) {
            publishAppToast({
              variant: "error",
              message: "Could not start setup. Please try again.",
            });
            return;
          }
          setStoredCompanySetupDraftId(id);
          setSetupDraftId(id);
          setSetupWizardOpen(true);
          refreshStoredDraftFlag();
        },
      },
    );
  };

  const handleOpenDraftFlow = () => {
    const stored = getStoredCompanySetupDraftId();
    if (stored) {
      setSetupDraftId(stored);
      setSetupWizardOpen(true);
      return;
    }
    setResumeDraftIdInput("");
    setResumeDraftModalOpen(true);
  };

  const handleResumeDraftSubmit = () => {
    const id = resumeDraftIdInput.trim();
    if (!id) {
      publishAppToast({ variant: "error", message: "Enter a draft id to open." });
      return;
    }
    setStoredCompanySetupDraftId(id);
    setSetupDraftId(id);
    setSetupWizardOpen(true);
    setResumeDraftModalOpen(false);
    setResumeDraftIdInput("");
    refreshStoredDraftFlag();
  };

  const handleCloseSetupWizard = (reason: "completed" | "dismissed") => {
    if (reason === "completed") {
      setStoredCompanySetupDraftId(null);
    } else if (setupDraftId) {
      setStoredCompanySetupDraftId(setupDraftId);
    }
    setSetupWizardOpen(false);
    setSetupDraftId(null);
    refreshStoredDraftFlag();
  };

  return (
    <Box sx={pageWrapper}>
      <Box sx={pageHeaderRow}>
        <Typography variant="regularLarge" fontWeight={700} color="white">
          All Companies
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.25, alignItems: "center" }}>
          <Button
            variant="secondary"
            sx={{ minWidth: 120, borderRadius: "9999px", py: 1.25, px: 2.5 }}
            onClick={handleOpenDraftFlow}
            disabled={setupWizardOpen || resumeDraftModalOpen}
          >
            <Typography component="span" variant="medium" color="inherit">
              Draft{storedDraftAvailable ? " · saved" : ""}
            </Typography>
          </Button>
          <Button
            variant="primary"
            sx={departmentsAddButton}
            onClick={handleStartSetup}
            disabled={createDraftMutation.isPending || setupWizardOpen}
          >
            <AddCircleIcon width={16} height={16} />
            <Typography component="span" variant="medium" color="inherit">
              {createDraftMutation.isPending ? "Starting…" : "Add Reseller / Company"}
            </Typography>
          </Button>
        </Box>
      </Box>

      {storedDraftAvailable ? (
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mt: -1 }}>
          A company setup draft is saved in this browser — use Draft to open the same form, or Add
          to start a new draft.
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
        search={search}
        onSearchChange={setSearch}
        rows={tableRows}
        isLoading={isCompaniesLoading}
        page={page}
        pageCount={pageCount}
        totalEntries={totalEntries}
        limit={limit}
        onPageChange={setPage}
      />

      <FormModal
        open={resumeDraftModalOpen}
        title="Open a saved setup"
        description="Only needed if support or another device gave you a reference to paste. Otherwise use Draft on the toolbar — it opens your last session on this browser."
        onClose={() => {
          setResumeDraftModalOpen(false);
          setResumeDraftIdInput("");
        }}
        onSave={handleResumeDraftSubmit}
        primaryButtonLabel="Open"
        primaryButtonDisabled={!resumeDraftIdInput.trim()}
        cancelButtonLabel="Cancel"
        maxWidth={480}
      >
        <InputField
          label="Reference"
          placeholder="Paste the value you were given"
          value={resumeDraftIdInput}
          onChange={(e) => setResumeDraftIdInput(e.target.value)}
        />
      </FormModal>

      <CompanySetupWizardModal
        open={setupWizardOpen}
        draftId={setupDraftId}
        onClose={handleCloseSetupWizard}
      />
    </Box>
  );
}
