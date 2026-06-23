"use client";

import { useEffect, useMemo, useState } from "react";
import Save from "@mui/icons-material/Save";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { VisitorTopicsEditor } from "@/features/chat-settings/components/VisitorTopicsEditor";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import type { DepartmentCatalogOption } from "../utils/catalog";
import { SchedulingSectionCard } from "@/features/website-assignments/components/ServiceSchedulingSections";
import { scheduleFormActionBarSx } from "@/features/website-assignments/styles/website-assignment-ui.styles";
import {
  useSaveVisitorTopicsMutation,
  useVisitorTopicsQuery,
} from "../hooks/useServiceScheduling";
import {
  buildVisitorTopicsSaveBody,
  defaultSchedulingDraft,
  emptyTopic,
  topicsBundleToDraft,
  validateVisitorTopicsDraft,
} from "./service-scheduling-form.utils";
import type { ServiceSchedulingTopic } from "@/services/chat/service-scheduling.types";

export type InquireTopicsTabProps = {
  websiteId: string;
  departments: DepartmentCatalogOption[];
  departmentsLoading?: boolean;
  canView: boolean;
  canEdit: boolean;
  onSaved?: () => void;
};

export function InquireTopicsTab({
  websiteId,
  departments,
  departmentsLoading = false,
  canView,
  canEdit,
  onSaved,
}: InquireTopicsTabProps) {
  const theme = useTheme() as AppTheme;
  const visitorTopicsQuery = useVisitorTopicsQuery(websiteId, canView);
  const saveTopicsMutation = useSaveVisitorTopicsMutation(websiteId);
  const [topics, setTopics] = useState<ServiceSchedulingTopic[]>(() =>
    defaultSchedulingDraft().topics,
  );

  useEffect(() => {
    if (visitorTopicsQuery.data) {
      setTopics(topicsBundleToDraft(visitorTopicsQuery.data));
    }
  }, [visitorTopicsQuery.data]);

  const externalDeptOptions = useMemo(
    () =>
      departments
        .filter((d) => d.departmentType === "External")
        .map((d) => ({ id: d.id, label: d.label })),
    [departments],
  );

  const runSaveTopics = () => {
    const err = validateVisitorTopicsDraft(topics);
    if (err) {
      publishAppToast({ message: err, variant: "error" });
      return;
    }
    saveTopicsMutation.mutate(buildVisitorTopicsSaveBody(topics), {
      onSuccess: () => {
        publishAppToast({ message: "Inquire topics saved", variant: "success" });
        onSaved?.();
      },
      onError: (e) =>
        publishAppToast({
          message: extractApiErrorMessageForToast(e, "Could not save inquire topics"),
          variant: "error",
        }),
    });
  };

  if (!canView) {
    return (
      <Typography sx={{ color: theme.app.dashboard.textMuted }}>
        You need chat-widget:view or chat-widget:update to load inquire topics.
      </Typography>
    );
  }

  if (visitorTopicsQuery.isLoading) {
    return (
      <Typography sx={{ color: theme.app.dashboard.textMuted, py: 2 }}>
        Loading inquire topics…
      </Typography>
    );
  }

  if (visitorTopicsQuery.isError) {
    return (
      <Typography sx={{ color: theme.palette.error.light }}>
        Could not load inquire topics. Refresh and try again.
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0, maxWidth: 1040 }}>
      <Typography
        variant="body2"
        sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.55, mb: 2 }}
      >
        Optional inquire topics for <strong>external</strong> visitor routing. Internal chats use
        department assignments only — topics are not required for internal or team assignment.
      </Typography>

      <SchedulingSectionCard
        step={1}
        title="Visitor topics"
        subtitle="Saved per website (same rows as Chat Box Design → Inquiry topics)."
      >
        <VisitorTopicsEditor
          topics={topics.map((t) => ({
            routingKey: t.routingKey,
            clientLabel: t.clientLabel,
            internalDepartmentId: t.internalDepartmentId,
            externalDepartmentId: t.externalDepartmentId,
            internalPoolId: t.internalPoolId,
            externalPoolId: t.externalPoolId,
            isActive: t.isActive,
          }))}
          onChange={(rows) =>
            setTopics(
              rows.map((row, i) => ({
                ...emptyTopic(i),
                ...topics[i],
                routingKey: row.routingKey,
                clientLabel: row.clientLabel,
                internalDepartmentId: row.internalDepartmentId,
                externalDepartmentId: row.externalDepartmentId,
                internalPoolId: row.internalPoolId ?? null,
                externalPoolId: row.externalPoolId ?? null,
                isActive: row.isActive !== false,
                displayOrder: i,
              })),
            )
          }
          canEdit={canEdit}
          showDepartmentCatalog
          showActive
          departments={departments}
          departmentsLoading={departmentsLoading}
          internalDeptOptions={[]}
          externalDeptOptions={externalDeptOptions}
          externalDeptOnly
          minRows={1}
        />
      </SchedulingSectionCard>

      {canEdit ? (
        <Box sx={scheduleFormActionBarSx}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700} sx={{ color: theme.app.text.primary, mb: 0.35 }}>
              Save inquire topics
            </Typography>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.5 }}>
              Topics are required before agent roster assignment.
            </Typography>
          </Box>
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            startIcon={<Save sx={{ fontSize: 18 }} />}
            disabled={saveTopicsMutation.isPending}
            onClick={runSaveTopics}
          >
            {saveTopicsMutation.isPending ? "Saving…" : "Save inquire topics"}
          </Button>
        </Box>
      ) : null}
    </Box>
  );
}
