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

function pickUsers(payload: unknown): UserOption[] {
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

  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    if (rosterQuery.data?.userIds) {
      setSelected(rosterQuery.data.userIds);
    }
  }, [rosterQuery.data?.userIds]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setUsersLoading(true);
      try {
        const res = await listUsers({ limit: 300, page: 1 });
        if (!cancelled) setUserOptions(pickUsers(res));
      } catch {
        if (!cancelled) setUserOptions([]);
      } finally {
        if (!cancelled) setUsersLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    const merged = new Map<string, UserOption>();
    for (const u of userOptions) merged.set(u.id, u);
    for (const id of selected) {
      if (!merged.has(id)) merged.set(id, { id, label: id.slice(0, 8) });
    }
    const all = [...merged.values()];
    if (!q) return all.sort((a, b) => a.label.localeCompare(b.label));
    return all.filter((u) => u.label.toLowerCase().includes(q) || u.id.toLowerCase().includes(q));
  }, [search, selected, userOptions]);

  const toggle = (userId: string) => {
    setSelected((prev) =>
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
                  When QA is enabled and &quot;Auto-assign on close&quot; is on (General tab), the backend
                  picks a reviewer from this roster using{" "}
                  <Typography component="span" variant="caption" sx={{ fontFamily: "monospace" }}>
                    assignMode: least_pending
                  </Typography>
                  . Manual assign uses{" "}
                  <Typography component="span" variant="caption" sx={{ fontFamily: "monospace" }}>
                    POST /chat/qa/conversations/:id/assign
                  </Typography>
                  .
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
                  saveRoster.mutate(selected, {
                    onSuccess: () =>
                      publishAppToast({ message: "QA roster saved", variant: "success" }),
                    onError: (e) =>
                      publishAppToast({
                        message: extractApiErrorMessageForToast(e, "Could not save QA roster"),
                        variant: "error",
                      }),
                  })
                }
              >
                {saveRoster.isPending ? "Saving…" : `Save (${selected.length})`}
              </Button>
            ) : null
          }
          belowSlot={
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, pt: 1 }}>
              {selected.length} reviewer{selected.length === 1 ? "" : "s"} selected for website{" "}
              {websiteId.slice(0, 8)}…
            </Typography>
          }
        />
      </DashboardCard>

      <DashboardCard sx={{ p: 2, maxHeight: 420, overflow: "auto" }}>
        {usersLoading ? (
          <Typography sx={{ color: theme.app.dashboard.textMuted, fontSize: 13 }}>
            Loading users…
          </Typography>
        ) : filteredUsers.length === 0 ? (
          <Typography sx={{ color: theme.app.dashboard.textMuted, fontSize: 13 }}>
            No users match your search.
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
            {filteredUsers.map((u) => (
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
    </Box>
  );
}
