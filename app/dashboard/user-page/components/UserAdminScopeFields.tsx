"use client";

import Box from "@mui/material/Box";
import type { ExternalAdminScope, InternalAdminScope } from "@/lib/users/user-admin-scope";
import type { AppTheme } from "@/theme/theme";
import {
  SelectableOptionCard,
  SelectableOptionsSection,
  type SelectableOptionAccent,
} from "./SelectableOptionCard";

type ScopeOption<T extends string> = {
  value: T;
  title: string;
  subtitle?: string;
  accent: SelectableOptionAccent;
};

const INTERNAL_SCOPE_OPTIONS: ScopeOption<InternalAdminScope>[] = [
  {
    value: "standard",
    title: "Standard staff",
    subtitle: "Normal role",
    accent: "indigo",
  },
  {
    value: "platform_admin",
    title: "Platform Admin",
    subtitle: "All permissions",
    accent: "purple",
  },
];

const EXTERNAL_SCOPE_OPTIONS: ScopeOption<ExternalAdminScope>[] = [
  {
    value: "standard",
    title: "Standard user",
    subtitle: "You pick the role",
    accent: "green",
  },
  {
    value: "parent_company",
    title: "Parent Company Admin",
    subtitle: "One parent company",
    accent: "blue",
  },
  {
    value: "wide_reseller",
    title: "Reseller Admin",
    subtitle: "All client companies",
    accent: "purple",
  },
];

function externalScopeOptionsForSession(
  allowWideResellerScope: boolean,
): ScopeOption<ExternalAdminScope>[] {
  if (allowWideResellerScope) return EXTERNAL_SCOPE_OPTIONS;
  return EXTERNAL_SCOPE_OPTIONS.filter((o) => o.value !== "wide_reseller");
}

type UserAdminScopeFieldsProps = {
  theme: AppTheme;
  userType: "Internal" | "External";
  internalScope: InternalAdminScope;
  externalScope: ExternalAdminScope;
  onInternalScopeChange: (scope: InternalAdminScope) => void;
  onExternalScopeChange: (scope: ExternalAdminScope) => void;
  disabled?: boolean;
  selectionLocked?: boolean;
  showInternal?: boolean;
  /** Parent-company external users must not offer portfolio-wide access. */
  allowWideResellerScope?: boolean;
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
  allowWideResellerScope = true,
}: UserAdminScopeFieldsProps) {
  const options =
    userType === "Internal" && showInternal
      ? INTERNAL_SCOPE_OPTIONS
      : userType === "External"
        ? externalScopeOptionsForSession(allowWideResellerScope)
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

  return (
    <SelectableOptionsSection
      theme={theme}
      title={userType === "Internal" ? "Operator access" : "Access level"}
      lockedHint={
        selectionLocked ? "Cannot change after the account is created." : undefined
      }
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: options.length > 2 ? "repeat(3, minmax(0, 1fr))" : "repeat(2, minmax(0, 1fr))",
          },
          gap: 1.25,
          alignItems: "stretch",
        }}
      >
        {options.map((option) => (
          <SelectableOptionCard
            key={option.value}
            theme={theme}
            title={option.title}
            subtitle={option.subtitle}
            accent={option.accent}
            value={option.value}
            selected={activeValue === option.value}
            disabled={disabled}
            selectionLocked={selectionLocked}
            onSelect={() => onSelect(option.value)}
          />
        ))}
      </Box>
    </SelectableOptionsSection>
  );
}
