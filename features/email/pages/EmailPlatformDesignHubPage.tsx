"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PaletteOutlined from "@mui/icons-material/PaletteOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  AppIconButton,
  Button,
  DataTable,
  Typography,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { iconGlyphSx } from "@/lib/design-system";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions/operational-keys";
import { EMAIL_ROUTES } from "../email.constants";
import { EmailConfigTableCard } from "../styles/email-configuration.styled";
import { EmailTableCardHeader } from "../components/EmailTableCardHeader";
import { EmailPreviewFrame } from "../components/EmailPreviewFrame";
import {
  usePlatformEmailTemplateDraftQuery,
  usePlatformEmailTemplatePublishedQuery,
  usePlatformEmailTemplatePublishedPreviewQuery,
} from "../hooks/useEmailTemplate";

type PlatformDesignRow = {
  id: string;
  name: string;
  hasDraft: boolean;
  publishedAt: string | null;
};

export function EmailPlatformDesignHubPage() {
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const { hasOperational } = useAuth();
  const canView = hasOperational(OP.emailTemplate.view);
  const canUpdate = hasOperational(OP.emailTemplate.update);

  const draftQuery = usePlatformEmailTemplateDraftQuery({ enabled: canView });
  const publishedQuery = usePlatformEmailTemplatePublishedQuery({ enabled: canView });
  const previewQuery = usePlatformEmailTemplatePublishedPreviewQuery({
    enabled: canView && Boolean(publishedQuery.data?.publishedAt),
  });

  const [previewOpen, setPreviewOpen] = useState(false);

  const row: PlatformDesignRow = useMemo(
    () => ({
      id: "platform-default",
      name: publishedQuery.data?.name ?? draftQuery.data?.name ?? "Platform default transcript email",
      hasDraft: Boolean(draftQuery.data),
      publishedAt: publishedQuery.data?.publishedAt ?? null,
    }),
    [draftQuery.data, publishedQuery.data],
  );

  const columns = useMemo<DataTableColumn<PlatformDesignRow>[]>(
    () => [
      { id: "name", label: "Design", align: "left" },
      {
        id: "hasDraft",
        label: "Draft",
        align: "left",
        render: (_v, r) => (
          <Chip
            size="small"
            label={r.hasDraft ? "In progress" : "Not started"}
            color={r.hasDraft ? "warning" : "default"}
            variant="outlined"
          />
        ),
      },
      {
        id: "publishedAt",
        label: "Last published",
        align: "left",
        render: (_v, r) =>
          r.publishedAt ? new Date(r.publishedAt).toLocaleString() : "Never published",
      },
    ],
    [],
  );

  if (!canView) {
    return <Typography variant="medium">Access denied.</Typography>;
  }

  const loading = draftQuery.isLoading || publishedQuery.isLoading;

  return (
    <>
      <EmailConfigTableCard>
        <EmailTableCardHeader
          icon={<PaletteOutlined sx={iconGlyphSx(theme, 22)} />}
          title="Platform email design"
          subtitle="Default transcript email for resellers on platform template mode."
        />

        {loading ? (
          <Skeleton variant="rounded" height={120} sx={{ mt: 2 }} />
        ) : (
          <DataTable<PlatformDesignRow>
            columns={columns}
            rows={[row]}
            getRowId={(r) => r.id}
            minWidth={640}
            actionColumn={{
              label: "Actions",
              align: "right",
              render: () => (
                <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                  <AppIconButton
                    type="button"
                    aria-label="Preview published"
                    disabled={!row.publishedAt}
                    onClick={() => setPreviewOpen(true)}
                  >
                    <VisibilityOutlined fontSize="small" />
                  </AppIconButton>
                  {canUpdate ? (
                    <AppIconButton
                      type="button"
                      aria-label="Set design"
                      onClick={() => router.push(EMAIL_ROUTES.designPlatformEditor)}
                    >
                      <EditOutlined fontSize="small" />
                    </AppIconButton>
                  ) : null}
                </Box>
              ),
            }}
          />
        )}

        {canUpdate ? (
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              type="button"
              variant="primary"
              onClick={() => router.push(EMAIL_ROUTES.designPlatformEditor)}
            >
              Set design
            </Button>
          </Box>
        ) : null}
      </EmailConfigTableCard>

      {previewOpen ? (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 1300,
            bgcolor: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
          }}
          onClick={() => setPreviewOpen(false)}
        >
          <Box
            sx={{
              width: "min(720px, 100%)",
              maxHeight: "90vh",
              overflow: "auto",
              bgcolor: theme.app.dashboard.cardBg,
              borderRadius: 2,
              p: 2,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Typography variant="mediumLarge" fontWeight={700} sx={{ mb: 1 }}>
              Published platform preview
            </Typography>
            {previewQuery.isLoading ? (
              <Skeleton variant="rounded" height={400} />
            ) : (
              <EmailPreviewFrame html={previewQuery.data?.html ?? ""} title="Preview" />
            )}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button type="button" variant="secondary" onClick={() => setPreviewOpen(false)}>
                Close
              </Button>
            </Box>
          </Box>
        </Box>
      ) : null}
    </>
  );
}
