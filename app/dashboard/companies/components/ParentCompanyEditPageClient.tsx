"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import ArrowBack from "@mui/icons-material/ArrowBack";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import ContactMailOutlined from "@mui/icons-material/ContactMailOutlined";
import HubOutlined from "@mui/icons-material/HubOutlined";
import LanguageOutlined from "@mui/icons-material/LanguageOutlined";
import LockOutlined from "@mui/icons-material/LockOutlined";
import OpenInNewOutlined from "@mui/icons-material/OpenInNewOutlined";
import StorefrontOutlined from "@mui/icons-material/StorefrontOutlined";
import { alpha, useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, Typography } from "@/components/common";
import { Label } from "@/components/common/Label";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { textFieldStyles } from "@/components/common/InputField/InputField.styles";
import type { JsonRecord } from "@/api";
import type { ParentCompanyChildDetail } from "@/api/types/companies.types";
import { CompanyEditStepper } from "./CompanyEditStepper";
import { CompanyEditStepHeader } from "./CompanyEditStepHeader";
import { CompanyEditChildNav } from "./CompanyEditChildNav";
import {
  useParentCompanyQuery,
  useUpdateCompanyMutation,
  useUpdateParentCompanyMutation,
} from "@/lib/hooks/query";
import { extractNestFieldErrors } from "@/lib/companies/extract-nest-field-errors";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { publishAppToast } from "@/lib/notify";
import { isRecord } from "@/lib/utils/core";
import { useAuth } from "@/lib/auth";
import { CompanyClientPermissionsPanel } from "@/features/companies/components/CompanyClientPermissionsPanel";
import { canCompaniesModuleAction } from "@/lib/permissions";
import { formatPhoneInputValue, PHONE_INPUT_PLACEHOLDER } from "@/lib/ui/format-phone-input";
import { pageWrapper } from "../overview.styles";
import {
  companyEditBranchPanelHeaderSx,
  companyEditBreadcrumbSx,
  companyEditCardBodySx,
  companyEditChildLayoutSx,
  companyEditChipSx,
  companyEditEditablePanelSx,
  companyEditFooterActionsSx,
  companyEditFormGridFullSx,
  companyEditFormGridSx,
  companyEditHeroSx,
  companyEditMainCardSx,
  companyEditPageSx,
  companyEditReadOnlyBadgeSx,
  companyEditReadOnlyPanelSx,
  companyEditSectionIconSx,
  companyEditSectionSx,
  companyEditStep1GridSx,
  companyEditStickyFooterSx,
} from "../company-edit.styles";
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
    phone: formatPhoneInputValue(String(c.phone ?? "")),
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
  return out.slice(0, 5);
}

function buildChildPatch(before: ChildFormState, after: ChildFormState): JsonRecord {
  const body: JsonRecord = {};
  if (after.name.trim() !== before.name.trim()) body.name = after.name.trim();
  if (after.email.trim() !== before.email.trim()) body.companyEmail = after.email.trim();
  if (after.phone.trim() !== before.phone.trim()) body.phone = after.phone.trim();
  if (after.address.trim() !== before.address.trim()) body.address = after.address.trim();
  return body;
}

function childIsDirty(
  childId: string,
  childBaselines: Record<string, ChildFormState>,
  childForms: Record<string, ChildFormState>,
  childTouched: Record<string, { websites?: boolean; pocs?: boolean }>,
): boolean {
  const baseline = childBaselines[childId];
  const current = childForms[childId];
  if (baseline && current && Object.keys(buildChildPatch(baseline, current)).length > 0) {
    return true;
  }
  const touched = childTouched[childId];
  return Boolean(touched?.websites || touched?.pocs);
}

function EditSection({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const theme = useTheme() as AppTheme;
  return (
    <Box sx={companyEditSectionSx}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 2 }}>
        <Box sx={companyEditSectionIconSx}>{icon}</Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body1" fontWeight={700} sx={{ color: theme.app.dashboard.white95 }}>
            {title}
          </Typography>
          {description ? (
            <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mt: 0.35, lineHeight: 1.55 }}>
              {description}
            </Typography>
          ) : null}
        </Box>
      </Box>
      {children}
    </Box>
  );
}

