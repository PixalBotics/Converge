"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import AccessTimeRounded from "@mui/icons-material/AccessTimeRounded";
import CheckCircleOutlineRounded from "@mui/icons-material/CheckCircleOutlineRounded";
import type { SxProps, Theme } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import TextField from "@mui/material/TextField";
import { Typography, DashboardCard, DataTable, SelectField, Button, TablePagination } from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { Label } from "@/components/common/Label";
import { textFieldStyles } from "@/components/common/InputField/InputField.styles";
import { ModalGlassShell } from "@/components/common/FormModal/ModalGlassShell";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { rolesCard, rolesFooterRow, rolesPageWrapper, rolesPaginationWrapper } from "../../roles/roles.styles";
import { footerMutedText, pageWrapper } from "../../companies/overview.styles";
import { useBodyScrollLock } from "@/lib/ui/useBodyScrollLock";
import {
  approveLeaveCardHeaderSx,
  approveLeaveFilterGridSx,
  approveLeaveHeaderWrapSx,
  approveLeaveIconSx,
  approveLeaveModalActionsSx,
  approveLeaveModalBackdropSx,
  approveLeaveModalCardSx,
  approveLeaveModalIconWrapSx,
  approveLeaveSubtextSx,
} from "./approve-leave.styles";

type ApproveLeaveRow = {
  id: string;
  employeeName: string;
  leaveType: string;
  date: string;
  reason: string;
  action: "Approved" | "Rejected";
};

