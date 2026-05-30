"use client";

import { useCallback, useMemo } from "react";
import Save from "@mui/icons-material/Save";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, SelectField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  VisitorTopicsEditor,
  type VisitorTopicEditorRow,
} from "@/features/chat-settings/components/VisitorTopicsEditor";
import { useDepartmentCatalogQuery } from "@/features/chat-settings/hooks/useChatSettings";
import { useSaveVisitorTopicsMutation } from "@/features/chat-settings/hooks/useServiceScheduling";
import type { DepartmentCatalogOption } from "@/features/chat-settings/utils/catalog";
import { useWebsiteAssignmentDetailQuery } from "@/lib/hooks";
import { parseWebsiteAssignmentDetail } from "@/lib/website-assignments/roster-payload";
import {
  schedulingTopicToWidgetInquiry,
  validateVisitorTopicsForSave,
  widgetInquiryToTopicInput,
} from "@/lib/chat-widget/visitor-topics.mapper";
import {
  slugRoutingKeyFromLabel,
  type WidgetInquiryOption,
  type WidgetServiceChannel,
} from "@/lib/chat-widget/widget-inquiry.types";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";

function inferServiceChannel(
  row: VisitorTopicEditorRow,
  fallback: WidgetServiceChannel = "internal",
): WidgetServiceChannel {
  const hasInternal = Boolean(row.internalDepartmentId.trim());
  const hasExternal = Boolean(row.externalDepartmentId.trim());
  if (hasInternal && !hasExternal) return "internal";
  if (hasExternal && !hasInternal) return "external";
  return fallback;
}

function toEditorRow(option: WidgetInquiryOption): VisitorTopicEditorRow {
  return {
    routingKey: option.routingKey,
    clientLabel: option.label,
    internalDepartmentId: option.internalDepartmentId ?? "",
    externalDepartmentId: option.externalDepartmentId ?? "",
  };
}

function fromEditorRow(row: VisitorTopicEditorRow, prev?: WidgetInquiryOption): WidgetInquiryOption {
  const label = row.clientLabel.trim();
  const routingKey =
    row.routingKey.trim() || (label ? slugRoutingKeyFromLabel(label) : "");
  return {
    label,
    routingKey: routingKey ? slugRoutingKeyFromLabel(routingKey) : "",
    serviceChannel: inferServiceChannel(row, prev?.serviceChannel ?? "internal"),
    internalDepartmentId: row.internalDepartmentId.trim() || null,
    externalDepartmentId: row.externalDepartmentId.trim() || null,
    internalPoolId: null,
    externalPoolId: null,
  };
}

export type WidgetInquiryOptionsEditorProps = {
  websiteId: string | undefined;
  value: WidgetInquiryOption[];
  onChange: (rows: WidgetInquiryOption[]) => void;
  disabled?: boolean;
  topicsLoading?: boolean;
  loadedFromScheduling?: boolean;
  onSaved?: (rows: WidgetInquiryOption[]) => void;
  inquiryFallbackRoutingKey?: string;
  onFallbackRoutingKeyChange?: (routingKey: string) => void;
};

