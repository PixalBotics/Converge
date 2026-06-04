"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PaletteOutlined from "@mui/icons-material/PaletteOutlined";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, DataTable, Typography } from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { iconGlyphSx } from "@/lib/design-system";
import { useEmailTemplateAccess } from "../hooks/useEmailTemplateAccess";
import { EMAIL_ROUTES } from "../email.constants";
import { EmailConfigTableCard, EmailHelpAlert } from "../styles/email-configuration.styled";
import { EmailTableCardHeader } from "../components/EmailTableCardHeader";
import { EmailDesignPreviewOverlay } from "../components/EmailDesignPreviewOverlay";
import { EmailDesignPublishChip } from "../components/EmailDesignSourceChip";
import { EmailDesignTableActions } from "../components/EmailDesignTableActions";
import {
  usePlatformEmailTemplateDraftQuery,
  usePlatformEmailTemplatePublishedQuery,
  usePlatformEmailTemplatePublishedPreviewQuery,
} from "../hooks/useEmailTemplate";
import { departmentsFooterRow, footerMutedText } from "../styles/email-page.styles";
import { emailPlatformDesignSummaryTableSx, emailTablePanelSx } from "../styles/email-table.styles";

type PlatformDesignRow = {
  id: string;
  name: string;
  status: "published" | "in_progress" | "not_started";
  publishedAt: string | null;
};

function formatPublishedAt(value: string | null, status: PlatformDesignRow["status"]): string {
  if (value) {
    return new Date(value).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }
  return status === "not_started" ? "Never published" : "—";
}

export function EmailPlatformDesignHubPage() {
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const { canView, canUpdate } = useEmailTemplateAccess();

  const draftQuery = usePlatformEmailTemplateDraftQuery({ enabled: canView });
  const publishedQuery = usePlatformEmailTemplatePublishedQuery({ enabled: canView });

  const row: PlatformDesignRow = useMemo(() => {
    const publishedAt = publishedQuery.data?.publishedAt ?? null;
    const isPublished = Boolean(publishedAt);
    const status: PlatformDesignRow["status"] = isPublished
      ? "published"
      : draftQuery.data
        ? "in_progress"
        : "not_started";
    return {
      id: "platform-default",
      name:
        publishedQuery.data?.name ??
        draftQuery.data?.name ??
        "Platform default transcript email",
      status,
      publishedAt,
    };
  }, [draftQuery.data, publishedQuery.data]);

  const previewQuery = usePlatformEmailTemplatePublishedPreviewQuery({
    enabled: canView && row.status === "published",
  });

  const [previewOpen, setPreviewOpen] = useState(false);

  const columns = useMemo<DataTableColumn<PlatformDesignRow>[]>(
    () => [
      { id: "name", label: "Design", align: "left" },
      {
        id: "status",
        label: "Status",
        align: "left",
        render: (_v, r) => <EmailDesignPublishChip status={r.status} />,
      },
      {
        id: "publishedAt",
        label: "Last published",
        align: "left",
        cellVariant: "muted",
        render: (_v, r) => formatPublishedAt(r.publishedAt, r.status),
      },
    ],
    [],
  );

  if (!canView) {
    return <Typography variant="medium">Access denied.</Typography>;
  }

  const loading = draftQuery.isLoading || publishedQuery.isLoading;

  const editButton = canUpdate ? (
    <Button
      type="button"
      variant="primary"
      sx={gradientPrimaryButtonSx}
      onClick={() => router.push(EMAIL_ROUTES.designPlatformEditor)}
    >
      {row.status === "not_started" ? "Create design" : "Edit design"}
    </Button>
  ) : null;

  return (
    <>
      {row.status !== "published" && !loading ? (
        <EmailHelpAlert severity="info" variant="outlined" sx={{ mb: 0 }}>
          New resellers use this platform template by default. Publish when the default transcript
          email is ready.
        </EmailHelpAlert>
      ) : null}

      <EmailConfigTableCard elevation={0}>
        <EmailTableCardHeader
          icon={
            <PaletteOutlined
              sx={{
                ...(iconGlyphSx("sm") as object),
                color: theme.app.dashboard.white95,
              }}
            />
          }
          title="Platform email design"
          subtitle="Default transcript email for all resellers unless they publish a custom design."
          action={editButton}
        />

        {loading ? (
          <Skeleton variant="rounded" height={120} />
        ) : (
          <>
            <DataTable<PlatformDesignRow>
              columns={columns}
              rows={[row]}
              getRowId={(r) => r.id}
              minWidth={640}
              size="medium"
              tableSx={emailPlatformDesignSummaryTableSx}
              containerSx={emailTablePanelSx}
              actionColumn={{
                label: "Actions",
                align: "right",
                render: () => (
                  <EmailDesignTableActions
                    previewLabel="Preview published platform design"
                    editLabel="Edit platform design"
                    canPreview
                    canEdit={canUpdate}
                    previewDisabled={row.status !== "published"}
                    onPreview={row.status === "published" ? () => setPreviewOpen(true) : undefined}
                    onEdit={
                      canUpdate
                        ? () => router.push(EMAIL_ROUTES.designPlatformEditor)
                        : undefined
                    }
                  />
                ),
              }}
            />

            <Box sx={departmentsFooterRow}>
              <Typography variant="medium" sx={footerMutedText(theme)}>
                Platform default · used by resellers without a custom design
              </Typography>
            </Box>
          </>
        )}
      </EmailConfigTableCard>

      <EmailDesignPreviewOverlay
        open={previewOpen}
        title="Published platform preview"
        html={previewQuery.data?.html ?? ""}
        loading={previewQuery.isLoading}
        onClose={() => setPreviewOpen(false)}
        footerActions={
          canUpdate ? (
            <Button
              type="button"
              variant="primary"
              sx={gradientPrimaryButtonSx}
              onClick={() => {
                setPreviewOpen(false);
                router.push(EMAIL_ROUTES.designPlatformEditor);
              }}
            >
              Edit design
            </Button>
          ) : null
        }
      />
    </>
  );
}
