"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { DashboardCard, Typography } from "@/components/common";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions/operational-keys";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import {
  useCreateChatRouteMutation,
  useDeleteChatRouteMutation,
  useDepartmentCatalogQuery,
  usePatchChatRouteMutation,
  usePoolCatalogQuery,
  useReplaceDepartmentEmailsMutation,
  useSaveWebsiteChatSettingsMutation,
  useWebsiteChatSettingsQuery,
} from "../hooks/useChatSettings";
import type { ChatSettingsWebsiteOption } from "../types";
import { DepartmentEmailsTab } from "./DepartmentEmailsTab";
import { GeneralOperationsTab } from "./GeneralOperationsTab";
import { QaPolicyTab } from "./QaPolicyTab";
import { RoutingRulesTab } from "./RoutingRulesTab";
import { QaRosterTab } from "./QaRosterTab";

type SettingsTab = "general" | "routing" | "qa-policy" | "qa-team" | "emails";

export function ChatSettingsWebsiteWorkspace({
  websiteId,
  websiteMeta = null,
}: {
  websiteId: string;
  websiteMeta?: ChatSettingsWebsiteOption | null;
}) {
  const theme = useTheme() as AppTheme;
  const { hasOperational } = useAuth();
  const canEdit = hasOperational(OP.chatWidget.update);

  const [tab, setTab] = useState<SettingsTab>("general");

  const settingsQuery = useWebsiteChatSettingsQuery(websiteId);
  const bundle = settingsQuery.data;
  const parentCompanyId = bundle?.parentCompanyId ?? websiteMeta?.parentCompanyId ?? "";

  const departmentsQuery = useDepartmentCatalogQuery(parentCompanyId, Boolean(parentCompanyId));
  const poolsQuery = usePoolCatalogQuery(parentCompanyId, Boolean(parentCompanyId));

  const saveSettings = useSaveWebsiteChatSettingsMutation(websiteId);
  const createRoute = useCreateChatRouteMutation(websiteId);
  const patchRoute = usePatchChatRouteMutation(websiteId);
  const deleteRoute = useDeleteChatRouteMutation(websiteId);
  const saveEmails = useReplaceDepartmentEmailsMutation(websiteId);
  const departments = departmentsQuery.data ?? [];
  const pools = poolsQuery.data ?? [];

  const busy =
    saveSettings.isPending ||
    createRoute.isPending ||
    patchRoute.isPending ||
    deleteRoute.isPending ||
    saveEmails.isPending;

  const notifyError = (e: unknown) => {
    publishAppToast({
      message: extractApiErrorMessageForToast(e, "Request failed"),
      variant: "error",
    });
  };

  const saveSettingsBody = (body: Parameters<typeof saveSettings.mutate>[0]) => {
    saveSettings.mutate(body, {
      onSuccess: () => publishAppToast({ message: "Settings saved", variant: "success" }),
      onError: notifyError,
    });
  };

  if (settingsQuery.isLoading) {
    return (
      <Typography sx={{ color: theme.app.dashboard.textMuted, py: 4 }}>
        Loading chat settings for website…
      </Typography>
    );
  }

  if (settingsQuery.isError || !bundle) {
    return (
      <DashboardCard sx={{ p: 3 }}>
        <Typography sx={{ color: theme.palette.error.light, mb: 1 }}>
          Could not load settings — check{" "}
          <Typography component="span" sx={{ fontFamily: "monospace", fontSize: 13 }}>
            GET /chat/settings/websites/{websiteId.slice(0, 8)}…
          </Typography>{" "}
          and <Typography component="span">chat-widget:view</Typography> permission.
        </Typography>
      </DashboardCard>
    );
  }

  const breadcrumb = [
    websiteMeta?.parentCompanyName,
    websiteMeta?.childCompanyName,
    websiteMeta?.name || websiteMeta?.url,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, minHeight: 0, flex: 1 }}>
      {breadcrumb ? (
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
          {breadcrumb}
        </Typography>
      ) : null}

      {!canEdit ? (
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
          View only — you need chat-widget:update to save changes.
        </Typography>
      ) : null}

      <DashboardCard sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v as SettingsTab)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: "divider", mb: 2, flexShrink: 0 }}
        >
          <Tab value="general" label="General" />
          <Tab value="routing" label="Routing" />
          <Tab value="qa-policy" label="QA policy" />
          <Tab value="qa-team" label="QA team" />
          <Tab value="emails" label="Emails" />
        </Tabs>

        <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
          {tab === "general" ? (
            <GeneralOperationsTab
              settings={bundle.settings}
              departments={departments}
              canEdit={canEdit}
              saving={saveSettings.isPending}
              onSave={saveSettingsBody}
            />
          ) : null}

          {tab === "routing" ? (
            <RoutingRulesTab
              routes={bundle.routes}
              departments={departments}
              pools={pools}
              canEdit={canEdit}
              busy={busy}
              onCreate={(body) => {
                createRoute.mutate(body, {
                  onSuccess: () =>
                    publishAppToast({ message: "Route created", variant: "success" }),
                  onError: notifyError,
                });
              }}
              onPatch={(routeId, body) => {
                patchRoute.mutate(
                  { routeId, body },
                  {
                    onSuccess: () =>
                      publishAppToast({ message: "Route updated", variant: "success" }),
                    onError: notifyError,
                  },
                );
              }}
              onDelete={(routeId) => {
                deleteRoute.mutate(routeId, {
                  onSuccess: () =>
                    publishAppToast({ message: "Route deleted", variant: "success" }),
                  onError: notifyError,
                });
              }}
            />
          ) : null}

          {tab === "qa-policy" ? (
            <QaPolicyTab
              settings={bundle.settings}
              canEdit={canEdit}
              saving={saveSettings.isPending}
              onSave={saveSettingsBody}
            />
          ) : null}

          {tab === "qa-team" ? <QaRosterTab websiteId={websiteId} /> : null}

          {tab === "emails" ? (
            <DepartmentEmailsTab
              rows={bundle.departmentNotifyEmails}
              departments={departments}
              canEdit={canEdit}
              saving={saveEmails.isPending}
              onSave={(items) => {
                saveEmails.mutate(
                  { items },
                  {
                    onSuccess: () =>
                      publishAppToast({ message: "Department emails saved", variant: "success" }),
                    onError: notifyError,
                  },
                );
              }}
            />
          ) : null}
        </Box>
      </DashboardCard>
    </Box>
  );
}
