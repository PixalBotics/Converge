"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import PaletteOutlined from "@mui/icons-material/PaletteOutlined";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  AppIconButton,
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
import { iconGlyphSx } from "@/lib/design-system";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions/operational-keys";
import { EMAIL_ROUTES } from "../email.constants";
import { EmailPreviewFrame } from "../components/EmailPreviewFrame";
import { EmailAddResellerDesignModal } from "../components/EmailAddResellerDesignModal";
import { EmailConfigTableCard } from "../styles/email-configuration.styled";
import { EmailTableCardHeader } from "../components/EmailTableCardHeader";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/http/axios-instance";
import { unwrapApiData } from "@/api/email/unwrap-api-data";
import { useEmailTemplatePreviewByIdQuery } from "../hooks/useEmailTemplate";

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

export function EmailDesignHubPage() {
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const { hasOperational } = useAuth();
  const canView = hasOperational(OP.emailTemplate.view);
  const canUpdate = hasOperational(OP.emailTemplate.update);

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
  const columns = useMemo<DataTableColumn<CatalogRow>[]>(
    () => [
      { id: "resellerName", label: "Reseller", align: "left" },
      {
        id: "templateMode",
        label: "Design source",
        align: "left",
        render: (_v, row) => (
          <Chip
            size="small"
            label={row.usesPlatformDefault ? "Platform default" : "Custom published"}
            color={row.usesPlatformDefault ? "info" : "success"}
            variant="outlined"
          />
        ),
      },
      {
        id: "publishedAt",
        label: "Last published",
        align: "left",
        render: (_v, row) =>
          row.publishedAt ? new Date(row.publishedAt).toLocaleString() : "—",
      },
    ],
    [],
  );

  if (!canView) {
    return <Typography variant="medium">Access denied.</Typography>;
  }

  const addButton = canUpdate ? (
    <Button
      type="button"
      variant="primary"
      startIcon={<AddCircleIcon />}
      sx={gradientPrimaryButtonSx}
      onClick={() => setAddOpen(true)}
    >
      Add reseller email design
    </Button>
  ) : null;

  return (
    <>
      <EmailConfigTableCard>
        <EmailTableCardHeader
          icon={<PaletteOutlined sx={iconGlyphSx(theme, 22)} />}
          title="Reseller email designs"
          subtitle="Custom transcript email per reseller. Resellers on platform default appear under Use platform design."
          action={addButton}
        />

        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <SearchBar
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Search reseller…"
            sx={{ minWidth: 220, maxWidth: 360 }}
          />
        </Box>

        {catalogQuery.isLoading ? (
          <Skeleton variant="rounded" height={320} />
        ) : (
          <>
            <DataTable<CatalogRow>
              columns={columns}
              rows={rows}
              getRowId={(r) => r.resellerId}
              minWidth={720}
              actionColumn={{
                label: "Actions",
                align: "right",
                render: (row) => (
                  <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                    <AppIconButton
                      type="button"
                      aria-label="Preview"
                      disabled={!row.previewTemplateId}
                      onClick={() => {
                        setPreviewResellerId(row.resellerId);
                        setPreviewTemplateId(row.previewTemplateId);
                      }}
                    >
                      <VisibilityOutlined fontSize="small" />
                    </AppIconButton>
                    {canUpdate ? (
                      <AppIconButton
                        type="button"
                        aria-label="Set design"
                        onClick={() =>
                          router.push(EMAIL_ROUTES.designResellerEdit(row.resellerId))
                        }
                      >
                        <EditOutlined fontSize="small" />
                      </AppIconButton>
                    ) : null}
                  </Box>
                ),
              }}
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <TablePagination
                page={page}
                pageCount={Math.max(1, catalogQuery.data?.totalPages ?? 1)}
                onPageChange={catalogQuery.isLoading ? undefined : setPage}
              />
            </Box>
          </>
        )}
      </EmailConfigTableCard>

      <EmailAddResellerDesignModal open={addOpen} onClose={() => setAddOpen(false)} />

      {previewTemplateId ? (
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
          onClick={() => {
            setPreviewTemplateId(null);
            setPreviewResellerId(null);
          }}
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
              Email preview
            </Typography>
            {previewQuery.isLoading ? (
              <Skeleton variant="rounded" height={400} />
            ) : (
              <EmailPreviewFrame html={previewQuery.data?.html ?? ""} title="Preview" />
            )}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, gap: 1 }}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setPreviewTemplateId(null);
                  setPreviewResellerId(null);
                }}
              >
                Close
              </Button>
              {previewResellerId && canUpdate ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => {
                    setPreviewTemplateId(null);
                    router.push(EMAIL_ROUTES.designResellerEdit(previewResellerId));
                  }}
                >
                  Set design
                </Button>
              ) : null}
            </Box>
          </Box>
        </Box>
      ) : null}
    </>
  );
}
