"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import { useTheme } from "@mui/material/styles";
import { CheckCircle as CheckCircleIcon } from "@mui/icons-material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import type { AppTheme } from "@/theme/theme";
import { Button, FormModal, InputField, SelectField, Typography } from "@/components/common";
import {
  useCompaniesSetupResellersQuery,
  useCompanySetupDraftByIdQuery,
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
  buildChildrenDraftPatchBody,
  buildResellerParentDraftPatchBody,
  emptyDraftChildRow,
  isChildRowPocComplete,
  normalizeHttpsWebsiteUrl,
  parseCompanySetupDraftRunForWizard,
  type DraftChildPayload,
} from "@/lib/companies/setup-draft.utils";
import { pickItemsArray, toIdNameOption } from "@/app/dashboard/user-page/components/add-user-modal.utils";
import { publishAppToast } from "@/lib/notify";
import { DeleteCircleIcon } from "@/components/dashboard/icons/DeleteCircleIcon";
import { AddCircleIcon } from "@/components/dashboard/icons/AddCircleIcon";
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
  deleteIconButton,
  addAnotherButton,
  addAnotherIcon,
  addAnotherLabel,
} from "../overview.styles";
import { CompanySetupChildPocBlock } from "./CompanySetupChildPocBlock";
import { useAuth, sessionMayPickInternalUserScope } from "@/lib/auth";
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
  const canCreateNewReseller = sessionMayPickInternalUserScope(isPlatformAdmin, authUser?.userType);
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

  const updateDraftMutation = useUpdateCompanySetupDraftMutation();
  /** Debounced step-2 PATCH: no global success/error toasts (inline field errors only). */
  const debouncedDraftUpdateMutation = useUpdateCompanySetupDraftMutation({ skipGlobalToast: true });
  const submitDraftMutation = useSubmitCompanySetupDraftMutation();

  const debouncedDraftMutateAsyncRef = useRef(debouncedDraftUpdateMutation.mutateAsync);
  debouncedDraftMutateAsyncRef.current = debouncedDraftUpdateMutation.mutateAsync;
  /** Read inside debounced timer — avoids stale `isPending` after 1200ms. */
  const mutationsPendingRef = useRef(false);
  mutationsPendingRef.current =
    updateDraftMutation.isPending ||
    submitDraftMutation.isPending ||
    debouncedDraftUpdateMutation.isPending;

  const draftQuery = useCompanySetupDraftByIdQuery(draftId, {
    enabled: open && !!draftId?.trim(),
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
    lastChildrenPatchBodyRef.current = "";
  }, [draftId]);

  useEffect(() => {
    if (modalStep === 1) lastChildrenPatchBodyRef.current = "";
  }, [modalStep]);

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
      setApiFieldErrors({});
      setModalStep(1);
      setSetupKind("new_reseller");
      setResellerId("");
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

  /** Hydrate form from GET `/companies/setup/draft/{id}` once per open for this draft id. */
  useEffect(() => {
    if (!open || !draftId?.trim()) return;
    if (!draftQuery.isSuccess || draftQuery.data === undefined) return;
    if (hydratedDraftIdRef.current === draftId) return;
    const parsed = parseCompanySetupDraftRunForWizard(draftQuery.data);
    if (!parsed) {
      hydratedDraftIdRef.current = draftId;
      return;
    }
    setSetupKind(parsed.setupKind);
    setResellerId(parsed.resellerId);
    setParentCompanyName(parsed.parentCompanyName);
    setParentEmail(parsed.parentEmail);
    setParentPhone(parsed.parentPhone);
    setParentAddress(parsed.parentAddress);
    setDraftChildRows(parsed.draftChildRows);
    setModalStep(parsed.modalStep);
    hydratedDraftIdRef.current = draftId;
  }, [open, draftId, draftQuery.isSuccess, draftQuery.data]);

  /** Persist children draft to server while editing step 2 so GET-after-refresh can hydrate rows. */
  useEffect(() => {
    if (!open || !draftId?.trim() || modalStep !== 2) return;
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
      const body = buildChildrenDraftPatchBody(rows);
      const serialized = JSON.stringify(body);
      if (serialized === lastChildrenPatchBodyRef.current) return;
      void (async () => {
        try {
          await debouncedDraftMutateAsyncRef.current({ id: draftId, body });
          lastChildrenPatchBodyRef.current = serialized;
        } catch (err) {
          applyApiErrorsFromCatch(err);
        }
      })();
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [
    open,
    draftId,
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
    parentCompanyName.trim().length > 0 &&
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
    if (updateDraftMutation.isPending || submitDraftMutation.isPending) return;
    onClose("dismissed");
  };

  const handlePrimary = () => {
    void (async () => {
      if (!draftId) return;
      if (!canSetupDraftMutate) return;
      if (modalStep === 1) {
        if (!isStepOneComplete) return;
        try {
          await updateDraftMutation.mutateAsync({
            id: draftId,
            body: buildResellerParentDraftPatchBody(
              setupKind === "new_reseller"
                ? {
                    kind: "new_reseller",
                    parent: parentPayload,
                  }
                : {
                    kind: "existing_reseller",
                    resellerId,
                    parent: parentPayload,
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
          id: draftId,
          body: buildChildrenDraftPatchBody(draftChildRows),
        });
        await submitDraftMutation.mutateAsync(draftId);
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

  if (!open || !draftId) return null;

  return (
    <FormModal
      open={open}
      fieldsScrollRef={wizardFieldsScrollRef}
      title={modalStep === 1 ? "Reseller / Parent Company" : "Add Child Companies"}
      description={
        modalStep === 1
          ? "Choose how this company sits in the hierarchy, complete the fields that apply, then continue to child companies."
          : "Add each child company and its point of contact. When the checklist is complete, submit to create everything."
      }
      onClose={handleClose}
      onSave={handlePrimary}
      primaryButtonLabel={
        modalStep === 1
          ? "Save & continue"
          : submitDraftMutation.isPending
            ? "Submitting…"
            : "Finish & create"
      }
      primaryButtonDisabled={
        modalStep === 1
          ? !isStepOneComplete ||
            !draftId ||
            updateDraftMutation.isPending ||
            !canSetupDraftMutate
          : !isStepTwoComplete ||
            !draftId ||
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
          <Typography variant="medium" color="white" fontWeight={600} sx={{ mb: 1 }}>
            How should this company sit in the tree?
          </Typography>
          <FormControl
            component="fieldset"
            sx={{
              width: "100%",
              mb: 1.5,
              m: 0,
              p: 0,
              border: "none",
            }}
          >
            <RadioGroup
              value={setupKind}
              onChange={(e) => {
                const v = e.target.value;
                if (v !== "new_reseller" && v !== "existing_reseller") return;
                clearResellerParentFieldErrors();
                if (!canCreateNewReseller && v === "new_reseller") return;
                setSetupKind(v);
                if (v === "new_reseller") setResellerId("");
              }}
            >
              {canCreateNewReseller ? (
                <FormControlLabel
                  value="new_reseller"
                  control={
                    <Radio
                      size="small"
                      sx={{
                        color: theme.app.dashboard.textMuted,
                        "&.Mui-checked": { color: theme.app.dashboard.accentBlue },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" color="white">
                      New reseller — only enter the parent company name (no reseller to pick).
                    </Typography>
                  }
                  sx={{ alignItems: "flex-start", ml: 0, mr: 0, mb: 0.5 }}
                />
              ) : null}
              <FormControlLabel
                value="existing_reseller"
                control={
                  <Radio
                    size="small"
                    sx={{
                      color: theme.app.dashboard.textMuted,
                      "&.Mui-checked": { color: theme.app.dashboard.accentBlue },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" color="white">
                    Under an existing reseller — then choose reseller and parent company.
                  </Typography>
                }
                sx={{ alignItems: "flex-start", ml: 0, mr: 0 }}
              />
            </RadioGroup>
          </FormControl>

          {setupKind === "existing_reseller" ? (
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
          {!isStepOneComplete && (
            <Typography variant="body2" sx={stepOneIncompleteHint}>
              {setupKind === "new_reseller"
                ? "Enter the parent company name to continue."
                : "Pick a reseller from the list and enter the parent company name."}
            </Typography>
          )}
        </>
      ) : (
        <>
          <Button
            variant="secondary"
            onClick={() => setModalStep(1)}
            disabled={updateDraftMutation.isPending || submitDraftMutation.isPending}
            sx={{ minWidth: 140, alignSelf: "flex-start", mb: 0.5 }}
          >
            Back to Step 1
          </Button>
          {draftChildRows.map((row, index) => (
            <Box key={`child-draft-${index}`} sx={sectionStack}>
              <Box sx={sectionHeaderRow}>
                <Typography variant="mediumLarge" color="white">
                  {`Child company ${index + 1}`}
                </Typography>
                <IconButton
                  type="button"
                  size="small"
                  sx={deleteIconButton}
                  aria-label={`Remove child company ${index + 1}`}
                  disabled={draftChildRows.length <= 1}
                  onClick={() => removeChildRow(index)}
                >
                  <DeleteCircleIcon width={43} height={43} />
                </IconButton>
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
                placeholder="Phone"
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
                <Typography variant="medium" color="white" fontWeight={600}>
                  Websites
                </Typography>
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
                    <IconButton
                      type="button"
                      size="small"
                      aria-label={`Remove website ${wi + 1}`}
                      disabled={row.websiteUrls.length <= 1}
                      onClick={() => removeWebsiteSlot(index, wi)}
                      sx={{
                        alignSelf: "center",
                        flexShrink: 0,
                        color: theme.app.dashboard.textMuted,
                        "&:hover": { color: theme.app.text.primary, bgcolor: "rgba(255,255,255,0.06)" },
                      }}
                    >
                      <DeleteOutlineRoundedIcon sx={{ fontSize: 22 }} />
                    </IconButton>
                  </Box>
                ))}
                <Box component="button" type="button" onClick={() => addWebsiteSlot(index)} sx={addAnotherButton}>
                  <AddCircleIcon width={16} height={16} sx={addAnotherIcon} />
                  <Typography variant="body2" sx={addAnotherLabel}>
                    Add another website
                  </Typography>
                </Box>
              </Box>
              <CompanySetupChildPocBlock
                row={row}
                childIndex={index}
                updateChildRow={updateChildRow}
                roleOptions={roleOptions}
                departmentOptions={departmentOptions}
                rolesLoading={rolesQuery.isLoading}
                departmentsLoading={departmentsQuery.isLoading}
                fieldErrors={apiFieldErrors}
                companySetupKind={setupKind}
              />
            </Box>
          ))}
          <Box component="button" type="button" onClick={addChildRow} sx={addAnotherButton}>
            <AddCircleIcon width={16} height={16} sx={addAnotherIcon} />
            <Typography variant="body2" sx={addAnotherLabel}>
              Add another child company
            </Typography>
          </Box>
          {!isStepTwoComplete && (
            <Typography variant="body2" sx={stepOneIncompleteHint}>
              Enter at least one child with company details, websites (optional), and a complete POC
              (name, email, role, department, designation).
            </Typography>
          )}
        </>
      )}
    </FormModal>
  );
}