export function WidgetInquiryOptionsEditor({
  websiteId,
  value,
  onChange,
  disabled = false,
  topicsLoading = false,
  loadedFromScheduling = false,
  onSaved,
  inquiryFallbackRoutingKey = "",
  onFallbackRoutingKeyChange,
}: WidgetInquiryOptionsEditorProps) {
  const theme = useTheme() as AppTheme;
  const wid = websiteId?.trim() ?? "";

  const detailQuery = useWebsiteAssignmentDetailQuery(wid, { enabled: Boolean(wid) });
  const detail = useMemo(
    () => parseWebsiteAssignmentDetail(detailQuery.data),
    [detailQuery.data],
  );
  const parentCompanyId = detail?.parentCompanyId?.trim() ?? "";

  const departmentsQuery = useDepartmentCatalogQuery(
    { parentCompanyId },
    Boolean(parentCompanyId),
  );

  const saveMutation = useSaveVisitorTopicsMutation(wid);

  const departments = departmentsQuery.data ?? [];
  const internalDeptOptions = useMemo(
    () => departments.filter((d) => d.departmentType === "Internal"),
    [departments],
  );
  const externalDeptOptions = useMemo(
    () => departments.filter((d) => d.departmentType === "External"),
    [departments],
  );

  const editorRows = useMemo(() => value.map(toEditorRow), [value]);

  const fallbackTopicOptions = useMemo(
    () =>
      value
        .filter((o) => o.routingKey.trim())
        .map((o) => ({ label: o.label || o.routingKey, value: o.routingKey })),
    [value],
  );

  const resolvedFallbackKey =
    inquiryFallbackRoutingKey.trim() ||
    fallbackTopicOptions[0]?.value ||
    "";

  const handleEditorChange = useCallback(
    (rows: VisitorTopicEditorRow[]) => {
      onChange(rows.map((row, i) => fromEditorRow(row, value[i])));
    },
    [onChange, value],
  );

  const handleSave = () => {
    if (!wid || disabled) return;
    const err = validateVisitorTopicsForSave(value);
    if (err) {
      publishAppToast({ variant: "error", message: err });
      return;
    }
    saveMutation.mutate(
      { topics: value.map(widgetInquiryToTopicInput) },
      {
        onSuccess: (bundle) => {
          const saved = bundle.topics
            .filter((t) => t.isActive !== false)
            .map(schedulingTopicToWidgetInquiry);
          onChange(saved);
          onSaved?.(saved);
          publishAppToast({
            variant: "success",
            message: "Inquire topics saved (scheduling + widget JSON).",
          });
        },
        onError: (e) => {
          publishAppToast({
            variant: "error",
            message:
              extractApiErrorMessageForToast(e) ?? "Could not save inquiry topics.",
          });
        },
      },
    );
  };

  const muted = theme.app.dashboard.textMuted;

  if (!wid) {
    return (
      <Typography variant="body2" sx={{ color: muted }}>
        Select a website in the widget setup flow first — inquiry topics are saved per website.
      </Typography>
    );
  }

  if (topicsLoading || detailQuery.isLoading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 2 }}>
        <CircularProgress size={22} />
        <Typography variant="body2" sx={{ color: muted }}>
          Loading topics from service scheduling…
        </Typography>
      </Box>
    );
  }

  return (
    <>
      {loadedFromScheduling ? (
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.success.light,
            mb: 1.5,
            bgcolor: `${theme.palette.success.main}14`,
            border: `1px solid ${theme.palette.success.main}44`,
            borderRadius: 1.5,
            px: 1.5,
            py: 1,
          }}
        >
          Loaded from inquire topics for this website. Save writes scheduling DB and widget JSON
          (behavior.inquiryOptions) for the embed.
        </Typography>
      ) : (
        <Typography variant="body2" sx={{ color: muted, mb: 1.5 }}>
          Required for routing and agent assignment. Save updates visitor-topics and widget JSON.
        </Typography>
      )}
      {fallbackTopicOptions.length > 0 ? (
        <Box sx={{ mb: 2 }}>
          <SelectField
            label="Fallback topic (skip / general routing)"
            value={resolvedFallbackKey}
            onChange={(v) => onFallbackRoutingKeyChange?.(v)}
            options={fallbackTopicOptions}
            searchable={false}
            menuMaxRows={8}
          />
        </Box>
      ) : null}
      <VisitorTopicsEditor
        topics={editorRows}
        onChange={handleEditorChange}
        canEdit={!disabled && !saveMutation.isPending}
        showDepartmentCatalog
        departments={departments as DepartmentCatalogOption[]}
        departmentsLoading={departmentsQuery.isLoading}
        internalDeptOptions={internalDeptOptions}
        externalDeptOptions={externalDeptOptions}
        rowTitlePrefix="Topic"
        addLabel="Add topic"
        minRows={1}
      />
      <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="button"
          variant="primary"
          sx={gradientPrimaryButtonSx}
          startIcon={<Save sx={{ fontSize: 18 }} />}
          disabled={disabled || saveMutation.isPending || value.length === 0}
          onClick={handleSave}
        >
          {saveMutation.isPending ? "Saving…" : "Save inquiry topics"}
        </Button>
      </Box>
    </>
  );
}





