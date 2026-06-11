"use client";

import type { ReactNode } from "react";
import Add from "@mui/icons-material/Add";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Checkbox, InputField, SelectField, Typography } from "@/components/common";
import type { DepartmentCatalogOption } from "@/features/chat-settings/utils/catalog";
import { DepartmentCatalogPanel } from "@/features/website-assignments/components/ServiceSchedulingSections";

export type VisitorTopicEditorRow = {
  routingKey: string;
  clientLabel: string;
  internalDepartmentId: string;
  externalDepartmentId: string;
  internalPoolId?: string | null;
  externalPoolId?: string | null;
  isActive?: boolean;
};

export type VisitorTopicsEditorProps = {
  topics: VisitorTopicEditorRow[];
  onChange: (topics: VisitorTopicEditorRow[]) => void;
  canEdit?: boolean;
  internalDeptOptions: Array<{ id: string; label: string }>;
  externalDeptOptions: Array<{ id: string; label: string }>;
  showActive?: boolean;
  showDepartmentCatalog?: boolean;
  departments?: DepartmentCatalogOption[];
  departmentsLoading?: boolean;
  internalDeptWarning?: ReactNode;
  rowTitlePrefix?: string;
  addLabel?: string;
  minRows?: number;
  /** Widget wizard: route visitors to external departments only. */
  externalDeptOnly?: boolean;
};

function patchRow(
  topics: VisitorTopicEditorRow[],
  index: number,
  patch: Partial<VisitorTopicEditorRow>,
): VisitorTopicEditorRow[] {
  return topics.map((t, i) => (i === index ? { ...t, ...patch } : t));
}

export function VisitorTopicsEditor({
  topics,
  onChange,
  canEdit = true,
  internalDeptOptions,
  externalDeptOptions,
  showActive = false,
  showDepartmentCatalog = false,
  departments = [],
  departmentsLoading = false,
  internalDeptWarning = null,
  rowTitlePrefix = "Topic",
  addLabel = "Add topic",
  minRows = 1,
  externalDeptOnly = false,
}: VisitorTopicsEditorProps) {
  const theme = useTheme() as AppTheme;
  const disabled = !canEdit;
  const canRemove = canEdit && topics.length > minRows;

  return (
    <Box>
      {showDepartmentCatalog ? (
        <DepartmentCatalogPanel departments={departments} isLoading={departmentsLoading} />
      ) : null}
      {internalDeptWarning ? (
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.warning.light,
            bgcolor: `${theme.palette.warning.main}14`,
            border: `1px solid ${theme.palette.warning.main}44`,
            borderRadius: 1.5,
            px: 1.5,
            py: 1,
            mb: 1.5,
          }}
        >
          {internalDeptWarning}
        </Typography>
      ) : null}
      <Box sx={{ mt: showDepartmentCatalog ? 0 : 0 }}>
        {topics.map((topic, index) => (
            <Box
              key={`visitor-topic-${index}`}
              sx={{
                p: 2,
                mb: 1.5,
                borderRadius: 2,
                border: `1px solid ${theme.app.dashboard.cardBorder}`,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                  {rowTitlePrefix} {index + 1}
                </Typography>
                {canRemove ? (
                  <IconButton
                    size="small"
                    aria-label={`Remove ${rowTitlePrefix.toLowerCase()}`}
                    onClick={() => onChange(topics.filter((_, i) => i !== index))}
                  >
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                ) : null}
              </Box>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 1.25,
                }}
              >
                <InputField
                  label="Routing key"
                  value={topic.routingKey}
                  disabled={disabled}
                  onChange={(e) =>
                    onChange(patchRow(topics, index, { routingKey: e.target.value }))
                  }
                  placeholder="billing"
                />
                <InputField
                  label="Client label (widget)"
                  value={topic.clientLabel}
                  disabled={disabled}
                  onChange={(e) =>
                    onChange(patchRow(topics, index, { clientLabel: e.target.value }))
                  }
                  placeholder="Billing"
                />
              </Box>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: externalDeptOnly
                    ? "1fr"
                    : { xs: "1fr", md: "1fr 1fr" },
                  gap: 1.25,
                  mt: 1.25,
                  p: 1.25,
                  borderRadius: 1.5,
                  border: `1px dashed ${theme.app.dashboard.cardBorder}`,
                }}
              >
                {externalDeptOnly ? null : (
                  <SelectField
                    label="Internal department"
                    value={topic.internalDepartmentId}
                    onChange={(v) =>
                      onChange(patchRow(topics, index, { internalDepartmentId: v }))
                    }
                    options={[
                      { value: "", label: "Select internal department…" },
                      ...internalDeptOptions.map((d) => ({ value: d.id, label: d.label })),
                    ]}
                    disabled={disabled}
                    menuMaxRows={8}
                  />
                )}
                <SelectField
                  label={externalDeptOnly ? "Department" : "External department"}
                  value={topic.externalDepartmentId}
                  onChange={(v) =>
                    onChange(patchRow(topics, index, { externalDepartmentId: v }))
                  }
                  options={[
                    { value: "", label: "Select department…" },
                    ...externalDeptOptions.map((d) => ({ value: d.id, label: d.label })),
                  ]}
                  disabled={disabled}
                  menuMaxRows={8}
                />
              </Box>
              {showActive ? (
                <Box
                  component="label"
                  sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, mt: 1 }}
                >
                  <Checkbox
                    checked={topic.isActive !== false}
                    disabled={disabled}
                    onChange={(_, v) => onChange(patchRow(topics, index, { isActive: v }))}
                  />
                  <Typography variant="caption">Active</Typography>
                </Box>
              ) : null}
            </Box>
        ))}
        {canEdit ? (
          <Button
            type="button"
            variant="outlined"
            startIcon={<Add />}
            onClick={() =>
              onChange([
                ...topics,
                {
                  routingKey: "",
                  clientLabel: "",
                  internalDepartmentId: "",
                  externalDepartmentId: "",
                  isActive: true,
                },
              ])
            }
            sx={{ alignSelf: "flex-start" }}
          >
            {addLabel}
          </Button>
        ) : null}
      </Box>
    </Box>
  );
}
