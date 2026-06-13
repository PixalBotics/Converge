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

import {
  isParentCompanyAdminApprover,
  resolveApprovalInboxAccess,
} from "../_approval-leave/utils/approval-inbox-scope";

import { userIsListedHead } from "@/app/dashboard/attendance/_team-attendance/utils/attendance-roster";

import { useAuth } from "@/lib/auth";

import { HRMS, hasAnyOperational } from "@/lib/permissions";

import { useDepartmentHeadsListQuery } from "@/lib/hooks/query";



const PAGE_LIMIT = 8;



const QUEUE_HEADER: Record<"pool" | "department" | "tenant", string> = {

  pool: "Approval Inbox — Team Members",

  department: "Approval Inbox — Pool Heads",

  tenant: "Approval Inbox — Department Heads",

};



export default function ApprovalLeavePage() {

  const { hasOperational: h, user, isPlatformAdmin } = useAuth();

  const skipDeptHeadRoster = user?.isPoolHead === true;

  const deptHeadsRosterQuery = useDepartmentHeadsListQuery(

    {

      all: true,

      ...(user?.parentCompanyId?.trim() ? { parentCompanyId: user.parentCompanyId.trim() } : {}),

    },

    { enabled: !skipDeptHeadRoster, scope: "approval-inbox-role-detect" },

  );

  const isParentCompanyAdmin = useMemo(

    () => isParentCompanyAdminApprover({ hasOperational: h, isPlatformAdmin, user }),

    [h, isPlatformAdmin, user],

  );

  const isDepartmentHead = useMemo(() => {

    if (user?.isPoolHead || isParentCompanyAdmin) return false;

    if (userIsListedHead(deptHeadsRosterQuery.data, user?.id)) return true;

    return h(HRMS.LEAVE_APPROVE_DEPT);

  }, [deptHeadsRosterQuery.data, user?.id, user?.isPoolHead, isParentCompanyAdmin, h]);

  const needsRosterDetect = !skipDeptHeadRoster && !isParentCompanyAdmin;

  const roleDetectLoading = needsRosterDetect && deptHeadsRosterQuery.isLoading;

  const inboxAccess = useMemo(

    () => resolveApprovalInboxAccess({ hasOperational: h, isPlatformAdmin, isDepartmentHead, user }),

    [h, isPlatformAdmin, isDepartmentHead, user],

  );



  const canPoolApprove = hasAnyOperational(h, [HRMS.LEAVE_APPROVE_POOL, HRMS.LEAVE_APPROVE]);

  const canPoolReject = canPoolApprove || h("hrms:leave:reject:pool");

  const canDeptApprove = hasAnyOperational(h, [HRMS.LEAVE_APPROVE_DEPT, HRMS.LEAVE_APPROVE]);

  const canDeptReject = canDeptApprove || h("hrms:leave:reject:department");

  const canTenantApprove = hasAnyOperational(h, [HRMS.LEAVE_APPROVE_TENANT, HRMS.LEAVE_APPROVE]);

  const canTenantReject = canTenantApprove;



  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const queue = inboxAccess.queue ?? "pool";

  const [decision, setDecision] = useState<LeaveDecision>(null);

  const queriesEnabled = !roleDetectLoading && Boolean(inboxAccess.queue);



  const poolQueueQuery = usePendingLeavePoolQueueQuery(

    {

      page,

      limit: PAGE_LIMIT,

      all: false,

      ...(search.trim() ? { search: search.trim() } : {}),

    },

    { enabled: queriesEnabled && queue === "pool" && inboxAccess.canUsePoolQueue, scope: "approval-inbox" },

  );

  const deptQueueQuery = usePendingLeaveDepartmentQueueQuery(

    { page, limit: PAGE_LIMIT, ...(search.trim() ? { search: search.trim() } : {}) },

    { enabled: queriesEnabled && queue === "department" && inboxAccess.canUseDepartmentQueue, scope: "approval-inbox" },

  );

  const tenantQueueQuery = usePendingLeaveTenantQueueQuery(

    { page, limit: PAGE_LIMIT, all: false, ...(search.trim() ? { search: search.trim() } : {}) },

    { enabled: queriesEnabled && queue === "tenant" && inboxAccess.canUseTenantQueue, scope: "approval-inbox" },

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

        const stage =

          queue === "pool" ? "Team member review" : queue === "department" ? "Pool head review" : "Department head review";

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



  if (roleDetectLoading) {

    return (

      <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>

        <Typography variant="regularLarge" fontWeight={700} color="white">

          Approval Inbox

        </Typography>

        <Typography variant="body2" sx={approvalLeaveSubtextSx}>

          Loading your approval scope…

        </Typography>

      </Box>

    );

  }



  if (!inboxAccess.queue) {

    return (

      <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>

        <Typography variant="regularLarge" fontWeight={700} color="white">

          Approval Inbox

        </Typography>

        <Typography variant="body2" sx={approvalLeaveSubtextSx}>

          You do not have permission to review leave applications.

        </Typography>

      </Box>

    );

  }



  return (

    <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>

      <Box sx={approvalLeaveHeaderWrapSx}>

        <Typography variant="regularLarge" fontWeight={700} color="white">

          {QUEUE_HEADER[queue]}

        </Typography>

        <Typography variant="body2" sx={approvalLeaveSubtextSx}>

          Review pending leave applications and decide.

        </Typography>

      </Box>



      <ApprovalLeaveTableCard

        queue={queue}

        onQueueChange={() => {}}

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

        canApprove={queue === "pool" ? canPoolApprove : queue === "department" ? canDeptApprove : canTenantApprove}

        canReject={queue === "pool" ? canPoolReject : queue === "department" ? canDeptReject : canTenantReject}

        canUsePoolQueue={inboxAccess.canUsePoolQueue}

        canUseDepartmentQueue={inboxAccess.canUseDepartmentQueue}

        canUseTenantQueue={inboxAccess.canUseTenantQueue}

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


