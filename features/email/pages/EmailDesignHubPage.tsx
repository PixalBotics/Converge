"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { integrationsMainCardSx } from "@/app/dashboard/integrations/integrations.styles";
import {
  Button,
  DashboardCard,
  DataTable,
  SearchBar,
  TablePagination,
  Typography,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { AddCircleIcon } from "@/components/common/icons";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { useAuth } from "@/lib/auth";
import { useEmailTemplateAccess } from "../hooks/useEmailTemplateAccess";
import { EMAIL_ROUTES } from "../email.constants";
import { EmailAddResellerDesignModal } from "../components/EmailAddResellerDesignModal";
import { EmailDesignPreviewOverlay } from "../components/EmailDesignPreviewOverlay";
import { EmailDesignSourceChip } from "../components/EmailDesignSourceChip";
import { EmailDesignTableActions } from "../components/EmailDesignTableActions";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/http/axios-instance";
import { unwrapApiData } from "@/api/email/unwrap-api-data";
import { useEmailTemplatePreviewByIdQuery } from "../hooks/useEmailTemplate";
import { departmentsFooterRow, emailToolbarRow, footerMutedText } from "../styles/email-page.styles";
import { emailDesignCatalogTableSx } from "../styles/email-table.styles";

type CatalogRow = {
  resellerId: string;
  resellerName: string;
  templateMode: string;
  usesPlatformDefault: boolean;
  hasPublished: boolean;
  publishedAt: string | null;
  previewTemplateId: string | null;
};

async function fetchDesignCatalog(search: string, page: number) {
  const { data } = await apiClient.get("/email/reseller-design-catalog", {
    params: { page, limit: 10, search: search || undefined },
  });
  return unwrapApiData<{
    items: CatalogRow[];
    total: number;
    totalPages: number;
  }>(data);
}

function formatPublishedAt(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function EmailDesignHubPage() {
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const { user } = useAuth();
  const { canView, canUpdate } = useEmailTemplateAccess();

  const scopedResellerId = user?.resellerId?.trim();
  const isExternalReseller =
    user?.userType === "External" && Boolean(scopedResellerId);

  useEffect(() => {
    if (!canView || !isExternalReseller || !scopedResellerId) return;
    router.replace(EMAIL_ROUTES.designResellerEdit(scopedResellerId));
  }, [canView, isExternalReseller, scopedResellerId, router]);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const [previewResellerId, setPreviewResellerId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const catalogQuery = useQuery({
    queryKey: ["email", "design-catalog", page, search],
    queryFn: () => fetchDesignCatalog(search.trim(), page),
    enabled: canView,
  });

  const previewQuery = useEmailTemplatePreviewByIdQuery(previewTemplateId, {
    enabled: Boolean(previewTemplateId),
  });

  const rows = catalogQuery.data?.items ?? [];
  const total = catalogQuery.data?.total ?? 0;
  const totalPages = Math.max(1, catalogQuery.data?.totalPages ?? 1);
  const isLoading = catalogQuery.isLoading || catalogQuery.isFetching;

  const columns = useMemo<DataTableColumn<CatalogRow>[]>(
    () => [
      { id: "resellerName", label: "Reseller", align: "left" },
      {
        id: "templateMode",
        label: "Design source",
        align: "left",
        render: (_v, row) => <EmailDesignSourceChip usesPlatformDefault={row.usesPlatformDefault} />,
      },
      {
        id: "publishedAt",
        label: "Last published",
        align: "left",
        cellVariant: "muted",
        render: (_v, row) => formatPublishedAt(row.publishedAt),
      },
    ],
    [],
  );

  if (!canView) {
    return <Typography variant="medium">Access denied.</Typography>;
  }

  if (isExternalReseller) {
    return null;
  }

  const addButton = canUpdate ? (
    <Button
      type="button"
      variant="primary"
      startIcon={<AddCircleIcon />}
      sx={gradientPrimaryButtonSx}
      onClick={() => setAddOpen(true)}
    >
      Add reseller design
    </Button>
  ) : null;

  const rangeStart = total === 0 ? 0 : (page - 1) * 10 + 1;
  const rangeEnd = Math.min(page * 10, total);

  return (
    <>
      <DashboardCard sx={integrationsMainCardSx}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 1.5,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="mediumLarge" color="white" fontWeight={600}>
              Reseller email designs
            </Typography>
            <Typography
              variant="small"
              sx={{ color: theme.app.dashboard.textMuted, mt: 0.25, display: "block", maxWidth: 640 }}
            >
              Resellers use the platform template by default. Add or edit a custom design when a reseller needs their own branding.
            </Typography>
          </Box>
          {addButton ? <Box sx={{ flexShrink: 0 }}>{addButton}</Box> : null}
        </Box>

        <Box sx={emailToolbarRow}>
          <SearchBar
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Search reseller…"
            sx={{ minWidth: 0, width: "100%", maxWidth: 360, ml: "auto" }}
          />
        </Box>

        <DataTable<CatalogRow>
          columns={columns}
          rows={rows}
          getRowId={(r) => r.resellerId}
          isLoading={isLoading}
          minWidth={760}
          emptyState={{
            title: catalogQuery.isError ? "Could not load designs" : "No reseller designs yet",
            description: catalogQuery.isError
              ? "Check your connection and try again."
              : canUpdate
                ? "Resellers on the platform default are not listed here until you add a custom design."
                : "No custom reseller designs are configured yet.",
          }}
          actionColumn={{
            label: "Actions",
            align: "right",
            render: (row) => (
              <EmailDesignTableActions
                previewLabel={`Preview design for ${row.resellerName}`}
                editLabel={`Edit design for ${row.resellerName}`}
                canPreview
                canEdit={canUpdate}
                previewDisabled={!row.previewTemplateId}
                onPreview={
                  row.previewTemplateId
                    ? () => {
                        setPreviewResellerId(row.resellerId);
                        setPreviewTemplateId(row.previewTemplateId);
                      }
                    : undefined
                }
                onEdit={
                  canUpdate
                    ? () => router.push(EMAIL_ROUTES.designResellerEdit(row.resellerId))
                    : undefined
                }
              />
            ),
          }}
        />

        <Box sx={departmentsFooterRow}>
          <Typography variant="medium" sx={footerMutedText(theme)}>
            {isLoading
              ? "Loading…"
              : total === 0
                ? "0 resellers"
                : `Showing ${rangeStart}–${rangeEnd} of ${total} reseller${total === 1 ? "" : "s"}`}
          </Typography>
          <TablePagination
            page={page}
            pageCount={totalPages}
            onPageChange={isLoading ? undefined : setPage}
          />
        </Box>
      </DashboardCard>

      <EmailAddResellerDesignModal open={addOpen} onClose={() => setAddOpen(false)} />

      <EmailDesignPreviewOverlay
        open={Boolean(previewTemplateId)}
        title="Email preview"
        html={previewQuery.data?.html ?? ""}
        loading={previewQuery.isLoading}
        onClose={() => {
          setPreviewTemplateId(null);
          setPreviewResellerId(null);
        }}
        footerActions={
          previewResellerId && canUpdate ? (
            <Button
              type="button"
              variant="primary"
              sx={gradientPrimaryButtonSx}
              onClick={() => {
                setPreviewTemplateId(null);
                router.push(EMAIL_ROUTES.designResellerEdit(previewResellerId));
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
