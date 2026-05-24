"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import TimerOutlined from "@mui/icons-material/TimerOutlined";
import PersonOffOutlined from "@mui/icons-material/PersonOffOutlined";
import SupervisorAccountOutlined from "@mui/icons-material/SupervisorAccountOutlined";
import LinkOutlined from "@mui/icons-material/LinkOutlined";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  DEFAULT_CHAT_OPERATIONS,
  mergeChatOperationsJson,
} from "@/services/chat/chat-settings.defaults";
import type { ChatOperationsJson, WebsiteChatSettingsRow } from "@/services/chat/chat-settings.types";
import { PolicyMinutesField } from "./PolicyMinutesField";
import { ClosePolicyStatusChip } from "./ClosePolicyStatusChip";

function readBool(section: Record<string, unknown> | undefined, key: string): boolean {
  return Boolean(section?.[key]);
}

function readNum(section: Record<string, unknown> | undefined, key: string, fallback: number): number {
  const v = section?.[key];
  if (typeof v === "number" && Number.isFinite(v)) return v;
  return fallback;
}

function readStr(section: Record<string, unknown> | undefined, key: string, fallback: string): string {
  const v = section?.[key];
  if (typeof v === "string") return v;
  return fallback;
}

interface ClosePolicyTabProps {
  settings: WebsiteChatSettingsRow;
  canEdit: boolean;
  saving: boolean;
  onSave: (body: {
    defaultDepartmentId: string | null;
    operationsJson: ChatOperationsJson;
  }) => void;
  /** Hide footer save — parent modal supplies primary action via onSaveReady */
  hideSaveButton?: boolean;
  onSaveReady?: (save: () => void) => void;
}

