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
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import { CheckCircle as CheckCircleIcon } from "@mui/icons-material";
import { alpha, useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, Typography } from "@/components/common";
import { Label } from "@/components/common/Label";
import { textFieldStyles } from "@/components/common/InputField/InputField.styles";
import type { JsonRecord } from "@/api";
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
import { isRecord } from "@/lib/utils";
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
import { ChildCompanyPocEditor } from "./ChildCompanyPocEditor";
import { ChildCompanyWebsitesPanel } from "./ChildCompanyWebsitesPanel";

type ChildFormState = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

type ChildWebsiteRow = { id?: string; url: string; name: string };

type ChildPocRow = {
  companyContactId?: string;
  userId?: string;
  pocInvite?: Record<string, unknown>;
  userProfile?: Record<string, unknown>;
};

function toChildForm(c: ParentCompanyChildDetail): ChildFormState {
  const emailRaw = c.email ?? c.companyEmail ?? "";
  return {
    name: c.name ?? "",
    email: String(emailRaw ?? ""),
    phone: c.phone ?? "",
    address: c.address ?? "",
  };
}

function toChildWebsites(c: ParentCompanyChildDetail): ChildWebsiteRow[] {
  const out: ChildWebsiteRow[] = [];
  const seen = new Set<string>();
  const push = (idRaw: unknown, urlRaw: unknown, nameRaw: unknown) => {
    const id = String(idRaw ?? "").trim();
    const url = String(urlRaw ?? "").trim();
    const name = String(nameRaw ?? "").trim();
    const key = id || url;
    if (!key || seen.has(key)) return;
    seen.add(key);
    out.push({ ...(id ? { id } : {}), url, name });
  };
  const w = c.website as unknown as { id?: string; websiteId?: string; url?: string; name?: string } | null | undefined;
  if (w) push(w.id ?? w.websiteId, w.url, w.name);
  const multi = c.websites;
  if (Array.isArray(multi)) {
    for (const raw of multi) {
      if (!isRecord(raw)) continue;
      push(raw["id"] ?? raw["websiteId"], raw["url"], raw["name"]);
    }
  }
  return out;
}

function toChildPocs(c: ParentCompanyChildDetail): ChildPocRow[] {
  const out: ChildPocRow[] = [];
  const raw = (c as unknown as Record<string, unknown>)["pocs"];
  if (Array.isArray(raw)) {
    for (const p of raw) {
      if (!isRecord(p)) continue;
      const userVal = p["user"];
      const userRec = isRecord(userVal) ? userVal : null;
      const pcid = String(p["companyContactId"] ?? "").trim();
      const userId = String(userRec?.["id"] ?? p["userId"] ?? "").trim();
      if (!pcid && !userId) continue;
      out.push({ ...(pcid ? { companyContactId: pcid } : {}), ...(userId ? { userId } : {}) });
    }
  }
  return out;
}

