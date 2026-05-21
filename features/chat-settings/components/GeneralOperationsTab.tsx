"use client";

import { useEffect, useState, type ReactNode } from "react";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  DEFAULT_CHAT_OPERATIONS,
  mergeChatOperationsJson,
} from "@/services/chat/chat-settings.defaults";
import type { ChatOperationsJson, WebsiteChatSettingsRow } from "@/services/chat/chat-settings.types";
import type { CatalogOption } from "../utils/catalog";

function readBool(section: Record<string, unknown> | undefined, key: string): boolean {
  return Boolean(section?.[key]);
}

function readNum(section: Record<string, unknown> | undefined, key: string, fallback: number): number {
  const v = section?.[key];
  if (typeof v === "number" && Number.isFinite(v)) return v;
  return fallback;
}

interface GeneralOperationsTabProps {
  settings: WebsiteChatSettingsRow;
  departments: CatalogOption[];
  canEdit: boolean;
  saving: boolean;
  onSave: (body: {
    defaultDepartmentId: string | null;
    operationsJson: ChatOperationsJson;
  }) => void;
}

export function GeneralOperationsTab({
  settings,
  departments,
  canEdit,
  saving,
  onSave,
}: GeneralOperationsTabProps) {
  const theme = useTheme() as AppTheme;
  const [defaultDepartmentId, setDefaultDepartmentId] = useState(
    settings.defaultDepartmentId ?? "",
  );
  const [ops, setOps] = useState<ChatOperationsJson>(() =>
    mergeChatOperationsJson(
      DEFAULT_CHAT_OPERATIONS,
      settings.operationsJson ?? DEFAULT_CHAT_OPERATIONS,
    ),
  );

  useEffect(() => {
    setDefaultDepartmentId(settings.defaultDepartmentId ?? "");
    setOps(
      mergeChatOperationsJson(
        DEFAULT_CHAT_OPERATIONS,
        settings.operationsJson ?? DEFAULT_CHAT_OPERATIONS,
      ),
    );
  }, [settings]);

  const patchSection = (key: keyof ChatOperationsJson, patch: Record<string, unknown>) => {
    setOps((prev) => ({
      ...prev,
      [key]: { ...(prev[key] as Record<string, unknown> | undefined), ...patch },
    }));
  };

  const session = (ops.sessionResume ?? {}) as Record<string, unknown>;
  const csat = (ops.csat ?? {}) as Record<string, unknown>;
  const canned = (ops.cannedResponses ?? {}) as Record<string, unknown>;
  const guest = (ops.guestAccess ?? {}) as Record<string, unknown>;
  const takeover = (ops.takeover ?? {}) as Record<string, unknown>;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 720 }}>
      <Box>
        <Typography fontWeight={600} sx={{ mb: 1.5, color: theme.app.text.primary }}>
          Default department
        </Typography>
        <FormControl fullWidth size="small" disabled={!canEdit}>
          <InputLabel id="default-dept-label">Fallback department</InputLabel>
          <Select
            labelId="default-dept-label"
            label="Fallback department"
            value={defaultDepartmentId}
            onChange={(e) => setDefaultDepartmentId(e.target.value)}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {departments.map((d) => (
              <MenuItem key={d.id} value={d.id}>
                {d.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Section title="Session resume">
        <FormControlLabel
          disabled={!canEdit}
          control={
            <Switch
              checked={readBool(session, "enabled")}
              onChange={(_, v) => patchSection("sessionResume", { enabled: v })}
            />
          }
          label="Reopen closed chats when visitor returns"
        />
        <InputField
          label="Within minutes"
          type="number"
          disabled={!canEdit}
          value={String(readNum(session, "reopenClosedWithinMinutes", 1440))}
          onChange={(e) =>
            patchSection("sessionResume", {
              reopenClosedWithinMinutes: Number(e.target.value) || 1440,
            })
          }
          sx={{ mt: 1, maxWidth: 200 }}
        />
      </Section>

      <Section title="CSAT">
        <FormControlLabel
          disabled={!canEdit}
          control={
            <Switch
              checked={readBool(csat, "enabled")}
              onChange={(_, v) => patchSection("csat", { enabled: v })}
            />
          }
          label="Collect CSAT on wrap-up"
        />
        <FormControlLabel
          disabled={!canEdit}
          control={
            <Switch
              checked={readBool(csat, "required")}
              onChange={(_, v) => patchSection("csat", { required: v })}
            />
          }
          label="Required when enabled"
        />
      </Section>

      <Section title="Canned responses">
        <FormControlLabel
          disabled={!canEdit}
          control={
            <Switch
              checked={readBool(canned, "enabled")}
              onChange={(_, v) => patchSection("cannedResponses", { enabled: v })}
            />
          }
          label="Quick replies in agent inbox"
        />
      </Section>

      <Section title="Guest access">
        <FormControlLabel
          disabled={!canEdit}
          control={
            <Switch
              checked={readBool(guest, "enabled")}
              onChange={(_, v) => patchSection("guestAccess", { enabled: v })}
            />
          }
          label="Department guest links"
        />
      </Section>

      <Section title="Supervisor takeover">
        <FormControlLabel
          disabled={!canEdit}
          control={
            <Switch
              checked={readBool(takeover, "enabled")}
              onChange={(_, v) => patchSection("takeover", { enabled: v })}
            />
          }
          label="Allow takeover requests"
        />
      </Section>

      {canEdit ? (
        <Button
          type="button"
          variant="primary"
          sx={gradientPrimaryButtonSx}
          disabled={saving}
          onClick={() =>
            onSave({
              defaultDepartmentId: defaultDepartmentId.trim() || null,
              operationsJson: ops,
            })
          }
        >
          {saving ? "Saving…" : "Save general settings"}
        </Button>
      ) : null}
    </Box>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const theme = useTheme() as AppTheme;
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: `1px solid ${theme.app.dashboard.cardBorder}`,
        bgcolor: "rgba(255,255,255,0.02)",
      }}
    >
      <Typography fontWeight={600} sx={{ mb: 1.5, fontSize: 14, color: theme.app.text.primary }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}
