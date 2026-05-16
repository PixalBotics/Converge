"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import { AttachMoney as AttachMoneyIcon } from "@mui/icons-material";
import type { SxProps, Theme } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Typography,
  DashboardCard,
  Button,
  InputField,
  Calendar,
  SelectField,
  DataTable,
  TablePagination,
  FormModal,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { AddCircleIcon } from "@/components/common/icons";
import { rolesCard, rolesFooterRow, rolesIconBox, rolesPageWrapper, rolesPaginationWrapper } from "../../roles/roles.styles";
import { footerMutedText, pageHeaderRow, pageWrapper } from "../../companies/overview.styles";
import { departmentsAddButton } from "../../website-assigning/website-assigning.styles";
import { publishAppToast } from "@/lib/notify";
import { formatIsoDate, isRecord, pickNum, pickStr, unwrapApiData } from "@/lib/utils/core";
import {
  useLeaveTypesForApplyQuery,
  useMyLeaveApplicationsQuery,
  useSubmitLeaveApplicationMutation,
} from "@/lib/hooks/query";
import {
  applyLeaveCardHeaderSx,
  applyLeaveFormGridSx,
  applyLeaveIconSx,
  applyLeaveSubtextSx,
} from "./apply-leave.styles";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions";

const PAGE_LIMIT = 8;

type MyLeaveRow = {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: string;
};

