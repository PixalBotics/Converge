"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Add from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { useTheme, type SxProps, type Theme } from "@mui/material/styles";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AppTheme } from "@/theme/theme";
import {
  integrationsFooterRow,
  integrationsMainCardSx,
} from "@/app/dashboard/integrations/integrations.styles";
import { Button, DashboardCard, SearchBar, TablePagination, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { deleteEmailForm, listEmailForms, type EmailFormListItem } from "@/api/email/email-forms.api";
import { EMAIL_ROUTES } from "../email.constants";
import { EmailDeleteConfirmModal } from "../components/EmailDeleteConfirmModal";
import { EmailFormsGroupedList } from "../components/EmailFormsGroupedList";
import { pageWrapper } from "@/app/dashboard/dashboard.styles";
import { emailFormBuilderPageSx } from "../styles/email-form-builder.styles";
import { departmentsFooterRow, emailToolbarRow, footerMutedText } from "../styles/email-page.styles";
import { emptyStatePanelSx } from "@/features/website-assignments/styles/website-assignment-ui.styles";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";

const LIST_PAGE_SIZE = 50;

export function EmailFormsListPage() {
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<EmailFormListItem | null>(null);

  const listQuery = useQuery({
    queryKey: ["email-forms", page, search],
    queryFn: () =>
      listEmailForms({ page, limit: LIST_PAGE_SIZE, search: search.trim() || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEmailForm(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["email-forms"] }),
  });

  const handleEdit = (row: EmailFormListItem) => {
    router.push(`${EMAIL_ROUTES.formsSet}?websiteId=${encodeURIComponent(row.websiteId)}`);
  };

  const handleDelete = (row: EmailFormListItem) => {
    setDeleteTarget(row);
  };

  const handleConfirmDelete = async () => {
    const id = deleteTarget?.id.trim();
    if (!id) return;
    try {
      await deleteMutation.mutateAsync(id);
      publishAppToast({ variant: "success", message: "Form removed." });
      setDeleteTarget(null);
    } catch (err) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(err, "Delete failed."),
      });
    }
  };

  const items = listQuery.data?.items ?? [];
  const isEmpty = items.length === 0 && !listQuery.isLoading;

  const total = listQuery.data?.total ?? items.length;

  return (
    <Box sx={[pageWrapper, emailFormBuilderPageSx] as SxProps<Theme>}>
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
            <Typography variant="regularLarge" fontWeight={400} color="white">
              Email forms
            </Typography>
            <Typography
              variant="medium"
              sx={{
                color: theme.app.dashboard.textMuted,
                mt: 0.25,
                display: "block",
                maxWidth: 640,
                lineHeight: "24px",
              }}
            >
              Wrap-up forms grouped by reseller and child company — each website shows its form type and
              field count without repeating org columns.
            </Typography>
          </Box>
          <Button
            type="button"
            variant="primary"
            startIcon={<Add />}
            sx={gradientPrimaryButtonSx}
            onClick={() => router.push(EMAIL_ROUTES.formsSet)}
          >
            Configure form
          </Button>
        </Box>

        <Box sx={emailToolbarRow}>
          <SearchBar
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Search reseller, child company, website…"
            sx={{ minWidth: 0, width: "100%", maxWidth: 360, ml: "auto" }}
          />
        </Box>

        {listQuery.isLoading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Skeleton variant="rounded" height={72} sx={{ borderRadius: 2.5 }} />
            <Skeleton variant="rounded" height={220} sx={{ borderRadius: 2.5 }} />
          </Box>
        ) : isEmpty ? (
          <Box sx={emptyStatePanelSx}>
            <Typography variant="mediumLarge" fontWeight={700} color="white" sx={{ mb: 0.75 }}>
              No forms configured yet
            </Typography>
            <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, mb: 2 }}>
              Set up a wrap-up form for a website under your reseller → child company tree.
            </Typography>
            <Button
              type="button"
              variant="primary"
              sx={gradientPrimaryButtonSx}
              onClick={() => router.push(EMAIL_ROUTES.formsSet)}
            >
              Configure first form
            </Button>
          </Box>
        ) : (
          <EmailFormsGroupedList
            items={items}
            onEdit={handleEdit}
            onDelete={handleDelete}
            deletingId={deleteMutation.isPending ? (deleteMutation.variables ?? null) : null}
          />
        )}

        {!isEmpty ? (
          <Box sx={[departmentsFooterRow, integrationsFooterRow] as SxProps<Theme>}>
            <Typography variant="medium" sx={footerMutedText(theme)}>
              Showing {items.length} of {total} form{total === 1 ? "" : "s"}
              {search.trim() ? ` matching “${search.trim()}”` : ""}.
            </Typography>
            {(listQuery.data?.totalPages ?? 1) > 1 ? (
              <TablePagination
                page={page}
                pageCount={Math.max(1, listQuery.data?.totalPages ?? 1)}
                onPageChange={listQuery.isLoading ? undefined : setPage}
              />
            ) : null}
          </Box>
        ) : null}
      </DashboardCard>

      <EmailDeleteConfirmModal
        open={Boolean(deleteTarget)}
        title="Remove wrap-up form?"
        description={
          deleteTarget
            ? `The wrap-up form for "${deleteTarget.website}" will be removed. You can configure it again later.`
            : ""
        }
        confirmLabel="Remove form"
        onDismiss={() => setDeleteTarget(null)}
        onConfirm={() => void handleConfirmDelete()}
        isLoading={deleteMutation.isPending}
      />
    </Box>
  );
}
