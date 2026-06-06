"use client";

import CloseRounded from "@mui/icons-material/CloseRounded";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import {
  FLOW_NODE_CATALOG,
  FLOW_PALETTE_CATEGORIES,
  type FlowBuilderNodeType,
} from "./ai-flow-builder.types";
import { flowNodeIcon } from "./ai-flow-builder.icons";
import { aiTrainingFlowBlocksPanelPaper } from "./ai-training-studio.styles";
import { FLOW_NODE_USER_SUBTITLE, studioColors } from "./ai-training-studio.tokens";

export function AiTrainingFlowPalette({
  onAddNode,
  onClose,
}: {
  onAddNode: (type: FlowBuilderNodeType) => void;
  onClose?: () => void;
}) {
  const theme = useTheme() as AppTheme;
  const c = studioColors(theme);
  return (
    <Box sx={[aiTrainingFlowBlocksPanelPaper, { minHeight: 0 }] as SxProps<Theme>}>
      <Box
        sx={{
          px: 1.5,
          py: 1.15,
          borderBottom: `1px solid ${c.border}`,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 0.75,
          flexShrink: 0,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" fontWeight={800} sx={{ color: c.text, display: "block" }}>
            Flow blocks
          </Typography>
          <Typography variant="caption" sx={{ color: c.textSecondary, fontSize: 11, lineHeight: 1.45 }}>
            Click or drag onto canvas
          </Typography>
        </Box>
        {onClose ? (
          <IconButton size="small" aria-label="Close blocks panel" onClick={onClose} sx={{ color: c.textSecondary, mt: -0.25 }}>
            <CloseRounded fontSize="small" />
          </IconButton>
        ) : null}
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        {FLOW_PALETTE_CATEGORIES.map((cat) => {
          const items = FLOW_NODE_CATALOG.filter((n) => n.category === cat.id);
          if (items.length === 0) return null;
          return (
            <Box key={cat.id} sx={{ px: 1.25, py: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  color: c.textSecondary,
                  fontWeight: 700,
                  fontSize: 10,
                  letterSpacing: 0.6,
                  textTransform: "uppercase",
                  display: "block",
                  mb: 0.75,
                  px: 0.5,
                }}
              >
                {cat.label}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                {items.map((item) => (
                  <Box
                    key={item.type}
                    component="button"
                    type="button"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("application/flow-node-type", item.type);
                      e.dataTransfer.effectAllowed = "copy";
                    }}
                    onClick={() => onAddNode(item.type)}
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1,
                      width: "100%",
                      border: `1px solid ${c.border}`,
                      borderRadius: 1.75,
                      bgcolor: c.surfaceMuted,
                      px: 1,
                      py: 0.85,
                      cursor: "grab",
                      textAlign: "left",
                      transition: "border-color 0.12s, background 0.12s, box-shadow 0.12s",
                      "&:hover": {
                        borderColor: item.color,
                        bgcolor: c.surface,
                        boxShadow: `0 4px 12px rgba(15,23,42,${c.isLight ? 0.06 : 0.2})`,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1.25,
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: `${item.color}18`,
                        color: item.color,
                        border: `1px solid ${item.color}40`,
                        mt: 0.1,
                      }}
                    >
                      {flowNodeIcon(item.icon, item.type)}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        sx={{ color: c.text, display: "block", lineHeight: 1.25 }}
                      >
                        {item.label}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: c.textSecondary,
                          display: "block",
                          lineHeight: 1.35,
                          fontSize: 10,
                          mt: 0.2,
                        }}
                      >
                        {FLOW_NODE_USER_SUBTITLE[item.type]}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