const STATUS_OPTIONS = [
  { label: "ABC Group", value: "abc-group" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const DEPARTMENT_OPTIONS = [
  { label: "Department", value: "" },
  { label: "Support", value: "support" },
  { label: "HR", value: "hr" },
  { label: "Sales", value: "sales" },
];

const ROWS: ApproveLeaveRow[] = Array.from({ length: 16 }, (_, i) => ({
  id: `approve-leave-${i + 1}`,
  employeeName: "Raja Saif Ul UX",
  leaveType: "Medical leave",
  date: "12 Jun Wednesday",
  reason: "Medical Checkup",
  action: i % 5 === 0 ? "Rejected" : "Approved",
}));
const PAGE_LIMIT = 10;

export default function ApproveLeavePage() {
  const theme = useTheme() as AppTheme;
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("abc-group");
  const [page, setPage] = useState(1);
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"Approved" | "Rejected" | null>(null);
  const [comment, setComment] = useState("");
  useBodyScrollLock(decisionModalOpen);

  const filteredRows = useMemo(() => {
    return ROWS.filter((row) => {
      if (status === "approved") return row.action === "Approved";
      if (status === "rejected") return row.action === "Rejected";
      return true;
    });
  }, [status]);
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_LIMIT));
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * PAGE_LIMIT;
    return filteredRows.slice(start, start + PAGE_LIMIT);
  }, [filteredRows, page]);
  const footerRangeStart = paginatedRows.length > 0 ? (page - 1) * PAGE_LIMIT + 1 : 0;
  const footerRangeEnd = (page - 1) * PAGE_LIMIT + paginatedRows.length;

  const columns = useMemo<DataTableColumn<ApproveLeaveRow>[]>(
    () => [
      { id: "employeeName", label: "Employee Name" },
      { id: "leaveType", label: "Leave Type" },
      { id: "date", label: "Dates" },
      { id: "reason", label: "Reason" },
      {
        id: "action",
        label: "Actions",
        render: (value) => {
          const statusValue = String(value ?? "");
          const isRejected = statusValue === "Rejected";
          return (
            <Typography
              component="button"
              onClick={() => {
                setPendingAction(isRejected ? "Rejected" : "Approved");
                setDecisionModalOpen(true);
              }}
              sx={{
                color: isRejected ? theme.palette.error.main : theme.palette.success.main,
                fontWeight: 600,
                fontSize: 13,
                border: 0,
                background: "transparent",
                p: 0,
                cursor: "pointer",
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              {statusValue}
            </Typography>
          );
        },
      },
    ],
    [theme],
  );

  return (
    <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>
      <Box sx={approveLeaveHeaderWrapSx}>
        <Typography variant="regularLarge" fontWeight={700} color="white">
          Leave Types
        </Typography>
        <Typography variant="body2" sx={approveLeaveSubtextSx}>
          Generate and distribute licenses to client companies
        </Typography>
      </Box>

      <DashboardCard sx={rolesCard}>
        <Box sx={approveLeaveCardHeaderSx}>
          <Box sx={approveLeaveIconSx}>
            <AccessTimeRounded sx={{ fontSize: 12 }} />
          </Box>
          <Typography variant="mediumLarge" fontWeight={600} color="white">
            Select Filter
          </Typography>
        </Box>
        <Box sx={approveLeaveFilterGridSx}>
          <SelectField label="Department / Pool" value={department} onChange={setDepartment} options={DEPARTMENT_OPTIONS} />
          <SelectField
            label="Status"
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
            options={STATUS_OPTIONS}
          />
          <Button
            type="button"
            variant="primary"
            sx={{ minWidth: 128, whiteSpace: "nowrap", width: { xs: "100%", md: "auto" } }}
          >
            Apply Filter
          </Button>
        </Box>
      </DashboardCard>

      <DashboardCard sx={rolesCard}>
        <Box sx={approveLeaveCardHeaderSx}>
          <Box sx={approveLeaveIconSx}>
            <AccessTimeRounded sx={{ fontSize: 12 }} />
          </Box>
          <Typography variant="mediumLarge" fontWeight={600} color="white">
            Departments List
          </Typography>
        </Box>

        <DataTable<ApproveLeaveRow>
          columns={columns}
          rows={paginatedRows}
          getRowId={(row) => row.id}
          minWidth={980}
        />
        <Box sx={rolesFooterRow}>
          <Typography variant="medium" sx={footerMutedText(theme)}>
            {`Showing data ${footerRangeStart} to ${footerRangeEnd} of ${filteredRows.length} entries`}
          </Typography>
          <Box sx={rolesPaginationWrapper}>
            <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
          </Box>
        </Box>
      </DashboardCard>

      {decisionModalOpen && (
        <Box
          sx={approveLeaveModalBackdropSx}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setDecisionModalOpen(false);
              setComment("");
            }
          }}
          role="presentation"
        >
          <ModalGlassShell sx={approveLeaveModalCardSx} onClick={(e) => e.stopPropagation()}>
            <Box sx={approveLeaveModalIconWrapSx} aria-hidden>
              <CheckCircleOutlineRounded sx={{ fontSize: 44, color: theme.app.dashboard.white95 }} />
            </Box>

            <Typography variant="regularLarge" fontWeight={700} sx={{ color: theme.app.text.primary, mt: 2.25, mb: 1 }}>
              Confirm action
            </Typography>
            <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, mb: 2.25 }}>
              {`Are you sure you want to ${pendingAction === "Rejected" ? "reject" : "approve"} this leave?`}
            </Typography>

            <Label htmlFor="approve-leave-comment" variant="mediumLarge" sx={{ mb: 0.75 }}>
              Comment
            </Label>
            <TextField
              id="approve-leave-comment"
              placeholder="Write comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              multiline
              minRows={3}
              inputProps={{ maxLength: 400, "aria-label": "Comment" }}
              fullWidth
              sx={[
                textFieldStyles(theme),
                { "& .MuiFormHelperText-root": { display: "none" } },
              ]}
            />

            <Box sx={approveLeaveModalActionsSx}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setDecisionModalOpen(false);
                  setComment("");
                }}
              >
                Reject
              </Button>
              <Button
                type="button"
                variant="primary"
                sx={gradientPrimaryButtonSx}
                onClick={() => {
                  setDecisionModalOpen(false);
                  setComment("");
                }}
              >
                Approve
              </Button>
            </Box>
          </ModalGlassShell>
        </Box>
      )}
    </Box>
  );
}
