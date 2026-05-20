"use client";

import { useRef } from "react";
import Box from "@mui/material/Box";
import { Button, Typography } from "@/components/common";

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
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="mediumLarge" component="p">
        Brand logo
      </Typography>
      {logoUrl ? (
        <Box
          component="img"
          src={logoUrl}
          alt="Email brand logo"
          sx={{ maxHeight: 64, maxWidth: 200, objectFit: "contain", borderRadius: 1 }}
        />
      ) : (
        <Typography variant="small" sx={{ color: "rgba(255,255,255,0.55)" }}>
          No logo uploaded
        </Typography>
      )}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Button
          type="button"
          variant="secondary"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Uploading…" : logoUrl ? "Replace logo" : "Upload logo"}
        </Button>
        {logoUrl ? (
          <Button type="button" variant="secondary" disabled={disabled || uploading} onClick={onRemove}>
            Remove
          </Button>
        ) : null}
      </Box>
      <Typography variant="small" sx={{ color: "rgba(255,255,255,0.5)" }}>
        PNG, JPEG, or WebP · max 2 MB
      </Typography>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          if (file.size > MAX_LOGO_BYTES) {
            window.alert("Logo must be 2 MB or smaller.");
            e.target.value = "";
            return;
          }
          onUpload(file);
          e.target.value = "";
        }}
      />
    </Box>
  );
}
