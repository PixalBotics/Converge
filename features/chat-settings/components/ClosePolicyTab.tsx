"use client";

import { useEffect, useState, type ReactNode } from "react";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  DEFAULT_CHAT_OPERATIONS,
  mergeChatOperationsJson,
} from "@/services/chat/chat-settings.defaults";
import type { ChatOperationsJson, WebsiteChatSettingsRow } from "@/services/chat/chat-settings.types";

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
}

export function ClosePolicyTab({ settings, canEdit, saving, onSave }: ClosePolicyTabProps) {
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

  const cp = (ops.closePolicy ?? DEFAULT_CHAT_OPERATIONS.closePolicy) as Record<
    string,
    unknown
  >;
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
    patchClosePolicy({
      visitorIdle: { ...vi, ...patch },
    });
  };

  const patchAgentNoResponse = (patch: Record<string, unknown>) => {
    patchClosePolicy({
      agentNoResponse: { ...anr, ...patch },
    });
  };

  const patchSupervisorClose = (patch: Record<string, unknown>) => {
    patchClosePolicy({
      supervisorClose: { ...sc, ...patch },
    });
  };

  const patchOnClose = (patch: Record<string, unknown>) => {
    patchClosePolicy({
      onClose: { ...oc, ...patch },
    });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 720 }}>
      <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
        Per-website rules for auto-close, visitor nudges, and agent no-response alerts.
        Timers run on the server every minute.
      </Typography>

      <FormControlLabel
        disabled={!canEdit}
        control={
          <Switch
            checked={readBool(cp, "enabled")}
            onChange={(_, v) => patchClosePolicy({ enabled: v })}
          />
        }
        label="Enable close policy for this website"
      />

      <Section title="Visitor inactivity">
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1.5 }}>
          When the agent (or AI) sent the last message and the visitor stops replying.
        </Typography>
        <FormControlLabel
          disabled={!canEdit || !readBool(cp, "enabled")}
          control={
            <Switch
              checked={readBool(vi, "enabled")}
              onChange={(_, v) => patchVisitorIdle({ enabled: v })}
            />
          }
          label="Auto-close inactive visitor chats"
        />
        <Box sx={{ display: "grid", gap: 1.5, mt: 1 }}>
          <InputField
            label="Nudge after (minutes)"
            type="number"
            disabled={!canEdit || !readBool(cp, "enabled") || !readBool(vi, "enabled")}
            value={String(readNum(vi, "nudgeAfterMinutes", viDefaults.nudgeAfterMinutes ?? 8))}
            onChange={(e) =>
              patchVisitorIdle({ nudgeAfterMinutes: Number(e.target.value) || 8 })
            }
            sx={{ maxWidth: 200 }}
          />
          <InputField
            label="Nudge message"
            multiline
            minRows={2}
            disabled={!canEdit || !readBool(cp, "enabled") || !readBool(vi, "enabled")}
            value={readStr(vi, "nudgeMessage", viDefaults.nudgeMessage ?? "")}
            onChange={(e) => patchVisitorIdle({ nudgeMessage: e.target.value })}
          />
          <InputField
            label="Close after (minutes)"
            type="number"
            disabled={!canEdit || !readBool(cp, "enabled") || !readBool(vi, "enabled")}
            value={String(readNum(vi, "closeAfterMinutes", viDefaults.closeAfterMinutes ?? 10))}
            onChange={(e) =>
              patchVisitorIdle({ closeAfterMinutes: Number(e.target.value) || 10 })
            }
            sx={{ maxWidth: 200 }}
          />
          <InputField
            label="Close message"
            multiline
            minRows={2}
            disabled={!canEdit || !readBool(cp, "enabled") || !readBool(vi, "enabled")}
            value={readStr(vi, "closeMessage", viDefaults.closeMessage ?? "")}
            onChange={(e) => patchVisitorIdle({ closeMessage: e.target.value })}
          />
        </Box>
      </Section>

      <Section title="Agent no response">
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1.5 }}>
          When the visitor sent the last message and no agent has replied yet (queued or assigned).
        </Typography>
        <FormControlLabel
          disabled={!canEdit || !readBool(cp, "enabled")}
          control={
            <Switch
              checked={readBool(anr, "enabled")}
              onChange={(_, v) => patchAgentNoResponse({ enabled: v })}
            />
          }
          label="Alert agents and send visitor fallback"
        />
        <Box sx={{ display: "grid", gap: 1.5, mt: 1 }}>
          <InputField
            label="Alert agent after (minutes)"
            type="number"
            disabled={!canEdit || !readBool(cp, "enabled") || !readBool(anr, "enabled")}
            value={String(
              readNum(anr, "firstAlertAgentAfterMinutes", anrDefaults.firstAlertAgentAfterMinutes ?? 2),
            )}
            onChange={(e) =>
              patchAgentNoResponse({
                firstAlertAgentAfterMinutes: Number(e.target.value) || 2,
              })
            }
            sx={{ maxWidth: 200 }}
          />
          <InputField
            label="Fallback to visitor after (minutes)"
            type="number"
            disabled={!canEdit || !readBool(cp, "enabled") || !readBool(anr, "enabled")}
            value={String(
              readNum(
                anr,
                "fallbackToVisitorAfterMinutes",
                anrDefaults.fallbackToVisitorAfterMinutes ?? 5,
              ),
            )}
            onChange={(e) =>
              patchAgentNoResponse({
                fallbackToVisitorAfterMinutes: Number(e.target.value) || 5,
              })
            }
            sx={{ maxWidth: 200 }}
          />
          <InputField
            label="Fallback message"
            multiline
            minRows={2}
            disabled={!canEdit || !readBool(cp, "enabled") || !readBool(anr, "enabled")}
            value={readStr(anr, "fallbackMessage", anrDefaults.fallbackMessage ?? "")}
            onChange={(e) => patchAgentNoResponse({ fallbackMessage: e.target.value })}
          />
          <InputField
            label="Close after (minutes)"
            type="number"
            disabled={!canEdit || !readBool(cp, "enabled") || !readBool(anr, "enabled")}
            value={String(readNum(anr, "closeAfterMinutes", anrDefaults.closeAfterMinutes ?? 20))}
            onChange={(e) =>
              patchAgentNoResponse({ closeAfterMinutes: Number(e.target.value) || 20 })
            }
            sx={{ maxWidth: 200 }}
          />
          <InputField
            label="Close message"
            multiline
            minRows={2}
            disabled={!canEdit || !readBool(cp, "enabled") || !readBool(anr, "enabled")}
            value={readStr(anr, "closeMessage", anrDefaults.closeMessage ?? "")}
            onChange={(e) => patchAgentNoResponse({ closeMessage: e.target.value })}
          />
        </Box>
      </Section>

      <Section title="Supervisor close (monitor)">
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1.5 }}>
          Pool heads and department heads can close chats from Chat monitor when enabled.
        </Typography>
        <FormControlLabel
          disabled={!canEdit || !readBool(cp, "enabled")}
          control={
            <Switch
              checked={readBool(sc, "enabled")}
              onChange={(_, v) => patchSupervisorClose({ enabled: v })}
            />
          }
          label="Allow supervisor close from monitor"
        />
        <FormControlLabel
          disabled={!canEdit || !readBool(cp, "enabled") || !readBool(sc, "enabled")}
          control={
            <Switch
              checked={readBool(sc, "requireReason")}
              onChange={(_, v) => patchSupervisorClose({ requireReason: v })}
            />
          }
          label="Require close reason"
        />
        <InputField
          label="Minimum reason length"
          type="number"
          disabled={!canEdit || !readBool(cp, "enabled") || !readBool(sc, "enabled")}
          value={String(readNum(sc, "reasonMinLength", Number(scDefaults.reasonMinLength) || 3))}
          onChange={(e) =>
            patchSupervisorClose({ reasonMinLength: Number(e.target.value) || 3 })
          }
          sx={{ mt: 1, maxWidth: 200 }}
        />
      </Section>

      <Section title="After close">
        <FormControlLabel
          disabled={!canEdit || !readBool(cp, "enabled")}
          control={
            <Switch
              checked={readBool(oc, "insertDistributionLinkInTranscript")}
              onChange={(_, v) => patchOnClose({ insertDistributionLinkInTranscript: v })}
            />
          }
          label="Insert distribution form link in chat transcript when configured"
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
              defaultDepartmentId: settings.defaultDepartmentId,
              operationsJson: ops,
            })
          }
        >
          {saving ? "Saving…" : "Save close policy"}
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
