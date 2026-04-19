"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { CheckCircle as CheckCircleIcon } from "@mui/icons-material";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, FormModal, InputField, Typography } from "@/components/common";
import { Label } from "@/components/common/Label";
import { textFieldStyles } from "@/components/common/InputField/InputField.styles";
import type { ParentCompanyChildDetail } from "@/api/types/companies.types";
import { normalizePocsFromCarrier } from "@/lib/companies/parent-detail-pocs";
import { CompanyPocSummaryBlock } from "./CompanyPocSummaryBlock";
import {
  useParentCompanyQuery,
  useUpdateCompanyMutation,
  useUpdateParentCompanyMutation,
} from "@/lib/hooks/query";
import { extractNestFieldErrors } from "@/lib/companies/extract-nest-field-errors";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { publishAppToast } from "@/lib/notify";
import {
  pageHeaderRow,
  pageWrapper,
  sectionStack,
  stepperCheckIcon,
  stepperDivider,
  stepperLabelChildDone,
  stepperLabelChildInactive,
  stepperLabelResellerActive,
  stepperLabelResellerDone,
  stepperNumberCircleActive,
  stepperNumberCircleInactive,
  stepperOuter,
  stepperSegment,
} from "../overview.styles";
import { departmentsCard } from "../../website-assigning/website-assigning.styles";

type ChildFormState = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

function toChildForm(c: ParentCompanyChildDetail): ChildFormState {
  return {
    name: c.name ?? "",
    email: c.email ?? "",
    phone: c.phone ?? "",
    address: c.address ?? "",
  };
}

function buildChildPatch(before: ChildFormState, after: ChildFormState): Record<string, string> {
  const body: Record<string, string> = {};
  if (after.name.trim() !== before.name.trim()) body.name = after.name.trim();
  if (after.email.trim() !== before.email.trim()) body.email = after.email.trim();
  if (after.phone.trim() !== before.phone.trim()) body.phone = after.phone.trim();
  if (after.address.trim() !== before.address.trim()) body.address = after.address.trim();
  return body;
}

const sectionOverlineSx = (theme: AppTheme) => ({
  display: "block",
  letterSpacing: "0.04em",
  fontSize: "0.6875rem",
  fontWeight: 600,
  color: theme.app.dashboard.textMuted,
  mb: 1.25,
});

const stepEyebrowSx = (theme: AppTheme) => ({
  fontSize: "0.75rem",
  fontWeight: 600,
  color: alpha(theme.app.dashboard.textMuted, 0.95),
  letterSpacing: "0.02em",
  mb: 0.5,
});

