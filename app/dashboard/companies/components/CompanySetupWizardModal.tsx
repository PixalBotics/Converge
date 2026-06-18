"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Radio from "@mui/material/Radio";
import { alpha, useTheme } from "@mui/material/styles";
import { CheckCircle as CheckCircleIcon } from "@mui/icons-material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import type { AppTheme } from "@/theme/theme";
import { Button, DashboardCard, FormModal, InputField, SelectField, Typography } from "@/components/common";
import {
  useCompaniesSetupResellersQuery,
  useCompanySetupDraftByIdQuery,
  useCreateCompanySetupDraftMutation,
  useDepartmentsListQuery,
  useRolesListQuery,
  useSubmitCompanySetupDraftMutation,
  useUpdateCompanySetupDraftMutation,
} from "@/lib/hooks/query";
import {
  childrenDraftFieldPath,
  getCompanySetupFieldError,
  scrollToFirstCompanySetupFieldError,
} from "@/lib/companies/company-setup-draft-field-paths";
import { extractNestFieldErrors } from "@/lib/companies/extract-nest-field-errors";
import {
  buildChildrenDraftAutosaveBody,
  buildChildrenDraftPatchBody,
  buildResellerParentDraftSaveBody,
  extractCompanySetupDraftId,
  emptyDraftChildRow,
  emptyPocSlice,
  isChildRowPocComplete,
  MAX_POC_PER_CHILD,
  normalizeHttpsWebsiteUrl,
  readWizardHydrationFromDraft,
  type CompanySetupWizardHydration,
  type DraftChildPayload,
  type PocDraftSlice,
} from "@/lib/companies/setup-draft.utils";
import { pickItemsArray, toIdNameOption } from "@/app/dashboard/user-page/components/add-user-modal.utils";
import { publishAppToast } from "@/lib/notify";
import { formatPhoneInputValue, PHONE_INPUT_PLACEHOLDER } from "@/lib/ui/format-phone-input";
import { AddCircleIcon } from "@/components/common/icons";
import {
  stepperOuter,
  stepperSegment,
  stepperDivider,
  stepperCheckIcon,
  stepperNumberCircleActive,
  stepperNumberCircleInactive,
  stepperLabelResellerDone,
  stepperLabelResellerActive,
  stepperLabelChildDone,
  stepperLabelChildInactive,
  stepOneIncompleteHint,
  sectionStack,
  sectionHeaderRow,
  sectionHeaderRowWebsiteFirst,
  addAnotherButtonRight,
  addAnotherIcon,
  addAnotherLabel,
  childRemoveIconButton,
} from "../overview.styles";
import { CompanySetupChildPocsList } from "./CompanySetupChildPocsList";
import {
  useAuth,
  resolveSessionParentCompanyId,
  resolveSessionResellerId,
  sessionIsNarrowClientRootScope,
  sessionMayPickInternalUserScope,
} from "@/lib/auth";
import { canCompaniesModuleAction } from "@/lib/permissions";

export type CompanySetupWizardCloseReason = "completed" | "dismissed";

export type CompanySetupWizardModalProps = {
  open: boolean;
  draftId: string | null;
  onClose: (reason: CompanySetupWizardCloseReason) => void;
};

type SetupKind = "new_reseller" | "existing_reseller";

