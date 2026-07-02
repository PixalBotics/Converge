"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Checkbox, Divider, FormModal, HoverTooltip, InputField, Typography } from "@/components/common";
import {
  CHAT_BUNDLE_OPTIONS,
  isChatBundleCode,
  isGranularChatPermissionCode,
  pickAssignedChatBundle,
  type ChatBundleCode,
} from "@/lib/permissions/chat-bundles";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import {
  fetchPermissionExpandPreview,
  PermissionExpansionUnavailableError,
  type PermissionExpandPreview,
} from "@/lib/permissions/expand-permission-names";
import { useQueryClient } from "@tanstack/react-query";
import { createRole, replaceRolePermissions, updateRole } from "@/api";
import {
  usePermissionsCatalogQuery,
  useRoleQuery,
  useRolePermissionsQuery,
} from "@/lib/hooks";
import { rolesKeys } from "@/lib/hooks/query/roles/keys";
import {
  buildSelectedPermissionSets,
  extractPermissionsCatalogGroups,
  extractRoleNameFromDetail,
  extractRoleDeniedPermissionNames,
  extractRoleEffectiveByType,
  extractRoleStoredPermissionNames,
  extractEquivalentPermissionNames,
  type PermissionOption,
  type PermissionGroup,
  type RoleRow,
} from "../utils";

export type RoleModalProps = {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  editRole?: RoleRow | null;
};

function normalizeGroupTitle(title: string): "operational" | "page" | "other" {
  const t = title.trim().toUpperCase();
  if (t.includes("PAGE")) return "page";
  if (t.includes("OPERATIONAL")) return "operational";
  return "other";
}

/** Build PUT /roles/:id/permissions body from current editor state. */
function buildRolePermissionsSaveBody(params: {
  storedGrants: readonly string[];
  deniedGrants: readonly string[];
  checkedOperational: ReadonlySet<string>;
  checkedPages: ReadonlySet<string>;
  impliedGrants: ReadonlySet<string>;
}): { permissionNames: string[]; deniedPermissionNames: string[] } {
  const deniedSet = new Set(params.deniedGrants);
  const allowSet = new Set<string>();

  const isChecked = (code: string) =>
    code.startsWith("page:") ? params.checkedPages.has(code) : params.checkedOperational.has(code);

  const isPureImplied = (code: string) =>
    params.impliedGrants.has(code) && !params.storedGrants.includes(code);

  for (const code of params.storedGrants) {
    if (isChatBundleCode(code)) allowSet.add(code);
  }

  for (const code of [...params.checkedOperational, ...params.checkedPages]) {
    if (isPureImplied(code)) {
      deniedSet.delete(code);
      continue;
    }
    allowSet.add(code);
  }

  for (const code of params.storedGrants) {
    if (isChatBundleCode(code) || isPureImplied(code)) continue;
    if (isChecked(code)) allowSet.add(code);
  }

  for (const code of params.impliedGrants) {
    if (!isChecked(code)) deniedSet.add(code);
    else deniedSet.delete(code);
  }

  return {
    permissionNames: Array.from(allowSet).sort(),
    deniedPermissionNames: Array.from(deniedSet).sort(),
  };
}

function PermissionCatalogRow({
  perm,
  checked,
  locked,
  disabled,
  hint,
  onToggle,
}: {
  perm: PermissionOption;
  checked: boolean;
  locked: boolean;
  disabled: boolean;
  hint?: string;
  onToggle: (checked: boolean) => void;
}) {
  const theme = useTheme() as AppTheme;
  const row = (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1,
        py: 0.25,
        minWidth: 0,
        opacity: locked ? 0.88 : 1,
      }}
    >
      <Checkbox
        checked={checked}
        disabled={disabled || locked}
        onChange={(_, next) => onToggle(next)}
      />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="body2"
          sx={{ color: theme.app.text.primary, fontSize: 13, wordBreak: "break-word" }}
        >
          {perm.label}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: theme.app.dashboard.textMuted, fontSize: 12, wordBreak: "break-all" }}
        >
          {perm.code}
        </Typography>
        {hint ? (
          <Typography
            variant="caption"
            sx={{
              display: "block",
              color: locked ? theme.app.dashboard.accentCyan : theme.app.dashboard.textMuted,
              fontSize: 11,
              mt: 0.15,
            }}
          >
            {hint}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );

  if (locked && hint) {
    return (
      <HoverTooltip label={hint} fullWidth={false}>
        <Box sx={{ width: "100%" }}>{row}</Box>
      </HoverTooltip>
    );
  }
  return row;
}