export function ParentCompanyEditPageClient() {
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<{ parentId: string }>();
  const parentId = decodeURIComponent(String(params?.parentId ?? "")).trim();

  const step = searchParams.get("step") === "2" ? 2 : 1;

  const setStepInUrl = useCallback(
    (next: 1 | 2) => {
      const q = new URLSearchParams(searchParams.toString());
      q.set("step", String(next));
      router.replace(`/dashboard/companies/${encodeURIComponent(parentId)}/edit?${q.toString()}`);
    },
    [parentId, router, searchParams],
  );

  const parentQuery = useParentCompanyQuery(parentId, { enabled: parentId.length > 0 });
  const detail = parentQuery.data?.success ? parentQuery.data.data : undefined;

  const [parentName, setParentName] = useState("");
  const [initialParentName, setInitialParentName] = useState("");
  const [parentFieldErrors, setParentFieldErrors] = useState<Record<string, string>>({});
  const [parentModalOpen, setParentModalOpen] = useState(false);

  useEffect(() => {
    if (!detail?.parentCompany) return;
    const n = detail.parentCompany.name ?? "";
    setParentName(n);
    setInitialParentName(n);
    setParentFieldErrors({});
  }, [detail?.parentCompany]);

  useEffect(() => {
    if (step !== 1) setParentModalOpen(false);
  }, [step]);

  const parentPocPreview = useMemo(() => {
    if (!detail?.parentCompany) return null;
    const rows = normalizePocsFromCarrier(detail.parentCompany);
    return rows[0]?.name?.trim() || null;
  }, [detail?.parentCompany]);

  const updateParentMutation = useUpdateParentCompanyMutation();
  const updateCompanyMutation = useUpdateCompanyMutation();

  const [childForms, setChildForms] = useState<Record<string, ChildFormState>>({});
  const [childBaselines, setChildBaselines] = useState<Record<string, ChildFormState>>({});
  const [childFieldErrors, setChildFieldErrors] = useState<Record<string, Record<string, string>>>(
    {},
  );
  const [savingChildId, setSavingChildId] = useState<string | null>(null);
  const childFormsHydratedForParent = useRef<string>("");

  useEffect(() => {
    childFormsHydratedForParent.current = "";
  }, [parentId]);

  useEffect(() => {
    if (!parentId || !detail?.children) return;
    if (childFormsHydratedForParent.current === parentId) return;
    childFormsHydratedForParent.current = parentId;
    const nextForms: Record<string, ChildFormState> = {};
    const nextBase: Record<string, ChildFormState> = {};
    for (const c of detail.children) {
      const form = toChildForm(c);
      nextForms[c.id] = form;
      nextBase[c.id] = { ...form };
    }
    setChildForms(nextForms);
    setChildBaselines(nextBase);
    setChildFieldErrors({});
  }, [parentId, detail?.children]);

  const handleSaveParent = async (thenGoStep2: boolean) => {
    if (!parentId) return;
    setParentFieldErrors({});
    const patch: Record<string, string> = {};
    if (parentName.trim() !== initialParentName.trim()) {
      patch.name = parentName.trim();
    }
    if (Object.keys(patch).length === 0) {
      if (thenGoStep2) {
        setParentModalOpen(false);
        setStepInUrl(2);
      }
      return;
    }
    try {
      await updateParentMutation.mutateAsync({ parentId, body: patch });
      setInitialParentName(parentName.trim());
      publishAppToast({ variant: "success", message: "Parent company updated." });
      if (thenGoStep2) {
        setParentModalOpen(false);
        setStepInUrl(2);
      }
    } catch (e) {
      const fields = extractNestFieldErrors(e);
      if (Object.keys(fields).length) setParentFieldErrors(fields);
      const toastMsg = extractApiErrorMessageForToast(e);
      if (toastMsg) publishAppToast({ variant: "error", message: toastMsg });
    }
  };

  const handleSaveChild = async (childId: string) => {
    const baseline = childBaselines[childId];
    const current = childForms[childId];
    if (!baseline || !current || !parentId) return;
    const patch = buildChildPatch(baseline, current);
    if (Object.keys(patch).length === 0) {
      return;
    }
    setSavingChildId(childId);
    setChildFieldErrors((prev) => ({ ...prev, [childId]: {} }));
    try {
      await updateCompanyMutation.mutateAsync({
        companyId: childId,
        body: patch,
        parentIdForList: parentId,
      });
      setChildBaselines((prev) => ({ ...prev, [childId]: { ...current } }));
      publishAppToast({ variant: "success", message: "Child company updated." });
    } catch (e) {
      const fields = extractNestFieldErrors(e);
      if (Object.keys(fields).length) {
        setChildFieldErrors((prev) => ({ ...prev, [childId]: fields }));
      }
      const toastMsg = extractApiErrorMessageForToast(e);
      if (toastMsg) publishAppToast({ variant: "error", message: toastMsg });
    } finally {
      setSavingChildId(null);
    }
  };

  const updateChildField = (childId: string, patch: Partial<ChildFormState>) => {
    setChildForms((prev) => {
      const row = prev[childId];
      if (!row) return prev;
      return { ...prev, [childId]: { ...row, ...patch } };
    });
  };

  const listHref = "/dashboard/companies";

  const errorMessage = useMemo(() => {
    if (!parentQuery.isError) return null;
    return extractApiErrorMessageForToast(parentQuery.error) ?? "Could not load company.";
  }, [parentQuery.isError, parentQuery.error]);

  if (!parentId) {
    return (
      <Box sx={pageWrapper}>
        <Typography color="white">Missing parent company id.</Typography>
        <Button component={Link} href={listHref} variant="secondary">
          Back to companies
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={pageWrapper}>
      <Box sx={pageHeaderRow}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Button
            component={Link}
            href={listHref}
            variant="secondary"
            sx={{ alignSelf: "flex-start", minWidth: 0, px: 2 }}
          >
            ← All companies
          </Button>
          <Typography variant="regularLarge" fontWeight={700} color="white">
            Edit company
          </Typography>
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 520, lineHeight: 1.5 }}>
            Update the parent company, reseller context, and each child. Changes save per section.
          </Typography>
        </Box>
      </Box>

      <Box sx={stepperOuter}>
        <Box sx={stepperSegment}>
          {step >= 2 ? (
            <CheckCircleIcon sx={stepperCheckIcon} />
          ) : (
            <Box sx={stepperNumberCircleActive}>1</Box>
          )}
          <Typography
            variant="body2"
            sx={step >= 2 ? stepperLabelResellerDone : stepperLabelResellerActive}
          >
            Parent + reseller
          </Typography>
        </Box>
        <Box sx={stepperDivider} />
        <Box sx={stepperSegment}>
          {step === 2 ? (
            <CheckCircleIcon sx={stepperCheckIcon} />
          ) : (
            <Box sx={stepperNumberCircleInactive}>2</Box>
          )}
          <Typography
            variant="body2"
            sx={step === 2 ? stepperLabelChildDone : stepperLabelChildInactive}
          >
            Child companies
          </Typography>
        </Box>
      </Box>

      {parentQuery.isLoading ? (
        <Typography sx={{ color: theme.app.dashboard.textMuted }}>Loading…</Typography>
      ) : null}

      {errorMessage ? (
        <Typography sx={{ color: "rgba(248,113,113,0.95)" }}>{errorMessage}</Typography>
      ) : null}

      {detail && step === 1 ? (
        <Box
          sx={{
            ...departmentsCard,
            p: { xs: 2, sm: 2.75 },
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Box>
            <Typography component="p" sx={stepEyebrowSx(theme)}>
              {"Step 1 · Parent & reseller"}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mt: 0.75, lineHeight: 1.55 }}>
              Open the row to see and edit this parent company, reseller context, and contacts — same idea as
              child rows on step 2.
            </Typography>
          </Box>

          <Box
            component="button"
            type="button"
            onClick={() => setParentModalOpen(true)}
            aria-expanded={parentModalOpen}
            aria-haspopup="dialog"
            sx={{
              width: "100%",
              textAlign: "left",
              cursor: "pointer",
              border: `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.95)}`,
              borderRadius: "14px",
              p: { xs: 1.75, sm: 2 },
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              bgcolor: alpha(theme.app.dashboard.white95, 0.04),
              boxShadow: `0 1px 0 ${alpha("#000", 0.2)} inset`,
              transition: theme.transitions.create(["border-color", "background-color"], {
                duration: theme.transitions.duration.shorter,
              }),
              "&:hover": {
                bgcolor: alpha(theme.app.dashboard.white95, 0.07),
                borderColor: alpha(theme.app.dashboard.accentBlue, 0.45),
              },
              "&:focus-visible": {
                outline: `2px solid ${alpha(theme.app.dashboard.accentBlue, 0.8)}`,
                outlineOffset: 2,
              },
            }}
          >
            <Box sx={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column", gap: 0.35 }}>
              <Typography
                sx={{
                  color: theme.app.dashboard.white95,
                  fontWeight: 600,
                  fontSize: "0.9375rem",
                  lineHeight: 1.35,
                }}
              >
                {(parentName.trim() || detail.parentCompany.name || "Parent company").trim()}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.45 }}>
                Reseller · {detail.parentCompany.reseller?.name ?? "—"}
              </Typography>
              {parentPocPreview ? (
                <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mt: 0.35 }}>
                  Primary contact · {parentPocPreview}
                </Typography>
              ) : null}
            </Box>
            <ChevronRightIcon
              sx={{ color: alpha(theme.app.dashboard.white95, 0.65), fontSize: 22, flexShrink: 0 }}
              aria-hidden
            />
          </Box>

          <FormModal
            open={parentModalOpen}
            title="Parent company"
            description={`You are editing “${detail.parentCompany.name ?? "—"}” under reseller ${detail.parentCompany.reseller?.name ?? "—"}.`}
            onClose={() => setParentModalOpen(false)}
            onSave={() => void handleSaveParent(true)}
            primaryButtonLabel={updateParentMutation.isPending ? "Saving…" : "Save & next"}
            primaryButtonDisabled={updateParentMutation.isPending}
            cancelButtonLabel="Close"
            fitContent
            maxWidth={560}
          >
            <Box sx={sectionStack}>
              <InputField
                label="Parent company name"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                error={Boolean(parentFieldErrors.name)}
                helperText={parentFieldErrors.name ?? "\u00a0"}
                inputProps={{ maxLength: 200 }}
              />
              <Box>
                <Typography component="h3" sx={{ ...sectionOverlineSx(theme), mb: 1 }}>
                  Reseller
                </Typography>
                <Typography variant="body1" sx={{ color: theme.app.text.primary, fontWeight: 500 }}>
                  {detail.parentCompany.reseller?.name ?? "—"}
                </Typography>
              </Box>
            <CompanyPocSummaryBlock rows={normalizePocsFromCarrier(detail.parentCompany)} />
              <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 0.5 }}>
                <Button
                  variant="secondary"
                  disabled={updateParentMutation.isPending}
                  onClick={() => void handleSaveParent(false)}
                >
                  {updateParentMutation.isPending ? "Saving…" : "Save only"}
                </Button>
              </Box>
            </Box>
          </FormModal>
        </Box>
      ) : null}

      {detail && step === 2 ? (
        <Box
          sx={{
            ...departmentsCard,
            p: { xs: 2, sm: 2.75 },
            display: "flex",
            flexDirection: "column",
            gap: 2.25,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
              <Typography component="p" sx={stepEyebrowSx(theme)}>
                Step 2 · Child companies
              </Typography>
              <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.5, maxWidth: 480 }}>
                {(() => {
                  const n = detail.counts?.children ?? detail.children.length;
                  return `${n} ${n === 1 ? "company" : "companies"} under this parent. Expand a row to edit details and review the contact.`;
                })()}
              </Typography>
            </Box>
            <Button variant="secondary" onClick={() => setStepInUrl(1)} sx={{ flexShrink: 0 }}>
              Back
            </Button>
          </Box>

          {detail.children.length === 0 ? (
            <Typography sx={{ color: theme.app.dashboard.textMuted }}>
              No child companies for this parent.
            </Typography>
          ) : (
            detail.children.map((child) => {
              const form = childForms[child.id] ?? toChildForm(child);
              const fe = childFieldErrors[child.id] ?? {};
              return (
                <Accordion
                  key={child.id}
                  disableGutters
                  sx={{
                    bgcolor: alpha(theme.app.dashboard.white95, 0.04),
                    border: `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.9)}`,
                    borderRadius: "14px !important",
                    overflow: "hidden",
                    "&:before": { display: "none" },
                    boxShadow: `0 1px 0 ${alpha("#000", 0.2)} inset`,
                  }}
                >
                  <AccordionSummary
                    expandIcon={
                      <ExpandMoreIcon sx={{ color: alpha(theme.app.dashboard.white95, 0.75), fontSize: 22 }} />
                    }
                    sx={{
                      px: 2,
                      py: 1.5,
                      minHeight: 56,
                      "& .MuiAccordionSummary-content": { my: 1, alignItems: "flex-start" },
                    }}
                  >
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 0.35 }}>
                      <Typography sx={{ color: theme.app.dashboard.white95, fontWeight: 600, fontSize: "0.9375rem" }}>
                        {form.name.trim() || child.name || "Child company"}
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                        {child.email || "—"}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 2, pb: 2.5, pt: 0 }}>
                    <Box sx={{ ...sectionStack, pt: 0.5 }}>
                      <Typography sx={{ ...sectionOverlineSx(theme), mb: 0.5 }}>
                        Company details
                      </Typography>
                      <InputField
                        label="Name"
                        value={form.name}
                        onChange={(e) => updateChildField(child.id, { name: e.target.value })}
                        error={Boolean(fe.name)}
                        helperText={fe.name ?? "\u00a0"}
                        inputProps={{ maxLength: 200 }}
                      />
                      <InputField
                        type="email"
                        label="Email"
                        value={form.email}
                        onChange={(e) => updateChildField(child.id, { email: e.target.value })}
                        error={Boolean(fe.email)}
                        helperText={fe.email ?? "\u00a0"}
                        inputProps={{ maxLength: 200 }}
                      />
                      <InputField
                        label="Phone"
                        value={form.phone}
                        onChange={(e) => updateChildField(child.id, { phone: e.target.value })}
                        error={Boolean(fe.phone)}
                        helperText={fe.phone ?? "\u00a0"}
                        inputProps={{ maxLength: 80 }}
                      />
                      <Box sx={{ width: "100%" }}>
                        <Label htmlFor={`child-address-${child.id}`} variant="mediumLarge" sx={{ mb: 0.75 }}>
                          Address
                        </Label>
                        <TextField
                          id={`child-address-${child.id}`}
                          fullWidth
                          multiline
                          minRows={2}
                          value={form.address}
                          onChange={(e) => updateChildField(child.id, { address: e.target.value })}
                          error={Boolean(fe.address)}
                          helperText={fe.address ?? "\u00a0"}
                          inputProps={{ maxLength: 500, "aria-label": "Address" }}
                          variant="outlined"
                          sx={textFieldStyles(theme)}
                        />
                      </Box>
                      <CompanyPocSummaryBlock rows={normalizePocsFromCarrier(child)} />
                      <Button
                        variant="primary"
                        sx={{ alignSelf: "flex-start", mt: 0.5 }}
                        disabled={savingChildId === child.id}
                        onClick={() => void handleSaveChild(child.id)}
                      >
                        {savingChildId === child.id ? "Saving…" : "Save changes"}
                      </Button>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              );
            })
          )}
        </Box>
      ) : null}
    </Box>
  );
}
