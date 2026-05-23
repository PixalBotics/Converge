"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Add from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { useTheme } from "@mui/material/styles";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AppTheme } from "@/theme/theme";
import { Button, SearchBar, TablePagination, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { deleteEmailForm, listEmailForms, type EmailFormListItem } from "@/api/email/email-forms.api";
import { EMAIL_ROUTES } from "../email.constants";
import { EmailFormsGroupedList } from "../components/EmailFormsGroupedList";
import { EmailBuilderPanel } from "../styles/email-design.styled";
import { pageWrapper } from "@/app/dashboard/dashboard.styles";
import { emailFormBuilderPageSx } from "../styles/email-form-builder.styles";
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
    if (!window.confirm(`Remove the wrap-up form for "${row.website}"?`)) return;
    void deleteMutation
      .mutateAsync(row.id)
      .then(() => {
        publishAppToast({ variant: "success", message: "Form removed." });
      })
      .catch((err) => {
        publishAppToast({
          variant: "error",
          message: extractApiErrorMessageForToast(err, "Delete failed."),
        });
      });
  };

  const items = listQuery.data?.items ?? [];
  const isEmpty = items.length === 0 && !listQuery.isLoading;

  return (
    <Box sx={[pageWrapper, emailFormBuilderPageSx]}>
      <Box
        sx={{
          mb: 2.5,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="regularLarge" fontWeight={700} color="white" sx={{ mb: 0.5 }}>
            Email forms
          </Typography>
          <Typography
            variant="medium"
            sx={{ color: theme.app.dashboard.textMuted, maxWidth: 560, lineHeight: 1.55 }}
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

      <EmailBuilderPanel>
        <Box sx={{ mb: 2.5 }}>
          <SearchBar
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Search reseller, child company, website…"
            sx={{ maxWidth: 400 }}
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

        {!isEmpty && (listQuery.data?.totalPages ?? 1) > 1 ? (
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2.5 }}>
            <TablePagination
              page={page}
              pageCount={Math.max(1, listQuery.data?.totalPages ?? 1)}
              onPageChange={listQuery.isLoading ? undefined : setPage}
            />
          </Box>
        ) : null}

        {!isEmpty ? (
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, mt: 1.5, display: "block" }}>
            Showing {items.length} of {listQuery.data?.total ?? items.length} form
            {(listQuery.data?.total ?? items.length) === 1 ? "" : "s"}
            {search.trim() ? ` matching “${search.trim()}”` : ""}.
          </Typography>
        ) : null}
      </EmailBuilderPanel>
    </Box>
  );
}
