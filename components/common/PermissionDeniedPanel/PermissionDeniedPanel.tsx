"use client";

import Box from "@mui/material/Box";
import LockOutlined from "@mui/icons-material/LockOutlined";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import type { AppTheme } from "@/theme/theme";
import { Button, DashboardCard, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { iconGlyphSx } from "@/lib/design-system";
import { resolveDashboardLandingHref } from "@/lib/permissions";
import { useAuth } from "@/lib/auth";

export type PermissionDeniedPanelProps = {
  title?: string;
  description?: string;
};

/**
 * In-page permission boundary (route / operational view) — same visual language as {@link AppBoundaryModal}.
 */
export function PermissionDeniedPanel({
  title = "Access denied",
  description = "You don't have view permission for this area. Ask an administrator to assign the right operational permission for this screen.",
}: PermissionDeniedPanelProps) {
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const { rbacEnabled, permissionsByType, isPlatformAdmin, user } = useAuth();
  const isDemoUser = user?.email?.trim().toLowerCase() === "demo@gmail.com";

  const homeHref = resolveDashboardLandingHref({
    permissionsByType,
    isDemoUser,
    isPlatformAdmin,
  });

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 520, mx: "auto" }}>
      <DashboardCard
        sx={{
          p: { xs: 3, sm: 4 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(236, 72, 153, 0.12)",
            mb: 2,
          }}
          aria-hidden
        >
          <LockOutlined
            sx={{
              ...(iconGlyphSx(36) as object),
              color: theme.app.dashboard.accentPink,
            }}
          />
        </Box>

        <Typography variant="regularLarge" fontWeight={800} sx={{ color: theme.app.text.primary, mb: 1 }}>
          {title}
        </Typography>

        <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.55, mb: 2.5 }}>
          {description}
        </Typography>

        <Button
          type="button"
          variant="primary"
          sx={gradientPrimaryButtonSx}
          onClick={() => router.push(homeHref)}
        >
          Go to home
        </Button>
      </DashboardCard>
    </Box>
  );
}
