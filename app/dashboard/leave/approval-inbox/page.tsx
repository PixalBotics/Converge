"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { Typography } from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { rolesPageWrapper } from "../../roles/roles.styles";
import { pageWrapper } from "../../companies/overview.styles";
import { formatIsoDate, isRecord, pickNum, pickStr, unwrapApiData } from "@/lib/utils";
import { publishAppToast } from "@/lib/notify";
import {
  useDecideLeaveDepartmentMutation,
  useDecideLeavePoolMutation,
  usePendingLeaveDepartmentQueueQuery,
  usePendingLeavePoolQueueQuery,
} from "@/lib/hooks/query";
import {
  approvalLeaveHeaderWrapSx,
  approvalLeaveStatusSx,
  approvalLeaveSubtextSx,
} from "../_approval-leave/approval-leave.styles";
import { ApprovalLeaveTableCard, LeaveDecisionModal, type LeaveDecision } from "../_approval-leave/components";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions";

const PAGE_LIMIT = 8;

type ApprovalLeaveRow = {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  stage: string;
};

export default function ApprovalLeavePage() {
  const { hasOperational: h } = useAuth();
  const orgBypass = h(OP.hrms.org.manage);
  const canPoolApprove = orgBypass || h(OP.hrms.leave.approvePool) || h(OP.hrms.leave.approve);
  const canPoolReject = orgBypass || h(OP.hrms.leave.rejectPool);
  const canDeptApprove = orgBypass || h(OP.hrms.leave.approveDepartment) || h(OP.hrms.leave.approve);
  const canDeptReject = orgBypass || h(OP.hrms.leave.rejectDepartment);
  const canUsePoolQueue = canPoolApprove || canPoolReject || h(OP.hrms.leave.view);
  const canUseDepartmentQueue = canDeptApprove || canDeptReject || h(OP.hrms.leave.view);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [queue, setQueue] = useState<"pool" | "department">("pool");
  const [decision, setDecision] = useState<LeaveDecision>(null);

  const poolQueueQuery = usePendingLeavePoolQueueQuery(
    { page, limit: PAGE_LIMIT, ...(search.trim() ? { search: search.trim() } : {}) },
    { enabled: queue === "pool", scope: "approval-inbox" },
  );
  const deptQueueQuery = usePendingLeaveDepartmentQueueQuery(
    { page, limit: PAGE_LIMIT, ...(search.trim() ? { search: search.trim() } : {}) },
    { enabled: queue === "department", scope: "approval-inbox" },
  );
  const decidePoolMutation = useDecideLeavePoolMutation();
  const decideDeptMutation = useDecideLeaveDepartmentMutation();

  const activeQuery = queue === "pool" ? poolQueueQuery : deptQueueQuery;
  const payload = unwrapApiData(activeQuery.data);
  const payloadObj = isRecord(payload) ? payload : null;
  const items = useMemo(() => {
    const arr = payloadObj?.["items"];
    return Array.isArray(arr) ? (arr as unknown[]).filter(isRecord) : [];
  }, [payloadObj]);

  const rows = useMemo<ApprovalLeaveRow[]>(() => {
    return items
      .map((r) => {
        const id = pickStr(r, ["id"]);
        if (!id) return null;
        const leaveType =
          pickStr(isRecord(r["leaveType"]) ? (r["leaveType"] as Record<string, unknown>) : null, ["name"]) ||
          pickStr(r, ["leaveTypeName"]) ||
          "—";
        const startDate = formatIsoDate(pickStr(r, ["startDate", "effectiveFrom"]));
        const endDate = formatIsoDate(pickStr(r, ["endDate", "effectiveTo"]));
        const stage = queue === "pool" ? "Pool review" : "Department review";
        return { id, leaveType, startDate, endDate, stage };
      })
      .filter((x): x is ApprovalLeaveRow => x !== null);
  }, [items, queue]);

  const totalEntries = useMemo(() => {
    const n = pickNum(payloadObj, ["total", "count", "totalCount"]);
    return n ?? rows.length;
  }, [payloadObj, rows.length]);

  const pageCount = useMemo(() => {
    const n = pickNum(payloadObj, ["totalPages"]);
    return n && n > 0 ? n : 1;
  }, [payloadObj]);

  useEffect(() => {
    setPage(1);
  }, [queue, search]);

  useEffect(() => {
    if (queue === "pool" && !canUsePoolQueue && canUseDepartmentQueue) setQueue("department");
    else if (queue === "department" && !canUseDepartmentQueue && canUsePoolQueue) setQueue("pool");
  }, [canUseDepartmentQueue, canUsePoolQueue, queue]);

  useEffect(() => {
    setPage((prev) => (prev > pageCount ? pageCount : prev));
  }, [pageCount]);

  const footerRangeStart = rows.length > 0 ? (page - 1) * PAGE_LIMIT + 1 : 0;
  const footerRangeEnd = (page - 1) * PAGE_LIMIT + rows.length;

  const columns = useMemo<DataTableColumn<ApprovalLeaveRow>[]>(
    () => [
      { id: "leaveType", label: "Leave Type" },
      { id: "startDate", label: "Start" },
      { id: "endDate", label: "End" },
      {
        id: "stage",
        label: "Stage",
        render: (value) => (
          <Typography component="span" sx={approvalLeaveStatusSx}>
            {String(value)}
          </Typography>
        ),
      },
    ],
    [],
  );

  return (
    <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>
      <Box sx={approvalLeaveHeaderWrapSx}>
        <Typography variant="regularLarge" fontWeight={700} color="white">
          Approval Inbox (Manager / Pool Head)
        </Typography>
        <Typography variant="body2" sx={approvalLeaveSubtextSx}>
          Review pending leave applications and decide.
        </Typography>
      </Box>

      <ApprovalLeaveTableCard
        queue={queue}
        onQueueChange={setQueue}
        search={search}
        onSearchChange={setSearch}
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
        footerText={
          activeQuery.isLoading
            ? "Loading…"
            : `Showing data ${footerRangeStart} to ${footerRangeEnd} of ${totalEntries} entries`
        }
        isLoading={activeQuery.isLoading || activeQuery.isFetching}
        rows={rows}
        columns={columns}
        onApprove={(id) => setDecision({ id, action: "approve" })}
        onReject={(id) => setDecision({ id, action: "reject" })}
        canApprove={queue === "pool" ? canPoolApprove : canDeptApprove}
        canReject={queue === "pool" ? canPoolReject : canDeptReject}
        canUsePoolQueue={canUsePoolQueue}
        canUseDepartmentQueue={canUseDepartmentQueue}
      />

      <LeaveDecisionModal
        decision={decision}
        isLoading={decidePoolMutation.isPending || decideDeptMutation.isPending}
        onDismiss={() => {
          if (decidePoolMutation.isPending || decideDeptMutation.isPending) return;
          setDecision(null);
        }}
        onConfirm={() => {
          const d = decision;
          if (!d) return;
          const status = d.action === "approve" ? "approved" : "rejected";
          const mutate = queue === "pool" ? decidePoolMutation : decideDeptMutation;
          mutate.mutate(
            { id: d.id, body: { status } },
            {
              onSuccess: () => {
                publishAppToast({ variant: "success", message: d.action === "approve" ? "Approved." : "Rejected." });
                setDecision(null);
              },
              onError: () =>
                publishAppToast({
                  variant: "error",
                  message: d.action === "approve" ? "Could not approve." : "Could not reject.",
                }),
            },
          );
        }}
      />
    </Box>
  );
}
