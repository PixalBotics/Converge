"use client";

import type { ReactNode } from "react";
import NightsStay from "@mui/icons-material/NightsStay";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Checkbox, Typography } from "@/components/common";
import {
  assignmentStepChipSx,
  assignmentStepRowSx,
  crossMidnightCardSx,
} from "../styles/website-assignment-ui.styles";
import type { DepartmentCatalogOption } from "@/features/chat-settings/utils/catalog";
import { mergeSx } from "@/lib/mui/merge-sx";
import type { KeyboardEvent } from "react";

export function CrossMidnightToggle({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  const theme = useTheme() as AppTheme;

  return (
    <Box
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={checked}
      sx={mergeSx(crossMidnightCardSx(checked), { opacity: disabled ? 0.55 : 1 })}
      onClick={() => {
        if (!disabled) onChange(!checked);
      }}
      onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
        if (disabled || (e.key !== "Enter" && e.key !== " ")) return;
        e.preventDefault();
        onChange(!checked);
      }}
    >
      <NightsStay
        sx={{
          fontSize: 28,
          color: checked ? theme.palette.warning.light : theme.app.dashboard.textMuted,
          mt: 0.25,
        }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 0.5 }}>
          <Typography fontWeight={700} sx={{ fontSize: 14 }}>
            Crosses midnight
          </Typography>
          {checked ? (
            <Chip
              label="Overnight window"
              size="small"
              sx={{
                height: 22,
                fontSize: 11,
                fontWeight: 700,
                bgcolor: `${theme.palette.warning.main}33`,
                color: theme.palette.warning.light,
              }}
            />
          ) : null}
        </Box>
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.5 }}>
          Turn on when service runs past midnight (e.g. 22:00 → 06:00). End time is on the{" "}
          <strong>next calendar day</strong> in the timezone below.
        </Typography>
      </Box>
      <Checkbox
        checked={checked}
        disabled={disabled}
        onChange={(_, v) => onChange(v)}
        onClick={(e) => e.stopPropagation()}
        sx={{ mt: 0.25 }}
      />
    </Box>
  );
}

export function DepartmentCatalogPanel({
  departments,
  isLoading,
}: {
  departments: DepartmentCatalogOption[];
  isLoading?: boolean;
}) {
  const theme = useTheme() as AppTheme;
  const internal = departments.filter((d) => d.departmentType === "Internal");
  const external = departments.filter((d) => d.departmentType === "External");

  const list = (items: DepartmentCatalogOption[], empty: string) =>
    items.length === 0 ? (
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
        {empty}
      </Typography>
    ) : (
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
        {items.map((d) => (
          <Chip key={d.id} label={d.label} size="small" sx={{ height: 24, fontSize: 12 }} />
        ))}
      </Box>
    );

  return (
    <Box
      sx={{
        p: 2,
        mb: 2.5,
        borderRadius: 2.5,
        border: `1px solid ${theme.app.dashboard.cardBorder}`,
        background: `linear-gradient(135deg, ${theme.app.dashboard.pillBg} 0%, rgba(99, 102, 241, 0.12) 100%)`,
      }}
    >
      <Typography fontWeight={700} sx={{ fontSize: 14, mb: 1 }}>
        Available departments (client catalog)
      </Typography>
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1.5 }}>
        Internal departments are loaded for your reseller (not tied to one parent company). External
        departments are scoped to this client. Pick one of each per visitor topic below.
      </Typography>
      {isLoading ? (
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, mb: 1 }}>
          Loading department catalog…
        </Typography>
      ) : null}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="caption" fontWeight={700} sx={{ display: "block", mb: 0.75 }}>
            Internal ({internal.length})
          </Typography>
          {list(internal, "No internal departments — create one in Departments.")}
        </Box>
        <Box>
          <Typography variant="caption" fontWeight={700} sx={{ display: "block", mb: 0.75 }}>
            External ({external.length})
          </Typography>
          {list(external, "No external departments — create one in Departments.")}
        </Box>
      </Box>
    </Box>
  );
}

export function SchedulingStepBar({
  activeStep,
}: {
  activeStep: 1 | 2 | 3;
}) {
  const steps = [
    { n: 1, label: "Mode & policy" },
    { n: 2, label: "Service hours" },
    { n: 3, label: "Visitor topics" },
  ] as const;
  return (
    <Box sx={assignmentStepRowSx}>
      {steps.map(({ n, label }) => (
        <Chip
          key={n}
          label={`${n}. ${label}`}
          size="small"
          sx={assignmentStepChipSx(activeStep >= n)}
        />
      ))}
    </Box>
  );
}

export function SchedulingSectionCard({
  title,
  subtitle,
  step,
  children,
}: {
  title: string;
  subtitle?: string;
  step?: number;
  children: ReactNode;
}) {
  const theme = useTheme() as AppTheme;
  return (
    <Box
      sx={{
        p: { xs: 2, sm: 2.5 },
        mb: 2.5,
        borderRadius: 2.5,
        border: `1px solid ${theme.app.dashboard.cardBorder}`,
        bgcolor: "rgba(255,255,255,0.03)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: subtitle ? 0.5 : 1.5 }}>
        {step ? (
          <Chip
            label={step}
            size="small"
            sx={{
              height: 22,
              minWidth: 22,
              fontWeight: 700,
              fontSize: 11,
              borderRadius: "6px",
              bgcolor: "rgba(99, 102, 241, 0.25)",
              color: "#c7d2fe",
            }}
          />
        ) : null}
        <Typography fontWeight={700} sx={{ fontSize: 16 }}>
          {title}
        </Typography>
      </Box>
      {subtitle ? (
        <Typography
          variant="caption"
          sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 2, lineHeight: 1.5 }}
        >
          {subtitle}
        </Typography>
      ) : null}
      {children}
    </Box>
  );
}
