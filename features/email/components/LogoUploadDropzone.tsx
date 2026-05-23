"use client";

import { useCallback, useRef, useState } from "react";
import Box from "@mui/material/Box";
import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import ImageOutlined from "@mui/icons-material/ImageOutlined";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { EmailLogoDropzoneRoot } from "../styles/email-design.styled";
import { publishAppToast } from "@/lib/notify";

const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const ACCEPT = "image/png,image/jpeg,image/webp";

export function LogoUploadDropzone({
  logoUrl,
  onUpload,
  onRemove,
  uploading,
  disabled,
}: {
  logoUrl?: string | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
  uploading?: boolean;
  disabled?: boolean;
}) {
  const theme = useTheme() as AppTheme;
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (file.size > MAX_LOGO_BYTES) {
        publishAppToast({
          variant: "error",
          message: "Logo must be 2 MB or smaller.",
        });
        return;
      }
      onUpload(file);
    },
    [onUpload],
  );

  return (
    <Box>
      <Typography variant="medium" fontWeight={600} sx={{ mb: 1 }}>
        Brand logo
      </Typography>
      <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, mb: 1.25 }}>
        Shown below the platform header in outgoing emails. PNG, JPEG, or WebP up to 2 MB.
      </Typography>

      <EmailLogoDropzoneRoot
        active={dragActive}
        hasLogo={Boolean(logoUrl)}
        onClick={() => {
          if (!disabled && !uploading) inputRef.current?.click();
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          if (!disabled) setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragActive(false);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (disabled || uploading) return;
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        {logoUrl ? (
          <Box
            component="img"
            src={logoUrl}
            alt="Email brand logo"
            sx={{ maxHeight: 72, maxWidth: 240, objectFit: "contain" }}
          />
        ) : (
          <>
            <ImageOutlined sx={{ fontSize: 36, color: theme.app.dashboard.iconMuted }} />
            <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted }}>
              Drag and drop your logo here
            </Typography>
          </>
        )}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.5 }}>
          <CloudUploadOutlined sx={{ fontSize: 18, color: theme.palette.primary.main }} />
          <Typography variant="small" fontWeight={600} sx={{ color: theme.palette.primary.main }}>
            {uploading ? "Uploading…" : "Click or drop to upload"}
          </Typography>
        </Box>
      </EmailLogoDropzoneRoot>

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1.25 }}>
        <Button
          type="button"
          variant="secondary"
          disabled={disabled || uploading}
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
        >
          {logoUrl ? "Replace logo" : "Choose file"}
        </Button>
        {logoUrl ? (
          <Button
            type="button"
            variant="secondary"
            disabled={disabled || uploading}
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            Remove logo
          </Button>
        ) : null}
      </Box>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </Box>
  );
}