export default function ApplyLeavePage() {
  const theme = useTheme() as AppTheme;
  const { hasOperational } = useAuth();
  const canApplyLeave = hasOperational(OP.hrms.leave.apply);
  const canSelfLeaveView = hasOperational(OP.hrms.leave.selfView);
  const showLeaveInsights = canSelfLeaveView || canApplyLeave;
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [page, setPage] = useState(1);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  const leaveTypesQuery = useLeaveTypesForApplyQuery({ all: true }, { enabled: true, scope: "apply-leave" });
  const leaveTypeOptions = useMemo(() => {
    const payload = unwrapApiData(leaveTypesQuery.data);
    const obj = isRecord(payload) ? payload : null;
    const items = Array.isArray(obj?.["items"]) ? (obj?.["items"] as unknown[]).filter(isRecord) : [];
    const base = items
      .map((r) => {
        const id = pickStr(r, ["id"]);
        const name = pickStr(r, ["name"]);
        if (!id || !name) return null;
        return { value: id, label: name };
      })
      .filter((o): o is { value: string; label: string } => o !== null);
    return [{ value: "", label: "— Select leave type —" }, ...base];
  }, [leaveTypesQuery.data]);

  const myLeavesQuery = useMyLeaveApplicationsQuery(
    {
      page,
      limit: PAGE_LIMIT,
    },
    { enabled: true, scope: "apply-leave" },
  );
  const submitMutation = useSubmitLeaveApplicationMutation();

  const myPayload = unwrapApiData(myLeavesQuery.data);
  const myObj = isRecord(myPayload) ? myPayload : null;
  const myItems = useMemo(() => {
    const arr = myObj?.["items"];
    return Array.isArray(arr) ? (arr as unknown[]).filter(isRecord) : [];
  }, [myObj]);

  const totalEntries = useMemo(() => {
    const n = pickNum(myObj, ["total", "count", "totalCount"]);
    return n ?? myItems.length;
  }, [myObj, myItems.length]);

  const pageCount = useMemo(() => {
    const n = pickNum(myObj, ["totalPages"]);
    return n && n > 0 ? n : 1;
  }, [myObj]);

  const myRows = useMemo<MyLeaveRow[]>(() => {
    return myItems
      .map((r) => {
        const id = pickStr(r, ["id"]);
        if (!id) return null;
        const typeName =
          pickStr(isRecord(r["leaveType"]) ? (r["leaveType"] as Record<string, unknown>) : null, ["name"]) ||
          pickStr(r, ["leaveTypeName"]) ||
          "—";
        const from = formatIsoDate(pickStr(r, ["startDate", "effectiveFrom"]));
        const to = formatIsoDate(pickStr(r, ["endDate", "effectiveTo"]));
        const status = pickStr(r, ["status", "approvalStatus", "stage"]) || "—";
        return { id, leaveType: typeName, startDate: from, endDate: to, status };
      })
      .filter((x): x is MyLeaveRow => x !== null);
  }, [myItems]);

  const footerRangeStart = myRows.length > 0 ? (page - 1) * PAGE_LIMIT + 1 : 0;
  const footerRangeEnd = (page - 1) * PAGE_LIMIT + myRows.length;

  const columns = useMemo<DataTableColumn<MyLeaveRow>[]>(
    () => [
      { id: "leaveType", label: "Leave type" },
      { id: "startDate", label: "Start" },
      { id: "endDate", label: "End" },
      { id: "status", label: "Status" },
    ],
    [],
  );

  const handleCancel = () => {
    setLeaveType("");
    setStartDate("");
    setEndDate("");
    setReason("");
  };

  const closeApplyModal = () => {
    handleCancel();
    setApplyModalOpen(false);
  };

  const handleSubmit = () => {
    if (!leaveType.trim()) {
      publishAppToast({ variant: "error", message: "Please select leave type." });
      return;
    }
    if (!startDate.trim()) {
      publishAppToast({ variant: "error", message: "Please enter start date." });
      return;
    }
    if (!endDate.trim()) {
      publishAppToast({ variant: "error", message: "Please enter end date." });
      return;
    }
    if (!reason.trim()) {
      publishAppToast({ variant: "error", message: "Please enter reason." });
      return;
    }

    submitMutation.mutate(
      {
        leaveTypeId: leaveType.trim(),
        startDate: startDate.trim(),
        endDate: endDate.trim(),
        reason: reason.trim(),
      },
      {
        onSuccess: () => {
          publishAppToast({ variant: "success", message: "Leave applied successfully." });
          handleCancel();
          setApplyModalOpen(false);
        },
        onError: () => publishAppToast({ variant: "error", message: "Could not submit leave application." }),
      },
    );
  };

  return (
    <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>
      <Box sx={pageHeaderRow}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="regularLarge" fontWeight={700} color="white">
            Apply Leave (Employee)
          </Typography>
          <Typography variant="body2" sx={applyLeaveSubtextSx}>
            Submit leave application and track approval stages.
          </Typography>
        </Box>
        {canApplyLeave ? (
          <Button variant="primary" sx={departmentsAddButton} onClick={() => setApplyModalOpen(true)}>
            <AddCircleIcon width={16} height={16} />
            <Typography component="span" variant="medium" sx={{ color: "inherit" }}>
              Apply leave
            </Typography>
          </Button>
        ) : null}
      </Box>

      {canApplyLeave ? (
        <FormModal
          open={applyModalOpen}
          title="Apply leave"
          description="Choose leave type, dates, and reason. Your request will follow the normal approval flow."
          onClose={closeApplyModal}
          onSave={handleSubmit}
          primaryButtonLabel={submitMutation.isPending ? "Submitting…" : "Submit"}
          primaryButtonDisabled={submitMutation.isPending}
          cancelButtonLabel="Cancel"
          maxWidth={560}
          fitContent
        >
          <Box sx={applyLeaveFormGridSx}>
            <SelectField label="Leave Type" value={leaveType} onChange={setLeaveType} options={leaveTypeOptions} menuMaxRows={8} />
            <Calendar label="Start Date" value={startDate} onChange={setStartDate} />
            <Calendar label="End Date" value={endDate} min={startDate || undefined} onChange={setEndDate} />
            <InputField
              label="Reason"
              placeholder="Brief reason for leave"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Box>
        </FormModal>
      ) : null}

      {showLeaveInsights ? (
      <DashboardCard sx={rolesCard}>
        <Box sx={applyLeaveCardHeaderSx}>
          <Box sx={rolesIconBox}>
            <AttachMoneyIcon sx={applyLeaveIconSx} />
          </Box>
          <Typography variant="mediumLarge" fontWeight={600} color="white">
            My leave applications
          </Typography>
        </Box>

        <DataTable<MyLeaveRow>
          columns={columns}
          rows={myRows}
          isLoading={myLeavesQuery.isLoading || myLeavesQuery.isFetching}
          getRowId={(row) => row.id}
          minWidth={720}
        />

        <Box sx={rolesFooterRow}>
          <Typography variant="medium" sx={footerMutedText(theme)}>
            {myLeavesQuery.isLoading ? "Loading…" : `Showing data ${footerRangeStart} to ${footerRangeEnd} of ${totalEntries} entries`}
          </Typography>
          <Box sx={rolesPaginationWrapper}>
            <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
          </Box>
        </Box>
      </DashboardCard>
      ) : null}

      {!canApplyLeave && !showLeaveInsights ? (
        <DashboardCard sx={rolesCard}>
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.6, p: 1 }}>
            You do not have leave permissions assigned for this screen. Required operational permissions include{" "}
            <Box component="span" sx={{ color: "white", fontWeight: 600 }}>
              {OP.hrms.leave.apply}
            </Box>{" "}
            to submit, and{" "}
            <Box component="span" sx={{ color: "white", fontWeight: 600 }}>
              {OP.hrms.leave.selfView}
            </Box>{" "}
            to view your applications.
          </Typography>
        </DashboardCard>
      ) : null}
    </Box>
  );
}