export function RoleModal({ open, onClose, onSaved, editRole = null }: RoleModalProps) {
  const theme = useTheme() as AppTheme;
  const editId = editRole?.id?.trim() ?? "";
  const isEdit = editId.length > 0;

  const [roleName, setRoleName] = useState("");
  const [permissionSearch, setPermissionSearch] = useState("");
  const [storedGrants, setStoredGrants] = useState<string[]>([]);
  const [deniedGrants, setDeniedGrants] = useState<string[]>([]);
  const [checkedOperational, setCheckedOperational] = useState<Set<string>>(new Set());
  const [checkedPages, setCheckedPages] = useState<Set<string>>(new Set());
  const [impliedGrants, setImpliedGrants] = useState<Set<string>>(new Set());
  const [equivalentGrants, setEquivalentGrants] = useState<Set<string>>(new Set());
  const [chatBundle, setChatBundle] = useState<ChatBundleCode | null>(null);
  /** DB snapshot on load — only used for "Saved on this role" hint, not draft edits. */
  const [persistedStoredGrants, setPersistedStoredGrants] = useState<string[]>([]);

  const hydratedKeyRef = useRef<string | null>(null);
  const hydratedPermsForRoleIdRef = useRef<string | null>(null);
  const previewRequestIdRef = useRef(0);
  const expansionWarningShownRef = useRef(false);

  const permissionsCatalogQuery = usePermissionsCatalogQuery(
    { groupByType: true },
    { enabled: open, scope: "role-modal" },
  );

  const rolePermissionsQuery = useRolePermissionsQuery(editId, {
    enabled: open && isEdit,
    scope: "role-modal",
    skipGlobalToast: true,
  });

  const roleDetailQuery = useRoleQuery(editId, {
    enabled: open && isEdit,
    scope: "role-modal",
    skipGlobalToast: true,
  });

  useEffect(() => {
    if (!open || !isEdit) return;
    void roleDetailQuery.refetch();
    void rolePermissionsQuery.refetch();
  }, [open, isEdit, editId]); // eslint-disable-line react-hooks/exhaustive-deps

  const queryClient = useQueryClient();
  const [isSavingRole, setIsSavingRole] = useState(false);
  const isSaving = isSavingRole;

  const permissionGroups: PermissionGroup[] = useMemo(
    () => extractPermissionsCatalogGroups(permissionsCatalogQuery.data),
    [permissionsCatalogQuery.data],
  );

  const { catalogOperational, catalogPage } = useMemo(() => {
    const operational: PermissionOption[] = [];
    const page: PermissionOption[] = [];
    const seen = new Set<string>();

    for (const group of permissionGroups) {
      const bucket = normalizeGroupTitle(group.title);
      for (const perm of group.permissions) {
        if (isChatBundleCode(perm.code) || seen.has(perm.code)) continue;
        seen.add(perm.code);
        const isPageCode = perm.code.startsWith("page:") || bucket === "page";
        if (isPageCode) page.push(perm);
        else operational.push(perm);
      }
    }

    operational.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
    page.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
    return { catalogOperational: operational, catalogPage: page };
  }, [permissionGroups]);

  const mapPermissionCodesToCatalog = useCallback(
    (codes: string[]) => {
      const lookup = new Map<string, string>();
      for (const perm of [...catalogOperational, ...catalogPage]) {
        lookup.set(perm.code.toLowerCase(), perm.code);
        lookup.set(perm.label.toLowerCase(), perm.code);
      }
      return codes
        .map((code) => lookup.get(code.toLowerCase()) ?? code)
        .filter((code) => code.length > 0);
    },
    [catalogOperational, catalogPage],
  );

  const filterCatalog = useCallback(
    (items: PermissionOption[]) => {
      const q = permissionSearch.trim().toLowerCase();
      if (!q) return items;
      return items.filter(
        (perm) =>
          perm.code.toLowerCase().includes(q) || perm.label.toLowerCase().includes(q),
      );
    },
    [permissionSearch],
  );

  const filteredOperational = useMemo(
    () => filterCatalog(catalogOperational),
    [catalogOperational, filterCatalog],
  );
  const filteredPage = useMemo(
    () => filterCatalog(catalogPage),
    [catalogPage, filterCatalog],
  );

  const draftAllowSet = useMemo(() => new Set(storedGrants), [storedGrants]);
  const deniedSet = useMemo(() => new Set(deniedGrants), [deniedGrants]);
  const persistedAllowSet = useMemo(
    () => new Set(persistedStoredGrants),
    [persistedStoredGrants],
  );

  const getSelectedPermissionNames = useCallback(
    (operational: Set<string>, pages: Set<string>) =>
      [...operational, ...pages].sort(),
    [],
  );

  const getAutoGrantHint = useCallback(
    (code: string): string => {
      if (equivalentGrants.has(code)) {
        return "Already covered by another grant on this role";
      }
      if (chatBundle && (isGranularChatPermissionCode(code) || code.startsWith("qa:chat:"))) {
        return `Auto-granted by ${chatBundle}`;
      }
      const pageGate = storedGrants.find((grant) => grant.startsWith("page:"));
      if (impliedGrants.has(code) && pageGate) {
        return `Auto-granted by ${pageGate}`;
      }
      return "Auto-granted by a bundle or page gate on this role";
    },
    [chatBundle, equivalentGrants, impliedGrants, storedGrants],
  );

  type SelectionSets = { operational: Set<string>; pages: Set<string> };

  const resolveSelectionSets = useCallback(
    (
      preview: PermissionExpandPreview,
      nextStored: string[],
      preserveSelection?: SelectionSets,
    ): SelectionSets => {
      if (preserveSelection) return preserveSelection;
      const mappedDenied = mapPermissionCodesToCatalog(preview.deniedPermissionNames);
      const mappedEquivalent = mapPermissionCodesToCatalog(preview.equivalentPermissionNames);
      const built = buildSelectedPermissionSets({
        stored: nextStored,
        denied: mappedDenied,
        effectiveOperational: mapPermissionCodesToCatalog(preview.operational),
        effectivePage: mapPermissionCodesToCatalog(preview.page),
        equivalent: mappedEquivalent,
      });
      return {
        operational: new Set(built.operational),
        pages: new Set(built.page),
      };
    },
    [mapPermissionCodesToCatalog],
  );

  const applyExpandMetadata = useCallback(
    (
      preview: PermissionExpandPreview,
      nextStored: string[],
      selection: SelectionSets,
    ) => {
      setCheckedOperational(new Set(selection.operational));
      setCheckedPages(new Set(selection.pages));
      setImpliedGrants(new Set(mapPermissionCodesToCatalog(preview.impliedPermissionNames)));
      setEquivalentGrants(new Set(mapPermissionCodesToCatalog(preview.equivalentPermissionNames)));
      setDeniedGrants(mapPermissionCodesToCatalog(preview.deniedPermissionNames));
      setChatBundle(pickAssignedChatBundle(nextStored));
    },
    [mapPermissionCodesToCatalog],
  );

  const refreshExpandPreview = useCallback(
    async (nextStored: string[], preserveSelection?: SelectionSets) => {
      const nextSelected = preserveSelection
        ? getSelectedPermissionNames(preserveSelection.operational, preserveSelection.pages)
        : undefined;
      const reqId = ++previewRequestIdRef.current;
      try {
        const preview = await fetchPermissionExpandPreview(nextStored, nextSelected);
        if (reqId !== previewRequestIdRef.current) return;
        const selection = resolveSelectionSets(preview, nextStored, preserveSelection);
        applyExpandMetadata(preview, nextStored, selection);
      } catch (err) {
        if (reqId !== previewRequestIdRef.current) return;
        if (err instanceof PermissionExpansionUnavailableError) {
          const fallbackPreview: PermissionExpandPreview = {
            operational: [],
            page: [],
            impliedPermissionNames: [],
            equivalentPermissionNames: [],
            deniedPermissionNames: [],
            storedPermissionNames: [],
          };
          const selection = resolveSelectionSets(fallbackPreview, nextStored, preserveSelection);
          applyExpandMetadata(fallbackPreview, nextStored, selection);
          if (!expansionWarningShownRef.current) {
            expansionWarningShownRef.current = true;
            publishAppToast({
              variant: "error",
              message:
                "Live permission preview needs POST /access/permissions/expand on the backend. Save the role to refresh implied permissions.",
            });
          }
          return;
        }
        publishAppToast({
          variant: "error",
          message:
            extractApiErrorMessageForToast(err) ??
            "Could not preview expanded permissions.",
        });
      }
    },
    [applyExpandMetadata, getSelectedPermissionNames, resolveSelectionSets],
  );

  useEffect(() => {
    if (!open) {
      hydratedKeyRef.current = null;
      hydratedPermsForRoleIdRef.current = null;
      return;
    }

    const key = isEdit ? `edit:${editId}` : "add";
    if (hydratedKeyRef.current === key) return;
    hydratedKeyRef.current = key;

    setRoleName(isEdit ? (editRole?.name ?? "") : "");
    setPermissionSearch("");
    setStoredGrants([]);
    setDeniedGrants([]);
    setCheckedOperational(new Set());
    setCheckedPages(new Set());
    setImpliedGrants(new Set());
    setEquivalentGrants(new Set());
    setChatBundle(null);
    hydratedPermsForRoleIdRef.current = null;
    expansionWarningShownRef.current = false;
    setPersistedStoredGrants([]);
  }, [open, isEdit, editId, editRole]);

  useEffect(() => {
    if (!open || !isEdit) return;
    if (hydratedPermsForRoleIdRef.current === editId) return;
    if (!catalogOperational.length && !catalogPage.length) return;

    const sourcePayload = rolePermissionsQuery.isSuccess
      ? rolePermissionsQuery.data
      : roleDetailQuery.isSuccess
        ? roleDetailQuery.data
        : null;
    if (!sourcePayload) return;

    const stored = mapPermissionCodesToCatalog(extractRoleStoredPermissionNames(sourcePayload));
    const denied = mapPermissionCodesToCatalog(extractRoleDeniedPermissionNames(sourcePayload));
    const effective = extractRoleEffectiveByType(sourcePayload);
    const equivalent = mapPermissionCodesToCatalog(
      extractEquivalentPermissionNames(sourcePayload),
    );
    const selection = buildSelectedPermissionSets({
      stored,
      denied,
      effectiveOperational: mapPermissionCodesToCatalog(effective.operational),
      effectivePage: mapPermissionCodesToCatalog(effective.page),
      equivalent,
    });

    setPersistedStoredGrants(stored);
    setStoredGrants(stored);
    setDeniedGrants(denied);
    setEquivalentGrants(new Set(equivalent));
    setChatBundle(pickAssignedChatBundle(stored));

    const selectionSets: SelectionSets = {
      operational: new Set(selection.operational),
      pages: new Set(selection.page),
    };
    setCheckedOperational(selectionSets.operational);
    setCheckedPages(selectionSets.pages);
    hydratedPermsForRoleIdRef.current = editId;

    void refreshExpandPreview(stored, selectionSets);
  }, [
    open,
    isEdit,
    editId,
    rolePermissionsQuery.isSuccess,
    rolePermissionsQuery.data,
    roleDetailQuery.isSuccess,
    roleDetailQuery.data,
    catalogOperational.length,
    catalogPage.length,
    mapPermissionCodesToCatalog,
    refreshExpandPreview,
  ]);

  useEffect(() => {
    if (!open || !isEdit || !roleDetailQuery.isSuccess) return;
    const serverName = extractRoleNameFromDetail(roleDetailQuery.data);
    if (!serverName) return;
    setRoleName(serverName);
  }, [open, isEdit, roleDetailQuery.isSuccess, roleDetailQuery.data]);

  const handleSelectChatBundle = (code: ChatBundleCode) => {
    const nextStored = [...storedGrants.filter((grant) => !isChatBundleCode(grant)), code];
    setStoredGrants(nextStored);
    void refreshExpandPreview(nextStored);
  };

  const isPureImpliedGrant = useCallback(
    (code: string) => impliedGrants.has(code) && !draftAllowSet.has(code),
    [impliedGrants, draftAllowSet],
  );

  const handlePermissionToggle = (code: string, checked: boolean) => {
    if (equivalentGrants.has(code) || isChatBundleCode(code)) {
      return;
    }

    const isPage = code.startsWith("page:");
    const nextOperational = new Set(checkedOperational);
    const nextPages = new Set(checkedPages);
    let nextStored = [...storedGrants];
    const nextDenied = deniedGrants.filter((grant) => grant !== code);
    const pureImplied = isPureImpliedGrant(code);

    if (checked) {
      if (isPage) nextPages.add(code);
      else nextOperational.add(code);
      if (!pureImplied && !nextStored.includes(code)) {
        nextStored.push(code);
      }
    } else {
      if (isPage) nextPages.delete(code);
      else nextOperational.delete(code);
      if (pureImplied) {
        nextDenied.push(code);
      } else {
        nextStored = nextStored.filter((grant) => grant !== code);
      }
    }

    const selectionSets: SelectionSets = {
      operational: nextOperational,
      pages: nextPages,
    };
    setCheckedOperational(nextOperational);
    setCheckedPages(nextPages);
    setStoredGrants(Array.from(new Set(nextStored)).sort());
    setDeniedGrants(Array.from(new Set(nextDenied)).sort());
    void refreshExpandPreview(Array.from(new Set(nextStored)).sort(), selectionSets);
  };

  const handleSectionSelectAll = (items: PermissionOption[], selectAll: boolean) => {
    const toggleableCodes = items
      .filter((perm) => !equivalentGrants.has(perm.code) && !isChatBundleCode(perm.code))
      .map((perm) => perm.code);

    if (toggleableCodes.length === 0) return;

    const toggleableSet = new Set(toggleableCodes);
    const nextOperational = new Set(checkedOperational);
    const nextPages = new Set(checkedPages);
    let nextStored = [...storedGrants];
    const nextDenied = deniedGrants.filter((grant) => !toggleableSet.has(grant));

    for (const code of toggleableCodes) {
      const isPage = code.startsWith("page:");
      const pureImplied = isPureImpliedGrant(code);
      if (selectAll) {
        if (isPage) nextPages.add(code);
        else nextOperational.add(code);
        if (!pureImplied && !nextStored.includes(code)) {
          nextStored.push(code);
        }
      } else {
        if (isPage) nextPages.delete(code);
        else nextOperational.delete(code);
        if (pureImplied) {
          nextDenied.push(code);
        } else {
          nextStored = nextStored.filter((grant) => grant !== code);
        }
      }
    }

    const selectionSets: SelectionSets = {
      operational: nextOperational,
      pages: nextPages,
    };
    setCheckedOperational(nextOperational);
    setCheckedPages(nextPages);
    setStoredGrants(Array.from(new Set(nextStored)).sort());
    setDeniedGrants(Array.from(new Set(nextDenied)).sort());
    void refreshExpandPreview(Array.from(new Set(nextStored)).sort(), selectionSets);
  };

  const detailError =
    (permissionsCatalogQuery.isError
      ? extractApiErrorMessageForToast(permissionsCatalogQuery.error) ??
        "Could not load permissions catalog."
      : null) ??
    (roleDetailQuery.isError
      ? extractApiErrorMessageForToast(roleDetailQuery.error) ?? "Could not load role details."
      : null) ??
    (rolePermissionsQuery.isError
      ? extractApiErrorMessageForToast(rolePermissionsQuery.error) ??
        "Could not load role permissions."
      : null);

  const isLoading =
    permissionsCatalogQuery.isLoading ||
    permissionsCatalogQuery.isFetching ||
    (isEdit &&
      (roleDetailQuery.isLoading ||
        roleDetailQuery.isFetching ||
        rolePermissionsQuery.isLoading ||
        rolePermissionsQuery.isFetching));

  const handleSave = async () => {
    const name = roleName.trim();
    if (!name) {
      publishAppToast({ variant: "error", message: "Please enter a role name." });
      return;
    }

    const permissionsBody = buildRolePermissionsSaveBody({
      storedGrants,
      deniedGrants,
      checkedOperational,
      checkedPages,
      impliedGrants,
    });

    if (permissionsBody.permissionNames.length === 0) {
      publishAppToast({ variant: "error", message: "Please select at least one permission." });
      return;
    }

    setIsSavingRole(true);
    try {
      if (!isEdit) {
        await createRole({ name, ...permissionsBody });
      } else {
        await replaceRolePermissions(editId, permissionsBody);
        const serverName =
          extractRoleNameFromDetail(roleDetailQuery.data) ?? editRole?.name ?? "";
        if (serverName.trim() !== name) {
          await updateRole(editId, { name });
        }
      }
      await queryClient.invalidateQueries({ queryKey: rolesKeys.all });
      if (isEdit) {
        await queryClient.invalidateQueries({ queryKey: rolesKeys.permissions(editId) });
      }
      onSaved?.();
      onClose();
    } catch (err) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(err) ?? "Could not save role.",
      });
    } finally {
      setIsSavingRole(false);
    }
  };

  const renderSection = (
    title: string,
    items: PermissionOption[],
    checkedSet: Set<string>,
  ) => {
    const toggleableItems = items.filter(
      (perm) => !equivalentGrants.has(perm.code) && !isChatBundleCode(perm.code),
    );
    const allSelected =
      toggleableItems.length > 0 && toggleableItems.every((perm) => checkedSet.has(perm.code));
    const someSelected = toggleableItems.some((perm) => checkedSet.has(perm.code));

    return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 1.5,
        minWidth: 0,
        background: theme.app.dashboard.glassGradient,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        boxShadow: theme.app.dashboard.glassShadow,
        border: `1px solid ${theme.app.dashboard.cardBorder}`,
      }}
    >
      <Typography variant="body2" fontWeight={800} sx={{ color: theme.app.text.primary, mb: 1, fontSize: 13 }}>
        {title}
      </Typography>
      {items.length === 0 ? (
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
          No permissions match your search.
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          {toggleableItems.length > 0 ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                pb: 0.75,
                mb: 0.25,
                borderBottom: `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.75)}`,
              }}
            >
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected && !allSelected}
                disabled={isSaving}
                onChange={(_, checked) => handleSectionSelectAll(items, checked)}
              />
              <Typography variant="body2" sx={{ color: theme.app.text.primary, fontSize: 13, fontWeight: 600 }}>
                Select all
              </Typography>
            </Box>
          ) : null}
          {items.map((perm) => {
            const checked = checkedSet.has(perm.code);
            const locked = equivalentGrants.has(perm.code);
            const implied = impliedGrants.has(perm.code);
            const denied = deniedSet.has(perm.code);
            const savedInDb = persistedAllowSet.has(perm.code);
            const hint = locked
              ? getAutoGrantHint(perm.code)
              : implied && checked
                ? getAutoGrantHint(perm.code)
                : implied && denied
                  ? "Denied for this role (bundle or page gate stays assigned)"
                  : savedInDb
                    ? "Saved on this role"
                    : undefined;
            return (
              <PermissionCatalogRow
                key={perm.code}
                perm={perm}
                checked={checked}
                locked={locked}
                disabled={isSaving}
                hint={hint}
                onToggle={(next) => handlePermissionToggle(perm.code, next)}
              />
            );
          })}
        </Box>
      )}
    </Box>
    );
  };

  return (
    <FormModal
      open={open}
      title={isEdit ? "Edit Role" : "Add Role"}
      description={
        isEdit
          ? "Update role name and permissions. Changes take effect immediately."
          : "Create a role and assign permissions."
      }
      onClose={onClose}
      onSave={() => void handleSave()}
      primaryButtonLabel={isEdit ? "Save changes" : "Create role"}
      primaryButtonDisabled={isSaving || isLoading || Boolean(detailError)}
      cancelButtonLabel="Cancel"
      maxWidth={780}
      fitContent
    >
      {detailError ? (
        <Typography variant="medium" sx={{ color: theme.palette.error.light, lineHeight: 1.5 }}>
          {detailError}
        </Typography>
      ) : isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 5 }}>
          <CircularProgress size={36} aria-label="Loading role data" />
        </Box>
      ) : (
        <>
          <InputField
            label="Role Name"
            placeholder="e.g. Support Agent"
            value={roleName}
            onChange={(e) => setRoleName((e.target as HTMLInputElement).value)}
            disabled={isSaving}
          />

          <Box sx={{ mt: 0.5 }}>
            <Typography variant="medium" fontWeight={700} sx={{ color: theme.app.text.primary, mb: 1.25 }}>
              Permissions
            </Typography>
            <Divider />

            <Box
              sx={{
                mt: 1.5,
                p: 1.5,
                borderRadius: 1.5,
                border: `1px solid ${theme.app.dashboard.cardBorder}`,
                background: theme.app.dashboard.glassGradient,
              }}
            >
              <Typography variant="medium" fontWeight={700} sx={{ color: theme.app.text.primary, mb: 0.5 }}>
                Chat access (pick one bundle)
              </Typography>
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1.25 }}>
                Bundles stay in <code>permissionNames</code>. Unchecking auto-granted permissions adds them to{" "}
                <code>deniedPermissionNames</code> without removing the bundle.
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {CHAT_BUNDLE_OPTIONS.map((opt) => {
                  const selected = chatBundle === opt.code;
                  return (
                    <Box
                      key={opt.code}
                      component="label"
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1,
                        p: 1,
                        borderRadius: 1,
                        cursor: isSaving ? "default" : "pointer",
                        border: `1px solid ${selected ? theme.app.dashboard.accentBlue : theme.app.dashboard.cardBorder}`,
                        bgcolor: selected ? alpha(theme.app.dashboard.accentBlue, 0.08) : "transparent",
                      }}
                    >
                      <input
                        type="radio"
                        name="chat-bundle"
                        checked={selected}
                        onChange={() => handleSelectChatBundle(opt.code)}
                        disabled={isSaving}
                        style={{ marginTop: 4 }}
                      />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13 }}>
                          {opt.label}
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                          {opt.description}
                        </Typography>
                        <Typography variant="caption" sx={{ display: "block", fontFamily: "monospace", mt: 0.25 }}>
                          {opt.code}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            <Box sx={{ mt: 1.5 }}>
              <InputField
                label="Search permissions"
                placeholder="Type to search (e.g. page:roles, chat:bundle:agent)"
                value={permissionSearch}
                onChange={(e) => setPermissionSearch((e.target as HTMLInputElement).value)}
                disabled={isSaving}
              />
            </Box>

            <Box
              sx={{
                mt: 1.25,
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                gap: 1.5,
              }}
            >
              {renderSection("Operational permissions", filteredOperational, checkedOperational)}
              {renderSection("Page permissions", filteredPage, checkedPages)}
            </Box>
          </Box>
        </>
      )}
    </FormModal>
  );
}
