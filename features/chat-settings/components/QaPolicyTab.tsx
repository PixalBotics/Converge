"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Switch from "@mui/material/Switch";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  DEFAULT_CHAT_OPERATIONS,
  mergeChatOperationsJson,
} from "@/services/chat/chat-settings.defaults";
import type { ChatOperationsJson, WebsiteChatSettingsRow } from "@/services/chat/chat-settings.types";

function readBool(section: Record<string, unknown> | undefined, key: string): boolean {
  return Boolean(section?.[key]);
}

interface QaPolicyTabProps {
  settings: WebsiteChatSettingsRow;
  canEdit: boolean;
  saving: boolean;
  onSave: (body: {
    defaultDepartmentId: string | null;
    operationsJson: ChatOperationsJson;
  }) => void;
}

export function QaPolicyTab({ settings, canEdit, saving, onSave }: QaPolicyTabProps) {
  const theme = useTheme() as AppTheme;
  const [ops, setOps] = useState<ChatOperationsJson>(() =>
    mergeChatOperationsJson(
      DEFAULT_CHAT_OPERATIONS,
      settings.operationsJson ?? DEFAULT_CHAT_OPERATIONS,
    ),
  );

  useEffect(() => {
    setOps(
      mergeChatOperationsJson(
        DEFAULT_CHAT_OPERATIONS,
        settings.operationsJson ?? DEFAULT_CHAT_OPERATIONS,
      ),
    );
  }, [settings]);

  const qa = (ops.qa ?? {}) as Record<string, unknown>;

  const patchQa = (patch: Record<string, unknown>) => {
    setOps((prev) => ({
      ...prev,
      qa: { ...(prev.qa as Record<string, unknown>), ...patch },
    }));
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 640 }}>
      <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
        These toggles control auto-assign rules only. Assign QA reviewers on the{" "}
        <strong>QA Team</strong> tab (roster API).
      </Typography>
      <FormControlLabel
        disabled={!canEdit}
        control={
          <Switch
            checked={readBool(qa, "enabled")}
            onChange={(_, v) => patchQa({ enabled: v })}
          />
        }
        label="Enable QA reviews"
      />
      <FormControlLabel
        disabled={!canEdit || !readBool(qa, "enabled")}
        control={
          <Switch
            checked={readBool(qa, "autoAssignOnClose")}
            onChange={(_, v) => patchQa({ autoAssignOnClose: v })}
          />
        }
        label="Auto-assign review when chat closes"
      />
      <FormControlLabel
        disabled={!canEdit || !readBool(qa, "enabled")}
        control={
          <Switch
            checked={readBool(qa, "autoAssignOnTakeover")}
            onChange={(_, v) => patchQa({ autoAssignOnTakeover: v })}
          />
        }
        label="Auto-assign on approved takeover"
      />
      <FormControl fullWidth size="small" disabled={!canEdit || !readBool(qa, "enabled")} sx={{ maxWidth: 320 }}>
        <InputLabel>Assign mode</InputLabel>
        <Select
          label="Assign mode"
          value={String(qa.assignMode ?? "least_pending")}
          onChange={(e) => patchQa({ assignMode: e.target.value })}
        >
          <MenuItem value="least_pending">Least pending</MenuItem>
        </Select>
      </FormControl>
      <FormControlLabel
        disabled={!canEdit || !readBool(qa, "enabled")}
        control={
          <Switch
            checked={readBool(qa, "externalCanSeeWhispers")}
            onChange={(_, v) => patchQa({ externalCanSeeWhispers: v })}
          />
        }
        label="External QA can see supervisor whispers"
      />
      {canEdit ? (
        <Button
          type="button"
          variant="primary"
          sx={gradientPrimaryButtonSx}
          disabled={saving}
          onClick={() =>
            onSave({
              defaultDepartmentId: settings.defaultDepartmentId,
              operationsJson: ops,
            })
          }
        >
          {saving ? "Saving…" : "Save QA policy"}
        </Button>
      ) : null}
    </Box>
  );
}
