"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Checkbox, FormModal, SearchBar, Typography } from "@/components/common";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import {
  usePermissionsCatalogQuery,
  useReplaceUserPermissionOverridesMutation,
  useUserPermissionsQuery,
  useUsersListQuery,
} from "@/lib/hooks/query";
import { isRecord, pickStr, unwrapApiData } from "@/lib/utils/core";
import { extractPermissionsCatalogGroups, type PermissionGroup } from "@/app/dashboard/roles/utils";
import { FORM_MODAL_MUI_OVERLAY_Z_INDEX } from "@/lib/ui/dialogStacking";

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return (v as unknown[])
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter((x) => x.length > 0);
}

function flattenPermissionNamesByType(v: unknown): string[] {
  if (!isRecord(v)) return [];
  const out: string[] = [];
  for (const value of Object.values(v)) {
    out.push(...asStringArray(value));
  }
  return out;
}

function extractUserOverrides(payload: unknown): { allowed: string[]; denied: string[] } {
  const data = unwrapApiData(payload);
  const obj = isRecord(data) ? (data as Record<string, unknown>) : null;
  const allowedByType = flattenPermissionNamesByType(obj?.["allowedPermissionNamesByType"]);
  const deniedByType = flattenPermissionNamesByType(obj?.["deniedPermissionNamesByType"]);
  const permissionNames =
    asStringArray(obj?.["permissionNames"]) ||
    asStringArray(obj?.["permissions"]) ||
    asStringArray(obj?.["effectivePermissionNames"]);
  const allowed =
    asStringArray(obj?.["allowedPermissionNames"]) ||
    asStringArray(obj?.["allowedPermissions"]) ||
    asStringArray(obj?.["allowed"]);
  const denied =
    asStringArray(obj?.["deniedPermissionNames"]) ||
    asStringArray(obj?.["deniedPermissions"]) ||
    asStringArray(obj?.["denied"]);
  return {
    // Prefer new API shape (`*ByType`) but keep backward compatibility with legacy fields.
    allowed: Array.from(new Set([...allowedByType, ...permissionNames, ...allowed])).sort(),
    denied: Array.from(new Set([...deniedByType, ...denied])).sort(),
  };
}

export type UserPermissionsModalProps = {
  open: boolean;
  onClose: () => void;
  /** When provided, modal opens for editing this user. */
  initialUserId?: string;
  onSaved?: () => void;
};

function normalizeGroupTitle(title: string): "Page permissions" | "Operational permissions" | "Permissions" {
  const t = title.trim().toLowerCase();
  if (t === "page" || t.includes("page")) return "Page permissions";
  if (t === "operational" || t.includes("operational")) return "Operational permissions";
  return "Permissions";
}

