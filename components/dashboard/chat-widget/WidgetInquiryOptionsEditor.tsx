"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AddRounded from "@mui/icons-material/AddRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { getWebsiteAssignmentDetail } from "@/api/website-assignments/website-assignments.api";
import { unwrapApiData } from "@/lib/utils/core";
import { Button, InputField, SelectField, Typography } from "@/components/common";
import {
  useDepartmentCatalogQuery,
  usePoolCatalogQuery,
} from "@/features/chat-settings/hooks/useChatSettings";
import {
  slugRoutingKeyFromLabel,
  type WidgetInquiryOption,
  type WidgetServiceChannel,
} from "@/lib/chat-widget/widget-inquiry.types";

function emptyRow(): WidgetInquiryOption {
  return {
    label: "",
    routingKey: "",
    serviceChannel: "internal",
    internalDepartmentId: null,
    externalDepartmentId: null,
    internalPoolId: null,
    externalPoolId: null,
  };
}

export type WidgetInquiryOptionsEditorProps = {
  websiteId: string | undefined;
  value: WidgetInquiryOption[];
  onChange: (rows: WidgetInquiryOption[]) => void;
  disabled?: boolean;
};

export function WidgetInquiryOptionsEditor({
  websiteId,
  value,
  onChange,
  disabled = false,
}: WidgetInquiryOptionsEditorProps) {
  const theme = useTheme() as AppTheme;
  const [parentCompanyId, setParentCompanyId] = useState("");

  useEffect(() => {
    const id = websiteId?.trim() ?? "";
    if (!id) {
      setParentCompanyId("");
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const res = await getWebsiteAssignmentDetail(id);
        const data = unwrapApiData(res) as { parentCompanyId?: string } | null;
        if (!cancelled) setParentCompanyId(String(data?.parentCompanyId ?? "").trim());
      } catch {
        if (!cancelled) setParentCompanyId("");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [websiteId]);

  const departmentsQuery = useDepartmentCatalogQuery(
    parentCompanyId,
    Boolean(parentCompanyId),
  );
  const poolsQuery = usePoolCatalogQuery(parentCompanyId, Boolean(parentCompanyId));

  const internalDepts = useMemo(
    () =>
      (departmentsQuery.data ?? []).filter((d) => d.departmentType === "Internal"),
    [departmentsQuery.data],
  );
  const externalDepts = useMemo(
    () =>
      (departmentsQuery.data ?? []).filter((d) => d.departmentType === "External"),
    [departmentsQuery.data],
  );

  const poolOptions = poolsQuery.data ?? [];

  const patchRow = useCallback(
    (index: number, patch: Partial<WidgetInquiryOption>) => {
      const next = value.map((row, i) => {
        if (i !== index) return row;
        const merged = { ...row, ...patch };
        if (patch.label !== undefined && !patch.routingKey) {
          merged.routingKey = slugRoutingKeyFromLabel(merged.label);
        }
        return merged;
      });
      onChange(next);
    },
    [onChange, value],
  );

  const addRow = () => onChange([...value, emptyRow()]);
  const removeRow = (index: number) => onChange(value.filter((_, i) => i !== index));

  const cardBorder = `1px solid ${theme.app.dashboard.cardBorder}`;
  const muted = theme.app.dashboard.textMuted;

  if (!websiteId?.trim()) {
    return (
      <Typography variant="body2" sx={{ color: muted }}>
        Select a website in the widget setup flow first — inquire options need a website to map
        departments.
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      <Typography variant="body2" sx={{ color: muted }}>
        Each option is shown on the widget before the form. Routing uses the key and department you
        set here (saved in the published widget config).
      </Typography>

      {value.length === 0 ? (
        <Box
          sx={{
            py: 2,
            px: 2,
            borderRadius: 1.5,
            border: cardBorder,
            bgcolor: theme.app.dashboard.cardBg,
          }}
        >
          <Typography variant="body2" sx={{ color: muted, mb: 1 }}>
            No inquire options yet.
          </Typography>
          <Button type="button" variant="secondary" onClick={addRow} disabled={disabled}>
            Add first option
          </Button>
        </Box>
      ) : null}

      {value.map((row, index) => {
        const channel = row.serviceChannel;
        const deptList = channel === "external" ? externalDepts : internalDepts;
        const deptId =
          channel === "external" ? row.externalDepartmentId : row.internalDepartmentId;
        const poolId = channel === "external" ? row.externalPoolId : row.internalPoolId;
        const poolsForDept = poolOptions.filter(
          (p) => !p.departmentId || p.departmentId === deptId,
        );

        return (
          <Box
            key={`inquiry-${index}`}
            sx={{
              p: 2,
              borderRadius: 1.5,
              border: cardBorder,
              bgcolor: theme.app.dashboard.cardBg,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1.5 }}
            >
              <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                Option {index + 1}
              </Typography>
              <IconButton
                size="small"
                aria-label="Remove inquire option"
                onClick={() => removeRow(index)}
                disabled={disabled}
              >
                <DeleteOutlineRounded fontSize="small" />
              </IconButton>
            </Stack>

            <Stack spacing={1.25}>
              <InputField
                label="Visitor label"
                value={row.label}
                onChange={(e) => patchRow(index, { label: e.target.value })}
                disabled={disabled}
                placeholder="e.g. Sales"
              />
              <InputField
                label="Routing key"
                value={row.routingKey}
                onChange={(e) =>
                  patchRow(index, { routingKey: slugRoutingKeyFromLabel(e.target.value) })
                }
                disabled={disabled}
                helperText="Used by chat routing (auto-filled from label if empty)."
              />
              <SelectField
                label="Visitor channel"
                value={channel}
                onChange={(v) => {
                  patchRow(index, { serviceChannel: v as WidgetServiceChannel });
                }}
                disabled={disabled}
                searchable={false}
                options={[
                  { value: "internal", label: "Internal" },
                  { value: "external", label: "External" },
                ]}
              />
              <SelectField
                label="Department"
                value={deptId ?? ""}
                onChange={(v) => {
                  const id = v || null;
                  if (channel === "external") {
                    patchRow(index, {
                      externalDepartmentId: id,
                      externalPoolId: null,
                    });
                  } else {
                    patchRow(index, {
                      internalDepartmentId: id,
                      internalPoolId: null,
                    });
                  }
                }}
                disabled={disabled || departmentsQuery.isLoading}
                options={[
                  { value: "", label: "Select department…" },
                  ...deptList.map((d) => ({ value: d.id, label: d.label })),
                ]}
              />
              <SelectField
                label="Pool (optional)"
                value={poolId ?? ""}
                onChange={(v) => {
                  const id = v || null;
                  if (channel === "external") {
                    patchRow(index, { externalPoolId: id });
                  } else {
                    patchRow(index, { internalPoolId: id });
                  }
                }}
                disabled={disabled || !deptId || poolsForDept.length === 0}
                options={[
                  { value: "", label: "No pool" },
                  ...poolsForDept.map((p) => ({ value: p.id, label: p.label })),
                ]}
              />
            </Stack>
          </Box>
        );
      })}

      <Button
        type="button"
        variant="secondary"
        startIcon={<AddRounded />}
        onClick={addRow}
        disabled={disabled}
        sx={{ alignSelf: "flex-start" }}
      >
        Add inquire option
      </Button>
    </Stack>
  );
}
