"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { SearchBar, Typography } from "@/components/common";
import type { ParentCompanyChildDetail } from "@/api/types/companies.types";
import {
  companyEditChildNavAvatarSx,
  companyEditChildNavHeaderSx,
  companyEditChildNavItemSx,
  companyEditChildNavListSx,
  companyEditChildNavRootSx,
  companyEditChildNavUnsavedDotSx,
} from "../company-edit.styles";

export type CompanyEditChildNavItem = {
  id: string;
  label: string;
  email: string;
  dirty: boolean;
};

export type CompanyEditChildNavProps = {
  childCompanies: ParentCompanyChildDetail[];
  activeChildId: string | null;
  onSelect: (childId: string) => void;
  getItem: (child: ParentCompanyChildDetail) => CompanyEditChildNavItem;
};

function childInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  return (parts[0]?.slice(0, 2) ?? "CO").toUpperCase();
}

export function CompanyEditChildNav({
  childCompanies,
  activeChildId,
  onSelect,
  getItem,
}: CompanyEditChildNavProps) {
  const theme = useTheme() as AppTheme;
  const [search, setSearch] = useState("");

  const items = useMemo(() => childCompanies.map((c) => getItem(c)), [childCompanies, getItem]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (row) =>
        row.label.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q),
    );
  }, [items, search]);

  const activeIndex = filtered.findIndex((row) => row.id === activeChildId);
  const showSearch = childCompanies.length >= 4;

  return (
    <Box sx={companyEditChildNavRootSx}>
      <Box sx={companyEditChildNavHeaderSx}>
        <Typography variant="body2" fontWeight={700} sx={{ color: theme.app.dashboard.white95 }}>
          Child companies
        </Typography>
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
          {childCompanies.length} total
          {search.trim() && filtered.length !== childCompanies.length
            ? ` · ${filtered.length} shown`
            : ""}
        </Typography>
      </Box>

      {showSearch ? (
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by name or email…"
          sx={{ mb: 1.25 }}
        />
      ) : null}

      <Box sx={companyEditChildNavListSx} role="tablist" aria-label="Child companies">
        {filtered.length === 0 ? (
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, px: 1, py: 2, textAlign: "center" }}>
            No match for &ldquo;{search.trim()}&rdquo;
          </Typography>
        ) : (
          filtered.map((row, index) => {
            const active = activeChildId === row.id;
            return (
              <Box
                key={row.id}
                component="button"
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onSelect(row.id)}
                sx={companyEditChildNavItemSx(active)}
              >
                <Box sx={companyEditChildNavAvatarSx}>{childInitials(row.label)}</Box>
                <Box sx={{ minWidth: 0, flex: 1, textAlign: "left" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{
                        color: theme.app.dashboard.white95,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        flex: 1,
                      }}
                    >
                      {row.label}
                    </Typography>
                    {row.dirty ? <Box sx={companyEditChildNavUnsavedDotSx} aria-label="Unsaved changes" /> : null}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.app.dashboard.textMuted,
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.email || "No email"}
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    flexShrink: 0,
                    color: alpha(theme.app.dashboard.textMuted, 0.85),
                    fontWeight: 600,
                    fontSize: "0.6875rem",
                  }}
                >
                  {index + 1}
                </Typography>
              </Box>
            );
          })
        )}
      </Box>

      {activeIndex >= 0 && filtered.length > 1 ? (
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, px: 0.5, pt: 1, display: "block" }}>
          Viewing {activeIndex + 1} of {filtered.length}
          {search.trim() ? " (filtered)" : ""}
        </Typography>
      ) : null}
    </Box>
  );
}
