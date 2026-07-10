"use client";

import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import type { OfferingType } from "@/api/companies/services-access.api";

const OFFERING_LABELS: Record<OfferingType, string> = {
  software: "Software",
  service: "Service",
  both: "Software + Service",
  none: "None",
};

const OFFERING_COLORS: Record<OfferingType, "default" | "primary" | "secondary" | "info"> = {
  software: "primary",
  service: "secondary",
  both: "info",
  none: "default",
};

export function OfferingTypeChip({ type }: { type: OfferingType }) {
  return (
    <Chip
      size="small"
      label={OFFERING_LABELS[type]}
      color={OFFERING_COLORS[type]}
      variant={type === "none" ? "outlined" : "filled"}
    />
  );
}

type ModuleChipsProps = {
  moduleCodes: string[];
  moduleLabels?: Record<string, string>;
  max?: number;
};

export function ModuleChips({ moduleCodes, moduleLabels, max = 4 }: ModuleChipsProps) {
  const theme = useTheme() as AppTheme;
  const visible = moduleCodes.slice(0, max);
  const overflow = moduleCodes.length - visible.length;

  if (!moduleCodes.length) {
    return (
      <Chip
        size="small"
        label="No modules"
        variant="outlined"
        sx={{ color: theme.app.dashboard.textMuted, borderColor: alpha(theme.app.dashboard.cardBorder, 0.8) }}
      />
    );
  }

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
      {visible.map((code) => (
        <Chip
          key={code}
          size="small"
          label={moduleLabels?.[code] ?? code.replaceAll("_", " ")}
          sx={{
            bgcolor: alpha(theme.app.dashboard.accentBlue, 0.12),
            color: theme.app.text.primary,
            border: `1px solid ${alpha(theme.app.dashboard.accentBlue, 0.25)}`,
          }}
        />
      ))}
      {overflow > 0 ? (
        <Chip size="small" label={`+${overflow}`} variant="outlined" />
      ) : null}
    </Box>
  );
}

export function formatServicesUpdatedAt(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export type EditableOfferingType = "software" | "service" | "both";

export const OFFERING_TYPE_OPTIONS: { value: EditableOfferingType; label: string; description: string }[] = [
  {
    value: "software",
    label: "Software",
    description: "Client operates the platform — tool license only.",
  },
  {
    value: "service",
    label: "Service",
    description: "Agency-managed operations — your team runs chat & services.",
  },
  {
    value: "both",
    label: "Software + Service",
    description: "Hybrid — client tools plus agency-managed operations.",
  },
];

export function deriveOfferingTypeFromModuleCodes(
  moduleCodes: string[],
  catalogModules: { code: string; category: "software" | "service" }[],
): OfferingType {
  if (!moduleCodes.length) return "none";
  const byCode = new Map(catalogModules.map((m) => [m.code, m.category]));
  let hasSoftware = false;
  let hasService = false;
  for (const code of moduleCodes) {
    const category = byCode.get(code);
    if (category === "software") hasSoftware = true;
    if (category === "service") hasService = true;
  }
  if (hasSoftware && hasService) return "both";
  if (hasService) return "service";
  if (hasSoftware) return "software";
  return "none";
}

export function toEditableOfferingType(type: OfferingType): EditableOfferingType {
  if (type === "software" || type === "service" || type === "both") return type;
  return "both";
}
