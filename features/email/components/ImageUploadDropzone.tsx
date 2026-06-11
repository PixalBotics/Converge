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

const MAX_BYTES = 2 * 1024 * 1024;
const ACCEPT = "image/png,image/jpeg,image/webp";

export function ImageUploadDropzone({
  title,
  description,
  imageUrl,
  onUpload,
  onRemove,
  uploading,
  disabled,
  uploadLabel = "Upload image",
  previewHeight = 120,
}: {
  title: string;
  description: string;
  imageUrl?: string | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
  uploading?: boolean;
  disabled?: boolean;
  uploadLabel?: string;
  previewHeight?: number;
}) {
  const theme = useTheme() as AppTheme;
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (file.size > MAX_BYTES) {
        publishAppToast({ variant: "error", message: "Image must be 2 MB or smaller." });
        return;
      }
      onUpload(file);
    },
    [onUpload],
  );

  return (
    <Box>
      <Typography variant="medium" fontWeight={600} sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, mb: 1.25 }}>
        {description}
      </Typography>

      <EmailLogoDropzoneRoot
        active={dragActive}
        hasLogo={Boolean(imageUrl)}
        onClick={() => {
          if (!disabled && !uploading) inputRef.current?.click();
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          if (!disabled) setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          hidden
          disabled={disabled || uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
        {imageUrl ? (
          <Box
            component="img"
            src={imageUrl}
            alt=""
            sx={{
              maxWidth: "100%",
              maxHeight: previewHeight,
              borderRadius: 1,
              objectFit: "contain",
            }}
          />
        ) : (
          <>
            <ImageOutlined sx={{ fontSize: 36, color: theme.app.dashboard.iconMuted }} />
            <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted }}>
              Drag & drop or click to upload
            </Typography>
          </>
        )}
        <CloudUploadOutlined sx={{ fontSize: 18, opacity: 0.6 }} />
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
          PNG, JPEG, WebP · max 2 MB
        </Typography>
      </EmailLogoDropzoneRoot>

      <Box sx={{ display: "flex", gap: 1, mt: 1.25, flexWrap: "wrap" }}>
        <Button
          type="button"
          variant="secondary"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Uploading…" : uploadLabel}
        </Button>
        {imageUrl ? (
          <Button type="button" variant="secondary" disabled={disabled || uploading} onClick={onRemove}>
            Remove
          </Button>
        ) : null}
      </Box>
    </Box>
  );
}
