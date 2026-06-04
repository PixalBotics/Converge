"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import type { KnowledgeChunkPreviewItem } from "@/api/ai-knowledge/types";
import { Button, Typography } from "@/components/common";
import {
  useAiAssistantKbSourceChunksQuery,
  useAiChatbotSourceChunksQuery,
} from "@/lib/hooks/query/ai-knowledge";
import { formatSourceRefForDisplay, isWebSourceType, sourceTypeHumanLabel } from "./ai-training-kb.utils";
import type { AiTrainingKbVariant } from "./ai-training-kb.utils";

const CHUNK_PAGE = 30;

function groupChunksByPage(items: KnowledgeChunkPreviewItem[]) {
  const pages = new Map<string, KnowledgeChunkPreviewItem[]>();
  const other: KnowledgeChunkPreviewItem[] = [];

  for (const item of items) {
    if (item.faqQuestion || item.faqAnswer) {
      other.push(item);
      continue;
    }
    const key = item.pageUrl ?? item.pageTitle ?? "general";
    const list = pages.get(key) ?? [];
    list.push(item);
    pages.set(key, list);
  }

  return { pages: [...pages.entries()], faqItems: other };
}

export function AiTrainingSourcePreview({
  variant,
  sourceId,
  sourceMeta,
  onClose,
}: {
  variant: AiTrainingKbVariant;
  sourceId: string;
  sourceMeta: {
    sourceType: string;
    sourceRef: string;
    title: string | null;
    status: string;
    chunkCount?: number;
  };
  onClose: () => void;
}) {
  const theme = useTheme() as AppTheme;
  const [offset, setOffset] = useState(0);
  const isChatbot = variant === "chatbot";

  const chatbotQ = useAiChatbotSourceChunksQuery(sourceId, { limit: CHUNK_PAGE, offset }, { enabled: isChatbot });
  const assistantQ = useAiAssistantKbSourceChunksQuery(sourceId, { limit: CHUNK_PAGE, offset }, { enabled: !isChatbot });
  const query = isChatbot ? chatbotQ : assistantQ;

  const items = query.data?.items ?? [];
  const total = query.data?.total ?? sourceMeta.chunkCount ?? 0;
  const grouped = useMemo(() => groupChunksByPage(items), [items]);

  const isWeb = isWebSourceType(sourceMeta.sourceType);
  const isFaq = sourceMeta.sourceType === "FAQ";

  return (
    <Box
      sx={{
        mt: 2,
        p: 2,
        borderRadius: 2,
        border: `1px solid ${theme.app.dashboard.cardBorder}`,
        bgcolor: "rgba(0,0,0,0.2)",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1, mb: 1.5 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={700} color="white">
            Preview: {formatSourceRefForDisplay(sourceMeta)}
          </Typography>
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
            {sourceTypeHumanLabel(sourceMeta.sourceType)} · {total} indexed piece{total === 1 ? "" : "s"}
          </Typography>
        </Box>
        <Button type="button" variant="secondary" size="small" onClick={onClose}>
          Close
        </Button>
      </Box>

      {query.isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress size={28} />
        </Box>
      ) : query.isError ? (
        <Typography variant="body2" sx={{ color: theme.palette.error.light }}>
          Could not load preview. Try Reindex if the source just finished.
        </Typography>
      ) : total === 0 ? (
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
          No indexed content yet. Status: {sourceMeta.status}.
        </Typography>
      ) : isFaq && grouped.faqItems.length > 0 ? (
        <Stack spacing={1}>
          {grouped.faqItems.map((item) => (
            <Box
              key={item.id}
              sx={{
                p: 1.25,
                borderRadius: 1.5,
                bgcolor: "rgba(255,255,255,0.04)",
                border: `1px solid ${theme.app.dashboard.cardBorder}`,
              }}
            >
              <Typography variant="caption" fontWeight={700} sx={{ color: theme.app.dashboard.accentBlue }}>
                Q
              </Typography>
              <Typography variant="body2" sx={{ color: theme.app.text.primary, mb: 0.75 }}>
                {item.faqQuestion ?? item.contentPreview.split("\n")[0]}
              </Typography>
              <Typography variant="caption" fontWeight={700} sx={{ color: theme.palette.success.light }}>
                A
              </Typography>
              <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                {item.faqAnswer ?? item.contentPreview}
              </Typography>
            </Box>
          ))}
        </Stack>
      ) : isWeb && grouped.pages.length > 0 ? (
        <Stack spacing={1.5}>
          {grouped.pages.map(([pageKey, chunks]) => (
            <Box key={pageKey}>
              <Typography variant="caption" fontWeight={700} sx={{ color: theme.app.dashboard.accentBlue, display: "block", mb: 0.5 }}>
                {chunks[0]?.pageTitle ?? pageKey}
              </Typography>
              {chunks[0]?.pageUrl ? (
                <Typography
                  variant="caption"
                  sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 0.75, wordBreak: "break-all" }}
                >
                  {chunks[0].pageUrl}
                </Typography>
              ) : null}
              <Chip label={`${chunks.length} snippet${chunks.length === 1 ? "" : "s"}`} size="small" sx={{ mb: 0.75 }} />
              {chunks.slice(0, 2).map((c) => (
                <Typography
                  key={c.id}
                  variant="caption"
                  component="p"
                  sx={{
                    color: theme.app.dashboard.textMuted,
                    mt: 0.5,
                    lineHeight: 1.5,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {c.contentPreview}
                </Typography>
              ))}
              {chunks.length > 2 ? (
                <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                  + {chunks.length - 2} more snippets on this page
                </Typography>
              ) : null}
            </Box>
          ))}
        </Stack>
      ) : (
        <Stack spacing={1}>
          {items.map((item) => (
            <Box
              key={item.id}
              sx={{
                p: 1.25,
                borderRadius: 1.5,
                bgcolor: "rgba(255,255,255,0.04)",
              }}
            >
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, whiteSpace: "pre-wrap" }}>
                {item.contentPreview}
              </Typography>
            </Box>
          ))}
        </Stack>
      )}

      {total > CHUNK_PAGE ? (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 2 }}>
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
            Showing {offset + 1}–{Math.min(offset + items.length, total)} of {total}
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              type="button"
              variant="secondary"
              size="small"
              disabled={offset <= 0 || query.isFetching}
              onClick={() => setOffset(Math.max(0, offset - CHUNK_PAGE))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="small"
              disabled={offset + CHUNK_PAGE >= total || query.isFetching}
              onClick={() => setOffset(offset + CHUNK_PAGE)}
            >
              Next
            </Button>
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}
