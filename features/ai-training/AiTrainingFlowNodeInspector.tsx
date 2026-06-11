"use client";

import { useEffect, useState } from "react";
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import CheckCircleOutlineRounded from "@mui/icons-material/CheckCircleOutlineRounded";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Slider from "@mui/material/Slider";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import type { FlowBuilderNode, FlowBuilderNodeType } from "./ai-flow-builder.types";
import { flowNodeIcon } from "./ai-flow-builder.icons";
import { FLOW_NODE_CATALOG } from "./ai-flow-builder.types";
import {
  FLOW_NODE_INSPECTOR,
  isCustomFlowNodeMessage,
  type FlowNodeRuntimeImpact,
} from "./ai-flow-node-inspector.config";
import {
  useAiTrainingBehaviorQuery,
  useUpdateAiTrainingBehaviorMutation,
} from "@/lib/hooks/query/ai-training/hooks";
import { aiTrainingSettingsSliderSx } from "./ai-training-studio.styles";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import { studioColors } from "./ai-training-studio.tokens";

function catalogMeta(type: FlowBuilderNodeType) {
  return FLOW_NODE_CATALOG.find((c) => c.type === type)!;
}

function badgeColors(theme: AppTheme, impact: FlowNodeRuntimeImpact) {
  const d = theme.app.dashboard;
  switch (impact) {
    case "message":
      return { bg: alpha(theme.palette.success.main, 0.15), color: theme.palette.success.light, border: alpha(theme.palette.success.main, 0.35) };
    case "settings":
      return { bg: alpha(d.accentBlue, 0.15), color: d.blueTint ?? "#93c5fd", border: alpha(d.accentBlue, 0.35) };
    default:
      return { bg: alpha(d.textMuted, 0.12), color: d.textMuted, border: alpha(d.cardBorder, 0.4) };
  }
}

