"use client";

import Box from "@mui/material/Box";
import Radio from "@mui/material/Radio";
import { DashboardCard, Typography } from "@/components/common";
import type { AppTheme } from "@/theme/theme";
import type { ExternalAdminScope, InternalAdminScope } from "@/lib/users/user-admin-scope";

type ScopeOption<T extends string> = {
  value: T;
  title: string;
  description: string;
};

const INTERNAL_SCOPE_OPTIONS: ScopeOption<InternalAdminScope>[] = [
  {
    value: "standard",
    title: "Standard internal staff",
    description: "Reseller/platform operations with a normal role (not full catalog).",
  },
  {
    value: "platform_admin",
    title: "Platform admin",
    description:
      "Full SaaS operator (Platform Admin role). Every permission automatically — caps skipped. Not on agent inbox.",
  },
];

const EXTERNAL_SCOPE_OPTIONS: ScopeOption<ExternalAdminScope>[] = [
  {
    value: "parent_company",
    title: "Parent company admin",
    description: "Scoped to the selected parent company and its children (client cap applies).",
  },
  {
    value: "wide_reseller",
    title: "Wide reseller admin",
    description:
      "Portfolio admin across all parent companies under this reseller — not locked to one parent cap.",
  },
];

function scopeRadioIcons(theme: AppTheme) {
  return {
    icon: (
      <Box
        sx={{
          width: 16,
          height: 16,
          borderRadius: "9999px",
          border: "2px solid rgba(148,163,184,0.6)",
          bgcolor: "transparent",
        }}
      />
    ),
    checkedIcon: (
      <Box
        sx={{
          width: 16,
          height: 16,
          borderRadius: "9999px",
          bgcolor: theme.app.dashboard.accentGreen,
          boxShadow: "0 0 0 4px rgba(34,197,94,0.35)",
        }}
      />
    ),
  };
}

type AdminScopeCardProps<T extends string> = {
  theme: AppTheme;
  option: ScopeOption<T>;
  selected: boolean;
  disabled: boolean;
  selectionLocked: boolean;
  onSelect: () => void;
};

function AdminScopeCard<T extends string>({
  theme,
  option,
  selected,
  disabled,
  selectionLocked,
  onSelect,
}: AdminScopeCardProps<T>) {
  const { icon, checkedIcon } = scopeRadioIcons(theme);
  const inactive = disabled || selectionLocked;

  return (
    <DashboardCard
      sx={{
        p: 2,
        borderRadius: 2,
        cursor: inactive ? "default" : "pointer",
        opacity: disabled ? 0.55 : 1,
        pointerEvents: inactive ? "none" : "auto",
        background: selected ? theme.app.dashboard.navActiveBg : theme.app.dashboard.cardBg,
        transition: "background 0.15s ease",
      }}
      onClick={() => {
        if (inactive) return;
        onSelect();
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
        <Radio
          checked={selected}
          onChange={onSelect}
          value={option.value}
          disabled={inactive}
          disableRipple
          icon={icon}
          checkedIcon={checkedIcon}
          sx={{ p: 0.25, mt: 0.15 }}
        />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="medium" color="white" sx={{ mb: 0.35, lineHeight: 1.35 }}>
            {option.title}
          </Typography>
          <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.45 }}>
            {option.description}
          </Typography>
        </Box>
      </Box>
    </DashboardCard>
  );
}

type UserAdminScopeFieldsProps = {
  theme: AppTheme;
  userType: "Internal" | "External";
  internalScope: InternalAdminScope;
  externalScope: ExternalAdminScope;
  onInternalScopeChange: (scope: InternalAdminScope) => void;
  onExternalScopeChange: (scope: ExternalAdminScope) => void;
  disabled?: boolean;
  /** When true (e.g. edit user), cards are visible but not clickable — same as user type row. */
  selectionLocked?: boolean;
  showInternal?: boolean;
};

export function UserAdminScopeFields({
  theme,
  userType,
  internalScope,
  externalScope,
  onInternalScopeChange,
  onExternalScopeChange,
  disabled = false,
  selectionLocked = false,
  showInternal = true,
}: UserAdminScopeFieldsProps) {
  const muted = theme.app.dashboard.textMuted;

  const options =
    userType === "Internal" && showInternal
      ? INTERNAL_SCOPE_OPTIONS
      : userType === "External"
        ? EXTERNAL_SCOPE_OPTIONS
        : null;

  if (!options) return null;

  const activeValue = userType === "Internal" ? internalScope : externalScope;
  const onSelect = (value: string) => {
    if (userType === "Internal") {
      onInternalScopeChange(value as InternalAdminScope);
    } else {
      onExternalScopeChange(value as ExternalAdminScope);
    }
  };

  const hint =
    userType === "Internal"
      ? "Platform admins are internal operators only — not assigned on the agent roster. Pick one."
      : "Choose one: parent company admin or wide reseller admin. Do not combine both.";

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="body2" fontWeight={600} color="white" sx={{ mb: 0.75 }}>
        Admin scope
      </Typography>
      <Typography variant="caption" sx={{ color: muted, display: "block", mb: 1.5, lineHeight: 1.5 }}>
        {hint}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2,
        }}
      >
        {options.map((option) => (
          <AdminScopeCard
            key={option.value}
            theme={theme}
            option={option}
            selected={activeValue === option.value}
            disabled={disabled}
            selectionLocked={selectionLocked}
            onSelect={() => onSelect(option.value)}
          />
        ))}
      </Box>
    </Box>
  );
}
