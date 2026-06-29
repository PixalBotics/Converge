"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ForumOutlined from "@mui/icons-material/ForumOutlined";
import Box from "@mui/material/Box";
import { useRouter } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { useAuth } from "@/lib/auth";
import { PermissionDeniedPanel } from "@/components/common";
import { needsChatScopeFilters, useChatApiGates } from "@/lib/permissions";
import { PAGE } from "@/lib/permissions/permission-constants";
import { OP } from "@/lib/permissions/operational-keys";
import {
  Button,
  DashboardCard,
  DataTable,
  TablePagination,
  Typography,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import {
  ChatLivePageHeader,
  ChatLivePageShell,
  calendarDateToIsoEnd,
  calendarDateToIsoStart,
  hasActiveChatScopeFilters,
  useChatScopeFilters,
} from "@/features/chat-shared";
import {
  overviewFooterRow,
  overviewIconBox,
  overviewPaginationWrapper,
  overviewTableCard,
  overviewTableCardHeader,
} from "@/app/dashboard/user-page/overview.styles";
import type { TranscriptListItem } from "@/services/chat/transcript.types";
import { agentDisplayName } from "@/services/chat/monitor-normalizers";
import type { TranscriptSearchField } from "@/services/chat/transcript.types";
import { useChatTranscripts } from "../hooks/useChatTranscripts";
import { useTranscriptSearchSuggestions } from "../hooks/useTranscriptSearchSuggestions";
import {
  isUuid,
  type TranscriptSearchKind,
  type TranscriptSearchSuggestion,
} from "../types";
import { ChatTranscriptsTableToolbar } from "./ChatTranscriptsTableToolbar";
import { TranscriptStatusChip } from "./TranscriptStatusChip";

function searchKindToField(kind: TranscriptSearchKind): TranscriptSearchField {
  return kind;
}

function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

export function ChatTranscriptsListWorkspace() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const { hasOperational, hasPage, permissionsSyncing } = useAuth();
  const gates = useChatApiGates();
  const hasPageAccess =
    hasPage(PAGE.CHAT_MONITOR) ||
    hasPage(PAGE.CHAT_QA) ||
    hasPage(PAGE.CHAT) ||
    gates.monitor ||
    hasOperational(OP.qa.chatReview);
  const apiEnabled = gates.ready && hasPageAccess;

  const scopeFilters = useChatScopeFilters(undefined, { apiEnabled });
  const showScopeFilters = needsChatScopeFilters(
    hasOperational,
    scopeFilters.canFilterByResellerId,
  );

  const transcripts = useChatTranscripts(null, { apiEnabled });

  const [searchKind, setSearchKind] = useState<TranscriptSearchKind>("agent");
  const [searchInput, setSearchInput] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] = useState<
    TranscriptSearchSuggestion | undefined
  >(undefined);

  const listScope = useMemo(
    () => ({
      resellerId: scopeFilters.filters.resellerId || undefined,
      parentCompanyId: scopeFilters.filters.parentCompanyId || undefined,
      childCompanyId: scopeFilters.filters.childCompanyId || undefined,
      websiteId: scopeFilters.filters.websiteId || undefined,
    }),
    [
      scopeFilters.filters.resellerId,
      scopeFilters.filters.parentCompanyId,
      scopeFilters.filters.childCompanyId,
      scopeFilters.filters.websiteId,
    ],
  );

  const { suggestions, isLoading: isSuggestionsLoading } = useTranscriptSearchSuggestions({
    kind: searchKind,
    query: searchInput,
    enabled: apiEnabled,
    listScope,
  });

  useEffect(() => {
    transcripts.patchFilters({
      resellerId: listScope.resellerId,
      parentCompanyId: listScope.parentCompanyId,
      childCompanyId: listScope.childCompanyId,
      websiteId: listScope.websiteId,
      from: calendarDateToIsoStart(scopeFilters.filters.dateFrom) || undefined,
      to: calendarDateToIsoEnd(scopeFilters.filters.dateTo) || undefined,
    });
  }, [
    listScope.resellerId,
    listScope.parentCompanyId,
    listScope.childCompanyId,
    listScope.websiteId,
    scopeFilters.filters.dateFrom,
    scopeFilters.filters.dateTo,
    transcripts.patchFilters,
  ]);

  const scopeTenantKey = `${listScope.resellerId ?? ""}|${listScope.parentCompanyId ?? ""}|${listScope.childCompanyId ?? ""}|${listScope.websiteId ?? ""}`;
  const prevScopeTenantKey = useRef(scopeTenantKey);

  useEffect(() => {
    if (prevScopeTenantKey.current === scopeTenantKey) return;
    prevScopeTenantKey.current = scopeTenantKey;
    transcripts.patchFilters({
      agentId: undefined,
      search: undefined,
      searchField: undefined,
      conversationId: undefined,
    });
    setSelectedSuggestion(undefined);
  }, [scopeTenantKey, transcripts.patchFilters]);

  const applyScopeSearch = useCallback(
    (kind: TranscriptSearchKind, suggestion: TranscriptSearchSuggestion) => {
      switch (kind) {
        case "reseller":
          scopeFilters.patchFilters({
            resellerId: suggestion.id,
            parentCompanyId: "",
            childCompanyId: "",
            websiteId: "",
          });
          break;
        case "parentCompany":
          scopeFilters.patchFilters({
            parentCompanyId: suggestion.id,
            childCompanyId: "",
            websiteId: "",
          });
          break;
        case "childCompany":
          scopeFilters.patchFilters({
            childCompanyId: suggestion.id,
            websiteId: "",
          });
          break;
        case "website":
          scopeFilters.patchFilters({ websiteId: suggestion.id });
          break;
        case "agent":
          transcripts.patchFilters({
            agentId: suggestion.id,
            search: undefined,
            searchField: undefined,
            conversationId: undefined,
          });
          break;
        case "conversationId":
          transcripts.patchFilters({
            conversationId: suggestion.id,
            search: undefined,
            searchField: undefined,
            agentId: undefined,
          });
          break;
        default:
          break;
      }
    },
    [scopeFilters.patchFilters, transcripts.patchFilters],
  );

  const runSearch = useCallback(() => {
    const text = searchInput.trim();
    const baseClear = {
      search: undefined as string | undefined,
      searchField: undefined as TranscriptSearchField | undefined,
      conversationId: undefined as string | undefined,
      agentId: undefined as string | undefined,
    };

    if (selectedSuggestion?.id) {
      if (searchKind === "agent" || searchKind === "conversationId") {
        applyScopeSearch(searchKind, selectedSuggestion);
        return;
      }
      applyScopeSearch(searchKind, selectedSuggestion);
      transcripts.patchFilters(baseClear);
      return;
    }

    if (!text) {
      transcripts.patchFilters(baseClear);
      return;
    }

    switch (searchKind) {
      case "agent":
        transcripts.patchFilters({
          ...baseClear,
          searchField: "agent",
          search: text,
        });
        break;
      case "conversationId":
        transcripts.patchFilters({
          ...baseClear,
          ...(isUuid(text)
            ? { conversationId: text }
            : { searchField: "conversationId", search: text }),
        });
        break;
      default:
        transcripts.patchFilters({
          ...baseClear,
          searchField: searchKindToField(searchKind),
          search: text,
        });
    }
  }, [applyScopeSearch, searchInput, searchKind, selectedSuggestion, transcripts.patchFilters]);

  useEffect(() => {
    if (searchInput.trim().length > 0) return;
    const hasTextFilters =
      Boolean(transcripts.listFilters.search?.trim()) ||
      Boolean(transcripts.listFilters.conversationId?.trim()) ||
      Boolean(transcripts.listFilters.agentId?.trim());
    if (!hasTextFilters) return;
    setSelectedSuggestion(undefined);
    transcripts.patchFilters({
      search: undefined,
      searchField: undefined,
      conversationId: undefined,
      agentId: undefined,
    });
  }, [searchInput, transcripts.listFilters, transcripts.patchFilters]);

  const resetAllFilters = useCallback(() => {
    scopeFilters.resetFilters();
    setSearchInput("");
    setSelectedSuggestion(undefined);
    transcripts.patchFilters({
      search: undefined,
      searchField: undefined,
      conversationId: undefined,
      agentId: undefined,
      from: undefined,
      to: undefined,
    });
  }, [scopeFilters.resetFilters, transcripts.patchFilters]);

  const columns = useMemo<DataTableColumn<Record<string, unknown>>[]>(
    () => [
      {
        id: "visitor",
        label: "Visitor",
        render: (_, row) => {
          const r = row as unknown as TranscriptListItem;
          return (
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>
                {r.visitorPresentation?.displayName ??
                  r.visitorPresentation?.inboxTitle ??
                  "Visitor"}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                {r.id.slice(0, 8)}…
              </Typography>
            </Box>
          );
        },
      },
      {
        id: "reseller",
        label: "Reseller",
        render: (_, row) => (row as unknown as TranscriptListItem).reseller?.name ?? "—",
      },
      {
        id: "parentCompany",
        label: "Parent",
        render: (_, row) => (row as unknown as TranscriptListItem).parentCompany?.name ?? "—",
      },
      {
        id: "childCompany",
        label: "Child",
        render: (_, row) => (row as unknown as TranscriptListItem).childCompany?.name ?? "—",
      },
      {
        id: "website",
        label: "Website",
        render: (_, row) => {
          const w = (row as unknown as TranscriptListItem).website;
          return w?.name ?? w?.url ?? "—";
        },
      },
      {
        id: "agent",
        label: "Agent",
        render: (_, row) => {
          const r = row as unknown as TranscriptListItem;
          if (r.agent) return agentDisplayName(r.agent);
          return r.resolvedAgentLabel ?? "—";
        },
      },
      {
        id: "status",
        label: "Status",
        render: (_, row) => (
          <TranscriptStatusChip row={row as unknown as TranscriptListItem} />
        ),
      },
      {
        id: "messageCount",
        label: "Msgs",
        align: "center",
        render: (_, row) => String((row as unknown as TranscriptListItem).messageCount),
      },
      {
        id: "startedAt",
        label: "Started",
        render: (_, row) =>
          formatDateTime((row as unknown as TranscriptListItem).startedAt),
      },
    ],
    [theme],
  );

  const filterPopoverActive = showScopeFilters
    ? hasActiveChatScopeFilters(scopeFilters.filters)
    : Boolean(scopeFilters.filters.dateFrom.trim() || scopeFilters.filters.dateTo.trim());

  if (!permissionsSyncing && !hasPageAccess) {
    return (
      <PermissionDeniedPanel
        title="Chat transcripts"
        description="Requires page:chat-monitor, page:chat-qa, or chat monitor / QA permissions."
      />
    );
  }

  return (
    <ChatLivePageShell>
      <ChatLivePageHeader
        title="Chat transcripts"
        subtitle="Search by reseller, website, agent, or chat ID. Use Filters for tenant scope and date range."
        navPreset="none"
        hideBottomBorder
      />

      <DashboardCard sx={overviewTableCard}>
        <Box sx={overviewTableCardHeader}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={overviewIconBox}>
              <ForumOutlined sx={{ fontSize: 20, color: "white" }} />
            </Box>
            <Box>
              <Typography variant="mediumLarge" color="white" fontWeight={600}>
                Conversations
              </Typography>
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                {transcripts.total} total
              </Typography>
            </Box>
          </Box>

          <ChatTranscriptsTableToolbar
            searchKind={searchKind}
            onSearchKindChange={(kind) => {
              setSearchKind(kind);
              setSelectedSuggestion(undefined);
            }}
            searchInput={searchInput}
            onSearchInputChange={setSearchInput}
            suggestions={suggestions}
            selectedSuggestion={selectedSuggestion}
            onSelectedSuggestionChange={setSelectedSuggestion}
            isSuggestionsLoading={isSuggestionsLoading}
            onSearch={runSearch}
            scopeFilters={scopeFilters.filters}
            onScopePatch={scopeFilters.patchFilters}
            onScopeReset={resetAllFilters}
            canFilterByResellerId={scopeFilters.canFilterByResellerId}
            resellerOptions={scopeFilters.resellerOptions}
            parentCompanyOptions={scopeFilters.parentCompanyOptions}
            childCompanyOptions={scopeFilters.childCompanyOptions}
            websiteOptions={scopeFilters.websiteOptions}
            showScopeFilters={showScopeFilters}
          />
        </Box>

        <DataTable
          columns={columns}
          rows={transcripts.items as unknown as Record<string, unknown>[]}
          getRowId={(row) => String(row.id ?? "")}
          isLoading={transcripts.listQuery.isLoading}
          minWidth={980}
          emptyState={{
            description: transcripts.listQuery.isError
              ? "Could not load transcripts."
              : filterPopoverActive ||
                  Boolean(transcripts.listFilters.search) ||
                  Boolean(transcripts.listFilters.searchField) ||
                  Boolean(transcripts.listFilters.agentId) ||
                  Boolean(transcripts.listFilters.conversationId)
                ? "No conversations match your filters."
                : "No conversations yet.",
          }}
          actionColumn={{
            label: "View",
            align: "right",
            render: (row) => {
              const id = String(row.id ?? "");
              return (
                <Button
                  type="button"
                  variant="secondary"
                  size="compact"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!id) return;
                    router.push(`/dashboard/chat-transcripts/${encodeURIComponent(id)}`);
                  }}
                >
                  View
                </Button>
              );
            },
          }}
          onRowClick={(row) => {
            const id = String(row.id ?? "");
            if (id) router.push(`/dashboard/chat-transcripts/${encodeURIComponent(id)}`);
          }}
        />

        <Box sx={overviewFooterRow}>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
            Page {transcripts.page} of {Math.max(1, transcripts.totalPages)} · {transcripts.total}{" "}
            conversations
          </Typography>
          <Box sx={overviewPaginationWrapper}>
            <TablePagination
              page={transcripts.page}
              pageCount={Math.max(1, transcripts.totalPages)}
              onPageChange={transcripts.setPage}
            />
          </Box>
        </Box>
      </DashboardCard>
    </ChatLivePageShell>
  );
}
