"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Checkbox, Divider, FormModal, InputField, Typography } from "@/components/common";
import {
  CHAT_BUNDLE_OPTIONS,
  isChatBundleCode,
  isGranularChatPermissionCode,
  pickAssignedChatBundle,
  type ChatBundleCode,
} from "@/lib/permissions/chat-bundles";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
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
  extractRoleAssignedPermissionNames,
  type PermissionGroup,
  type RoleRow,
} from "../utils";
import { isRecord, unwrapApiData } from "@/lib/utils/core";

function extractAssignedFromRoleDetail(payload: unknown): string[] {
  const data = unwrapApiData(payload);
  const inner = isRecord(data) ? data : null;
  const byTypeRaw = inner && "permissionNamesByType" in inner ? inner.permissionNamesByType : null;
  const byType = isRecord(byTypeRaw) ? (byTypeRaw as Record<string, unknown>) : null;
  if (!byType) return [];
  const out: string[] = [];
  for (const v of Object.values(byType)) {
    if (!Array.isArray(v)) continue;
    for (const item of v) {
      if (typeof item === "string" && item.trim()) out.push(item.trim());
    }
  }
  return Array.from(new Set(out)).sort();
}

export type RoleModalProps = {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  editRole?: RoleRow | null;
};

function buildPermissionsMap(selected: string[]): Record<string, boolean> {
  const next: Record<string, boolean> = {};
  for (const code of selected) next[code] = true;
  return next;
}

