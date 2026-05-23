"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Switch from "@mui/material/Switch";
import ArrowDownward from "@mui/icons-material/ArrowDownward";
import ArrowUpward from "@mui/icons-material/ArrowUpward";
import PaletteOutlined from "@mui/icons-material/PaletteOutlined";
import ViewQuiltOutlined from "@mui/icons-material/ViewQuiltOutlined";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, Typography } from "@/components/common";
import type { EmailTemplateBlock, EmailTemplateBlockKey } from "../../types";
import {
  EMAIL_BRAND_COLOR_PRESETS,
  EMAIL_TEMPLATE_BLOCK_DESCRIPTIONS,
  EMAIL_TEMPLATE_BLOCK_LABELS,
} from "../../email.constants";
import {
  defaultStyleForBlock,
  patchBlockStyle,
  readBlockStyle,
} from "../../utils/email-block-style";
import { LogoUploadDropzone } from "../LogoUploadDropzone";
import {
  EmailBuilderBlockCard,
  EmailBuilderBlockHeader,
  EmailBuilderIconBadge,
  EmailBuilderPanel,
  EmailBuilderSectionTitle,
  EmailColorSwatch,
  EmailColorSwatchRow,
} from "../../styles/email-design.styled";
import { blockIconForKey } from "./block-icons";