export function UserPermissionsModal({ open, onClose, initialUserId, onSaved }: UserPermissionsModalProps) {
  const theme = useTheme() as AppTheme;
  const [userId, setUserId] = useState("");
  const [permissionSearch, setPermissionSearch] = useState("");
  const [allowedMap, setAllowedMap] = useState<Record<string, boolean>>({});

  const hydratedRef = useRef<string | null>(null);

  const usersQuery = useUsersListQuery({ all: true }, { enabled: open });
  const userRows = useMemo(() => {
    const payload = unwrapApiData(usersQuery.data);
    const obj = isRecord(payload) ? (payload as Record<string, unknown>) : null;
    const itemsRaw =
      Array.isArray(obj?.["items"]) ? (obj?.["items"] as unknown[])
      : Array.isArray(payload) ? (payload as unknown[])
      : [];
    const items = itemsRaw.filter(isRecord);
    const base = items
      .map((r) => {
        const id = pickStr(r, ["id"]);
        if (!id) return null;
        const firstName = pickStr(r, ["firstName"]) || "";
        const middleName = pickStr(r, ["middleName"]) || "";
        const lastName = pickStr(r, ["lastName"]) || "";
        const fallbackName = pickStr(r, ["name", "fullName", "userName"]) || "";
        const email = pickStr(r, ["email"]) || "";
        const displayName =
          [firstName, middleName, lastName].filter(Boolean).join(" ").trim() ||
          fallbackName.trim() ||
          "—";
        return { id, name: displayName, email: email || "—", firstName, middleName, lastName };
      })
      .filter((x): x is { id: string; name: string; email: string; firstName: string; middleName: string; lastName: string } => x !== null);
    base.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
    return base;
  }, [usersQuery.data]);

  const selectedUserLabel = useMemo(() => {
    if (!userId.trim()) return "";
    const u = userRows.find((x) => x.id === userId);
    return u ? `${u.name} — ${u.email}` : "";
  }, [userId, userRows]);

  const permissionsCatalogQuery = usePermissionsCatalogQuery(
    { groupByType: true },
    {
      enabled: open,
      scope: "user-permissions",
    },
  );

  const userPermissionsQuery = useUserPermissionsQuery(userId, {
    enabled: open && Boolean(userId.trim()),
    scope: "user-permissions",
  });

  const replaceMutation = useReplaceUserPermissionOverridesMutation();
  const isSaving = replaceMutation.isPending;

  const permissionGroups: PermissionGroup[] = useMemo(
    () => extractPermissionsCatalogGroups(permissionsCatalogQuery.data),
    [permissionsCatalogQuery.data],
  );

  const allCodes = useMemo(() => {
    const set = new Set<string>();
    for (const g of permissionGroups) for (const p of g.permissions) set.add(p.code);
    return Array.from(set).sort();
  }, [permissionGroups]);

  const filteredGroups = useMemo(() => {
    const q = permissionSearch.trim().toLowerCase();
    if (!q) return permissionGroups;
    return permissionGroups
      .map((g) => ({
        ...g,
        permissions: g.permissions.filter(
          (p) => p.code.toLowerCase().includes(q) || p.label.toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.permissions.length > 0);
  }, [permissionGroups, permissionSearch]);

  const operationalPermissions = useMemo(() => {
    const list: { code: string; label: string }[] = [];
    for (const g of filteredGroups) {
      if (normalizeGroupTitle(g.title) !== "Operational permissions") continue;
      list.push(...g.permissions);
    }
    const seen = new Set<string>();
    return list.filter((p) => (seen.has(p.code) ? false : (seen.add(p.code), true)));
  }, [filteredGroups]);

  const pagePermissions = useMemo(() => {
    const list: { code: string; label: string }[] = [];
    for (const g of filteredGroups) {
      if (normalizeGroupTitle(g.title) !== "Page permissions") continue;
      list.push(...g.permissions);
    }
    const seen = new Set<string>();
    return list.filter((p) => (seen.has(p.code) ? false : (seen.add(p.code), true)));
  }, [filteredGroups]);

  useEffect(() => {
    if (!open) {
      hydratedRef.current = null;
      return;
    }
    if (hydratedRef.current === "open") return;
    hydratedRef.current = "open";
    setUserId(initialUserId?.trim() ?? "");
    setPermissionSearch("");
    setAllowedMap({});
  }, [open, initialUserId]);

  useEffect(() => {
    if (!open) return;
    if (!allCodes.length) return;
    setAllowedMap((prev) => {
      const next = { ...prev };
      for (const code of allCodes) if (next[code] == null) next[code] = false;
      return next;
    });
  }, [open, allCodes]);

  useEffect(() => {
    if (!open) return;
    if (!userId.trim()) return;
    if (!userPermissionsQuery.isSuccess) return;
    if (!permissionGroups.length || !allCodes.length) return;

    const { allowed } = extractUserOverrides(userPermissionsQuery.data);

    // Backend may return either permission codes or human labels; map both to catalog codes.
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

    const mappedAllowed = allowed
      .map((c) => lookup.get(c.toLowerCase()) ?? c)
      .filter((c) => typeof c === "string" && c.trim().length > 0);
    setAllowedMap((prev) => {
      const next: Record<string, boolean> = { ...prev };
      // Reset to false first so switching users doesn't leak previous selections.
      for (const code of allCodes) next[code] = false;
      for (const code of mappedAllowed) next[code] = true;
      return next;
    });
  }, [
    open,
    userId,
    userPermissionsQuery.isSuccess,
    userPermissionsQuery.data,
    permissionGroups,
    allCodes,
  ]);

  const selectedAllowed = useMemo(() => allCodes.filter((c) => allowedMap[c]), [allCodes, allowedMap]);
  const canEditPermissions = Boolean(userId.trim());

  const canSave = Boolean(userId.trim()) && !isSaving;

  const handleClose = () => {
    if (isSaving) return;
    onClose();
  };

  const toggleAllowed = (code: string) => {
    if (!canEditPermissions) return;
    setAllowedMap((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  const handleSave = () => {
    const id = userId.trim();
    if (!id) {
      publishAppToast({ variant: "error", message: "Please select a user." });
      return;
    }

    const allowedPermissionNames = selectedAllowed;
    const deniedPermissionNames = allCodes.filter((c) => !allowedMap[c]);
    const permissionNames = Array.from(new Set([...allowedPermissionNames, ...deniedPermissionNames])).sort();

    replaceMutation.mutate(
      {
        id,
        body: {
          permissionNames,
          allowedPermissionNames,
          deniedPermissionNames,
        },
      },
      {
        onSuccess: () => {
          publishAppToast({ variant: "success", message: "User permissions updated." });
          onSaved?.();
          onClose();
        },
        onError: (e) => {
          publishAppToast({
            variant: "error",
            message: extractApiErrorMessageForToast(e) || "Could not update user permissions.",
          });
        },
      },
    );
  };

  const isLoading =
    usersQuery.isLoading ||
    usersQuery.isFetching ||
    permissionsCatalogQuery.isLoading ||
    permissionsCatalogQuery.isFetching ||
    (userId.trim() ? userPermissionsQuery.isLoading || userPermissionsQuery.isFetching : false);

  const errorMessage =
    (usersQuery.isError ? extractApiErrorMessageForToast(usersQuery.error) ?? "Could not load users." : null) ??
    (permissionsCatalogQuery.isError ? extractApiErrorMessageForToast(permissionsCatalogQuery.error) ?? "Could not load permissions." : null) ??
    (userPermissionsQuery.isError ? extractApiErrorMessageForToast(userPermissionsQuery.error) ?? "Could not load user permissions." : null);

  return (
    <FormModal
      open={open}
      title="User permissions"
      description="Manage direct permission overrides for a specific user."
      onClose={handleClose}
      onSave={handleSave}
      primaryButtonLabel={isSaving ? "Saving…" : "Save changes"}
      primaryButtonDisabled={!canSave}
      cancelButtonLabel="Close"
      maxWidth={920}
      fitContent
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          mt: 1.5,
        }}
      >
        <Box
          sx={{
            border: `1px solid ${theme.app.dashboard.cardBorder}`,
            borderRadius: 2,
            p: 2,
            background: theme.app.dashboard.glassGradient,
            boxShadow: theme.app.dashboard.glassShadow,
            backdropFilter: "blur(10px)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1, mb: 1.25 }}>
            <Box>
              <Typography variant="mediumLarge" fontWeight={900} sx={{ color: theme.app.dashboard.white95 }}>
                Select user
              </Typography>
              <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mt: 0.25 }}>
                {selectedUserLabel || "Pick a user to view and edit direct permission overrides."}
              </Typography>
            </Box>
          </Box>

          <Autocomplete
            options={userRows}
            loading={usersQuery.isLoading || usersQuery.isFetching}
            value={userRows.find((u) => u.id === userId) ?? null}
            onChange={(_, v) => setUserId(v?.id ?? "")}
            getOptionLabel={(o) => `${o.name} — ${o.email}`}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            autoHighlight
            slotProps={{
              popper: {
                placement: "bottom-start",
                modifiers: [
                  { name: "flip", enabled: false },
                  { name: "preventOverflow", enabled: true, options: { altAxis: true, padding: 8 } },
                ],
                sx: { zIndex: FORM_MODAL_MUI_OVERLAY_Z_INDEX },
              },
            }}
            filterOptions={(options, state) => {
              const q = state.inputValue.trim().toLowerCase();
              if (!q) return options;
              const includes = (v: string) => v.toLowerCase().includes(q);
              return options.filter((u) => {
                if (includes(u.name)) return true;
                if (includes(u.firstName) || includes(u.middleName) || includes(u.lastName)) return true;
                if (u.email !== "—" && includes(u.email)) return true;
                return false;
              });
            }}
            renderOption={(props, option) => (
              <Box component="li" {...props} sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <Typography variant="body2" sx={{ color: "white", fontWeight: 750 }} noWrap>
                  {option.name}
                </Typography>
                <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }} noWrap>
                  {option.email}
                </Typography>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Search by name or email…"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {usersQuery.isLoading || usersQuery.isFetching ? (
                        <CircularProgress color="inherit" size={18} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                sx={{
                  "& .MuiInputBase-root": {
                    borderRadius: 2,
                    color: "white",
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${theme.app.dashboard.cardBorder}`,
                  },
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                  "& .MuiInputBase-input::placeholder": { color: "rgba(255,255,255,0.55)", opacity: 1 },
                }}
              />
            )}
            sx={{
              "& .MuiAutocomplete-listbox": {
                bgcolor: "rgba(10, 10, 14, 0.96)",
              },
              "& .MuiAutocomplete-paper": {
                borderRadius: 2,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(10, 10, 14, 0.96)",
              },
              "& .MuiAutocomplete-endAdornment": { right: 10 },
            }}
          />

        </Box>

        {errorMessage ? (
          <Typography variant="body2" sx={{ color: theme.palette.error.light, lineHeight: 1.5, mt: -0.75 }}>
            {errorMessage}
          </Typography>
        ) : null}

        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "stretch", md: "center" },
            justifyContent: "space-between",
            gap: 1.5,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ minWidth: 260, flex: "1 1 360px" }}>
            <SearchBar
              value={permissionSearch}
              onChange={setPermissionSearch}
              placeholder="Type to search (e.g. page:roles, user:create)"
            />
          </Box>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: { xs: "flex-start", md: "flex-end" } }}>
            <Box
              sx={{
                px: 1.25,
                py: 0.6,
                borderRadius: "9999px",
                bgcolor: "rgba(34, 197, 94, 0.12)",
                border: "1px solid rgba(34, 197, 94, 0.35)",
              }}
            >
              <Typography variant="caption" sx={{ color: theme.app.dashboard.white95 }}>
                Allowed: {selectedAllowed.length}
              </Typography>
            </Box>
            <Box
              sx={{
                px: 1.25,
                py: 0.6,
                borderRadius: "9999px",
                bgcolor: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.35)",
              }}
            >
              <Typography variant="caption" sx={{ color: theme.app.dashboard.white95 }}>
                Disallowed: {Math.max(0, allCodes.length - selectedAllowed.length)}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            border: `1px solid ${theme.app.dashboard.cardBorder}`,
            borderRadius: 2,
            p: 2,
            minHeight: 360,
            background: theme.app.dashboard.glassGradient,
            boxShadow: theme.app.dashboard.glassShadow,
            backdropFilter: "blur(10px)",
          }}
        >
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 6 }}>
              <CircularProgress size={34} aria-label="Loading permissions" />
            </Box>
          ) : filteredGroups.length === 0 ? (
            <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
              No permissions match your search.
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {!canEditPermissions ? (
                <Box
                  sx={{
                    mb: 1,
                    p: 1.25,
                    borderRadius: 2,
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(255,255,255,0.04)",
                  }}
                >
                  <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.5 }}>
                    Select a user above to load their current permissions, then check/uncheck to allow/disallow.
                  </Typography>
                </Box>
              ) : null}
              <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1 }}>
                <Typography variant="mediumLarge" fontWeight={900} sx={{ color: theme.app.dashboard.white95 }}>
                  Permissions
                </Typography>
                <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                  {allCodes.length} total
                </Typography>
              </Box>
              <Divider sx={{ borderColor: "rgba(255,255,255,0.10)" }} />

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 1.5,
                }}
              >
                {([
                  { title: "OPERATIONAL", items: operationalPermissions },
                  { title: "PAGE", items: pagePermissions },
                ] as const).map((col) => (
                  <Box
                    key={col.title}
                    sx={{
                      border: "1px solid rgba(255,255,255,0.10)",
                      borderRadius: 2,
                      p: 1.5,
                      background: "rgba(255,255,255,0.035)",
                      minHeight: 260,
                      minWidth: 0,
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 1 }}>
                      <Typography variant="body2" sx={{ color: "white", fontWeight: 950, letterSpacing: 0.4 }} noWrap>
                        {col.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }} noWrap>
                        {col.items.length}
                      </Typography>
                    </Box>
                    <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mb: 1 }} />
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.75,
                        overflowY: "auto",
                        pr: 0.5,
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        "&::-webkit-scrollbar": { display: "none" },
                      }}
                    >
                      {col.items.map((p) => {
                        const checked = Boolean(allowedMap[p.code]);
                        return (
                          <Box
                            key={p.code}
                            sx={{
                              display: "grid",
                              gridTemplateColumns: "24px 1fr",
                              alignItems: "flex-start",
                              gap: 1,
                              px: 1,
                              py: 0.75,
                              borderRadius: 1.5,
                              backgroundColor: checked ? "rgba(34, 197, 94, 0.10)" : "rgba(255,255,255,0.03)",
                              border: checked ? "1px solid rgba(34, 197, 94, 0.22)" : "1px solid rgba(255,255,255,0.08)",
                              opacity: canEditPermissions ? 1 : 0.7,
                              transition: "background-color 140ms ease, border-color 140ms ease",
                              "&:hover": canEditPermissions
                                ? {
                                    backgroundColor: checked ? "rgba(34, 197, 94, 0.14)" : "rgba(255,255,255,0.05)",
                                    borderColor: checked ? "rgba(34, 197, 94, 0.30)" : "rgba(255,255,255,0.12)",
                                  }
                                : undefined,
                            }}
                          >
                            <Checkbox
                              checked={checked}
                              disabled={!canEditPermissions}
                              onChange={() => toggleAllowed(p.code)}
                              sx={{ p: 0 }}
                            />
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography
                                variant="body2"
                                sx={{ color: "white", fontWeight: 650, wordBreak: "break-word" }}
                              >
                                {p.label}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: theme.app.dashboard.textMuted, wordBreak: "break-all" }}
                              >
                                {p.code}
                              </Typography>
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </FormModal>
  );
}

