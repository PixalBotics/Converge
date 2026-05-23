"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Switch from "@mui/material/Switch";
import { alpha, useTheme } from "@mui/material/styles";
import LockOutlined from "@mui/icons-material/LockOutlined";
import type { AppTheme } from "@/theme/theme";
import { Button, SearchBar, Typography } from "@/components/common";
import type { EmailFormFieldRow } from "@/api/email/email-forms.api";
import { groupEmailFormFields } from "../utils/email-form-field-groups";
import {
  emailFormFieldTableHeadSx,
  emailFormFieldTableRowSx,
  emailFormFieldTableSx,
} from "../styles/email-form-builder.styles";

function groupLabelForField(fieldKey: string, groups: ReturnType<typeof groupEmailFormFields>): string {
  for (const { group, fields } of groups) {
    if (fields.some((f) => f.fieldKey === fieldKey)) return group.label;
  }
  return "Other";
}

export function EmailFormFieldsPanel({
  fields,
  formType,
  onToggle,
  onSetAllOptional,
}: {
  fields: EmailFormFieldRow[];
  formType: "standard" | "custom";
  onToggle: (key: string, enabled: boolean) => void;
  onSetAllOptional?: (enabled: boolean) => void;
}) {
  const theme = useTheme() as AppTheme;
  const [search, setSearch] = useState("");
  const groups = groupEmailFormFields(fields);
  const enabledCount = fields.filter((f) => formType === "standard" || f.isRequired || f.enabled).length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return fields;
    return fields.filter(
      (f) =>
        f.label.toLowerCase().includes(q) ||
        f.fieldKey.toLowerCase().includes(q) ||
        groupLabelForField(f.fieldKey, groups).toLowerCase().includes(q),
    );
  }, [fields, search, groups]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 1.5 }}>
        <Box>
          <Typography variant="medium" fontWeight={700} color="white">
            Field catalog
          </Typography>
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
            {formType === "custom"
              ? "Toggle optional fields for this website."
              : "Standard mode ships every catalog field."}
          </Typography>
        </Box>
        <Chip
          size="small"
          label={`${enabledCount} / ${fields.length} active`}
          sx={{
            fontWeight: 700,
            bgcolor: alpha(theme.palette.success.main, 0.14),
            color: theme.palette.success.light,
          }}
        />
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.25, alignItems: "center" }}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search fields…"
          sx={{ flex: 1, minWidth: 200, maxWidth: 320 }}
        />
        {formType === "custom" && onSetAllOptional ? (
          <>
            <Button type="button" variant="secondary" onClick={() => onSetAllOptional(true)}>
              Enable all
            </Button>
            <Button type="button" variant="secondary" onClick={() => onSetAllOptional(false)}>
              Disable optional
            </Button>
          </>
        ) : null}
      </Box>

      <Box sx={emailFormFieldTableSx}>
        <Box sx={emailFormFieldTableHeadSx}>
          <Typography variant="caption" fontWeight={700} sx={{ color: theme.app.dashboard.textMuted }}>
            Field
          </Typography>
          <Typography variant="caption" fontWeight={700} sx={{ color: theme.app.dashboard.textMuted }}>
            Section
          </Typography>
          <Typography
            variant="caption"
            fontWeight={700}
            sx={{ color: theme.app.dashboard.textMuted, textAlign: "right" }}
          >
            Include
          </Typography>
        </Box>

        {filtered.length === 0 ? (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted }}>
              No fields match your search.
            </Typography>
          </Box>
        ) : (
          filtered.map((field) => {
            const isOn = formType === "standard" || field.isRequired || field.enabled;
            return (
              <Box key={field.fieldKey} sx={emailFormFieldTableRowSx(isOn)}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="small" fontWeight={600} color="white" sx={{ display: "block" }}>
                    {field.label}
                  </Typography>
                  {field.isRequired ? (
                    <Typography variant="caption" sx={{ color: theme.palette.primary.light }}>
                      Required
                    </Typography>
                  ) : (
                    <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                      Optional
                    </Typography>
                  )}
                </Box>
                <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                  {groupLabelForField(field.fieldKey, groups)}
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                  {formType === "custom" && !field.isRequired ? (
                    <Switch
                      size="small"
                      checked={field.enabled}
                      onChange={(e) => onToggle(field.fieldKey, e.target.checked)}
                      inputProps={{ "aria-label": `Include ${field.label}` }}
                    />
                  ) : (
                    <LockOutlined
                      sx={{
                        fontSize: 18,
                        color: isOn ? theme.palette.success.light : theme.app.dashboard.textMuted,
                      }}
                      aria-label="Always included"
                    />
                  )}
                </Box>
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
}
