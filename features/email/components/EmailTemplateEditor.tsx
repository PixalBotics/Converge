"use client";

import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import type { EmailTemplateBlock, EmailTemplateBlockKey } from "../types";
import { InputField, Typography } from "@/components/common";
import { EMAIL_TEMPLATE_BLOCK_LABELS } from "../email.constants";
import { LogoUploadDropzone } from "./LogoUploadDropzone";

export function EmailTemplateEditor({
  name,
  primaryColor,
  blocks,
  logoUrl,
  onNameChange,
  onPrimaryColorChange,
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
  onToggleBlock: (blockKey: EmailTemplateBlockKey, enabled: boolean) => void;
  onReorderBlock: (blockKey: EmailTemplateBlockKey, direction: "up" | "down") => void;
  onUploadLogo: (file: File) => void;
  onRemoveLogo: () => void;
  logoUploading?: boolean;
  disabled?: boolean;
}) {
  const sorted = [...blocks].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <InputField
        label="Template name"
        name="templateName"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        disabled={disabled}
      />
      <InputField
        label="Primary color"
        name="primaryColor"
        value={primaryColor}
        onChange={(e) => onPrimaryColorChange(e.target.value)}
        placeholder="#2563eb"
        disabled={disabled}
      />
      <LogoUploadDropzone
        logoUrl={logoUrl}
        onUpload={onUploadLogo}
        onRemove={onRemoveLogo}
        uploading={logoUploading}
        disabled={disabled}
      />
      <Box>
        <Typography variant="mediumLarge" component="p" sx={{ mb: 1 }}>
          Content blocks
        </Typography>
        {sorted.map((block, index) => (
          <Box
            key={block.blockKey}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              py: 1,
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={block.enabled}
                  onChange={(e) => onToggleBlock(block.blockKey, e.target.checked)}
                  disabled={disabled}
                />
              }
              label={EMAIL_TEMPLATE_BLOCK_LABELS[block.blockKey]}
            />
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <button
                type="button"
                disabled={disabled || index === 0}
                onClick={() => onReorderBlock(block.blockKey, "up")}
              >
                ↑
              </button>
              <button
                type="button"
                disabled={disabled || index === sorted.length - 1}
                onClick={() => onReorderBlock(block.blockKey, "down")}
              >
                ↓
              </button>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
