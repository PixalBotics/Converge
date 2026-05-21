"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { DashboardCard, Typography } from "@/components/common";
import {
  ChatScopeFiltersPanel,
  useChatScopeFilters,
} from "@/features/chat-shared";
import { chatLiveFilterCardSx, chatLivePageStackSx } from "@/features/chat-shared/styles/chat-live.styles";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions/operational-keys";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import type { ChatSettingsWebsiteOption } from "../types";
import { ChatSettingsWebsiteWorkspace } from "./ChatSettingsWebsiteWorkspace";
import { CannedResponsesTab } from "./CannedResponsesTab";

type PageTab = "settings" | "canned";

export function ChatSettingsWorkspace() {
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasOperational } = useAuth();
  const canEdit = hasOperational(OP.chatWidget.update);

  const initialWebsiteId = searchParams.get("website")?.trim() ?? "";
  const initialTab = searchParams.get("tab") === "canned" ? "canned" : "settings";

  const scopeFilters = useChatScopeFilters(
    initialWebsiteId ? { websiteId: initialWebsiteId } : undefined,
  );

  const [pageTab, setPageTab] = useState<PageTab>(initialTab);

  const selectedWebsiteId = scopeFilters.filters.websiteId.trim();

  const selectedWebsite = useMemo((): ChatSettingsWebsiteOption | null => {
    if (!selectedWebsiteId) return null;
    const opt = scopeFilters.websiteOptions.find((o) => o.value === selectedWebsiteId);
    const label = opt?.label ?? selectedWebsiteId.slice(0, 8);
    const name = label.split(" · ")[0]?.trim() ?? label;
    return {
      websiteId: selectedWebsiteId,
      widgetKey: "",
      name,
      url: label.includes(" · ") ? (label.split(" · ").pop()?.trim() ?? "") : "",
      parentCompanyId: scopeFilters.filters.parentCompanyId,
      childCompanyId: scopeFilters.filters.childCompanyId,
      parentCompanyName: "",
      childCompanyName: "",
      resellerName: "",
    };
  }, [
    scopeFilters.filters.childCompanyId,
    scopeFilters.filters.parentCompanyId,
    scopeFilters.filters.websiteId,
    scopeFilters.websiteOptions,
    selectedWebsiteId,
  ]);

  useEffect(() => {
    setPageTab(searchParams.get("tab") === "canned" ? "canned" : "settings");
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedWebsiteId) params.set("website", selectedWebsiteId);
    else params.delete("website");
    const qs = params.toString();
    const next = qs ? `/dashboard/chat-settings?${qs}` : "/dashboard/chat-settings";
    const current = qs
      ? `/dashboard/chat-settings?${searchParams.toString()}`
      : "/dashboard/chat-settings";
    if (next !== current) {
      router.replace(next, { scroll: false });
    }
  }, [router, searchParams, selectedWebsiteId]);

  const syncTabUrl = (tab: PageTab) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "canned") params.set("tab", "canned");
    else params.delete("tab");
    const qs = params.toString();
    router.replace(qs ? `/dashboard/chat-settings?${qs}` : "/dashboard/chat-settings", {
      scroll: false,
    });
  };

  const handlePageTab = (tab: PageTab) => {
    setPageTab(tab);
    syncTabUrl(tab);
  };

  const scopeReadyForWebsite =
    Boolean(scopeFilters.filters.parentCompanyId.trim()) &&
    Boolean(scopeFilters.filters.childCompanyId.trim());

  const notifyError = (e: unknown) => {
    publishAppToast({
      message: extractApiErrorMessageForToast(e, "Request failed"),
      variant: "error",
    });
  };

  return (
    <Box sx={chatLivePageStackSx}>
      <Box sx={{ flexShrink: 0 }}>
        <Typography variant="regularLarge" fontWeight={700} sx={{ color: theme.app.text.primary }}>
          Chat settings
        </Typography>
        <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, mt: 0.35, maxWidth: 720 }}>
          Configure routing, QA policy, and operations per website. Manage canned quick replies per
          website for the agent inbox.
        </Typography>
      </Box>

      <Tabs
        value={pageTab}
        onChange={(_, v) => handlePageTab(v as PageTab)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: "divider", flexShrink: 0 }}
      >
        <Tab value="settings" label="Website settings" />
        <Tab value="canned" label="Canned messages" />
      </Tabs>

      <Box sx={chatLiveFilterCardSx}>
        <ChatScopeFiltersPanel
          filters={scopeFilters.filters}
          onPatch={scopeFilters.patchFilters}
          onReset={scopeFilters.resetFilters}
          canFilterByResellerId={scopeFilters.canFilterByResellerId}
          resellerOptions={scopeFilters.resellerOptions}
          parentCompanyOptions={scopeFilters.parentCompanyOptions}
          childCompanyOptions={scopeFilters.childCompanyOptions}
          websiteOptions={scopeFilters.websiteOptions}
          hint={
            pageTab === "canned"
              ? "Filter canned messages: reseller → parent company → child company → website (optional)."
              : "Select reseller → parent company → child company → website to configure that site."
          }
        />
        {scopeFilters.websitesLoading ? (
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, mt: 1 }}>
            Loading websites…
          </Typography>
        ) : null}
        {pageTab === "settings" && !scopeReadyForWebsite ? (
          <Typography sx={{ color: theme.palette.warning.main, mt: 1, fontSize: 13 }}>
            Select parent and child company above, then pick a website.
          </Typography>
        ) : null}
        {pageTab === "settings" && selectedWebsite ? (
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, mt: 1, display: "block" }}>
            Configuring websiteId: {selectedWebsite.websiteId}
          </Typography>
        ) : null}
      </Box>

      {pageTab === "settings" ? (
        <>
          <DashboardCard
            sx={{
              p: 2,
              display: "flex",
              gap: 1,
              alignItems: "flex-start",
              bgcolor: "rgba(59,130,246,0.08)",
              border: `1px solid ${theme.app.dashboard.cardBorder}`,
            }}
          >
            <InfoOutlined sx={{ fontSize: 18, color: theme.app.dashboard.accentBlue, mt: 0.2 }} />
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.5 }}>
              Live chat socket error &quot;Agent is not permitted for this website&quot; is fixed under{" "}
              <Typography
                component={Link}
                href="/dashboard/website-assigning"
                variant="caption"
                sx={{ color: theme.app.dashboard.accentBlue, textDecoration: "underline" }}
              >
                Website Assignments
              </Typography>{" "}
              (Primary/Secondary/Backup agents).
            </Typography>
          </DashboardCard>

          {!selectedWebsiteId ? (
            <DashboardCard sx={{ p: 4, textAlign: "center" }}>
              <Typography sx={{ color: theme.app.dashboard.textMuted }}>
                Use the filters above: reseller → parent → child → website, then settings load here.
              </Typography>
            </DashboardCard>
          ) : (
            <ChatSettingsWebsiteWorkspace websiteId={selectedWebsiteId} websiteMeta={selectedWebsite} />
          )}
        </>
      ) : (
        <CannedResponsesTab
          filters={scopeFilters.filters}
          canFilterByResellerId={scopeFilters.canFilterByResellerId}
          canEdit={canEdit}
          onNotifyError={notifyError}
          onNotifySuccess={(message) => publishAppToast({ message, variant: "success" })}
        />
      )}
    </Box>
  );
}