/** PATCH /companies/:id — matches OpenAPI (companyEmail, not email). */
function buildChildPatch(before: ChildFormState, after: ChildFormState): JsonRecord {
  const body: JsonRecord = {};
  if (after.name.trim() !== before.name.trim()) body.name = after.name.trim();
  if (after.email.trim() !== before.email.trim()) body.companyEmail = after.email.trim();
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

  useEffect(() => {
    if (!detail?.parentCompany) return;
    const n = detail.parentCompany.name ?? "";
    setParentName(n);
    setInitialParentName(n);
    setParentFieldErrors({});
  }, [detail?.parentCompany]);

  const updateParentMutation = useUpdateParentCompanyMutation();
  const updateCompanyMutation = useUpdateCompanyMutation();

  const [childForms, setChildForms] = useState<Record<string, ChildFormState>>({});
  const [childBaselines, setChildBaselines] = useState<Record<string, ChildFormState>>({});
  const [childFieldErrors, setChildFieldErrors] = useState<Record<string, Record<string, string>>>(
    {},
  );
  const [childWebsites, setChildWebsites] = useState<Record<string, ChildWebsiteRow[]>>({});
  const [childWebsitesBase, setChildWebsitesBase] = useState<Record<string, ChildWebsiteRow[]>>({});
  const [childPocs, setChildPocs] = useState<Record<string, ChildPocRow[]>>({});
  const [childPocsBase, setChildPocsBase] = useState<Record<string, ChildPocRow[]>>({});
  const [childTouched, setChildTouched] = useState<Record<string, { websites?: boolean; pocs?: boolean }>>({});
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
    const nextWebsites: Record<string, ChildWebsiteRow[]> = {};
    const nextWebsitesBase: Record<string, ChildWebsiteRow[]> = {};
    const nextPocs: Record<string, ChildPocRow[]> = {};
    const nextPocsBase: Record<string, ChildPocRow[]> = {};
    for (const c of detail.children) {
      const form = toChildForm(c);
      nextForms[c.id] = form;
      nextBase[c.id] = { ...form };
      const ws = toChildWebsites(c);
      nextWebsites[c.id] = ws;
      nextWebsitesBase[c.id] = ws.map((x) => ({ ...x }));
      const ps = toChildPocs(c);
      nextPocs[c.id] = ps;
      nextPocsBase[c.id] = ps.map((x) => ({ ...x }));
    }
    setChildForms(nextForms);
    setChildBaselines(nextBase);
    setChildWebsites(nextWebsites);
    setChildWebsitesBase(nextWebsitesBase);
    setChildPocs(nextPocs);
    setChildPocsBase(nextPocsBase);
    setChildTouched({});
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
        setStepInUrl(2);
      }
      return;
    }
    try {
      await updateParentMutation.mutateAsync({ parentId, body: patch });
      setInitialParentName(parentName.trim());
      publishAppToast({ variant: "success", message: "Parent company updated." });
      if (thenGoStep2) {
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
    const touched = childTouched[childId] ?? {};
    if (touched.websites) {
      patch.websites = (childWebsites[childId] ?? []).map((w) => ({
        ...(w.id ? { id: w.id } : {}),
        url: String(w.url ?? "").trim(),
        name: String(w.name ?? "").trim(),
      }));
    }
    if (touched.pocs) {
      patch.pocs = (childPocs[childId] ?? []).map((p) => ({
        ...(p.companyContactId ? { companyContactId: p.companyContactId } : {}),
        ...(p.userId ? { userId: p.userId } : {}),
        ...(p.pocInvite ? { pocInvite: p.pocInvite } : {}),
        ...(p.userProfile ? { userProfile: p.userProfile } : {}),
      }));
    }

    if (Object.keys(patch).length === 0) return;
    setSavingChildId(childId);
    setChildFieldErrors((prev) => ({ ...prev, [childId]: {} }));
    try {
      await updateCompanyMutation.mutateAsync({
        companyId: childId,
        body: patch,
        parentIdForList: parentId,
      });
      setChildBaselines((prev) => ({ ...prev, [childId]: { ...current } }));
      if (touched.websites) {
        const ws = childWebsites[childId] ?? [];
        setChildWebsitesBase((prev) => ({ ...prev, [childId]: ws.map((x) => ({ ...x })) }));
      }
      if (touched.pocs) {
        const ps = childPocs[childId] ?? [];
        setChildPocsBase((prev) => ({ ...prev, [childId]: ps.map((x) => ({ ...x })) }));
      }
      setChildTouched((prev) => ({ ...prev, [childId]: {} }));
      publishAppToast({ variant: "success", message: "Child company updated." });
    } catch (e) {
      let fields = extractNestFieldErrors(e);
      if (fields.companyEmail && !fields.email) {
        fields = { ...fields, email: fields.companyEmail };
      }
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

  const updateChildWebsites = (childId: string, next: ChildWebsiteRow[]) => {
    setChildWebsites((prev) => ({ ...prev, [childId]: next }));
    setChildTouched((prev) => ({ ...prev, [childId]: { ...(prev[childId] ?? {}), websites: true } }));
  };

  const updateChildPocs = (childId: string, next: ChildPocRow[]) => {
    setChildPocs((prev) => ({ ...prev, [childId]: next }));
    setChildTouched((prev) => ({ ...prev, [childId]: { ...(prev[childId] ?? {}), pocs: true } }));
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
    <Box sx={[pageWrapper, { maxWidth: 1040, width: "100%", mx: "auto", pb: 4 }] as SxProps<Theme>}>
      <Box sx={pageHeaderRow}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Button
            component={Link}
            href={listHref}
            variant="secondary"
            sx={{ alignSelf: "flex-start", minWidth: 0, px: 2 }}
          >
            ← All companies
          </Button>
          <Typography variant="regularLarge" fontWeight={700} color="white" sx={{ letterSpacing: "-0.02em" }}>
            Edit company
          </Typography>
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 640, lineHeight: 1.65 }}>
            Two clear steps: parent & reseller, then each child with company details, contacts, and websites. Save
            each block when you are done — nothing is auto-lost when you expand another row.
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
            maxWidth: 720,
            width: "100%",
            alignSelf: "stretch",
            borderRadius: "16px",
            border: `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.55)}`,
            boxShadow: `0 18px 48px ${alpha("#000", 0.22)}`,
          }}
        >
          <Box>
            <Typography component="p" sx={stepEyebrowSx(theme)}>
              Step 1 · Parent & reseller
            </Typography>
            <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mt: 0.75, lineHeight: 1.55 }}>
              Edit the parent on this page (same full-width pattern as child companies on step 2). Use the actions
              below when you are ready to continue.
            </Typography>
          </Box>

          <Box sx={{ ...sectionStack, pt: 0.5 }}>
            <Typography sx={{ ...sectionOverlineSx(theme), mb: 0.25 }}>Parent company</Typography>
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
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, justifyContent: "flex-end", pt: 1 }}>
              <Button
                variant="secondary"
                disabled={updateParentMutation.isPending}
                onClick={() => void handleSaveParent(false)}
              >
                {updateParentMutation.isPending ? "Saving…" : "Save parent"}
              </Button>
              <Button
                variant="primary"
                disabled={updateParentMutation.isPending}
                onClick={() => void handleSaveParent(true)}
              >
                {updateParentMutation.isPending ? "Saving…" : "Save & go to child companies"}
              </Button>
            </Box>
          </Box>
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
            maxWidth: 900,
            width: "100%",
            alignSelf: "stretch",
            borderRadius: "16px",
            border: `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.55)}`,
            boxShadow: `0 18px 48px ${alpha("#000", 0.22)}`,
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
                    borderRadius: "16px !important",
                    overflow: "hidden",
                    "&:before": { display: "none" },
                    boxShadow: `0 10px 32px ${alpha("#000", 0.16)}, inset 0 1px 0 ${alpha(theme.app.dashboard.white95, 0.05)}`,
                  }}
                >
                  <AccordionSummary
                    expandIcon={
                      <ExpandMoreIcon sx={{ color: alpha(theme.app.dashboard.white95, 0.75), fontSize: 22 }} />
                    }
                    sx={{
                      px: 2,
                      py: 1.75,
                      minHeight: 68,
                      "& .MuiAccordionSummary-content": { my: 1, alignItems: "center", gap: 1.5 },
                    }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "12px",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: alpha(theme.palette.primary.main, 0.14),
                        color: theme.palette.primary.light,
                      }}
                    >
                      <BusinessOutlined sx={{ fontSize: 24 }} />
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 0.35, minWidth: 0 }}>
                      <Typography sx={{ color: theme.app.dashboard.white95, fontWeight: 700, fontSize: "0.975rem" }}>
                        {form.name.trim() || child.name || "Child company"}
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                        {child.email || "—"}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 2, pb: 2.75, pt: 0, bgcolor: alpha("#000", 0.08) }}>
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
                      <ChildCompanyPocEditor
                        child={child}
                        resellerId={String(detail.parentCompany.reseller?.id ?? "").trim()}
                        parentCompanyId={parentId}
                        pocs={childPocs[child.id] ?? childPocsBase[child.id] ?? []}
                        onPocsChange={(next) => updateChildPocs(child.id, next)}
                        disabled={savingChildId === child.id}
                      />
                      <ChildCompanyWebsitesPanel
                        child={child}
                        parentCompanyId={parentId}
                        websites={childWebsites[child.id] ?? childWebsitesBase[child.id] ?? []}
                        onWebsitesChange={(next) => updateChildWebsites(child.id, next)}
                        disabled={savingChildId === child.id}
                      />
                      <Button
                        variant="primary"
                        sx={{ alignSelf: "flex-start", mt: 1 }}
                        disabled={savingChildId === child.id}
                        onClick={() => void handleSaveChild(child.id)}
                      >
                        {savingChildId === child.id ? "Saving…" : "Save company details"}
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