export function ClosePolicyTab({
  settings,
  canEdit,
  saving,
  onSave,
  hideSaveButton = false,
  onSaveReady,
}: ClosePolicyTabProps) {
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

  const cp = (ops.closePolicy ?? DEFAULT_CHAT_OPERATIONS.closePolicy) as Record<string, unknown>;
  const vi = (cp.visitorIdle ?? {}) as Record<string, unknown>;
  const anr = (cp.agentNoResponse ?? {}) as Record<string, unknown>;
  const sc = (cp.supervisorClose ?? {}) as Record<string, unknown>;
  const oc = (cp.onClose ?? {}) as Record<string, unknown>;
  const cpDefaults = DEFAULT_CHAT_OPERATIONS.closePolicy ?? {};
  const viDefaults = cpDefaults.visitorIdle ?? {
    nudgeAfterMinutes: 8,
    nudgeMessage: "Are you still there? Reply to keep this chat open.",
    closeAfterMinutes: 10,
    closeMessage:
      "This chat was closed due to inactivity. You can start a new conversation anytime.",
  };
  const anrDefaults = cpDefaults.agentNoResponse ?? {
    firstAlertAgentAfterMinutes: 2,
    fallbackToVisitorAfterMinutes: 5,
    fallbackMessage: "Thanks for your patience. An agent will respond shortly.",
    closeAfterMinutes: 20,
    closeMessage:
      "We could not connect you with an agent right now. Please try again later.",
  };
  const scDefaults = cpDefaults.supervisorClose ?? {
    enabled: true,
    requireReason: true,
    reasonMinLength: 3,
  };

  const policyEnabled = readBool(cp, "enabled");

  const patchClosePolicy = (patch: Record<string, unknown>) => {
    setOps((prev) => ({
      ...prev,
      closePolicy: {
        ...(prev.closePolicy as Record<string, unknown> | undefined),
        ...patch,
      },
    }));
  };

  const patchVisitorIdle = (patch: Record<string, unknown>) => {
    patchClosePolicy({ visitorIdle: { ...vi, ...patch } });
  };

  const patchAgentNoResponse = (patch: Record<string, unknown>) => {
    patchClosePolicy({ agentNoResponse: { ...anr, ...patch } });
  };

  const patchSupervisorClose = (patch: Record<string, unknown>) => {
    patchClosePolicy({ supervisorClose: { ...sc, ...patch } });
  };

  const patchOnClose = (patch: Record<string, unknown>) => {
    patchClosePolicy({ onClose: { ...oc, ...patch } });
  };

  const handleSave = useCallback(() => {
    onSave({
      defaultDepartmentId: settings.defaultDepartmentId,
      operationsJson: ops,
    });
  }, [onSave, ops, settings.defaultDepartmentId]);

  useEffect(() => {
    if (!onSaveReady) return;
    onSaveReady(handleSave);
  }, [handleSave, onSaveReady]);

  const sectionDisabled = !canEdit || !policyEnabled;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          p: 2,
          borderRadius: 2,
          border: `1px solid ${alpha(theme.app.dashboard.accentBlue, 0.25)}`,
          bgcolor: alpha(theme.app.dashboard.accentBlue, 0.06),
        }}
      >
        <Box>
          <Typography fontWeight={700} sx={{ fontSize: 15, color: theme.app.text.primary }}>
            Close policy
          </Typography>
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mt: 0.35 }}>
            Server checks run every minute. Timers use website-local settings below.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <ClosePolicyStatusChip enabled={policyEnabled} />
          <FormControlLabel
            disabled={!canEdit}
            sx={{ m: 0 }}
            control={
              <Switch
                checked={policyEnabled}
                onChange={(_, v) => patchClosePolicy({ enabled: v })}
              />
            }
            label={
              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Enable for this website</Typography>
            }
          />
        </Box>
      </Box>

      <Section
        icon={<TimerOutlined fontSize="small" />}
        title="Visitor inactivity"
        description="When the agent (or AI) sent the last message and the visitor stops replying."
        disabled={sectionDisabled}
      >
        <FormControlLabel
          disabled={sectionDisabled}
          control={
            <Switch
              checked={readBool(vi, "enabled")}
              onChange={(_, v) => patchVisitorIdle({ enabled: v })}
            />
          }
          label="Auto-close inactive visitor chats"
        />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
            mt: 0.5,
          }}
        >
          <PolicyMinutesField
            label="Nudge after"
            value={readNum(vi, "nudgeAfterMinutes", viDefaults.nudgeAfterMinutes ?? 8)}
            disabled={sectionDisabled || !readBool(vi, "enabled")}
            onChange={(n) => patchVisitorIdle({ nudgeAfterMinutes: n })}
            helperText="Reminder before auto-close"
          />
          <PolicyMinutesField
            label="Close after"
            value={readNum(vi, "closeAfterMinutes", viDefaults.closeAfterMinutes ?? 10)}
            disabled={sectionDisabled || !readBool(vi, "enabled")}
            onChange={(n) => patchVisitorIdle({ closeAfterMinutes: n })}
            helperText="From last visitor message"
          />
          <Box sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }}>
            <InputField
              label="Nudge message"
              multiline
              minRows={2}
              disabled={sectionDisabled || !readBool(vi, "enabled")}
              value={readStr(vi, "nudgeMessage", viDefaults.nudgeMessage ?? "")}
              onChange={(e) => patchVisitorIdle({ nudgeMessage: e.target.value })}
              inputProps={{ maxLength: 500 }}
            />
          </Box>
          <Box sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }}>
            <InputField
              label="Close message"
              multiline
              minRows={2}
              disabled={sectionDisabled || !readBool(vi, "enabled")}
              value={readStr(vi, "closeMessage", viDefaults.closeMessage ?? "")}
              onChange={(e) => patchVisitorIdle({ closeMessage: e.target.value })}
              inputProps={{ maxLength: 500 }}
            />
          </Box>
        </Box>
      </Section>

      <Section
        icon={<PersonOffOutlined fontSize="small" />}
        title="Agent no response"
        description="When the visitor sent the last message and no agent has replied yet."
        disabled={sectionDisabled}
      >
        <FormControlLabel
          disabled={sectionDisabled}
          control={
            <Switch
              checked={readBool(anr, "enabled")}
              onChange={(_, v) => patchAgentNoResponse({ enabled: v })}
            />
          }
          label="Alert agents and send visitor fallback"
        />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
            gap: 2,
            mt: 0.5,
          }}
        >
          <PolicyMinutesField
            label="Alert agent after"
            value={readNum(
              anr,
              "firstAlertAgentAfterMinutes",
              anrDefaults.firstAlertAgentAfterMinutes ?? 2,
            )}
            disabled={sectionDisabled || !readBool(anr, "enabled")}
            onChange={(n) => patchAgentNoResponse({ firstAlertAgentAfterMinutes: n })}
          />
          <PolicyMinutesField
            label="Fallback to visitor"
            value={readNum(
              anr,
              "fallbackToVisitorAfterMinutes",
              anrDefaults.fallbackToVisitorAfterMinutes ?? 5,
            )}
            disabled={sectionDisabled || !readBool(anr, "enabled")}
            onChange={(n) => patchAgentNoResponse({ fallbackToVisitorAfterMinutes: n })}
          />
          <PolicyMinutesField
            label="Close after"
            value={readNum(anr, "closeAfterMinutes", anrDefaults.closeAfterMinutes ?? 20)}
            disabled={sectionDisabled || !readBool(anr, "enabled")}
            onChange={(n) => patchAgentNoResponse({ closeAfterMinutes: n })}
          />
          <Box sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }}>
            <InputField
              label="Fallback message"
              multiline
              minRows={2}
              disabled={sectionDisabled || !readBool(anr, "enabled")}
              value={readStr(anr, "fallbackMessage", anrDefaults.fallbackMessage ?? "")}
              onChange={(e) => patchAgentNoResponse({ fallbackMessage: e.target.value })}
              inputProps={{ maxLength: 500 }}
            />
          </Box>
          <Box sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }}>
            <InputField
              label="Close message"
              multiline
              minRows={2}
              disabled={sectionDisabled || !readBool(anr, "enabled")}
              value={readStr(anr, "closeMessage", anrDefaults.closeMessage ?? "")}
              onChange={(e) => patchAgentNoResponse({ closeMessage: e.target.value })}
              inputProps={{ maxLength: 500 }}
            />
          </Box>
        </Box>
      </Section>

      <Section
        icon={<SupervisorAccountOutlined fontSize="small" />}
        title="Supervisor close (monitor)"
        description="Pool heads and department heads can close chats from Chat monitor when enabled."
        disabled={sectionDisabled}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <FormControlLabel
            disabled={sectionDisabled}
            control={
              <Switch
                checked={readBool(sc, "enabled")}
                onChange={(_, v) => patchSupervisorClose({ enabled: v })}
              />
            }
            label="Allow supervisor close from monitor"
          />
          <FormControlLabel
            disabled={sectionDisabled || !readBool(sc, "enabled")}
            control={
              <Switch
                checked={readBool(sc, "requireReason")}
                onChange={(_, v) => patchSupervisorClose({ requireReason: v })}
              />
            }
            label="Require close reason"
          />
        </Box>
        <Box sx={{ maxWidth: 220, mt: 1.5 }}>
          <InputField
            label="Minimum reason length (characters)"
            type="number"
            disabled={sectionDisabled || !readBool(sc, "enabled")}
            value={String(readNum(sc, "reasonMinLength", Number(scDefaults.reasonMinLength) || 3))}
            onChange={(e) =>
              patchSupervisorClose({
                reasonMinLength: Math.max(1, Math.min(200, Number(e.target.value) || 3)),
              })
            }
            inputProps={{ min: 1, max: 200, step: 1 }}
            dense
          />
        </Box>
      </Section>

      <Section
        icon={<LinkOutlined fontSize="small" />}
        title="After close"
        disabled={sectionDisabled}
      >
        <FormControlLabel
          disabled={sectionDisabled}
          control={
            <Switch
              checked={readBool(oc, "insertDistributionLinkInTranscript")}
              onChange={(_, v) => patchOnClose({ insertDistributionLinkInTranscript: v })}
            />
          }
          label="Insert distribution form link in chat transcript when configured"
        />
      </Section>

      {canEdit && !hideSaveButton ? (
        <Button
          type="button"
          variant="primary"
          sx={{ ...gradientPrimaryButtonSx, alignSelf: "flex-start", minWidth: 200 }}
          disabled={saving}
          onClick={handleSave}
        >
          {saving ? "Saving…" : "Save close policy"}
        </Button>
      ) : null}
    </Box>
  );
}

function Section({
  title,
  description,
  icon,
  disabled,
  children,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
  children: ReactNode;
}) {
  const theme = useTheme() as AppTheme;
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: `1px solid ${theme.app.dashboard.cardBorder}`,
        bgcolor: alpha(theme.app.dashboard.overlayLight, 0.2),
        opacity: disabled ? 0.72 : 1,
        transition: "opacity 0.15s ease",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, mb: 1.5 }}>
        {icon ? (
          <Box
            sx={{
              mt: 0.25,
              width: 32,
              height: 32,
              borderRadius: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme.app.dashboard.accentBlue,
              bgcolor: alpha(theme.app.dashboard.accentBlue, 0.12),
            }}
          >
            {icon}
          </Box>
        ) : null}
        <Box sx={{ minWidth: 0 }}>
          <Typography fontWeight={700} sx={{ fontSize: 14, color: theme.app.text.primary }}>
            {title}
          </Typography>
          {description ? (
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mt: 0.35 }}>
              {description}
            </Typography>
          ) : null}
        </Box>
      </Box>
      {children}
    </Box>
  );
}
