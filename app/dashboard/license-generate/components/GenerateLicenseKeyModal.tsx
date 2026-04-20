"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { FormModal, SelectField, Typography } from "@/components/common";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import {
  useCompaniesByResellerQuery,
  useCompaniesSetupResellersQuery,
  useGeneratePlatformLicenseKeyMutation,
} from "@/lib/hooks";
import {
  extractParentCompaniesFromByResellerTree,
  pickItemsArray,
  toIdNameOption,
} from "@/app/dashboard/user-page/components/add-user-modal.utils";

const EMPTY_SELECT = [{ label: "—", value: "" }] as const;

export type GenerateLicenseKeyModalProps = {
  open: boolean;
  onClose: () => void;
  onGenerated?: () => void;
};

export function GenerateLicenseKeyModal({ open, onClose, onGenerated }: GenerateLicenseKeyModalProps) {
  const theme = useTheme() as AppTheme;
  const [resellerId, setResellerId] = useState("");
  const [parentCompanyId, setParentCompanyId] = useState("");

  const resellersQuery = useCompaniesSetupResellersQuery({ enabled: open });
  const generateMutation = useGeneratePlatformLicenseKeyMutation();

  const resellerOptions = useMemo(() => {
    return pickItemsArray(resellersQuery.data)
      .map((row) => toIdNameOption(row))
      .filter((o): o is { value: string; label: string } => o !== null);
  }, [resellersQuery.data]);

  const resellerSelectOptions = useMemo(() => {
    if (resellerOptions.length > 0) return resellerOptions;
    return resellersQuery.isLoading ? [{ value: "", label: "Loading…" }] : [...EMPTY_SELECT];
  }, [resellerOptions, resellersQuery.isLoading]);

  const parentCompaniesQuery = useCompaniesByResellerQuery(
    resellerId,
    // Match AddUserModal behavior: tree view + stable sorting.
    { view: "tree", sortBy: "name", sortOrder: "asc", all: true },
    { enabled: open && resellerId.trim().length > 0 },
  );

  const parentCompanyOptions = useMemo(() => {
    /**
     * `GET /companies/by-reseller/:id?view=tree` returns parent companies nested under
     * `data.items[].parentCompanies[]`. This extractor normalizes both `tree` and legacy `flat`.
     */
    return extractParentCompaniesFromByResellerTree(parentCompaniesQuery.data).map((o) => ({
      value: o.value,
      label: o.label,
    }));
  }, [parentCompaniesQuery.data]);

  const parentCompanySelectOptions = useMemo(() => {
    if (!resellerId.trim()) return [{ value: "", label: "Select reseller first" }];
    if (parentCompanyOptions.length > 0) return parentCompanyOptions;
    return parentCompaniesQuery.isLoading ? [{ value: "", label: "Loading…" }] : [...EMPTY_SELECT];
  }, [resellerId, parentCompanyOptions, parentCompaniesQuery.isLoading]);

  useEffect(() => {
    if (!open) return;
    setResellerId("");
    setParentCompanyId("");
  }, [open]);

  useEffect(() => {
    setParentCompanyId("");
  }, [resellerId]);

  const handleGenerate = () => {
    const parentId = parentCompanyId.trim();
    if (!resellerId.trim()) {
      publishAppToast({ variant: "error", message: "Please select a reseller." });
      return;
    }
    if (!parentId) {
      publishAppToast({ variant: "error", message: "Please select a parent company." });
      return;
    }

    generateMutation.mutate(
      { parentCompanyId: parentId },
      {
        onSuccess: () => {
          publishAppToast({ variant: "success", message: "License key generated." });
          onGenerated?.();
          onClose();
        },
        onError: (err) => {
          const msg = extractApiErrorMessageForToast(err) ?? "Could not generate license key.";
          publishAppToast({ variant: "error", message: msg });
        },
      },
    );
  };

  const formBusy =
    generateMutation.isPending ||
    resellersQuery.isLoading ||
    parentCompaniesQuery.isLoading;

  const parentsErrorMsg = parentCompaniesQuery.isError
    ? extractApiErrorMessageForToast(parentCompaniesQuery.error) ?? "Could not load parent companies."
    : null;

  return (
    <FormModal
      open={open}
      title="Generate License Key"
      description="Select a reseller, then choose a client root (parent company) to generate its workspace license key."
      onClose={() => {
        if (generateMutation.isPending) return;
        onClose();
      }}
      onSave={handleGenerate}
      primaryButtonLabel={generateMutation.isPending ? "Generating…" : "Generate"}
      primaryButtonDisabled={generateMutation.isPending}
      maxWidth={560}
      fitContent
    >
      <SelectField
        label="Reseller"
        value={resellerId}
        onChange={setResellerId}
        options={resellerSelectOptions}
        menuMaxRows={6}
        disabled={generateMutation.isPending || resellersQuery.isLoading}
      />

      <Box sx={{ position: "relative" }}>
        <SelectField
          label="Parent Company (Client Root)"
          value={parentCompanyId}
          onChange={setParentCompanyId}
          options={parentCompanySelectOptions}
          menuMaxRows={7}
          disabled={!resellerId.trim() || generateMutation.isPending || parentCompaniesQuery.isLoading}
        />
        {parentCompaniesQuery.isLoading && (
          <Box
            sx={{
              position: "absolute",
              right: 14,
              top: 34,
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              color: theme.app.dashboard.textMuted,
            }}
          >
            <CircularProgress size={16} />
          </Box>
        )}
      </Box>

      {parentsErrorMsg && (
        <Typography variant="medium" sx={{ color: theme.palette.error.light, lineHeight: 1.5 }}>
          {parentsErrorMsg}
        </Typography>
      )}
      {!parentsErrorMsg && formBusy && (
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
          Loading options…
        </Typography>
      )}
    </FormModal>
  );
}

