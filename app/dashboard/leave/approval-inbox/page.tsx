"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { Typography } from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { rolesPageWrapper } from "../../roles/roles.styles";
import { pageWrapper } from "../../companies/overview.styles";
import { formatIsoDate, isRecord, pickNum, pickStr, unwrapApiData } from "@/lib/utils/core";
import { publishAppToast } from "@/lib/notify";
import {
  useDecideLeaveTenantMutation,
  useDecideLeaveDepartmentMutation,
  useDecideLeavePoolMutation,
  usePendingLeaveDepartmentQueueQuery,
  usePendingLeavePoolQueueQuery,
  usePendingLeaveTenantQueueQuery,
} from "@/lib/hooks/query";
import {
  approvalLeaveHeaderWrapSx,
  approvalLeaveStatusSx,
  approvalLeaveSubtextSx,
} from "../_approval-leave/approval-leave.styles";
import {
  ApprovalLeaveTableCard,
  LeaveDecisionModal,
  type ApprovalLeaveRow,
  type LeaveDecision,
} from "../_approval-leave/components";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions";

const PAGE_LIMIT = 8;

export default function ApprovalLeavePage() {
  const { hasOperational: h, user } = useAuth();
  const orgBypass = h(OP.hrms.org.manage);
  const canPoolApprove = orgBypass || h(OP.hrms.leave.approvePool) || h(OP.hrms.leave.approve);
  const canPoolReject = orgBypass || h(OP.hrms.leave.rejectPool);
  const canDeptApprove = orgBypass || h(OP.hrms.leave.approveDepartment) || h(OP.hrms.leave.approve);
  const canDeptReject = orgBypass || h(OP.hrms.leave.rejectDepartment);
  const canUsePoolQueue = canPoolApprove || canPoolReject || h(OP.hrms.leave.view);
  const canUseDepartmentQueue = canDeptApprove || canDeptReject || h(OP.hrms.leave.view);
  const canTenantApprove = canDeptApprove;
  const canTenantReject = canDeptReject;
  const canUseTenantQueue = canTenantApprove || canTenantReject || h(OP.hrms.leave.view);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [queue, setQueue] = useState<"pool" | "department" | "tenant">("pool");
  const [decision, setDecision] = useState<LeaveDecision>(null);

  const sessionPoolId = user?.poolId?.trim() ?? "";
  const poolQueueEnabled =
    queue === "pool" && canUsePoolQueue && (orgBypass || Boolean(sessionPoolId));

  const poolQueueQuery = usePendingLeavePoolQueueQuery(
    {
      page,
      limit: PAGE_LIMIT,
      all: false,
      ...(sessionPoolId ? { poolId: sessionPoolId } : {}),
      ...(search.trim() ? { search: search.trim() } : {}),
    },
    { enabled: poolQueueEnabled, scope: "approval-inbox" },
  );
  const deptQueueQuery = usePendingLeaveDepartmentQueueQuery(
    { page, limit: PAGE_LIMIT, ...(search.trim() ? { search: search.trim() } : {}) },
    { enabled: queue === "department", scope: "approval-inbox" },
  );
  const tenantQueueQuery = usePendingLeaveTenantQueueQuery(
    { page, limit: PAGE_LIMIT, all: false, ...(search.trim() ? { search: search.trim() } : {}) },
    { enabled: queue === "tenant" && canUseTenantQueue, scope: "approval-inbox" },
  );
  const decidePoolMutation = useDecideLeavePoolMutation();
  const decideDeptMutation = useDecideLeaveDepartmentMutation();
  const decideTenantMutation = useDecideLeaveTenantMutation();

  const activeQuery = queue === "pool" ? poolQueueQuery : queue === "department" ? deptQueueQuery : tenantQueueQuery;
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
        const stage = queue === "pool" ? "Pool review" : queue === "department" ? "Department review" : "Tenant review";
        const applicant = isRecord(r["user"]) ? (r["user"] as Record<string, unknown>) : null;
        const poolNested =
          applicant && isRecord(applicant["pool"]) ? (applicant["pool"] as Record<string, unknown>) : null;
        const departmentNested =
          applicant && isRecord(applicant["department"]) ? (applicant["department"] as Record<string, unknown>) : null;
        const row: ApprovalLeaveRow = {
          id,
          leaveType,
          startDate,
          endDate,
          stage,
          applicantFirstName: pickStr(applicant, ["firstName"]) || "—",
          applicantLastName: pickStr(applicant, ["lastName"]) || "—",
          departmentName:
            pickStr(applicant, ["departmentName"]) || pickStr(departmentNested, ["name"]) || "—",
          poolName: pickStr(applicant, ["poolName"]) || pickStr(poolNested, ["name"]) || "—",
        };
        return row;
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
    else if (queue === "department" && !canUseDepartmentQueue && canUseTenantQueue) setQueue("tenant");
    else if (queue === "department" && !canUseDepartmentQueue && canUsePoolQueue) setQueue("pool");
    else if (queue === "tenant" && !canUseTenantQueue && canUseDepartmentQueue) setQueue("department");
    else if (queue === "tenant" && !canUseTenantQueue && canUsePoolQueue) setQueue("pool");
  }, [canUseDepartmentQueue, canUsePoolQueue, canUseTenantQueue, queue]);

  useEffect(() => {
    setPage((prev) => (prev > pageCount ? pageCount : prev));
  }, [pageCount]);

  const footerRangeStart = rows.length > 0 ? (page - 1) * PAGE_LIMIT + 1 : 0;
  const footerRangeEnd = (page - 1) * PAGE_LIMIT + rows.length;

  const columns = useMemo<DataTableColumn<ApprovalLeaveRow>[]>(
    () => [
      ...(queue === "pool"
        ? ([
            { id: "applicantFirstName", label: "First name" },
            { id: "applicantLastName", label: "Last name" },
            { id: "poolName", label: "Pool" },
          ] as DataTableColumn<ApprovalLeaveRow>[])
        : ([
            { id: "applicantFirstName", label: "First name" },
            { id: "applicantLastName", label: "Last name" },
            { id: "departmentName", label: "Department name" },
            { id: "poolName", label: "Pool name" },
          ] as DataTableColumn<ApprovalLeaveRow>[])),
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
    [queue],
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
        canReject={queue === "pool" ? canPoolReject : queue === "department" ? canDeptReject : canTenantReject}
        canUsePoolQueue={canUsePoolQueue}
        canUseDepartmentQueue={canUseDepartmentQueue}
        canUseTenantQueue={canUseTenantQueue}
      />

      <LeaveDecisionModal
        decision={decision}
        isLoading={decidePoolMutation.isPending || decideDeptMutation.isPending || decideTenantMutation.isPending}
        onDismiss={() => {
          if (decidePoolMutation.isPending || decideDeptMutation.isPending || decideTenantMutation.isPending) return;
          setDecision(null);
        }}
        onConfirm={() => {
          const d = decision;
          if (!d) return;
          const status = d.action === "approve" ? "approved" : "rejected";
          const mutate =
            queue === "pool"
              ? decidePoolMutation
              : queue === "department"
                ? decideDeptMutation
                : decideTenantMutation;
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