export function CompanySetupWizardModal({ open, draftId, onClose }: CompanySetupWizardModalProps) {
  const theme = useTheme() as AppTheme;
  const { isPlatformAdmin, user: authUser, hasPage, hasOperational } = useAuth();
  const canSetupDraftMutate =
    canCompaniesModuleAction(hasPage, hasOperational, "create") ||
    canCompaniesModuleAction(hasPage, hasOperational, "update");
  const canSubmitWizard = canCompaniesModuleAction(hasPage, hasOperational, "create");
  const canCreateNewReseller = sessionMayPickInternalUserScope(isPlatformAdmin, authUser);
  const isNarrowClientScope = sessionIsNarrowClientRootScope(isPlatformAdmin, authUser);
  const sessionParentCompanyId = resolveSessionParentCompanyId(authUser?.parentCompanyId);
  const sessionResellerId = resolveSessionResellerId(authUser?.resellerId);
  const [lockedParentCompanyId, setLockedParentCompanyId] = useState("");
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  /** Default: new reseller — no dropdown until user picks “under existing reseller”. */
  const [setupKind, setSetupKind] = useState<SetupKind>("new_reseller");
  const [resellerId, setResellerId] = useState("");
  const [parentCompanyName, setParentCompanyName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentAddress, setParentAddress] = useState("");
  const [draftChildRows, setDraftChildRows] = useState<DraftChildPayload[]>([emptyDraftChildRow()]);
  /** API `details.fields` / `fieldErrors` keyed by backend path (shown inline on inputs). */
  const [apiFieldErrors, setApiFieldErrors] = useState<Record<string, string>>({});
  /** After hydration from GET draft, skip re-applying until modal closes (avoids wiping user edits on refetch). */
  const hydratedDraftIdRef = useRef<string | null>(null);
  const draftChildRowsRef = useRef<DraftChildPayload[]>(draftChildRows);
  /** Avoid duplicate PATCH bodies while typing in step 2. */
  const lastChildrenPatchBodyRef = useRef<string>("");
  const wizardFieldsScrollRef = useRef<HTMLDivElement | null>(null);

  draftChildRowsRef.current = draftChildRows;

  const createDraftMutation = useCreateCompanySetupDraftMutation();
  const updateDraftMutation = useUpdateCompanySetupDraftMutation();
  /** Debounced step-2 PATCH: no global success/error toasts (inline field errors only). */
  const debouncedDraftUpdateMutation = useUpdateCompanySetupDraftMutation({ skipGlobalToast: true });
  const submitDraftMutation = useSubmitCompanySetupDraftMutation();
  /** DB run id — created only after step 1 Continue (not on Add Reseller). */
  const [activeRunId, setActiveRunId] = useState<string | null>(null);

  const debouncedDraftMutateAsyncRef = useRef(debouncedDraftUpdateMutation.mutateAsync);
  debouncedDraftMutateAsyncRef.current = debouncedDraftUpdateMutation.mutateAsync;
  /** Read inside debounced timer — avoids stale `isPending` after 1200ms. */
  const mutationsPendingRef = useRef(false);
  mutationsPendingRef.current =
    createDraftMutation.isPending ||
    updateDraftMutation.isPending ||
    submitDraftMutation.isPending ||
    debouncedDraftUpdateMutation.isPending;

  const effectiveRunId = activeRunId?.trim() || draftId?.trim() || "";

  const draftQuery = useCompanySetupDraftByIdQuery(effectiveRunId || null, {
    enabled: open && effectiveRunId.length > 0,
  });

  const resellersQuery = useCompaniesSetupResellersQuery({
    enabled: open,
  });

  const resellerIdForExternalDepartments = resellerId.trim();
  const departmentQueryParams = useMemo(
    () => ({ type: "External", resellerId: resellerIdForExternalDepartments }),
    [resellerIdForExternalDepartments],
  );

  const departmentsQuery = useDepartmentsListQuery(departmentQueryParams, {
    enabled: open && modalStep === 2 && resellerIdForExternalDepartments.length > 0,
    scope: "company-setup-wizard",
  });
  const rolesQuery = useRolesListQuery(undefined, {
    enabled: open && modalStep === 2,
  });

  const resellerOptions = useMemo(() => {
    return pickItemsArray(resellersQuery.data)
      .map((row) => toIdNameOption(row))
      .filter((o): o is { value: string; label: string } => o !== null);
  }, [resellersQuery.data]);

  const departmentOptions = useMemo(
    () =>
      pickItemsArray(departmentsQuery.data)
        .map((row) => toIdNameOption(row))
        .filter((o): o is { value: string; label: string } => o !== null),
    [departmentsQuery.data],
  );

  const roleOptions = useMemo(
    () =>
      pickItemsArray(rolesQuery.data)
        .map((row) => toIdNameOption(row))
        .filter((o): o is { value: string; label: string } => o !== null),
    [rolesQuery.data],
  );

  useEffect(() => {
    if (!open) return;
    setActiveRunId(draftId?.trim() || null);
    lastChildrenPatchBodyRef.current = "";
    hydratedDraftIdRef.current = null;
  }, [open, draftId]);

  useEffect(() => {
    if (modalStep === 1) lastChildrenPatchBodyRef.current = "";
  }, [modalStep]);

  const applyHydration = useCallback((parsed: CompanySetupWizardHydration & { modalStep: 1 | 2 }) => {
    setSetupKind(parsed.setupKind);
    setResellerId(parsed.resellerId);
    setParentCompanyName(parsed.parentCompanyName);
    setParentEmail(parsed.parentEmail);
    setParentPhone(parsed.parentPhone);
    setParentAddress(parsed.parentAddress);
    setDraftChildRows(
      parsed.draftChildRows.map((row) => ({
        ...row,
        phone: formatPhoneInputValue(row.phone),
      })),
    );
    setModalStep(parsed.modalStep);
  }, []);

  const hydrateFromDraftResponse = useCallback(
    (data: unknown, modalStepOverride?: 1 | 2) => {
      const parsed = readWizardHydrationFromDraft(data, modalStepOverride);
      if (!parsed) return false;
      applyHydration(parsed);
      return true;
    },
    [applyHydration],
  );

  const applyApiErrorsFromCatch = (err: unknown) => {
    setApiFieldErrors(extractNestFieldErrors(err));
  };

  /** After validation errors render, scroll the modal body to the first failing field. */
  useEffect(() => {
    if (!open) return;
    const hasErr = Object.values(apiFieldErrors).some((v) => v?.trim());
    if (!hasErr) return;
    const t = window.setTimeout(() => {
      scrollToFirstCompanySetupFieldError(wizardFieldsScrollRef.current, apiFieldErrors);
    }, 0);
    return () => window.clearTimeout(t);
  }, [apiFieldErrors, open, modalStep]);

  const clearChildrenDraftFieldErrors = (childIndex: number) => {
    setApiFieldErrors((prev) => {
      const prefix = `childrenDraft.children.${childIndex}.`;
      const next = { ...prev };
      for (const k of Object.keys(next)) {
        if (k.startsWith(prefix)) delete next[k];
      }
      return next;
    });
  };

  const clearResellerParentFieldErrors = () => {
    setApiFieldErrors((prev) => {
      const next = { ...prev };
      for (const k of Object.keys(next)) {
        if (k.startsWith("resellerParentDraft.") || k === "resellerId") delete next[k];
      }
      return next;
    });
  };

  useEffect(() => {
    if (!open) {
      hydratedDraftIdRef.current = null;
      lastChildrenPatchBodyRef.current = "";
      setActiveRunId(null);
      setApiFieldErrors({});
      setModalStep(1);
      setSetupKind("new_reseller");
      setResellerId("");
      setLockedParentCompanyId("");
      setParentCompanyName("");
      setParentEmail("");
      setParentPhone("");
      setParentAddress("");
      setDraftChildRows([emptyDraftChildRow()]);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (canCreateNewReseller) return;
    if (setupKind !== "existing_reseller") {
      setSetupKind("existing_reseller");
    }
  }, [open, canCreateNewReseller, setupKind]);

  useEffect(() => {
    if (!open) return;
    if (!isNarrowClientScope) {
      setLockedParentCompanyId("");
      return;
    }
    setSetupKind("existing_reseller");
    if (sessionResellerId) setResellerId(sessionResellerId);
    if (sessionParentCompanyId) setLockedParentCompanyId(sessionParentCompanyId);
  }, [open, isNarrowClientScope, sessionResellerId, sessionParentCompanyId]);

  /** Hydrate form from GET `/companies/setup/draft/{id}` once per open for this draft id. */
  useEffect(() => {
    if (!open || !effectiveRunId) return;
    if (!draftQuery.isSuccess || draftQuery.data === undefined) return;
    if (hydratedDraftIdRef.current === effectiveRunId) return;
    if (!hydrateFromDraftResponse(draftQuery.data)) {
      hydratedDraftIdRef.current = effectiveRunId;
      return;
    }
    hydratedDraftIdRef.current = effectiveRunId;
  }, [open, effectiveRunId, draftQuery.isSuccess, draftQuery.data, hydrateFromDraftResponse]);

  const handleBackToStep1 = () => {
    void (async () => {
      if (!effectiveRunId) {
        setModalStep(1);
        return;
      }
      const refreshed = await draftQuery.refetch();
      const payload = refreshed.data ?? draftQuery.data;
      if (payload) {
        hydrateFromDraftResponse(payload, 1);
      } else {
        setModalStep(1);
      }
      if (canSetupDraftMutate) {
        try {
          await updateDraftMutation.mutateAsync({
            id: effectiveRunId,
            body: { step: "reseller_parent" },
          });
        } catch (err) {
          applyApiErrorsFromCatch(err);
        }
      }
    })();
  };

  /** Persist children draft to server while editing step 2 so GET-after-refresh can hydrate rows. */
  useEffect(() => {
    if (!open || !effectiveRunId || modalStep !== 2) return;
    if (!canSetupDraftMutate) return;
    if (
      updateDraftMutation.isPending ||
      submitDraftMutation.isPending ||
      debouncedDraftUpdateMutation.isPending
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (mutationsPendingRef.current) return;
      const rows = draftChildRowsRef.current;
      if (!rows.some((r) => r.name.trim().length > 0)) return;
      const body = buildChildrenDraftAutosaveBody(rows);
      const serialized = JSON.stringify(body);
      if (serialized === lastChildrenPatchBodyRef.current) return;
      void (async () => {
        try {
          await debouncedDraftMutateAsyncRef.current({ id: effectiveRunId, body });
          lastChildrenPatchBodyRef.current = serialized;
        } catch (err) {
          applyApiErrorsFromCatch(err);
        }
      })();
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [
    open,
    effectiveRunId,
    modalStep,
    draftChildRows,
    updateDraftMutation.isPending,
    submitDraftMutation.isPending,
    debouncedDraftUpdateMutation.isPending,
    canSetupDraftMutate,
  ]);

  const parentPayload = useMemo(
    () => ({
      name: parentCompanyName,
      email: parentEmail,
      phone: parentPhone,
      address: parentAddress,
    }),
    [parentCompanyName, parentEmail, parentPhone, parentAddress],
  );

  const isStepOneComplete =
    lockedParentCompanyId.trim().length > 0
      ? resellerId.trim().length > 0 || sessionResellerId.length > 0
      : parentCompanyName.trim().length > 0 &&
        (setupKind === "new_reseller" || resellerId.trim().length > 0);

  const isStepTwoComplete = useMemo(() => {
    const rows = draftChildRows.filter((r) => r.name.trim().length > 0);
    if (rows.length === 0) return false;
    return rows.every(
      (r) =>
        r.email.trim().length > 0 &&
        r.phone.trim().length > 0 &&
        r.address.trim().length > 0 &&
        isChildRowPocComplete(r),
    );
  }, [draftChildRows]);

  const resellerSelectError = useMemo(
    () =>
      getCompanySetupFieldError(apiFieldErrors, "resellerId") ||
      getCompanySetupFieldError(apiFieldErrors, "resellerParentDraft.resellerId"),
    [apiFieldErrors],
  );

  const handleClose = () => {
    if (
      createDraftMutation.isPending ||
      updateDraftMutation.isPending ||
      submitDraftMutation.isPending
    ) {
      return;
    }
    onClose("dismissed");
  };

  const handlePrimary = () => {
    void (async () => {
      if (!canSetupDraftMutate) return;
      if (modalStep === 1) {
        if (!isStepOneComplete) return;
        try {
          let runId = effectiveRunId;
          if (!runId) {
            const created = await createDraftMutation.mutateAsync({});
            runId = extractCompanySetupDraftId(created) ?? "";
            if (!runId) {
              publishAppToast({
                variant: "error",
                message: "Could not start setup draft. Please try again.",
              });
              return;
            }
            setActiveRunId(runId);
            hydratedDraftIdRef.current = null;
          }
          await updateDraftMutation.mutateAsync({
            id: runId,
            body: buildResellerParentDraftSaveBody(
              setupKind === "new_reseller"
                ? {
                    kind: "new_reseller",
                    parent: parentPayload,
                  }
                : {
                    kind: "existing_reseller",
                    resellerId: resellerId.trim() || sessionResellerId,
                    parentCompanyId: lockedParentCompanyId.trim() || undefined,
                    parent: lockedParentCompanyId.trim()
                      ? {
                          ...parentPayload,
                          name: parentPayload.name.trim() || "—",
                        }
                      : parentPayload,
                  },
            ),
          });
          setApiFieldErrors((prev) => {
            const next = { ...prev };
            for (const k of Object.keys(next)) {
              if (k.startsWith("resellerParentDraft.") || k === "resellerId") delete next[k];
            }
            return next;
          });
          setModalStep(2);
        } catch (err) {
          applyApiErrorsFromCatch(err);
        }
        return;
      }
      if (!effectiveRunId) return;
      if (!isStepTwoComplete) return;
      if (!canSubmitWizard) {
        publishAppToast({
          variant: "error",
          message: "You do not have permission to submit this setup.",
        });
        return;
      }
      try {
        await updateDraftMutation.mutateAsync({
          id: effectiveRunId,
          body: buildChildrenDraftPatchBody(draftChildRows),
        });
        await submitDraftMutation.mutateAsync(effectiveRunId);
        onClose("completed");
      } catch (err) {
        applyApiErrorsFromCatch(err);
      }
    })();
  };

  const updateChildRow = (index: number, patch: Partial<DraftChildPayload>) => {
    clearChildrenDraftFieldErrors(index);
    setDraftChildRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  };

  const removeChildRow = (index: number) => {
    setApiFieldErrors((prev) => {
      const next = { ...prev };
      for (const k of Object.keys(next)) {
        if (k.startsWith("childrenDraft.children.")) delete next[k];
      }
      return next;
    });
    setDraftChildRows((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const addChildRow = () => {
    setDraftChildRows((prev) => [...prev, emptyDraftChildRow()]);
  };

  const updateChildPoc = (
    childIndex: number,
    pocIndex: number,
    patch: Partial<PocDraftSlice>,
  ) => {
    clearChildrenDraftFieldErrors(childIndex);
    setDraftChildRows((prev) =>
      prev.map((row, i) => {
        if (i !== childIndex) return row;
        const pocRows = row.pocRows.map((p, pi) => (pi === pocIndex ? { ...p, ...patch } : p));
        return { ...row, pocRows };
      }),
    );
  };

  const addChildPoc = (childIndex: number) => {
    clearChildrenDraftFieldErrors(childIndex);
    setDraftChildRows((prev) =>
      prev.map((row, i) => {
        if (i !== childIndex || row.pocRows.length >= MAX_POC_PER_CHILD) return row;
        return { ...row, pocRows: [...row.pocRows, emptyPocSlice()] };
      }),
    );
  };

  const removeChildPoc = (childIndex: number, pocIndex: number) => {
    clearChildrenDraftFieldErrors(childIndex);
    setDraftChildRows((prev) =>
      prev.map((row, i) => {
        if (i !== childIndex || pocIndex <= 0) return row;
        return { ...row, pocRows: row.pocRows.filter((_, pi) => pi !== pocIndex) };
      }),
    );
  };

  const updateChildWebsiteUrlSlot = (childIndex: number, urlIndex: number, value: string) => {
    clearChildrenDraftFieldErrors(childIndex);
    setDraftChildRows((prev) =>
      prev.map((r, i) => {
        if (i !== childIndex) return r;
        const next = [...r.websiteUrls];
        next[urlIndex] = value;
        return { ...r, websiteUrls: next };
      }),
    );
  };

  const addWebsiteSlot = (childIndex: number) => {
    clearChildrenDraftFieldErrors(childIndex);
    setDraftChildRows((prev) =>
      prev.map((r, i) => (i === childIndex ? { ...r, websiteUrls: [...r.websiteUrls, ""] } : r)),
    );
  };

  const removeWebsiteSlot = (childIndex: number, urlIndex: number) => {
    clearChildrenDraftFieldErrors(childIndex);
    setDraftChildRows((prev) =>
      prev.map((r, i) => {
        if (i !== childIndex) return r;
        if (r.websiteUrls.length <= 1) return { ...r, websiteUrls: [""] };
        return { ...r, websiteUrls: r.websiteUrls.filter((_, ui) => ui !== urlIndex) };
      }),
    );
  };

  if (!open) return null;

  return (
    <FormModal
      open={open}
      fieldsScrollRef={wizardFieldsScrollRef}
      title={
        modalStep === 1
          ? isNarrowClientScope
            ? "Add Child Companies"
            : "Reseller / Parent Company"
          : "Add Child Companies"
      }
      description={
        modalStep === 1
          ? isNarrowClientScope
            ? "Child companies are added under your assigned parent company. Continue to enter branch details and points of contact."
            : "Choose how this company sits in the hierarchy. Nothing is saved until you click Continue with a complete parent company name."
          : "Add each child company and up to five points of contact. Your work is saved to the draft as you type. Use Save at the end to create everything."
      }
      onClose={handleClose}
      onSave={handlePrimary}
      primaryButtonLabel={
        modalStep === 1
          ? createDraftMutation.isPending || updateDraftMutation.isPending
            ? "Saving draft…"
            : "Continue"
          : submitDraftMutation.isPending
            ? "Saving…"
            : "Save"
      }
      primaryButtonDisabled={
        modalStep === 1
          ? !isStepOneComplete ||
            createDraftMutation.isPending ||
            updateDraftMutation.isPending ||
            !canSetupDraftMutate
          : !isStepTwoComplete ||
            !effectiveRunId ||
            updateDraftMutation.isPending ||
            submitDraftMutation.isPending ||
            !canSetupDraftMutate ||
            !canSubmitWizard
      }
      cancelButtonLabel="Cancel"
    >
      <Box sx={stepperOuter}>
        <Box sx={stepperSegment}>
          {modalStep >= 2 ? (
            <CheckCircleIcon sx={stepperCheckIcon} />
          ) : (
            <Box sx={stepperNumberCircleActive}>1</Box>
          )}
          <Typography
            variant="body2"
            sx={modalStep >= 2 ? stepperLabelResellerDone : stepperLabelResellerActive}
          >
            Reseller / Parent Company
          </Typography>
        </Box>
        <Box sx={stepperDivider} />
        <Box sx={stepperSegment}>
          {modalStep === 2 ? (
            <CheckCircleIcon sx={stepperCheckIcon} />
          ) : (
            <Box sx={stepperNumberCircleInactive}>2</Box>
          )}
          <Typography
            variant="body2"
            sx={modalStep === 2 ? stepperLabelChildDone : stepperLabelChildInactive}
          >
            Child Company Setup
          </Typography>
        </Box>
      </Box>

      {modalStep === 1 ? (
        <>
          {isNarrowClientScope ? (
            <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 2 }}>
              You can add child companies only under your organization. A new parent company or
              reseller cannot be created from your account.
            </Typography>
          ) : (
            <Typography variant="medium" color="white" fontWeight={600} sx={{ mb: 1 }}>
              How should this company sit in the tree?
            </Typography>
          )}
          {!isNarrowClientScope ? (
          <Box
            role="radiogroup"
            aria-label="Reseller placement"
            sx={{
              display: "grid",
              gridTemplateColumns: canCreateNewReseller ? { xs: "1fr", sm: "1fr 1fr" } : "1fr",
              gap: 2,
              mb: 1.5,
            }}
          >
            {canCreateNewReseller ? (
              <DashboardCard
                sx={{
                  p: 2,
                  borderRadius: 2,
                  cursor: "pointer",
                  transition: "background-color 160ms ease, box-shadow 160ms ease",
                  background:
                    setupKind === "new_reseller" ? theme.app.dashboard.navActiveBg : theme.app.dashboard.cardBg,
                  boxShadow:
                    setupKind === "new_reseller"
                      ? `0 0 0 1px ${alpha(theme.app.dashboard.accentBlue, 0.45)}`
                      : "none",
                }}
                onClick={() => {
                  clearResellerParentFieldErrors();
                  setSetupKind("new_reseller");
                  setResellerId("");
                }}
              >
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
                  <Radio
                    name="company-setup-kind"
                    checked={setupKind === "new_reseller"}
                    onChange={() => {
                      clearResellerParentFieldErrors();
                      setSetupKind("new_reseller");
                      setResellerId("");
                    }}
                    value="new_reseller"
                    disableRipple
                    icon={
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          border: "2px solid rgba(148,163,184,0.55)",
                          bgcolor: "transparent",
                        }}
                      />
                    }
                    checkedIcon={
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          bgcolor: theme.app.dashboard.accentBlue,
                          boxShadow: `0 0 0 4px ${alpha(theme.app.dashboard.accentBlue, 0.32)}`,
                        }}
                      />
                    }
                    sx={{ p: 0.25, mt: 0.125 }}
                  />
                  <Box>
                    <Typography variant="medium" color="white" sx={{ mb: 0.25 }}>
                      New reseller
                    </Typography>
                    <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.45 }}>
                      Parent company only — no reseller to pick from the list.
                    </Typography>
                  </Box>
                </Box>
              </DashboardCard>
            ) : null}
            <DashboardCard
              sx={{
                p: 2,
                borderRadius: 2,
                cursor: "pointer",
                transition: "background-color 160ms ease, box-shadow 160ms ease",
                background:
                  setupKind === "existing_reseller"
                    ? theme.app.dashboard.navActiveBg
                    : theme.app.dashboard.cardBg,
                boxShadow:
                  setupKind === "existing_reseller"
                    ? `0 0 0 1px ${alpha(theme.app.dashboard.accentBlue, 0.45)}`
                    : "none",
              }}
              onClick={() => {
                clearResellerParentFieldErrors();
                setSetupKind("existing_reseller");
              }}
            >
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
                <Radio
                  name="company-setup-kind"
                  checked={setupKind === "existing_reseller"}
                  onChange={() => {
                    clearResellerParentFieldErrors();
                    setSetupKind("existing_reseller");
                  }}
                  value="existing_reseller"
                  disableRipple
                  icon={
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        border: "2px solid rgba(148,163,184,0.55)",
                        bgcolor: "transparent",
                      }}
                    />
                  }
                  checkedIcon={
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        bgcolor: theme.app.dashboard.accentBlue,
                        boxShadow: `0 0 0 4px ${alpha(theme.app.dashboard.accentBlue, 0.32)}`,
                      }}
                    />
                  }
                  sx={{ p: 0.25, mt: 0.125 }}
                />
                <Box>
                  <Typography variant="medium" color="white" sx={{ mb: 0.25 }}>
                    Under existing reseller
                  </Typography>
                  <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.45 }}>
                    Choose reseller from the list, then the parent company.
                  </Typography>
                </Box>
              </Box>
            </DashboardCard>
          </Box>
          ) : null}

          {setupKind === "existing_reseller" && !lockedParentCompanyId ? (
            <Box>
              <SelectField
                label="Reseller"
                value={resellerId}
                scrollAnchorPath="resellerId,resellerParentDraft.resellerId"
                onChange={(id) => {
                  clearResellerParentFieldErrors();
                  setResellerId(id);
                }}
                options={
                  resellerOptions.length > 0
                    ? resellerOptions
                    : [{ value: "", label: resellersQuery.isLoading ? "Loading…" : "— Select —" }]
                }
              />
              {resellerSelectError ? (
                <Typography
                  variant="caption"
                  sx={{ color: theme.palette.error.main, display: "block", mt: 0.5 }}
                >
                  {resellerSelectError}
                </Typography>
              ) : null}
            </Box>
          ) : null}
          {!lockedParentCompanyId ? (
            <InputField
              label="Parent company name"
              placeholder="Type the parent company name"
              value={parentCompanyName}
              scrollAnchorPath="resellerParentDraft.parent.name"
              error={!!getCompanySetupFieldError(apiFieldErrors, "resellerParentDraft.parent.name")}
              helperText={
                getCompanySetupFieldError(apiFieldErrors, "resellerParentDraft.parent.name") ||
                undefined
              }
              onChange={(event) => {
                clearResellerParentFieldErrors();
                setParentCompanyName(event.target.value);
              }}
            />
          ) : null}
          {!isStepOneComplete && (
            <Typography variant="body2" sx={stepOneIncompleteHint}>
              {lockedParentCompanyId
                ? "Your session is missing reseller context. Contact an administrator."
                : setupKind === "new_reseller"
                  ? "Enter the parent company name to continue."
                  : "Pick a reseller from the list and enter the parent company name."}
            </Typography>
          )}
        </>
      ) : (
        <>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1.5,
              flexWrap: "wrap",
              mb: 0.5,
            }}
          >
            <Button
              variant="secondary"
              onClick={handleBackToStep1}
              disabled={updateDraftMutation.isPending || submitDraftMutation.isPending}
              sx={{ minWidth: 140 }}
            >
              Back to Step 1
            </Button>
            <Box
              component="button"
              type="button"
              onClick={addChildRow}
              sx={addAnotherButtonRight}
              disabled={updateDraftMutation.isPending || submitDraftMutation.isPending}
            >
              <AddCircleIcon width={16} height={16} sx={addAnotherIcon} />
              <Typography variant="body2" sx={addAnotherLabel}>
                Add child company
              </Typography>
            </Box>
          </Box>
          {draftChildRows.map((row, index) => (
            <Box key={`child-draft-${index}`} sx={sectionStack}>
              <Box sx={sectionHeaderRow}>
                <Typography variant="mediumLarge" color="white">
                  {`Child company ${index + 1}`}
                </Typography>
                {index > 0 ? (
                  <IconButton
                    type="button"
                    size="small"
                    sx={childRemoveIconButton}
                    aria-label={`Remove child company ${index + 1}`}
                    onClick={() => removeChildRow(index)}
                  >
                    <DeleteOutlineRoundedIcon sx={{ fontSize: 22 }} />
                  </IconButton>
                ) : null}
              </Box>
              <InputField
                label="Company name"
                placeholder="Branch name"
                value={row.name}
                scrollAnchorPath={childrenDraftFieldPath(index, "name")}
                error={!!getCompanySetupFieldError(apiFieldErrors, childrenDraftFieldPath(index, "name"))}
                helperText={
                  getCompanySetupFieldError(apiFieldErrors, childrenDraftFieldPath(index, "name")) ||
                  undefined
                }
                onChange={(e) => updateChildRow(index, { name: e.target.value })}
              />
              <InputField
                label="Email"
                placeholder="branch@client.com"
                type="email"
                value={row.email}
                scrollAnchorPath={childrenDraftFieldPath(index, "email")}
                error={!!getCompanySetupFieldError(apiFieldErrors, childrenDraftFieldPath(index, "email"))}
                helperText={
                  getCompanySetupFieldError(apiFieldErrors, childrenDraftFieldPath(index, "email")) ||
                  undefined
                }
                onChange={(e) => updateChildRow(index, { email: e.target.value })}
              />
              <InputField
                label="Phone"
                placeholder={PHONE_INPUT_PLACEHOLDER}
                type="phone"
                value={row.phone}
                scrollAnchorPath={childrenDraftFieldPath(index, "phone")}
                error={!!getCompanySetupFieldError(apiFieldErrors, childrenDraftFieldPath(index, "phone"))}
                helperText={
                  getCompanySetupFieldError(apiFieldErrors, childrenDraftFieldPath(index, "phone")) ||
                  undefined
                }
                onChange={(e) => updateChildRow(index, { phone: e.target.value })}
              />
              <InputField
                label="Address"
                placeholder="Address"
                value={row.address}
                scrollAnchorPath={childrenDraftFieldPath(index, "address")}
                error={!!getCompanySetupFieldError(apiFieldErrors, childrenDraftFieldPath(index, "address"))}
                helperText={
                  getCompanySetupFieldError(apiFieldErrors, childrenDraftFieldPath(index, "address")) ||
                  undefined
                }
                onChange={(e) => updateChildRow(index, { address: e.target.value })}
              />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, width: "100%" }}>
                <Box sx={sectionHeaderRowWebsiteFirst}>
                  <Typography variant="medium" color="white" fontWeight={600}>
                    Websites
                  </Typography>
                  <Box
                    component="button"
                    type="button"
                    onClick={() => addWebsiteSlot(index)}
                    sx={addAnotherButtonRight}
                  >
                    <AddCircleIcon width={16} height={16} sx={addAnotherIcon} />
                    <Typography variant="body2" sx={addAnotherLabel}>
                      Add website
                    </Typography>
                  </Box>
                </Box>
                {row.websiteUrls.map((url, wi) => (
                  <Box
                    key={`child-${index}-website-${wi}`}
                    sx={{ display: "flex", gap: 1, alignItems: "flex-start", width: "100%" }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <InputField
                        label={wi === 0 ? "Website URL" : `Website URL ${wi + 1}`}
                        placeholder="https://branch.example.com"
                        value={url}
                        inputProps={{ maxLength: 2000 }}
                        scrollAnchorPath={
                          wi === 0
                            ? `${childrenDraftFieldPath(index, "website.url")},${childrenDraftFieldPath(index, "website")}`
                            : undefined
                        }
                        error={
                          wi === 0 &&
                          !!(
                            getCompanySetupFieldError(
                              apiFieldErrors,
                              childrenDraftFieldPath(index, "website.url"),
                            ) ||
                            getCompanySetupFieldError(
                              apiFieldErrors,
                              childrenDraftFieldPath(index, "website"),
                            )
                          )
                        }
                        helperText={
                          (wi === 0 &&
                            (getCompanySetupFieldError(
                              apiFieldErrors,
                              childrenDraftFieldPath(index, "website.url"),
                            ) ||
                              getCompanySetupFieldError(
                                apiFieldErrors,
                                childrenDraftFieldPath(index, "website"),
                              ))) ||
                          undefined
                        }
                        onChange={(e) => updateChildWebsiteUrlSlot(index, wi, e.target.value)}
                        onBlur={() => {
                          const n = normalizeHttpsWebsiteUrl(url);
                          if (n && n !== url) updateChildWebsiteUrlSlot(index, wi, n);
                        }}
                      />
                    </Box>
                    {wi > 0 ? (
                      <IconButton
                        type="button"
                        size="small"
                        aria-label={`Remove website ${wi + 1}`}
                        onClick={() => removeWebsiteSlot(index, wi)}
                        sx={childRemoveIconButton}
                      >
                        <DeleteOutlineRoundedIcon sx={{ fontSize: 22 }} />
                      </IconButton>
                    ) : null}
                  </Box>
                ))}
              </Box>
              <CompanySetupChildPocsList
                childIndex={index}
                pocRows={row.pocRows}
                updatePocRow={(pocIndex, patch) => updateChildPoc(index, pocIndex, patch)}
                addPocRow={() => addChildPoc(index)}
                removePocRow={(pocIndex) => removeChildPoc(index, pocIndex)}
                roleOptions={roleOptions}
                departmentOptions={departmentOptions}
                rolesLoading={rolesQuery.isLoading}
                departmentsLoading={departmentsQuery.isLoading}
                fieldErrors={apiFieldErrors}
                companySetupKind={setupKind}
              />
            </Box>
          ))}
          <Typography
            variant="body2"
            sx={{
              color: theme.app.dashboard.textMuted,
              mt: -0.25,
              lineHeight: 1.5,
            }}
          >
            Draft autosaves while you edit. Save creates everything in the system when the checklist
            below is complete.
          </Typography>
          {!isStepTwoComplete && (
            <Typography variant="body2" sx={stepOneIncompleteHint}>
              Enter at least one child with company details, websites (optional), and at least one
              complete POC (name, email, role, designation; department optional).
            </Typography>
          )}
        </>
      )}
    </FormModal>
  );
}
