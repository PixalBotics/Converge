"use client";

import { useState } from "react";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import { Button, DashboardCard, InputField, Typography } from "@/components/common";
import { postKbReindex, postKbSourceMultipart, type KbSourceType } from "@/api/kb/kb.api";

const SOURCE_OPTIONS: { label: string; value: KbSourceType }[] = [
  { label: "FAQ", value: "FAQ" },
  { label: "URL", value: "URL" },
  { label: "PDF", value: "PDF" },
  { label: "Web crawl", value: "WEB_CRAWL" },
  { label: "Sitemap", value: "SITEMAP" },
];

/** Knowledge ingestion & reindex aligned with `/kb/sources` + `/kb/reindex`. */
export default function AIManagementPage() {
  const [websiteId, setWebsiteId] = useState("");
  const [sourceType, setSourceType] = useState<KbSourceType>("URL");
  const [sourceRef, setSourceRef] = useState("");
  const [title, setTitle] = useState("");
  const [metadataJson, setMetadataJson] = useState("{}");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [sourceIdReindex, setSourceIdReindex] = useState("");
  const [reindexBusy, setReindexBusy] = useState(false);

  const submitSource = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const payload = await postKbSourceMultipart({
        websiteId: websiteId.trim(),
        sourceType,
        sourceRef: sourceRef.trim(),
        title: title.trim(),
        metadataJson,
        file: sourceType === "PDF" ? file : null,
      });
      setStatus(`Indexed: ${JSON.stringify(payload)}`);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const reindex = async () => {
    setReindexBusy(true);
    setStatus(null);
    try {
      const sid = sourceIdReindex.trim();
      const payload = sid
        ? { sourceId: sid, includeFailed: true as const }
        : { includeFailed: true as const };
      const raw = await postKbReindex(payload);
      setStatus(`Reindex: ${JSON.stringify(raw)}`);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Reindex failed");
    } finally {
      setReindexBusy(false);
    }
  };

  return (
    <Stack spacing={2.5} sx={{ maxWidth: 960, mx: "auto" }}>
      <Box>
        <Typography variant="regularLarge" fontWeight={700} color="white" sx={{ mb: 0.75 }}>
          AI & knowledge base
        </Typography>
        <Typography variant="medium" sx={{ color: (t) => t.app.dashboard.textMuted }}>
          Create sources against a website; indexing is synchronous on the API.
        </Typography>
      </Box>

      <DashboardCard sx={{ p: 2.5 }}>
        <Typography variant="mediumLarge" color="white" fontWeight={600} sx={{ mb: 2 }}>
          Add source
        </Typography>
        <Stack spacing={1.5}>
          <InputField
            label="Website ID (UUID)"
            value={websiteId}
            onChange={(e) => setWebsiteId(e.target.value)}
          />
          <Box>
            <Typography variant="small" sx={{ mb: 0.5 }}>
              Source type
            </Typography>
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as KbSourceType)}
              style={{ width: "100%", padding: 10, borderRadius: 8 }}
            >
              {SOURCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Box>
          <InputField
            label="Source reference (URL, path, or identifier)"
            value={sourceRef}
            onChange={(e) => setSourceRef(e.target.value)}
          />
          <InputField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <InputField
            label="metadataJson"
            value={metadataJson}
            onChange={(e) => setMetadataJson(e.target.value)}
          />
          {sourceType === "PDF" ? (
            <Button type="button" variant="secondary" component="label">
              Choose PDF
              <input
                type="file"
                accept="application/pdf"
                hidden
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </Button>
          ) : null}
          <Button type="button" variant="primary" disabled={busy} onClick={() => void submitSource()}>
            {busy ? "Submitting…" : "Upload / index source"}
          </Button>
        </Stack>
      </DashboardCard>

      <DashboardCard sx={{ p: 2.5 }}>
        <Typography variant="mediumLarge" color="white" fontWeight={600} sx={{ mb: 2 }}>
          Reindex source
        </Typography>
        <Stack spacing={1.5}>
          <InputField
            label="Source ID"
            value={sourceIdReindex}
            onChange={(e) => setSourceIdReindex(e.target.value)}
          />
          <Button
            type="button"
            variant="secondary"
            disabled={reindexBusy}
            onClick={() => void reindex()}
          >
            {reindexBusy ? "Working…" : "Reindex"}
          </Button>
        </Stack>
      </DashboardCard>

      {status ? (
        <Alert severity="info" variant="outlined">
          {status}
        </Alert>
      ) : null}
    </Stack>
  );
}
