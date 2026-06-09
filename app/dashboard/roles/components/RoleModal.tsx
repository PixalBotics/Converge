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
import {
  parsePermissionExpandPreview,
} from "@/lib/permissions/role-permission-payload";
import {
  useCreateRoleMutation,
  usePermissionsCatalogQuery,
  useReplaceRolePermissionsMutation,
  useRoleQuery,
  useRolePermissionsQuery,
  useUpdateRoleMutation,
} from "@/lib/hooks";
import {
  extractPermissionsCatalogGroups,
  extractRoleNameFromDetail,
  extractRoleStoredPermissionNames,
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
        {locked && hint ? (
          <Typography
            variant="caption"
            sx={{ display: "block", color: theme.app.dashboard.accentCyan, fontSize: 11, mt: 0.15 }}
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
  const [checkedOperational, setCheckedOperational] = useState<Set<string>>(new Set());
  const [checkedPages, setCheckedPages] = useState<Set<string>>(new Set());
  const [impliedGrants, setImpliedGrants] = useState<Set<string>>(new Set());
  const [equivalentGrants, setEquivalentGrants] = useState<Set<string>>(new Set());
  const [chatBundle, setChatBundle] = useState<ChatBundleCode | null>(null);

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

  const createRoleMutation = useCreateRoleMutation();
  const updateRoleMutation = useUpdateRoleMutation();
  const replacePermsMutation = useReplaceRolePermissionsMutation();
  const isSaving =
    createRoleMutation.isPending || updateRoleMutation.isPending || replacePermsMutation.isPending;

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

  const storedSet = useMemo(() => new Set(storedGrants), [storedGrants]);

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

  const applyExpandPreview = useCallback(
    (preview: PermissionExpandPreview, nextStored: string[]) => {
      setCheckedOperational(new Set(mapPermissionCodesToCatalog(preview.operational)));
      setCheckedPages(new Set(mapPermissionCodesToCatalog(preview.page)));
      setImpliedGrants(new Set(mapPermissionCodesToCatalog(preview.impliedPermissionNames)));
      setEquivalentGrants(new Set(mapPermissionCodesToCatalog(preview.equivalentPermissionNames)));
      setChatBundle(pickAssignedChatBundle(nextStored));
    },
    [mapPermissionCodesToCatalog],
  );

  const syncCheckedFromStored = useCallback(
    (nextStored: string[]) => {
      const mapped = mapPermissionCodesToCatalog(nextStored);
      setCheckedOperational(new Set(mapped.filter((code) => !code.startsWith("page:"))));
      setCheckedPages(new Set(mapped.filter((code) => code.startsWith("page:"))));
      setChatBundle(pickAssignedChatBundle(nextStored));
    },
    [mapPermissionCodesToCatalog],
  );

  const refreshExpandPreview = useCallback(
    async (nextStored: string[]) => {
      const reqId = ++previewRequestIdRef.current;
      try {
        const preview = await fetchPermissionExpandPreview(nextStored);
        if (reqId !== previewRequestIdRef.current) return;
        applyExpandPreview(preview, nextStored);
      } catch (err) {
        if (reqId !== previewRequestIdRef.current) return;
        if (err instanceof PermissionExpansionUnavailableError) {
          const mappedStored = mapPermissionCodesToCatalog(nextStored);
          applyExpandPreview(
            {
              operational: mappedStored.filter((code) => !code.startsWith("page:")),
              page: mappedStored.filter((code) => code.startsWith("page:")),
              impliedPermissionNames: [],
              equivalentPermissionNames: [],
            },
            nextStored,
          );
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
    [applyExpandPreview, mapPermissionCodesToCatalog],
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
    setCheckedOperational(new Set());
    setCheckedPages(new Set());
    setImpliedGrants(new Set());
    setEquivalentGrants(new Set());
    setChatBundle(null);
    hydratedPermsForRoleIdRef.current = null;
    expansionWarningShownRef.current = false;
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
    const preview = parsePermissionExpandPreview(sourcePayload);
    setStoredGrants(stored);
    applyExpandPreview(preview, stored);
    hydratedPermsForRoleIdRef.current = editId;
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
    applyExpandPreview,
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
    syncCheckedFromStored(nextStored);
    void refreshExpandPreview(nextStored);
  };

  const handleStoredPermissionToggle = (code: string, checked: boolean) => {
    if (impliedGrants.has(code) || equivalentGrants.has(code) || isChatBundleCode(code)) {
      return;
    }
    const nextStored = checked
      ? [...storedGrants.filter((grant) => grant !== code), code]
      : storedGrants.filter((grant) => grant !== code);
    setStoredGrants(nextStored);
    syncCheckedFromStored(nextStored);
    void refreshExpandPreview(nextStored);
  };

  const handleSectionSelectAll = (items: PermissionOption[], selectAll: boolean) => {
    const toggleableCodes = items
      .filter(
        (perm) =>
          !impliedGrants.has(perm.code) &&
          !equivalentGrants.has(perm.code) &&
          !isChatBundleCode(perm.code),
      )
      .map((perm) => perm.code);

    if (toggleableCodes.length === 0) return;

    const toggleableSet = new Set(toggleableCodes);
    const nextStored = selectAll
      ? [...new Set([...storedGrants, ...toggleableCodes])]
      : storedGrants.filter((grant) => !toggleableSet.has(grant));

    setStoredGrants(nextStored);
    syncCheckedFromStored(nextStored);
    void refreshExpandPreview(nextStored);
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
    if (storedGrants.length === 0) {
      publishAppToast({ variant: "error", message: "Please select at least one permission." });
      return;
    }

    const closeOnSuccess = () => {
      onSaved?.();
      onClose();
    };

    if (!isEdit) {
      createRoleMutation.mutate(
        { name, permissionNames: storedGrants },
        { onSuccess: closeOnSuccess },
      );
      return;
    }

    updateRoleMutation.mutate(
      { id: editId, body: { name } },
      {
        onSuccess: () => {
          replacePermsMutation.mutate(
            { id: editId, body: { permissionNames: storedGrants } },
            { onSuccess: closeOnSuccess },
          );
        },
      },
    );
  };

  const renderSection = (
    title: string,
    items: PermissionOption[],
    checkedSet: Set<string>,
  ) => {
    const toggleableItems = items.filter(
      (perm) =>
        !impliedGrants.has(perm.code) &&
        !equivalentGrants.has(perm.code) &&
        !isChatBundleCode(perm.code),
    );
    const allSelected =
      toggleableItems.length > 0 && toggleableItems.every((perm) => storedSet.has(perm.code));
    const someSelected = toggleableItems.some((perm) => storedSet.has(perm.code));

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
            const locked = impliedGrants.has(perm.code) || equivalentGrants.has(perm.code);
            const stored = storedSet.has(perm.code);
            const hint = locked ? getAutoGrantHint(perm.code) : stored ? "Saved on this role" : undefined;
            return (
              <PermissionCatalogRow
                key={perm.code}
                perm={perm}
                checked={checked}
                locked={locked}
                disabled={isSaving}
                hint={hint}
                onToggle={(next) => handleStoredPermissionToggle(perm.code, next)}
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
      onSave={handleSave}
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
                Sends the full stored grant list to <code>POST /access/permissions/expand</code> so operational and
                page permissions update instantly. Only stored grants are saved to the role.
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
                placeholder="Type to search (e.g. page:roles, chat:access)"
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
