"use client";

import { useEffect, useMemo, useState } from "react";
import FactCheckOutlined from "@mui/icons-material/FactCheckOutlined";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { listUsers } from "@/api/users/users.api";
import { unwrapApiData } from "@/lib/utils/core";
import {
  Button,
  DashboardCard,
  DashboardFilterSection,
  SearchBar,
  Typography,
} from "@/components/common";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions/operational-keys";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { useQaRosterQuery, useSaveQaRosterMutation } from "../hooks/useChatSettings";

type UserOption = { id: string; label: string };

function pickUsers(payload: unknown, scope: "internal" | "external"): UserOption[] {
  const data = unwrapApiData(payload);
  const items = Array.isArray(data)
    ? data
    : data && typeof data === "object" && Array.isArray((data as { items?: unknown }).items)
      ? (data as { items: unknown[] }).items
      : [];
  return items
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const o = row as Record<string, unknown>;
      const id = String(o.id ?? "").trim();
      if (!id) return null;
      const userType = String(o.userType ?? o.user_type ?? "")
        .trim()
        .toLowerCase();
      if (scope === "internal" && userType && userType !== "internal") return null;
      if (scope === "external" && userType !== "external") return null;
      const name = String(o.displayName ?? o.name ?? "").trim();
      const email = String(o.email ?? "").trim();
      return { id, label: name ? `${name}${email ? ` · ${email}` : ""}` : email || id.slice(0, 8) };
    })
    .filter((u): u is UserOption => u !== null);
}

export function QaRosterTab({ websiteId }: { websiteId: string }) {
  const theme = useTheme() as AppTheme;
  const { hasOperational } = useAuth();
  const canEdit = hasOperational(OP.qa.chatAssign) || hasOperational(OP.chatWidget.update);

  const rosterQuery = useQaRosterQuery(websiteId);
  const saveRoster = useSaveQaRosterMutation(websiteId);

  const [internalSelected, setInternalSelected] = useState<string[]>([]);
  const [externalSelected, setExternalSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [internalOptions, setInternalOptions] = useState<UserOption[]>([]);
  const [externalOptions, setExternalOptions] = useState<UserOption[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    if (rosterQuery.data) {
      setInternalSelected(rosterQuery.data.internal.map((r) => r.userId));
      setExternalSelected(rosterQuery.data.external.map((r) => r.userId));
    }
  }, [rosterQuery.data]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setUsersLoading(true);
      try {
        const res = await listUsers({ all: true });
        if (!cancelled) {
          setInternalOptions(pickUsers(res, "internal"));
          setExternalOptions(pickUsers(res, "external"));
        }
      } catch {
        if (!cancelled) {
          setInternalOptions([]);
          setExternalOptions([]);
        }
      } finally {
        if (!cancelled) setUsersLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filterList = (options: UserOption[], selected: string[]) => {
    const q = search.trim().toLowerCase();
    const merged = new Map<string, UserOption>();
    for (const u of options) merged.set(u.id, u);
    for (const id of selected) {
      if (!merged.has(id)) merged.set(id, { id, label: id.slice(0, 8) });
    }
    const all = [...merged.values()];
    if (!q) return all.sort((a, b) => a.label.localeCompare(b.label));
    return all.filter((u) => u.label.toLowerCase().includes(q) || u.id.toLowerCase().includes(q));
  };

  const internalFiltered = useMemo(
    () => filterList(internalOptions, internalSelected),
    [search, internalOptions, internalSelected],
  );
  const externalFiltered = useMemo(
    () => filterList(externalOptions, externalSelected),
    [search, externalOptions, externalSelected],
  );

  const toggleInternal = (userId: string) => {
    setInternalSelected((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };
  const toggleExternal = (userId: string) => {
    setExternalSelected((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  if (rosterQuery.isLoading) {
    return (
      <Typography sx={{ color: theme.app.dashboard.textMuted, py: 2 }}>
        Loading QA roster…
      </Typography>
    );
  }

  if (rosterQuery.isError) {
    return (
      <Typography color="error" sx={{ py: 2 }}>
        Could not load QA roster for this website.
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <DashboardCard sx={{ p: 2 }}>
        <DashboardFilterSection
          titleSlot={
            <Box sx={{ display: "flex", gap: 1.25, alignItems: "flex-start" }}>
              <FactCheckOutlined sx={{ color: theme.app.dashboard.accentViolet, mt: 0.25 }} />
              <Box>
                <Typography fontWeight={700} sx={{ fontSize: 16 }}>
                  QA roster (this website)
                </Typography>
                <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.5 }}>
                  Internal-channel chats auto-assign to <strong>Internal QA</strong>. External-channel
                  chats assign to <strong>External QA</strong>. Match roster to agent channel.
                </Typography>
              </Box>
            </Box>
          }
          primarySlot={
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search QA users…"
              sx={{ width: "100%" }}
            />
          }
          actionSlot={
            canEdit ? (
              <Button
                type="button"
                variant="primary"
                disabled={saveRoster.isPending}
                onClick={() =>
                  saveRoster.mutate(
                    {
                      internalUserIds: internalSelected,
                      externalUserIds: externalSelected,
                    },
                    {
                      onSuccess: () =>
                        publishAppToast({ message: "QA roster saved", variant: "success" }),
                      onError: (e) =>
                        publishAppToast({
                          message: extractApiErrorMessageForToast(e, "Could not save QA roster"),
                          variant: "error",
                        }),
                    },
                  )
                }
              >
                {saveRoster.isPending
                  ? "Saving…"
                  : `Save (${internalSelected.length + externalSelected.length})`}
              </Button>
            ) : null
          }
          belowSlot={
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, pt: 1 }}>
              Internal {internalSelected.length} · External {externalSelected.length} · website{" "}
              {websiteId.slice(0, 8)}…
            </Typography>
          }
        />
      </DashboardCard>

      {(["internal", "external"] as const).map((scope) => {
        const filtered = scope === "internal" ? internalFiltered : externalFiltered;
        const selected = scope === "internal" ? internalSelected : externalSelected;
        const toggle = scope === "internal" ? toggleInternal : toggleExternal;
        return (
          <DashboardCard key={scope} sx={{ p: 2, maxHeight: 280, overflow: "auto" }}>
            <Typography fontWeight={700} sx={{ fontSize: 14, mb: 1, textTransform: "capitalize" }}>
              {scope} QA reviewers
            </Typography>
            {usersLoading ? (
              <Typography sx={{ color: theme.app.dashboard.textMuted, fontSize: 13 }}>
                Loading users…
              </Typography>
            ) : filtered.length === 0 ? (
              <Typography sx={{ color: theme.app.dashboard.textMuted, fontSize: 13 }}>
                No {scope} users match your search.
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
                {filtered.map((u) => (
                  <FormControlLabel
                    key={u.id}
                    sx={{ alignItems: "flex-start", mx: 0 }}
                    control={
                      <Checkbox
                        size="small"
                        checked={selected.includes(u.id)}
                        onChange={() => toggle(u.id)}
                        disabled={!canEdit || saveRoster.isPending}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: 13, pt: 0.35 }}>{u.label}</Typography>
                    }
                  />
                ))}
              </Box>
            )}
          </DashboardCard>
        );
      })}
    </Box>
  );
}