export function EmailTemplateBuilder({
  name,
  primaryColor,
  blocks,
  logoUrl,
  onNameChange,
  onPrimaryColorChange,
  onBlocksChange,
  onToggleBlock,
  onReorderBlock,
  onUploadLogo,
  onRemoveLogo,
  logoUploading,
  disabled,
}: {
  name: string;
  primaryColor: string;
  blocks: EmailTemplateBlock[];
  logoUrl?: string | null;
  onNameChange: (value: string) => void;
  onPrimaryColorChange: (value: string) => void;
  onBlocksChange: (blocks: EmailTemplateBlock[]) => void;
  onToggleBlock: (blockKey: EmailTemplateBlockKey, enabled: boolean) => void;
  onReorderBlock: (blockKey: EmailTemplateBlockKey, direction: "up" | "down") => void;
  onUploadLogo: (file: File) => void;
  onRemoveLogo: () => void;
  logoUploading?: boolean;
  disabled?: boolean;
}) {
  const theme = useTheme() as AppTheme;
  const sorted = useMemo(
    () => [...blocks].sort((a, b) => a.sortOrder - b.sortOrder),
    [blocks],
  );
  const [expandedKey, setExpandedKey] = useState<EmailTemplateBlockKey | null>("visitor_info");

  const setBlockStyle = (blockKey: EmailTemplateBlockKey, showIcons: boolean) => {
    onBlocksChange(
      blocks.map((b) =>
        b.blockKey === blockKey ? patchBlockStyle(b, { showIcons }) : b,
      ),
    );
  };

  const applyPreset = () => {
    onBlocksChange(
      sorted.map((b) => ({
        ...b,
        styleJson: defaultStyleForBlock(b.blockKey),
      })),
    );
  };

  return (
    <EmailBuilderPanel elevation={0}>
      <EmailBuilderSectionTitle>
        <PaletteOutlined sx={{ fontSize: 20, color: theme.palette.primary.main }} />
        <Typography variant="mediumLarge" fontWeight={700}>
          Branding
        </Typography>
      </EmailBuilderSectionTitle>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2,
        }}
      >
        <InputField
          label="Template name"
          name="templateName"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          disabled={disabled}
          placeholder="Chat transcript email"
        />
        <Box>
          <Typography variant="small" sx={{ mb: 0.75, color: theme.app.dashboard.textMuted }}>
            Accent color (section headers)
          </Typography>
          <EmailColorSwatchRow>
            {EMAIL_BRAND_COLOR_PRESETS.map((hex) => (
              <EmailColorSwatch
                key={hex}
                type="button"
                selected={primaryColor.toLowerCase() === hex.toLowerCase()}
                style={{ background: hex }}
                disabled={disabled}
                onClick={() => onPrimaryColorChange(hex)}
                aria-label={`Color ${hex}`}
              />
            ))}
          </EmailColorSwatchRow>
          <Box sx={{ display: "flex", gap: 1, mt: 1, alignItems: "center" }}>
            <Box
              component="input"
              type="color"
              value={primaryColor.startsWith("#") ? primaryColor : "#2563eb"}
              disabled={disabled}
              onChange={(e) => onPrimaryColorChange(e.target.value)}
              aria-label="Pick accent color"
              sx={{
                width: 40,
                height: 36,
                border: `1px solid ${theme.app.dashboard.cardBorder}`,
                borderRadius: 1,
                cursor: disabled ? "not-allowed" : "pointer",
                bgcolor: "transparent",
              }}
            />
            <InputField
              label=""
              name="primaryColorHex"
              value={primaryColor}
              onChange={(e) => onPrimaryColorChange(e.target.value)}
              placeholder="#2563eb"
              disabled={disabled}
              sx={{ flex: 1, m: 0 }}
            />
          </Box>
        </Box>
      </Box>

      <LogoUploadDropzone
        logoUrl={logoUrl}
        onUpload={onUploadLogo}
        onRemove={onRemoveLogo}
        uploading={logoUploading}
        disabled={disabled}
      />

      <Box sx={{ mt: 0.5 }}>
      <EmailBuilderSectionTitle>
        <ViewQuiltOutlined sx={{ fontSize: 20, color: theme.palette.primary.main }} />
        <Typography variant="mediumLarge" fontWeight={700}>
          Email sections
        </Typography>
        {!disabled ? (
          <Button
            type="button"
            variant="secondary"
            onClick={applyPreset}
            sx={{ ml: "auto", fontSize: 12, py: 0.5, px: 1.25 }}
          >
            Reset display options
          </Button>
        ) : null}
      </EmailBuilderSectionTitle>
      </Box>

      <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, mt: -1.5 }}>
        Toggle sections, reorder, and choose whether field labels show icons in the outgoing email.
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
        {sorted.map((block, index) => {
          const Icon = blockIconForKey(block.blockKey);
          const expanded = expandedKey === block.blockKey;
          const style = readBlockStyle(block);
          return (
            <EmailBuilderBlockCard
              key={block.blockKey}
              selected={expanded && block.enabled}
              disabled={!block.enabled}
            >
              <EmailBuilderBlockHeader>
                <EmailBuilderIconBadge active={block.enabled}>
                  <Icon sx={{ fontSize: 20 }} />
                </EmailBuilderIconBadge>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="medium" fontWeight={600}>
                    {EMAIL_TEMPLATE_BLOCK_LABELS[block.blockKey]}
                  </Typography>
                  <Typography
                    variant="small"
                    sx={{
                      color: theme.app.dashboard.textMuted,
                      display: "block",
                      lineHeight: 1.35,
                    }}
                  >
                    {EMAIL_TEMPLATE_BLOCK_DESCRIPTIONS[block.blockKey]}
                  </Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={block.enabled}
                      onChange={(e) => onToggleBlock(block.blockKey, e.target.checked)}
                      disabled={disabled}
                    />
                  }
                  label=""
                  sx={{ m: 0 }}
                />
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <IconButton
                    size="small"
                    disabled={disabled || index === 0}
                    onClick={() => onReorderBlock(block.blockKey, "up")}
                    aria-label="Move section up"
                  >
                    <ArrowUpward fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    disabled={disabled || index === sorted.length - 1}
                    onClick={() => onReorderBlock(block.blockKey, "down")}
                    aria-label="Move section down"
                  >
                    <ArrowDownward fontSize="small" />
                  </IconButton>
                </Box>
              </EmailBuilderBlockHeader>
              <Collapse in={block.enabled}>
                <Box
                  sx={{
                    px: 1.5,
                    pb: 1.5,
                    pt: 0,
                    borderTop: `1px solid ${theme.app.dashboard.cardBorder}`,
                  }}
                >
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      setExpandedKey(expanded ? null : block.blockKey)
                    }
                    sx={{ width: "100%", mb: expanded ? 1 : 0, fontSize: 12 }}
                  >
                    {expanded ? "Hide options" : "Section options"}
                  </Button>
                  <Collapse in={expanded}>
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={style.showIcons !== false}
                          onChange={(e) =>
                            setBlockStyle(block.blockKey, e.target.checked)
                          }
                          disabled={disabled}
                        />
                      }
                      label={
                        <Typography variant="small">
                          Show icons next to fields in email
                        </Typography>
                      }
                    />
                  </Collapse>
                </Box>
              </Collapse>
            </EmailBuilderBlockCard>
          );
        })}
      </Box>
    </EmailBuilderPanel>
  );
}
