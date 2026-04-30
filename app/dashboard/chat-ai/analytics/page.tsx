"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { getAccessToken } from "@/api";
import { Button, DashboardCard, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  integrationsMainCardSx,
  integrationsPageHeader,
  integrationsPageWrapper,
} from "../../integrations/integrations.styles";
import { useVisitorAiAnalyticsQuery } from "@/lib/hooks/query";
import { isRecord, unwrapApiData } from "@/lib/utils";

function formatMetricLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
}

function VisitorAnalyticsDisplay({ payload }: { payload: unknown }) {
  const theme = useTheme() as AppTheme;
  const data = unwrapApiData(payload);
  const root = isRecord(data) ? data : null;

  const totals = root && isRecord(root["totals"]) ? (root["totals"] as Record<string, unknown>) : null;
  const series = Array.isArray(root?.["series"]) ? root["series"] : Array.isArray(root?.["daily"]) ? root["daily"] : null;

  if (totals && Object.keys(totals).length > 0) {
    return (
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 1.5 }}>
        {Object.entries(totals).map(([k, v]) => (
          <DashboardCard key={k} sx={{ ...integrationsMainCardSx, p: 2 }}>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
              {formatMetricLabel(k)}
            </Typography>
            <Typography variant="mediumLarge" fontWeight={700} color="white" sx={{ mt: 0.5 }}>
              {typeof v === "object" ? JSON.stringify(v) : String(v)}
            </Typography>
          </DashboardCard>
        ))}
      </Box>
    );
  }

  if (series && series.length > 0) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {series.slice(0, 30).map((row, i) => (
          <DashboardCard key={i} sx={{ ...integrationsMainCardSx, p: 1.5 }}>
            <Typography variant="small" sx={{ color: theme.app.text.primary, fontFamily: "ui-monospace, monospace", whiteSpace: "pre-wrap" }}>
              {typeof row === "object" ? JSON.stringify(row, null, 2) : String(row)}
            </Typography>
          </DashboardCard>
        ))}
      </Box>
    );
  }

  return (
    <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, fontFamily: "ui-monospace, monospace", whiteSpace: "pre-wrap" }}>
      {root ? JSON.stringify(root, null, 2) : String(payload)}
    </Typography>
  );
}

export default function VisitorAiAnalyticsPage() {
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const token = getAccessToken()?.trim() ?? "";

  const defaultTo = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const defaultFrom = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  }, []);

  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [enabled, setEnabled] = useState(false);

  const query = useVisitorAiAnalyticsQuery(
    enabled ? { from, to } : undefined,
    { enabled: enabled && Boolean(token), token, scope: "visitor-ai" },
  );

  return (
    <Box sx={integrationsPageWrapper}>
      <Box sx={integrationsPageHeader}>
        <Box>
          <Button type="button" variant="secondary" startIcon={<ArrowBack />} onClick={() => router.push("/dashboard/chat-operations")} sx={{ mb: 1 }}>
            Chat operations
          </Button>
          <Typography variant="regularLarge" fontWeight={700} color="white" sx={{ mb: 0.5 }}>
            Visitor AI analytics
          </Typography>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 720 }}>
            Metrics from GET /chat/ai/analytics/visitors. When the API returns totals or series objects, they are shown as cards or a list; otherwise the raw JSON payload is displayed.
          </Typography>
        </Box>
      </Box>

      <DashboardCard sx={{ ...integrationsMainCardSx, p: 2, mb: 2 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "flex-end" }}>
          <TextField
            label="From"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 160, "& .MuiInputBase-input": { color: theme.app.text.primary } }}
          />
          <TextField
            label="To"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 160, "& .MuiInputBase-input": { color: theme.app.text.primary } }}
          />
          <Button type="button" variant="primary" sx={gradientPrimaryButtonSx} disabled={!token} onClick={() => setEnabled(true)}>
            Load analytics
          </Button>
          <Button type="button" variant="secondary" disabled={!enabled} onClick={() => void query.refetch()}>
            Refresh
          </Button>
        </Box>
        {!token ? (
          <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, mt: 1.5 }}>
            Sign in to load analytics.
          </Typography>
        ) : null}
      </DashboardCard>

      <DashboardCard sx={{ ...integrationsMainCardSx, p: 2 }}>
        {query.isLoading ? (
          <Typography color="white">Loading…</Typography>
        ) : query.isError ? (
          <Typography sx={{ color: theme.app.dashboard.textMuted }}>
            Request failed. Ensure the backend exposes visitor AI analytics for your tenant.
          </Typography>
        ) : query.data !== undefined ? (
          <VisitorAnalyticsDisplay payload={query.data} />
        ) : (
          <Typography sx={{ color: theme.app.dashboard.textMuted }}>Choose a date range and click Load analytics.</Typography>
        )}
      </DashboardCard>
    </Box>
  );
}