export function RoleModal({ open, onClose, onSaved, editRole = null }: RoleModalProps) {
  const theme = useTheme() as AppTheme;
  const editId = editRole?.id?.trim() ?? "";
  const isEdit = editId.length > 0;

  const [roleName, setRoleName] = useState("");
  const [permissionSearch, setPermissionSearch] = useState("");
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [chatBundle, setChatBundle] = useState<ChatBundleCode | null>(null);
  const [showAdvancedChat, setShowAdvancedChat] = useState(false);

  const hydratedKeyRef = useRef<string | null>(null);
  const hydratedPermsForRoleIdRef = useRef<string | null>(null);

  const permissionsCatalogQuery = usePermissionsCatalogQuery(
    { groupByType: true },
    {
      enabled: open,
      scope: "role-modal",
    },
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
    // Ensure we actually hit GET /roles/:id and /roles/:id/permissions when editing.
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

  const { standardPermissionGroups, advancedChatPermissions } = useMemo(() => {
    const standard: PermissionGroup[] = [];
    const advanced: PermissionGroup["permissions"] = [];
    for (const g of permissionGroups) {
      const stdPerms = g.permissions.filter(
        (p) => !isGranularChatPermissionCode(p.code) && !isChatBundleCode(p.code),
      );
      const advPerms = g.permissions.filter((p) => isGranularChatPermissionCode(p.code));
      if (stdPerms.length > 0) standard.push({ title: g.title, permissions: stdPerms });
      advanced.push(...advPerms);
    }
    return { standardPermissionGroups: standard, advancedChatPermissions: advanced };
  }, [permissionGroups]);

  const filteredPermissionGroups: PermissionGroup[] = useMemo(() => {
    const q = permissionSearch.trim().toLowerCase();
    const base = standardPermissionGroups;
    if (!q) return base;
    return base
      .map((g) => ({
        ...g,
        permissions: g.permissions.filter(
          (p) =>
            p.code.toLowerCase().includes(q) || p.label.toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.permissions.length > 0);
  }, [standardPermissionGroups, permissionSearch]);

  const filteredAdvancedChat = useMemo(() => {
    const q = permissionSearch.trim().toLowerCase();
    if (!q) return advancedChatPermissions;
    return advancedChatPermissions.filter(
      (p) => p.code.toLowerCase().includes(q) || p.label.toLowerCase().includes(q),
    );
  }, [advancedChatPermissions, permissionSearch]);

  const allCodes = useMemo(() => {
    const set = new Set<string>();
    for (const g of permissionGroups) for (const p of g.permissions) set.add(p.code);
    return Array.from(set);
  }, [permissionGroups]);

  const allSelected = useMemo(() => allCodes.length > 0 && allCodes.every((c) => permissions[c]), [allCodes, permissions]);

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
    setPermissions({});
    setChatBundle(null);
    setShowAdvancedChat(false);
    hydratedPermsForRoleIdRef.current = null;
  }, [open, isEdit, editId, editRole]);

  const handleSelectChatBundle = (code: ChatBundleCode) => {
    setChatBundle(code);
    setPermissions((prev) => {
      const next = { ...prev };
      for (const opt of CHAT_BUNDLE_OPTIONS) next[opt.code] = opt.code === code;
      return next;
    });
  };

  useEffect(() => {
    if (!open) return;
    if (!permissionGroups.length) return;
    // Ensure all permission codes exist in the map (unchecked by default).
    setPermissions((prev) => {
      const next = { ...prev };
      for (const code of allCodes) if (next[code] == null) next[code] = false;
      return next;
    });
  }, [open, permissionGroups, allCodes]);

  useEffect(() => {
    if (!open || !isEdit || !rolePermissionsQuery.isSuccess) return;
    if (!allCodes.length) return;
    if (hydratedPermsForRoleIdRef.current === editId) return;
    const fromPermsEndpoint = extractRoleAssignedPermissionNames(rolePermissionsQuery.data);
    const assigned = fromPermsEndpoint;
    if (assigned.length === 0) return;

    // Map assigned values to catalog codes (case-insensitive).
    // Backend may return either permission codes or human labels.
    const lookup = new Map<string, string>();
    for (const g of permissionGroups) {
      for (const p of g.permissions) {
        lookup.set(p.code.toLowerCase(), p.code);
        lookup.set(p.label.toLowerCase(), p.code);
      }
    }
    for (const code of allCodes) {
      const k = code.toLowerCase();
      if (!lookup.has(k)) lookup.set(k, code);
    }
    const mapped = assigned
      .map((c) => lookup.get(c.toLowerCase()) ?? c)
      .filter((c) => c.length > 0);

    setPermissions((prev) => ({ ...prev, ...buildPermissionsMap(mapped) }));
    setChatBundle(pickAssignedChatBundle(mapped));
    hydratedPermsForRoleIdRef.current = editId;
  }, [
    open,
    isEdit,
    editId,
    rolePermissionsQuery.isSuccess,
    rolePermissionsQuery.data,
    allCodes,
    permissionGroups,
  ]);

  useEffect(() => {
    if (!open || !isEdit || !roleDetailQuery.isSuccess) return;
    if (!allCodes.length) return;
    if (hydratedPermsForRoleIdRef.current === editId) return;
    const assigned = extractAssignedFromRoleDetail(roleDetailQuery.data);
    if (assigned.length === 0) return;

    const lookup = new Map<string, string>();
    for (const g of permissionGroups) {
      for (const p of g.permissions) {
        lookup.set(p.code.toLowerCase(), p.code);
        lookup.set(p.label.toLowerCase(), p.code);
      }
    }
    for (const code of allCodes) {
      const k = code.toLowerCase();
      if (!lookup.has(k)) lookup.set(k, code);
    }
    const mapped = assigned
      .map((c) => lookup.get(c.toLowerCase()) ?? c)
      .filter((c) => c.length > 0);

    setPermissions((prev) => ({ ...prev, ...buildPermissionsMap(mapped) }));
    setChatBundle(pickAssignedChatBundle(mapped));
    hydratedPermsForRoleIdRef.current = editId;
  }, [open, isEdit, editId, roleDetailQuery.isSuccess, roleDetailQuery.data, allCodes, permissionGroups]);

  useEffect(() => {
    if (!open || !isEdit || !roleDetailQuery.isSuccess) return;
    const serverName = extractRoleNameFromDetail(roleDetailQuery.data);
    if (!serverName) return;
    setRoleName(serverName);
  }, [open, isEdit, roleDetailQuery.isSuccess, roleDetailQuery.data]);

  const handleToggleAll = () => {
    const next = !allSelected;
    setPermissions((prev) => {
      const updated = { ...prev };
      for (const code of allCodes) updated[code] = next;
      return updated;
    });
  };

  const selectedPermissionNames = useMemo(
    () => allCodes.filter((c) => permissions[c]),
    [allCodes, permissions],
  );

  const detailError =
    (permissionsCatalogQuery.isError
      ? extractApiErrorMessageForToast(permissionsCatalogQuery.error) ?? "Could not load permissions catalog."
      : null)
    ?? (roleDetailQuery.isError
      ? extractApiErrorMessageForToast(roleDetailQuery.error) ?? "Could not load role details."
      : null)
    ?? (rolePermissionsQuery.isError
      ? extractApiErrorMessageForToast(rolePermissionsQuery.error) ?? "Could not load role permissions."
      : null);

  const isLoading =
    permissionsCatalogQuery.isLoading ||
    permissionsCatalogQuery.isFetching ||
    (isEdit && (
      roleDetailQuery.isLoading ||
      roleDetailQuery.isFetching ||
      rolePermissionsQuery.isLoading ||
      rolePermissionsQuery.isFetching
    ));

  const handleSave = async () => {
    const name = roleName.trim();
    if (!name) {
      publishAppToast({ variant: "error", message: "Please enter a role name." });
      return;
    }
    if (selectedPermissionNames.length === 0) {
      publishAppToast({ variant: "error", message: "Please select at least one permission." });
      return;
    }

    const closeOnSuccess = () => {
      onSaved?.();
      onClose();
    };

    if (!isEdit) {
      createRoleMutation.mutate(
        { name, permissionNames: selectedPermissionNames },
        { onSuccess: closeOnSuccess },
      );
      return;
    }

    // Update name first, then replace permissions.
    updateRoleMutation.mutate(
      { id: editId, body: { name } },
      {
        onSuccess: () => {
          replacePermsMutation.mutate(
            { id: editId, body: { permissionNames: selectedPermissionNames } },
            { onSuccess: closeOnSuccess },
          );
        },
      },
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
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1.25,
                gap: 2,
              }}
            >
              <Typography variant="medium" fontWeight={700} sx={{ color: theme.app.text.primary }}>
                Permissions
              </Typography>
              <Box
                component="button"
                type="button"
                onClick={handleToggleAll}
                disabled={allCodes.length === 0}
                sx={{
                  color: theme.app.dashboard.textMuted95,
                  cursor: allCodes.length === 0 ? "default" : "pointer",
                  background: "none",
                  border: "none",
                  textDecoration: "underline",
                  fontSize: 14,
                  fontFamily: "inherit",
                  opacity: allCodes.length === 0 ? 0.4 : 1,
                  "&:hover": { color: theme.app.text.primary },
                }}
              >
                {allSelected ? "Unselect all" : "Select all"}
              </Box>
            </Box>
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
                Backend expands bundles on <code>/auth/me</code>. Add <code>page:hrms</code> or org pages separately
                below — do not assign granular chat codes unless needed.
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {CHAT_BUNDLE_OPTIONS.map((opt) => {
                  const selected = chatBundle === opt.code || Boolean(permissions[opt.code]);
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
                        cursor: "pointer",
                        border: `1px solid ${selected ? theme.app.dashboard.accentBlue : theme.app.dashboard.cardBorder}`,
                        bgcolor: selected ? "rgba(96,165,250,0.08)" : "transparent",
                      }}
                    >
                      <input
                        type="radio"
                        name="chat-bundle"
                        checked={selected}
                        onChange={() => handleSelectChatBundle(opt.code)}
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
                placeholder="Type to search (e.g. page:roles, user:create)"
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
              {filteredPermissionGroups.map((group, idx) => (
                <Box
                  key={`${group.title}-${idx}`}
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    background: theme.app.dashboard.glassGradient,
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    boxShadow: theme.app.dashboard.glassShadow,
                    border: `1px solid ${theme.app.dashboard.cardBorder}`,
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={800}
                    sx={{ color: theme.app.text.primary, mb: 1, fontSize: 13 }}
                  >
                    {group.title}
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                    {group.permissions.map((perm) => (
                      <Box
                        key={perm.code}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          py: 0.25,
                          minWidth: 0,
                        }}
                      >
                        <Checkbox
                          checked={Boolean(permissions[perm.code])}
                          onChange={(_, checked) => setPermissions((p) => ({ ...p, [perm.code]: checked }))}
                        />
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" sx={{ color: theme.app.text.primary, fontSize: 13 }} noWrap>
                            {perm.label}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: theme.app.dashboard.textMuted, fontSize: 12 }}
                            noWrap
                          >
                            {perm.code}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>

            {filteredAdvancedChat.length > 0 ? (
              <Box sx={{ mt: 1.5 }}>
                <Box
                  component="button"
                  type="button"
                  onClick={() => setShowAdvancedChat((v) => !v)}
                  sx={{
                    color: theme.app.dashboard.textMuted95,
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                    textDecoration: "underline",
                    fontSize: 14,
                    fontFamily: "inherit",
                    mb: showAdvancedChat ? 1 : 0,
                  }}
                >
                  {showAdvancedChat ? "Hide" : "Show"} advanced chat permissions ({filteredAdvancedChat.length})
                </Box>
                {showAdvancedChat ? (
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      border: `1px dashed ${theme.app.dashboard.cardBorder}`,
                    }}
                  >
                    <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1 }}>
                      Prefer bundles above. Granular codes are expanded by the server — use only for exceptions.
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                      {filteredAdvancedChat.map((perm) => (
                        <Box key={perm.code} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Checkbox
                            checked={Boolean(permissions[perm.code])}
                            onChange={(_, checked) =>
                              setPermissions((p) => ({ ...p, [perm.code]: checked }))
                            }
                          />
                          <Typography variant="body2" sx={{ fontSize: 12 }}>
                            {perm.label}{" "}
                            <Typography component="span" variant="caption" sx={{ fontFamily: "monospace" }}>
                              {perm.code}
                            </Typography>
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                ) : null}
              </Box>
            ) : null}
          </Box>
        </>
      )}
    </FormModal>
  );
}