export function ParentCompanyEditPageClient() {
  const theme = useTheme() as AppTheme;
  const { hasPage, hasOperational } = useAuth();
  const canUpdateCompanies = canCompaniesModuleAction(hasPage, hasOperational, "update");
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<{ parentId: string }>();
  const parentId = decodeURIComponent(String(params?.parentId ?? "")).trim();

  const step = searchParams.get("step") === "2" ? 2 : 1;

  const setStepInUrl = useCallback(
    (next: 1 | 2) => {
      if (next === step) return;
      const q = new URLSearchParams(searchParams.toString());
      q.set("step", String(next));
      router.push(`/dashboard/companies/${encodeURIComponent(parentId)}/edit?${q.toString()}`, {
        scroll: false,
      });
    },
    [parentId, router, searchParams, step],
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
  const [childFieldErrors, setChildFieldErrors] = useState<Record<string, Record<string, string>>>({});
  const [childWebsites, setChildWebsites] = useState<Record<string, ChildWebsiteRow[]>>({});
  const [childWebsitesBase, setChildWebsitesBase] = useState<Record<string, ChildWebsiteRow[]>>({});
  const [childPocs, setChildPocs] = useState<Record<string, ChildPocRow[]>>({});
  const [childPocsBase, setChildPocsBase] = useState<Record<string, ChildPocRow[]>>({});
  const [childTouched, setChildTouched] = useState<Record<string, { websites?: boolean; pocs?: boolean }>>({});
  const [savingChildId, setSavingChildId] = useState<string | null>(null);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const childFormsHydratedForParent = useRef<string>("");

  useEffect(() => {
    childFormsHydratedForParent.current = "";
    setActiveChildId(null);
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
    setActiveChildId(detail.children[0]?.id ?? null);
  }, [parentId, detail?.children]);

  const handleSaveParent = async (thenGoStep2: boolean) => {
    if (!parentId) return;
    setParentFieldErrors({});
    const patch: Record<string, string> = {};
    if (parentName.trim() !== initialParentName.trim()) {
      patch.name = parentName.trim();
    }
    if (Object.keys(patch).length === 0) {
      if (thenGoStep2) setStepInUrl(2);
      return;
    }
    try {
      await updateParentMutation.mutateAsync({ parentId, body: patch });
      setInitialParentName(parentName.trim());
      publishAppToast({ variant: "success", message: "Organization updated." });
      if (thenGoStep2) setStepInUrl(2);
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
      const pocRows = (childPocs[childId] ?? []).slice(0, 5);
      patch.pocs = pocRows.map((p) => ({
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
      publishAppToast({ variant: "success", message: "Branch saved." });
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
  const detailHref =
    parentId.length > 0
      ? `/dashboard/companies/parent/${encodeURIComponent(parentId)}/detail`
      : listHref;

  const childCount = detail?.counts?.children ?? detail?.children.length ?? 0;
  const activeChild = detail?.children.find((c) => c.id === activeChildId) ?? null;
  const activeChildIndex = detail?.children.findIndex((c) => c.id === activeChildId) ?? -1;

  const getChildNavItem = useCallback(
    (child: ParentCompanyChildDetail) => {
      const form = childForms[child.id] ?? toChildForm(child);
      return {
        id: child.id,
        label: form.name.trim() || child.name || "Child company",
        email: form.email.trim() || String(child.email ?? child.companyEmail ?? ""),
        dirty: childIsDirty(child.id, childBaselines, childForms, childTouched),
      };
    },
    [childBaselines, childForms, childTouched],
  );

  const parentNameDirty = parentName.trim() !== initialParentName.trim();

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
    <Box sx={[pageWrapper, companyEditPageSx] as SxProps<Theme>}>
      <Link href={listHref} style={{ textDecoration: "none", alignSelf: "flex-start" }}>
        <Box
          component="span"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.75,
            color: theme.app.dashboard.textMuted,
            fontSize: "0.875rem",
            fontWeight: 500,
            "&:hover": { color: theme.app.dashboard.white95 },
          }}
        >
          <ArrowBack sx={{ fontSize: 18 }} />
          Back to companies
        </Box>
      </Link>

      <Box sx={companyEditHeroSx}>
        <Box sx={companyEditBreadcrumbSx}>
          <Link href={listHref}>Companies</Link>
          <span aria-hidden>/</span>
          <Link href={detailHref}>{parentName.trim() || "Organization"}</Link>
          <span aria-hidden>/</span>
          <span data-current>Edit</span>
        </Box>
        <Typography variant="regularLarge" fontWeight={700} color="white" sx={{ mt: 1.25, mb: 0.75, letterSpacing: "-0.02em" }}>
          Edit company
        </Typography>
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 520, lineHeight: 1.65, mb: 1.75 }}>
          Step 1 updates the parent name. Step 2 lets you edit each child company one at a time.
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {detail?.parentCompany.reseller?.name ? (
            <Box component="span" sx={companyEditChipSx}>
              <HubOutlined sx={{ fontSize: 16, opacity: 0.85 }} />
              {detail.parentCompany.reseller.name}
            </Box>
          ) : null}
          {childCount > 0 ? (
            <Box component="span" sx={companyEditChipSx}>
              <StorefrontOutlined sx={{ fontSize: 16, opacity: 0.85 }} />
              {childCount} {childCount === 1 ? "branch" : "branches"}
            </Box>
          ) : null}
          <Button
            component={Link}
            href={detailHref}
            variant="secondary"
            size="small"
            startIcon={<OpenInNewOutlined sx={{ fontSize: 16 }} />}
            sx={{ ml: { sm: "auto" } }}
          >
            View overview
          </Button>
        </Box>
      </Box>

      <CompanyEditStepper
        step={step}
        onStepChange={setStepInUrl}
        parentName={parentName}
        childCount={childCount}
        disabled={parentQuery.isLoading && !detail}
      />

      {parentQuery.isLoading ? (
        <Typography sx={{ color: theme.app.dashboard.textMuted }}>Loading organization…</Typography>
      ) : null}

      {errorMessage ? (
        <Typography sx={{ color: "rgba(248,113,113,0.95)" }}>{errorMessage}</Typography>
      ) : null}

      {detail && step === 1 ? (
        <Box sx={companyEditMainCardSx}>
          <Box sx={companyEditCardBodySx}>
            <CompanyEditStepHeader
              step={1}
              title="Parent company name"
              description="This is the main client company in your account. Only the name can be changed here — reseller is shown for reference."
              tip="When you are done, continue to step 2 to edit child companies (branches, contacts, and websites)."
            />

            <Box sx={companyEditStep1GridSx}>
              <Box sx={companyEditEditablePanelSx}>
                <Typography variant="body2" fontWeight={700} sx={{ color: theme.palette.primary.light, mb: 0.5 }}>
                  You can edit
                </Typography>
                <InputField
                  label="Parent company name"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  disabled={!canUpdateCompanies}
                  error={Boolean(parentFieldErrors.name)}
                  helperText={
                    parentFieldErrors.name ??
                    "Shown on invoices, login scope, and across the dashboard."
                  }
                  inputProps={{ maxLength: 200 }}
                />
                {parentNameDirty ? (
                  <Typography variant="caption" sx={{ color: theme.palette.warning.light, mt: 1, display: "block" }}>
                    Unsaved change — click Save before leaving this step.
                  </Typography>
                ) : null}
              </Box>

              <Box sx={companyEditReadOnlyPanelSx}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 2 }}>
                  <Typography variant="body2" fontWeight={700} sx={{ color: theme.app.dashboard.textMuted }}>
                    Reference only
                  </Typography>
                  <Box component="span" sx={companyEditReadOnlyBadgeSx}>
                    <LockOutlined sx={{ fontSize: 12, mr: 0.35, verticalAlign: "middle" }} />
                    Read-only
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, fontWeight: 600, display: "block", mb: 0.5 }}>
                    Reseller
                  </Typography>
                  <Typography variant="body1" sx={{ color: theme.app.dashboard.white95, fontWeight: 600 }}>
                    {detail.parentCompany.reseller?.name ?? "—"}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box sx={companyEditStickyFooterSx}>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 320, lineHeight: 1.5 }}>
              {childCount > 0
                ? `${childCount} child ${childCount === 1 ? "company" : "companies"} ready in step 2.`
                : "No child companies yet — you can still save the parent name."}
            </Typography>
            <Box sx={companyEditFooterActionsSx}>
              <Button
                variant="secondary"
                disabled={!canUpdateCompanies || updateParentMutation.isPending || !parentNameDirty}
                onClick={() => void handleSaveParent(false)}
              >
                {updateParentMutation.isPending ? "Saving…" : "Save name"}
              </Button>
              <Button
                variant="primary"
                sx={gradientPrimaryButtonSx}
                disabled={!canUpdateCompanies || updateParentMutation.isPending}
                onClick={() => void handleSaveParent(true)}
              >
                {updateParentMutation.isPending
                  ? "Saving…"
                  : parentNameDirty
                    ? "Save & go to child companies"
                    : "Continue to child companies"}
              </Button>
            </Box>
          </Box>
        </Box>
      ) : null}

      {detail && step === 2 ? (
        <Box sx={companyEditMainCardSx}>
          <Box sx={companyEditCardBodySx}>
            <CompanyEditStepHeader
              step={2}
              title="Child companies"
              description="Pick a company from the list, edit its details, then save. Switch between companies anytime — use search when you have many branches."
              tip="Orange dot = unsaved changes on that child. Save each child before moving on if you changed contacts or websites."
            />

            {detail.children.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 6, px: 2 }}>
                <StorefrontOutlined sx={{ fontSize: 48, color: alpha(theme.app.dashboard.textMuted, 0.5), mb: 2 }} />
                <Typography variant="mediumLarge" fontWeight={600} color="white" sx={{ mb: 1 }}>
                  No child companies yet
                </Typography>
                <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 400, mx: "auto", mb: 2.5 }}>
                  Add child companies from the company setup wizard, then return here to manage each branch.
                </Typography>
                <Button variant="secondary" onClick={() => setStepInUrl(1)}>
                  Back to parent company
                </Button>
              </Box>
            ) : (
              <Box sx={companyEditChildLayoutSx}>
                <CompanyEditChildNav
                  childCompanies={detail.children}
                  activeChildId={activeChildId}
                  onSelect={setActiveChildId}
                  getItem={getChildNavItem}
                />

                {activeChild ? (
                  <Box sx={{ minWidth: 0 }}>
                    {(() => {
                      const child = activeChild;
                      const form = childForms[child.id] ?? toChildForm(child);
                      const fe = childFieldErrors[child.id] ?? {};
                      const dirty = childIsDirty(child.id, childBaselines, childForms, childTouched);
                      const label = form.name.trim() || child.name || "Child company";
                      return (
                        <>
                          <Box sx={companyEditBranchPanelHeaderSx}>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, fontWeight: 600 }}>
                                {activeChildIndex >= 0
                                  ? `Child ${activeChildIndex + 1} of ${detail.children.length}`
                                  : "Selected child"}
                              </Typography>
                              <Typography variant="mediumLarge" fontWeight={700} color="white" sx={{ mt: 0.35, lineHeight: 1.3 }}>
                                {label}
                              </Typography>
                              {dirty ? (
                                <Typography variant="caption" sx={{ color: theme.palette.warning.light, mt: 0.5, display: "block" }}>
                                  Unsaved changes on this company
                                </Typography>
                              ) : null}
                            </Box>
                            <Box sx={{ display: "flex", gap: 0.75, flexShrink: 0 }}>
                              <Button
                                variant="secondary"
                                size="small"
                                disabled={activeChildIndex <= 0}
                                onClick={() => {
                                  const prev = detail.children[activeChildIndex - 1];
                                  if (prev) setActiveChildId(prev.id);
                                }}
                                startIcon={<ChevronLeft sx={{ fontSize: 18 }} />}
                              >
                                Previous
                              </Button>
                              <Button
                                variant="secondary"
                                size="small"
                                disabled={activeChildIndex < 0 || activeChildIndex >= detail.children.length - 1}
                                onClick={() => {
                                  const next = detail.children[activeChildIndex + 1];
                                  if (next) setActiveChildId(next.id);
                                }}
                                endIcon={<ChevronRight sx={{ fontSize: 18 }} />}
                              >
                                Next
                              </Button>
                            </Box>
                          </Box>

                          <EditSection
                            icon={<StorefrontOutlined sx={{ fontSize: 22 }} />}
                            title="Company profile"
                            description="Basic branch details used in your directory and assignments."
                          >
                            <Box sx={companyEditFormGridSx}>
                              <InputField
                                label="Company name"
                                value={form.name}
                                onChange={(e) => updateChildField(child.id, { name: e.target.value })}
                                disabled={!canUpdateCompanies}
                                error={Boolean(fe.name)}
                                helperText={fe.name ?? " "}
                                inputProps={{ maxLength: 200 }}
                              />
                              <InputField
                                type="email"
                                label="Contact email"
                                value={form.email}
                                onChange={(e) => updateChildField(child.id, { email: e.target.value })}
                                disabled={!canUpdateCompanies}
                                error={Boolean(fe.email)}
                                helperText={fe.email ?? " "}
                                inputProps={{ maxLength: 200 }}
                              />
                              <InputField
                                label="Phone"
                                type="phone"
                                placeholder={PHONE_INPUT_PLACEHOLDER}
                                value={form.phone}
                                onChange={(e) => updateChildField(child.id, { phone: e.target.value })}
                                disabled={!canUpdateCompanies}
                                error={Boolean(fe.phone)}
                                helperText={fe.phone ?? " "}
                                inputProps={{ maxLength: 20 }}
                              />
                              <Box sx={companyEditFormGridFullSx}>
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
                                  disabled={!canUpdateCompanies}
                                  error={Boolean(fe.address)}
                                  helperText={fe.address ?? " "}
                                  inputProps={{ maxLength: 500, "aria-label": "Address" }}
                                  variant="outlined"
                                  sx={textFieldStyles(theme)}
                                />
                              </Box>
                            </Box>
                          </EditSection>

                          <Box sx={{ mt: 2.5 }}>
                            <EditSection
                              icon={<ContactMailOutlined sx={{ fontSize: 22 }} />}
                              title="Point of contact (POC)"
                              description="External users for this branch — up to 5 contacts."
                            >
                              <ChildCompanyPocEditor
                                child={child}
                                resellerId={String(detail.parentCompany.reseller?.id ?? "").trim()}
                                parentCompanyId={parentId}
                                pocs={childPocs[child.id] ?? childPocsBase[child.id] ?? []}
                                onPocsChange={(next) => updateChildPocs(child.id, next)}
                                disabled={!canUpdateCompanies || savingChildId === child.id}
                              />
                            </EditSection>
                          </Box>

                          <Box sx={{ mt: 2.5 }}>
                            <EditSection
                              icon={<LanguageOutlined sx={{ fontSize: 22 }} />}
                              title="Websites"
                              description="Websites linked to this child for chat widgets and assignments."
                            >
                              <ChildCompanyWebsitesPanel
                                child={child}
                                parentCompanyId={parentId}
                                websites={childWebsites[child.id] ?? childWebsitesBase[child.id] ?? []}
                                onWebsitesChange={(next) => updateChildWebsites(child.id, next)}
                                disabled={!canUpdateCompanies || savingChildId === child.id}
                              />
                            </EditSection>
                          </Box>
                        </>
                      );
                    })()}
                  </Box>
                ) : null}
              </Box>
            )}
          </Box>

          {detail.children.length > 0 && activeChild ? (
            <Box sx={companyEditStickyFooterSx}>
              <Button variant="secondary" onClick={() => setStepInUrl(1)} sx={{ mr: "auto" }}>
                ← Parent company
              </Button>
              <Box sx={companyEditFooterActionsSx}>
                <Button
                  variant="secondary"
                  size="small"
                  disabled={activeChildIndex <= 0}
                  onClick={() => {
                    const prev = detail.children[activeChildIndex - 1];
                    if (prev) setActiveChildId(prev.id);
                  }}
                  startIcon={<ChevronLeft sx={{ fontSize: 18 }} />}
                >
                  Previous
                </Button>
                <Button
                  variant="primary"
                  sx={gradientPrimaryButtonSx}
                  disabled={!canUpdateCompanies || savingChildId === activeChild.id}
                  onClick={() => void handleSaveChild(activeChild.id)}
                >
                  {savingChildId === activeChild.id ? "Saving…" : "Save this child"}
                </Button>
                <Button
                  variant="secondary"
                  size="small"
                  disabled={activeChildIndex >= detail.children.length - 1}
                  onClick={() => {
                    const next = detail.children[activeChildIndex + 1];
                    if (next) setActiveChildId(next.id);
                  }}
                  endIcon={<ChevronRight sx={{ fontSize: 18 }} />}
                >
                  Next
                </Button>
              </Box>
            </Box>
          ) : null}
        </Box>
      ) : null}

      {detail ? (
        <CompanyClientPermissionsPanel
          parentCompanyId={parentId}
          parentCompanyName={detail.parentCompany.name ?? undefined}
        />
      ) : null}
    </Box>
  );
}
