"use client";

import { useMemo, useState } from "react";
import NextLink from "next/link";
import Box from "@mui/material/Box";
import LanguageOutlined from "@mui/icons-material/LanguageOutlined";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import type { ParentCompanyChildDetail, ParentCompanyChildWebsiteSnippet } from "@/api/types/companies.types";
import { Button, InputField, Typography } from "@/components/common";
import { normalizeHttpsWebsiteUrl } from "@/lib/companies/setup-draft.utils";
import { sitesListHref } from "@/app/dashboard/website-assigning/group-websites-by-org";

export type ChildCompanyWebsitesPanelProps = {
  child: ParentCompanyChildDetail;
  parentCompanyId: string;
  websites: WebsiteListItem[];
  onWebsitesChange: (next: WebsiteListItem[]) => void;
  disabled?: boolean;
};

type WebsiteListItem = { id?: string; url: string; name: string };

export type { WebsiteListItem };

function displayNameFromUrl(url: string): string {
  try {
    const h = new URL(url).hostname.replace(/^www\./i, "");
    return h || url;
  } catch {
    return url;
  }
}

function snippetToItem(w: ParentCompanyChildWebsiteSnippet): WebsiteListItem | null {
  const id = String(w.id ?? w.websiteId ?? "").trim();
  const url = String(w.url ?? "").trim();
  const name = String(w.name ?? "").trim();
  if (!id && !url) return null;
  return {
    id: id || undefined,
    url,
    name: name || (url ? displayNameFromUrl(url) : ""),
  };
}

function collectWebsitesFromChild(child: ParentCompanyChildDetail): WebsiteListItem[] {
  const out: WebsiteListItem[] = [];
  const seenId = new Set<string>();
  const seenUrl = new Set<string>();

  const push = (w: ParentCompanyChildWebsiteSnippet | null | undefined) => {
    const item = w ? snippetToItem(w) : null;
    if (!item) return;
    if (item.id) {
      if (seenId.has(item.id)) return;
      seenId.add(item.id);
    } else if (item.url) {
      if (seenUrl.has(item.url)) return;
      seenUrl.add(item.url);
    } else return;
    out.push(item);
  };

  push(child.website ?? undefined);
  if (Array.isArray(child.websites)) {
    for (const w of child.websites) push(w);
  }
  return out;
}

export function ChildCompanyWebsitesPanel({
  child,
  parentCompanyId,
  websites,
  onWebsitesChange,
  disabled,
}: ChildCompanyWebsitesPanelProps) {
  const theme = useTheme() as AppTheme;
  const apiWebsites = useMemo(() => collectWebsitesFromChild(child), [child]);

  const [addName, setAddName] = useState("");
  const [addUrl, setAddUrl] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);

  const panelSurface = {
    mt: 2,
    p: { xs: 2, sm: 2.25 },
    borderRadius: "14px",
    border: `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.55)}`,
    background: `linear-gradient(145deg, ${alpha(theme.app.dashboard.white95, 0.06)} 0%, ${alpha("#000", 0.12)} 100%)`,
    boxShadow: `0 12px 40px ${alpha("#000", 0.18)}, inset 0 1px 0 ${alpha(theme.app.dashboard.white95, 0.06)}`,
  } as const;

  const setAt = (idx: number, patch: Partial<WebsiteListItem>) => {
    const next = websites.slice();
    const cur = next[idx];
    if (!cur) return;
    next[idx] = { ...cur, ...patch };
    onWebsitesChange(next);
  };

  const removeAt = (idx: number) => {
    const next = websites.slice();
    next.splice(idx, 1);
    onWebsitesChange(next);
  };

  const addRow = () => {
    const url = normalizeHttpsWebsiteUrl(addUrl);
    if (!url) {
      setFieldError("Enter a valid website URL.");
      return;
    }
    setFieldError(null);
    const name = addName.trim() || displayNameFromUrl(url);
    onWebsitesChange([...websites, { url, name }]);
    setAddName("");
    setAddUrl("");
  };

  return (
    <Box sx={panelSurface}>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 1.5, mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, minWidth: 0 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(theme.palette.primary.main, 0.15),
              color: theme.palette.primary.light,
              flexShrink: 0,
            }}
          >
            <LanguageOutlined sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: "0.6875rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: theme.app.dashboard.textMuted,
                mb: 0.35,
              }}
            >
              Websites
            </Typography>
            <Typography variant="body2" sx={{ color: theme.app.text.primary, fontWeight: 600, lineHeight: 1.45 }}>
              Saved together with child company via one PATCH call (
              <Box component="code" sx={{ fontSize: "0.75rem" }}>websites: []</Box> full replace).
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          <Button type="button" variant="outlined" size="small" component={NextLink} href={sitesListHref(parentCompanyId.trim(), child.id)}>
            Assignment list
          </Button>
          <Button type="button" variant="secondary" size="small" component={NextLink} href="/dashboard/website-assigning">
            Assign agents
          </Button>
        </Box>
      </Box>

      {apiWebsites.length > 0 && websites.length === 0 ? (
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1.5, lineHeight: 1.5 }}>
          This company already has {apiWebsites.length} website(s) saved. To update them, edit below and then click Save for the child company.
        </Typography>
      ) : null}

      {websites.length > 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, mb: 2 }}>
          {websites.map((row, idx) => (
            <Box
              key={row.id ?? `${idx}:${row.url}`}
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1.5,
                p: 1.5,
                borderRadius: "10px",
                border: `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.45)}`,
                bgcolor: alpha(theme.app.dashboard.white95, 0.04),
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, flex: 1, minWidth: 260 }}>
                <InputField
                  label="Name"
                  value={row.name}
                  onChange={(e) => setAt(idx, { name: e.target.value })}
                  disabled={disabled}
                  inputProps={{ maxLength: 200 }}
                />
                <InputField
                  label="URL"
                  value={row.url}
                  onChange={(e) => setAt(idx, { url: e.target.value })}
                  disabled={disabled}
                  inputProps={{ maxLength: 500 }}
                />
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, alignItems: "flex-end" }}>
                {row.id ? (
                  <Button
                    type="button"
                    variant="outlined"
                    size="small"
                    component={NextLink}
                    href={`/dashboard/website-assigning/website/${encodeURIComponent(row.id)}`}
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    Assignment detail
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="outlined"
                  color="error"
                  size="small"
                  disabled={disabled}
                  onClick={() => removeAt(idx)}
                  sx={{ whiteSpace: "nowrap" }}
                >
                  Remove
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 2 }}>
          No websites on this child yet.
        </Typography>
      )}

      <Typography sx={{ fontWeight: 700, color: theme.app.text.primary, fontSize: "0.875rem", mb: 1 }}>Add website</Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, maxWidth: 520 }}>
        <InputField label="Display name" value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="e.g. Lahore branch" inputProps={{ maxLength: 200 }} />
        <InputField
          label="Website URL"
          value={addUrl}
          onChange={(e) => setAddUrl(e.target.value)}
          placeholder="https://example.com"
          inputProps={{ maxLength: 500 }}
        />
        {fieldError ? (
          <Typography variant="caption" sx={{ color: theme.palette.error.light }}>
            {fieldError}
          </Typography>
        ) : null}
        <Button type="button" variant="primary" size="small" sx={{ alignSelf: "flex-start" }} disabled={disabled} onClick={addRow}>
          Add row
        </Button>
      </Box>
    </Box>
  );
}