export function AiTrainingFlowNodeInspector({
  websiteId,
  node,
  onUpdate,
  onOpenSettings,
}: {
  websiteId: string;
  node: FlowBuilderNode;
  onUpdate: (patch: Partial<FlowBuilderNode>) => void;
  onOpenSettings?: () => void;
}) {
  const theme = useTheme() as AppTheme;
  const c = studioColors(theme);
  const meta = catalogMeta(node.type);
  const config = FLOW_NODE_INSPECTOR[node.type];
  const badge = badgeColors(theme, config.runtimeImpact);
  const behaviorQuery = useAiTrainingBehaviorQuery(websiteId);
  const updateBehavior = useUpdateAiTrainingBehaviorMutation();
  const [threshold, setThreshold] = useState(0.26);

  useEffect(() => {
    if (behaviorQuery.data?.confidenceThreshold != null) {
      setThreshold(behaviorQuery.data.confidenceThreshold);
    }
  }, [behaviorQuery.data?.confidenceThreshold]);

  const d = theme.app.dashboard;
  const inputSx = {
    width: "100%",
    px: 1.25,
    py: 0.85,
    borderRadius: "10px",
    border: `1px solid ${alpha(d.cardBorder, c.isLight ? 0.55 : 0.45)}`,
    bgcolor: c.isLight ? theme.palette.background.paper : alpha(d.pillBg, 0.75),
    color: c.text,
    fontSize: 13,
    outline: "none",
    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
    "&:focus": {
      borderColor: meta.color,
      boxShadow: `0 0 0 2px ${alpha(meta.color, 0.22)}`,
    },
  };

  const saveThreshold = async (value: number) => {
    try {
      await updateBehavior.mutateAsync({
        websiteId,
        body: { confidenceThreshold: value },
      });
      publishAppToast({ variant: "success", message: "Confidence threshold saved." });
    } catch (e) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(e) ?? "Could not save threshold.",
      });
    }
  };

  const messageActive = config.runtimeImpact === "message" && isCustomFlowNodeMessage(node.detail);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1.5,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: `${meta.color}22`,
            color: meta.color,
            border: `1px solid ${meta.color}44`,
          }}
        >
          {flowNodeIcon(meta.icon, meta.type)}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="body2" fontWeight={700} sx={{ color: c.text }}>
            {meta.label}
          </Typography>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              mt: 0.75,
              px: 1,
              py: 0.25,
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 700,
              bgcolor: badge.bg,
              color: badge.color,
              border: `1px solid ${badge.border}`,
            }}
          >
            {config.runtimeImpact === "none" ? (
              <VisibilityOutlined sx={{ fontSize: 13 }} />
            ) : (
              <CheckCircleOutlineRounded sx={{ fontSize: 13 }} />
            )}
            {config.runtimeBadge}
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          p: 1.5,
          borderRadius: 2,
          bgcolor: alpha(d.menuSurfaceBg ?? d.pillBg, c.isLight ? 0.45 : 0.32),
          border: `1px solid ${c.border}`,
        }}
      >
        <Typography variant="caption" sx={{ color: c.text, fontWeight: 700, display: "block", mb: 0.5 }}>
          What this block does
        </Typography>
        <Typography variant="caption" sx={{ color: c.textSoft, lineHeight: 1.55, display: "block" }}>
          {config.whatItDoes}
        </Typography>
      </Box>

      <Box>
        <Typography variant="caption" sx={{ color: c.text, fontWeight: 600, display: "block" }}>
          Block title (diagram only)
        </Typography>
        <Typography variant="caption" sx={{ color: c.textSecondary, display: "block", mb: 0.6, fontSize: 11, lineHeight: 1.45 }}>
          Renaming does not change bot logic — for your reference only.
        </Typography>
        <Box
          component="input"
          value={node.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          sx={inputSx}
        />
      </Box>

      {config.runtimeImpact === "message" ? (
        <Box>
          <Typography variant="caption" sx={{ color: c.text, fontWeight: 600, display: "block" }}>
            {config.messageLabel}
          </Typography>
          <Typography variant="caption" sx={{ color: c.textSecondary, display: "block", mb: 0.6, lineHeight: 1.45 }}>
            {config.messageHelper}
          </Typography>
          <Box
            component="textarea"
            value={node.detail}
            onChange={(e) => onUpdate({ detail: e.target.value })}
            placeholder={config.messagePlaceholder}
            rows={5}
            sx={{ ...inputSx, fontSize: 12, resize: "vertical", lineHeight: 1.45 }}
          />
          <Typography
            variant="caption"
            sx={{
              mt: 0.75,
              display: "block",
              color: messageActive ? theme.palette.success.main : c.textSecondary,
              fontSize: 11,
            }}
          >
            {messageActive
              ? "✓ Custom message active — bot will use this text."
              : "Using platform default until you write custom text above."}
          </Typography>
        </Box>
      ) : null}

      {config.runtimeImpact === "settings" && node.type === "condition" ? (
        <Box
          sx={{
            p: 1.25,
            borderRadius: 2,
            bgcolor: alpha(theme.app.dashboard.blueTintBg ?? "rgba(59,130,246,0.12)", 0.65),
            border: `1px solid ${alpha(theme.app.dashboard.accentBlue, 0.25)}`,
          }}
        >
          <Typography variant="caption" fontWeight={700} sx={{ color: c.text, display: "block", mb: 0.5 }}>
            {config.settingsLabel}
          </Typography>
          <Typography variant="caption" sx={{ color: c.textSecondary, display: "block", mb: 1.25, lineHeight: 1.45 }}>
            Minimum KB score (0.1–0.6). Higher = stricter answers, more fallbacks.
          </Typography>
          <Slider
            size="small"
            min={0.1}
            max={0.6}
            step={0.02}
            value={threshold}
            onChange={(_, v) => setThreshold(typeof v === "number" ? v : v[0])}
            onChangeCommitted={(_, v) => void saveThreshold(typeof v === "number" ? v : v[0])}
            valueLabelDisplay="auto"
            sx={aiTrainingSettingsSliderSx}
            disabled={updateBehavior.isPending}
          />
          {onOpenSettings ? (
            <Button
              size="small"
              variant="text"
              startIcon={<OpenInNewRounded sx={{ fontSize: 16 }} />}
              onClick={onOpenSettings}
              sx={{ mt: 0.5, color: theme.app.dashboard.accentBlue, textTransform: "none", px: 0 }}
            >
              All bot settings (fallbacks, strict mode…)
            </Button>
          ) : null}
        </Box>
      ) : null}

      {config.runtimeImpact === "none" ? (
        <Box
          sx={{
            p: 1.35,
            borderRadius: 2,
            bgcolor: alpha(d.pillBg, c.isLight ? 0.35 : 0.22),
            border: `1px dashed ${alpha(d.cardBorder, c.isLight ? 0.5 : 0.42)}`,
            display: "flex",
            gap: 1,
            alignItems: "flex-start",
          }}
        >
          <InfoOutlined sx={{ fontSize: 16, color: c.textSecondary, mt: 0.1, flexShrink: 0 }} />
          <Typography variant="caption" sx={{ color: c.textSoft, lineHeight: 1.5 }}>
            {config.editHint}
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            p: 1.35,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.success.main, 0.08),
            border: `1px solid ${alpha(theme.palette.success.main, 0.22)}`,
            display: "flex",
            gap: 1,
            alignItems: "flex-start",
          }}
        >
          <CheckCircleOutlineRounded sx={{ fontSize: 16, color: theme.palette.success.light, mt: 0.1, flexShrink: 0 }} />
          <Typography variant="caption" sx={{ color: c.textSoft, lineHeight: 1.5 }}>
            {config.editHint} Flow auto-saves ~1 second after edits.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
