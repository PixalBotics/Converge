"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import { AttachMoney as AttachMoneyIcon } from "@mui/icons-material";
import { alpha, useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import Checkbox from "@mui/material/Checkbox";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import {
  Typography,
  DashboardCard,
  Button,
  SelectField,
  FormModal,
  SearchBar,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { rolesCard, rolesIconBox, rolesPageWrapper } from "../roles/roles.styles";
import { pageWrapper } from "../companies/overview.styles";
import { departmentsCardHeader } from "../website-assigning/website-assigning.styles";
import { publishAppToast } from "@/lib/notify";
import { isRecord, pickNum, pickStr, unwrapApiData } from "@/lib/utils";
import {
  type HrmsPoolsListParams,
  useAddPoolMemberMutation,
  useCompaniesByResellerQuery,
  useCompaniesSetupResellersQuery,
  useCreatePoolMutation,
  useDeletePoolMutation,
  useDepartmentsListQuery,
  usePoolsListQuery,
  useUpdatePoolMutation,
  useUsersListQuery,
} from "@/lib/hooks/query";
import {
  extractParentCompaniesFromByResellerTree,
  pickItemsArray,
  toIdNameOption,
} from "@/app/dashboard/user-page/components/add-user-modal.utils";
import { extractUsersRows } from "@/app/dashboard/user-page/utils";
import type { UserRow } from "@/app/dashboard/user-page/types";
import { PoolModals, PoolsTableCard, UnifiedPoolMembersCard } from "./components";
import type { PoolRow } from "./components";
import { useAuth } from "@/lib/auth";
import {
  canPoolAction,
  canPoolMemberAdd,
  canPoolMemberList,
  canPoolMemberMove,
  canPoolMemberRemove,
} from "@/lib/permissions";

const PAGE_LIMIT = 8;
const HUB_ADD_USER_TABLE_MAX_PX = 360;

const hubUserCheckboxSx = (theme: AppTheme) => ({
  color: theme.app.dashboard.textMuted,
  "&.Mui-checked": { color: "#2dd4bf" },
});

export type PoolsPageMode = "pools" | "pool-members";

export type PoolsPageViewProps = {
  mode: PoolsPageMode;
};

export function PoolsPageView({ mode }: PoolsPageViewProps) {
  const theme = useTheme() as AppTheme;
  const isMembersHub = mode === "pool-members";
  const { hasOperational, hasPage, user } = useAuth();
  const canCreatePool = canPoolAction(hasOperational, "create");
  const canUpdatePool = canPoolAction(hasOperational, "update");
  const canDeletePool = canPoolAction(hasOperational, "delete");
  const hasHrmsPage = hasPage("page:hrms");
  const canListPoolMembers = hasHrmsPage && canPoolMemberList(hasOperational);
  const canAddPoolMember = hasHrmsPage && canPoolMemberAdd(hasOperational);
  const canMovePoolMember = hasHrmsPage && canPoolMemberMove(hasOperational);
  const canRemovePoolMember = hasHrmsPage && canPoolMemberRemove(hasOperational);

  const [resellerId, setResellerId] = useState("");
  const [parentCompanyId, setParentCompanyId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [poolNameField, setPoolNameField] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [createDeptKind, setCreateDeptKind] = useState<"Internal" | "External">("Internal");
  const [createModalResellerId, setCreateModalResellerId] = useState("");
  const [createModalParentCompanyId, setCreateModalParentCompanyId] = useState("");
  const [createModalDepartmentId, setCreateModalDepartmentId] = useState("");
  const [editTarget, setEditTarget] = useState<PoolRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PoolRow | null>(null);
  const [editName, setEditName] = useState("");
  const [hubAddOpen, setHubAddOpen] = useState(false);
  const [hubDeptKind, setHubDeptKind] = useState<"Internal" | "External">("Internal");
  const [hubResellerId, setHubResellerId] = useState("");
  const [hubParentCompanyId, setHubParentCompanyId] = useState("");
  const [hubDepartmentId, setHubDepartmentId] = useState("");
  const [hubPoolId, setHubPoolId] = useState("");
  const [hubUserId, setHubUserId] = useState("");
  const [hubUserSearchInput, setHubUserSearchInput] = useState("");
  const [hubUserSearchApplied, setHubUserSearchApplied] = useState("");

  const resellersQuery = useCompaniesSetupResellersQuery({ enabled: true });
  const resellerOptions = useMemo(() => {
    const base = pickItemsArray(resellersQuery.data)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => o !== null);
    return [{ value: "", label: "— Select reseller —" }, ...base];
  }, [resellersQuery.data]);

  /** Tree view + extractor so option values are real ParentCompany ids (flat list row `id` is often wrong for HRMS). */
  const parentCompaniesQuery = useCompaniesByResellerQuery(
    resellerId.trim(),
    { view: "tree", sortBy: "name", sortOrder: "asc", all: true },
    { enabled: Boolean(resellerId.trim()) },
  );
  const parentCompanyOptions = useMemo(() => {
    const base = extractParentCompaniesFromByResellerTree(parentCompaniesQuery.data).map((o) => ({
      value: o.value,
      label: o.label,
    }));
    const placeholder =
      parentCompaniesQuery.isLoading && resellerId.trim()
        ? "Loading parent companies…"
        : "— Select parent company —";
    return [{ value: "", label: placeholder }, ...base];
  }, [parentCompaniesQuery.data, parentCompaniesQuery.isLoading, resellerId]);

  const createModalParentCompaniesQuery = useCompaniesByResellerQuery(
    createModalResellerId.trim(),
    { view: "tree", sortBy: "name", sortOrder: "asc", all: true },
    {
      enabled:
        createOpen && !isMembersHub && createDeptKind === "External" && Boolean(createModalResellerId.trim()),
    },
  );

  const createInternalDepartmentsQuery = useDepartmentsListQuery(
    { type: "Internal", all: true },
    { enabled: createOpen && !isMembersHub && createDeptKind === "Internal", scope: "pool-create-int-dept" },
  );

  const createExternalDepartmentsQuery = useDepartmentsListQuery(
    {
      all: true,
      type: "External",
      parentCompanyId: createModalParentCompanyId.trim(),
    },
    {
      enabled:
        createOpen &&
        !isMembersHub &&
        createDeptKind === "External" &&
        Boolean(createModalResellerId.trim()) &&
        Boolean(createModalParentCompanyId.trim()),
      scope: "pool-create-ext-dept",
    },
  );

  const departmentsQuery = useDepartmentsListQuery(
    {
      all: true,
      ...(resellerId.trim() ? { resellerId: resellerId.trim() } : {}),
      ...(parentCompanyId.trim() ? { parentCompanyId: parentCompanyId.trim() } : {}),
      ...(resellerId.trim() && parentCompanyId.trim()
        ? { type: "External" as const }
        : {}),
    },
    { enabled: true, scope: "pools" },
  );
  const departmentOptions = useMemo(() => {
    const base = pickItemsArray(departmentsQuery.data)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => o !== null);
    return [{ value: "", label: "— Select department —" }, ...base];
  }, [departmentsQuery.data]);

  const createModalParentCompanyOptionsForCreate = useMemo(() => {
    const base = extractParentCompaniesFromByResellerTree(createModalParentCompaniesQuery.data).map((o) => ({
      value: o.value,
      label: o.label,
    }));
    const placeholder = createModalParentCompaniesQuery.isLoading
      ? "Loading parent companies…"
      : "— Select parent company —";
    return [{ value: "", label: placeholder }, ...base];
  }, [createModalParentCompaniesQuery.data, createModalParentCompaniesQuery.isLoading]);

  const createPoolDepartmentOptions = useMemo(() => {
    const data =
      createDeptKind === "Internal" ? createInternalDepartmentsQuery.data : createExternalDepartmentsQuery.data;
    const loading =
      createDeptKind === "Internal"
        ? createInternalDepartmentsQuery.isLoading
        : createExternalDepartmentsQuery.isLoading;
    const base = pickItemsArray(data)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => o !== null);
    return [
      {
        value: "",
        label: loading ? "Loading departments…" : "— Select department —",
      },
      ...base,
    ];
  }, [
    createDeptKind,
    createInternalDepartmentsQuery.data,
    createInternalDepartmentsQuery.isLoading,
    createExternalDepartmentsQuery.data,
    createExternalDepartmentsQuery.isLoading,
  ]);

  const createSaveDisabled = useMemo(() => {
    if (!poolNameField.trim()) return true;
    if (!createModalDepartmentId.trim()) return true;
    if (createDeptKind === "External") {
      if (!createModalResellerId.trim() || !createModalParentCompanyId.trim()) return true;
    }
    return false;
  }, [
    poolNameField,
    createModalDepartmentId,
    createDeptKind,
    createModalResellerId,
    createModalParentCompanyId,
  ]);

  const listParams = useMemo((): HrmsPoolsListParams => {
    const params: HrmsPoolsListParams = { page, limit: PAGE_LIMIT };
    if (appliedSearch.trim()) params.search = appliedSearch.trim();
    if (resellerId.trim()) params.resellerId = resellerId.trim();
    if (parentCompanyId.trim()) params.parentCompanyId = parentCompanyId.trim();
    if (departmentId.trim()) params.departmentId = departmentId.trim();
    return params;
  }, [appliedSearch, departmentId, page, parentCompanyId, resellerId]);

  const poolsQuery = usePoolsListQuery(listParams, { enabled: !isMembersHub, scope: "pools-page" });
  const createMutation = useCreatePoolMutation();
  const updateMutation = useUpdatePoolMutation();
  const deleteMutation = useDeletePoolMutation();
  const addPoolMemberMutation = useAddPoolMemberMutation();

  const addMemberHubQueriesActive = isMembersHub && canAddPoolMember && hubAddOpen;

  const hubModalParentCompaniesQuery = useCompaniesByResellerQuery(
    hubResellerId.trim(),
    { view: "tree", sortBy: "name", sortOrder: "asc", all: true },
    { enabled: addMemberHubQueriesActive && hubDeptKind === "External" && Boolean(hubResellerId.trim()) },
  );

  const hubInternalDepartmentsQuery = useDepartmentsListQuery(
    { type: "Internal", all: true },
    { enabled: addMemberHubQueriesActive && hubDeptKind === "Internal", scope: "hub-add-pm-int-dept" },
  );

  const hubExternalDepartmentsQuery = useDepartmentsListQuery(
    {
      all: true,
      type: "External",
      parentCompanyId: hubParentCompanyId.trim(),
    },
    {
      enabled:
        addMemberHubQueriesActive &&
        hubDeptKind === "External" &&
        Boolean(hubResellerId.trim()) &&
        Boolean(hubParentCompanyId.trim()),
      scope: "hub-add-pm-ext-dept",
    },
  );

  const hubAddPoolsQuery = usePoolsListQuery(
    addMemberHubQueriesActive && hubDepartmentId.trim()
      ? { departmentId: hubDepartmentId.trim(), all: true }
      : undefined,
    { enabled: addMemberHubQueriesActive && Boolean(hubDepartmentId.trim()), scope: "hub-add-pm-pools" },
  );

  /** Department narrows list when set; without it we still load all internal users (same idea as pool-heads assign). */
  const hubInternalUsersQuery = useUsersListQuery(
    addMemberHubQueriesActive && hubDeptKind === "Internal"
      ? {
          all: true,
          userType: "Internal",
          unassignedPoolOnly: true,
          ...(hubDepartmentId.trim() ? { departmentId: hubDepartmentId.trim() } : {}),
        }
      : undefined,
    { enabled: addMemberHubQueriesActive && hubDeptKind === "Internal" },
  );

  const hubExternalUsersQuery = useUsersListQuery(
    addMemberHubQueriesActive &&
      hubDeptKind === "External" &&
      hubResellerId.trim() &&
      hubParentCompanyId.trim()
      ? {
          all: true,
          userType: "External",
          unassignedPoolOnly: true,
          parentCompanyId: hubParentCompanyId.trim(),
          ...(hubDepartmentId.trim() ? { departmentId: hubDepartmentId.trim() } : {}),
        }
      : undefined,
    {
      enabled:
        addMemberHubQueriesActive &&
        hubDeptKind === "External" &&
        Boolean(hubResellerId.trim()) &&
        Boolean(hubParentCompanyId.trim()),
    },
  );

  const payload = unwrapApiData(poolsQuery.data);
  const payloadObj = isRecord(payload) ? payload : null;
  const items = useMemo(() => {
    if (!payloadObj) return [];
    const arr = payloadObj["items"];
    return Array.isArray(arr) ? (arr as unknown[]).filter(isRecord) : [];
  }, [payloadObj]);

  const totalEntries = useMemo(() => {
    const n = pickNum(payloadObj, ["total", "count", "totalCount"]);
    return n ?? items.length;
  }, [payloadObj, items.length]);

  const pageCount = useMemo(() => {
    const n = pickNum(payloadObj, ["totalPages"]);
    return n && n > 0 ? n : 1;
  }, [payloadObj]);

  useEffect(() => {
    setPage(1);
  }, [resellerId, parentCompanyId, departmentId]);

  useEffect(() => {
    setParentCompanyId("");
    setDepartmentId("");
  }, [resellerId]);

  useEffect(() => {
    setDepartmentId("");
  }, [parentCompanyId]);

  useEffect(() => {
    setPage((p) => (p > pageCount ? pageCount : p));
  }, [pageCount]);

  const tableRows = useMemo<PoolRow[]>(() => {
    return items
      .map((r) => {
        const dept = isRecord(r["department"]) ? (r["department"] as Record<string, unknown>) : null;
        const rowDepartmentId =
          pickStr(dept, ["id"]) ||
          pickStr(r, ["departmentId", "department_id"]) ||
          "";
        return {
          id: pickStr(r, ["id"]) || "",
          poolName: pickStr(r, ["name", "poolName"]) || "—",
          departmentName: pickStr(dept, ["name"]) || "—",
          departmentId: rowDepartmentId,
        };
      })
      .filter((r) => r.id);
  }, [items]);

  const footerRangeStart = tableRows.length > 0 ? (page - 1) * PAGE_LIMIT + 1 : 0;
  const footerRangeEnd = (page - 1) * PAGE_LIMIT + tableRows.length;

  const columns = useMemo<DataTableColumn<PoolRow>[]>(
    () => [
      { id: "poolName", label: "Pool Name" },
      { id: "departmentName", label: "Department" },
    ],
    [],
  );

  const resetForm = () => {
    setPoolNameField("");
  };

  const resetCreatePoolModal = () => {
    setCreateDeptKind("Internal");
    setCreateModalResellerId("");
    setCreateModalParentCompanyId("");
    setCreateModalDepartmentId("");
    setPoolNameField("");
  };

  const handleSavePool = (opts?: { onSuccess?: () => void }) => {
    const name = poolNameField.trim();
    if (!name) {
      publishAppToast({ variant: "error", message: "Please enter a pool name." });
      return;
    }
    if (createDeptKind === "External" && (!createModalResellerId.trim() || !createModalParentCompanyId.trim())) {
      publishAppToast({ variant: "error", message: "Select reseller and parent company for an external department." });
      return;
    }
    if (!createModalDepartmentId.trim()) {
      publishAppToast({ variant: "error", message: "Please select a department." });
      return;
    }
    createMutation.mutate(
      { departmentId: createModalDepartmentId.trim(), name },
      {
        onSuccess: () => {
          publishAppToast({ variant: "success", message: `Pool “${name}” saved.` });
          resetForm();
          opts?.onSuccess?.();
        },
        onError: () => publishAppToast({ variant: "error", message: "Could not create pool." }),
      },
    );
  };

  const handleClearFilters = () => {
    setResellerId("");
    setParentCompanyId("");
    setDepartmentId("");
    setSearchInput("");
    setAppliedSearch("");
    setPage(1);
  };

  const hubModalParentCompanyOptions = useMemo(() => {
    const base = extractParentCompaniesFromByResellerTree(hubModalParentCompaniesQuery.data).map((o) => ({
      value: o.value,
      label: o.label,
    }));
    const placeholder = hubModalParentCompaniesQuery.isLoading
      ? "Loading parent companies…"
      : "— Select parent company —";
    return [{ value: "", label: placeholder }, ...base];
  }, [hubModalParentCompaniesQuery.data, hubModalParentCompaniesQuery.isLoading]);

  const hubDepartmentOptions = useMemo(() => {
    const data =
      hubDeptKind === "Internal" ? hubInternalDepartmentsQuery.data : hubExternalDepartmentsQuery.data;
    const loading =
      hubDeptKind === "Internal"
        ? hubInternalDepartmentsQuery.isLoading
        : hubExternalDepartmentsQuery.isLoading;
    const base = pickItemsArray(data)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => o !== null);
    return [
      {
        value: "",
        label: loading ? "Loading departments…" : "— Select department —",
      },
      ...base,
    ];
  }, [
    hubDeptKind,
    hubInternalDepartmentsQuery.data,
    hubInternalDepartmentsQuery.isLoading,
    hubExternalDepartmentsQuery.data,
    hubExternalDepartmentsQuery.isLoading,
  ]);

  const hubAddPoolOptions = useMemo(() => {
    const items = pickItemsArray(unwrapApiData(hubAddPoolsQuery.data))
      .map((r) => {
        if (!isRecord(r)) return null;
        const id = pickStr(r, ["id"]) || "";
        const name = pickStr(r, ["name", "poolName"]) || "";
        if (!id) return null;
        return { value: id, label: name };
      })
      .filter((o): o is { value: string; label: string } => o !== null);
    return [{ value: "", label: hubAddPoolsQuery.isLoading ? "Loading pools…" : "— Select pool —" }, ...items];
  }, [hubAddPoolsQuery.data, hubAddPoolsQuery.isLoading]);

  const hubUserSourceRows = useMemo((): UserRow[] => {
    const data = hubDeptKind === "Internal" ? hubInternalUsersQuery.data : hubExternalUsersQuery.data;
    return extractUsersRows(data);
  }, [hubDeptKind, hubInternalUsersQuery.data, hubExternalUsersQuery.data]);

  /** Full list for the selected Internal/External query; narrowed only after Search applies. */
  const hubFilteredUserRows = useMemo(() => {
    const raw = hubUserSearchApplied.replace(/[\u200B-\u200D\uFEFF]/g, "").trim().toLowerCase();
    const q = raw.replace(/\s+/g, " ");
    if (!q) return hubUserSourceRows;
    return hubUserSourceRows.filter((r) => {
      const blob = [r.type, r.user, r.email, r.department].join(" ").toLowerCase().replace(/\s+/g, " ");
      return blob.includes(q);
    });
  }, [hubUserSourceRows, hubUserSearchApplied]);

  const hubUsersLoading =
    hubDeptKind === "Internal"
      ? hubInternalUsersQuery.isLoading || hubInternalUsersQuery.isFetching
      : hubExternalUsersQuery.isLoading || hubExternalUsersQuery.isFetching;

  const hubUsersFetchError =
    hubDeptKind === "Internal" ? hubInternalUsersQuery.isError : hubExternalUsersQuery.isError;

  useEffect(() => {
    if (!hubUserId.trim()) return;
    if (!hubFilteredUserRows.some((r) => r.id === hubUserId)) setHubUserId("");
  }, [hubFilteredUserRows, hubUserId]);

  const resetHubAddMemberForm = () => {
    setHubDeptKind("Internal");
    setHubResellerId("");
    setHubParentCompanyId("");
    setHubDepartmentId("");
    setHubPoolId("");
    setHubUserId("");
    setHubUserSearchInput("");
    setHubUserSearchApplied("");
  };

  const handleHubAddMemberSave = () => {
    const pid = hubPoolId.trim();
    const uid = hubUserId.trim();
    if (!pid || !uid) {
      publishAppToast({ variant: "error", message: "Select both pool and user." });
      return;
    }
    addPoolMemberMutation.mutate(
      { poolId: pid, userId: uid },
      {
        onSuccess: () => {
          publishAppToast({ variant: "success", message: "Member added to pool." });
          setHubAddOpen(false);
          resetHubAddMemberForm();
        },
        onError: () => publishAppToast({ variant: "error", message: "Could not add member." }),
      },
    );
  };

  const pageTitle = isMembersHub ? "Pool members" : "Pools";
  const pageSubtitle = isMembersHub
    ? "Open Add pool member to assign someone to a pool. The table below lists members for the department you pick in Filters."
    : "Create and manage pools by department.";

  const poolsTableEl = (
    <PoolsTableCard
      rows={tableRows}
      columns={columns}
      isLoading={poolsQuery.isLoading || poolsQuery.isFetching}
      search={searchInput}
      onSearchChange={setSearchInput}
      onSearchSubmit={() => {
        setAppliedSearch(searchInput);
        setPage(1);
      }}
      page={page}
      pageCount={pageCount}
      footerText={
        poolsQuery.isLoading
          ? "Loading…"
          : `Showing data ${footerRangeStart} to ${footerRangeEnd} of ${totalEntries} entries`
      }
      onPageChange={setPage}
      onEdit={(row) => {
        setEditTarget(row);
        setEditName(row.poolName);
      }}
      onDelete={setDeleteTarget}
      disableActions={deleteMutation.isPending}
      canEdit={canUpdatePool}
      canDelete={canDeletePool}
      canViewMembers={false}
    />
  );

  return (
    <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, mb: 0.75 }}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} color="white">
            {pageTitle}
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.75, color: theme.app.dashboard.textMuted, maxWidth: 720 }}>
            {pageSubtitle}
          </Typography>
        </Box>

        {isMembersHub && canAddPoolMember ? (
          <Button
            variant="primary"
            sx={gradientPrimaryButtonSx}
            disabled={addPoolMemberMutation.isPending}
            onClick={() => {
              resetHubAddMemberForm();
              setHubAddOpen(true);
            }}
          >
            Add pool member
          </Button>
        ) : !isMembersHub && canCreatePool ? (
          <Button
            variant="primary"
            sx={gradientPrimaryButtonSx}
            disabled={deleteMutation.isPending}
            onClick={() => {
              resetCreatePoolModal();
              setCreateOpen(true);
            }}
          >
            Add pool
          </Button>
        ) : null}
      </Box>

      <DashboardCard sx={rolesCard}>
        <Box sx={departmentsCardHeader}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={rolesIconBox}>
              <AttachMoneyIcon sx={{ fontSize: 20, color: theme.app.dashboard.white95 }} />
            </Box>
            <Typography variant="mediumLarge" fontWeight={600} color="white">
              Filters
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button variant="outlined" onClick={handleClearFilters}>
              Clear filters
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)" },
            gap: 1.5,
            mt: 2,
          }}
        >
          <SelectField
            label="Reseller"
            value={resellerId}
            onChange={setResellerId}
            options={resellerOptions}
            menuMaxRows={8}
          />
          <SelectField
            label="Parent company"
            value={parentCompanyId}
            onChange={setParentCompanyId}
            options={parentCompanyOptions}
            menuMaxRows={8}
            disabled={!resellerId.trim()}
          />
          <SelectField
            label="Department"
            value={departmentId}
            onChange={setDepartmentId}
            options={departmentOptions}
            menuMaxRows={8}
          />
        </Box>
      </DashboardCard>

      {isMembersHub && !canListPoolMembers ? (
        <Typography variant="body2" sx={{ mt: 2, color: theme.app.dashboard.textMuted }}>
          You need page:hrms plus pool view (or org pool manage) to list members on this page.
        </Typography>
      ) : null}

      {isMembersHub && canListPoolMembers ? (
        <Box sx={{ mt: 2 }}>
          <UnifiedPoolMembersCard
            departmentId={departmentId}
            sessionPoolId={user?.poolId}
            active={canListPoolMembers}
            canMove={canMovePoolMember}
            canRemove={canRemovePoolMember}
          />
        </Box>
      ) : (
        poolsTableEl
      )}

      {isMembersHub && canAddPoolMember ? (
        <FormModal
          open={hubAddOpen}
          title="Add pool member"
          description="Choose the target pool, pick one user from the list, then confirm. Internal users load by default; external flows need reseller and parent company first."
          onClose={() => {
            if (addPoolMemberMutation.isPending) return;
            setHubAddOpen(false);
            resetHubAddMemberForm();
          }}
          onSave={handleHubAddMemberSave}
          primaryButtonLabel={addPoolMemberMutation.isPending ? "Adding…" : "Add to pool"}
          primaryButtonDisabled={addPoolMemberMutation.isPending || !hubPoolId.trim() || !hubUserId.trim()}
          cancelButtonLabel="Cancel"
          maxWidth={760}
          fitContent
        >
          <Stack spacing={0}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 0.5 }}>
              <Button
                variant="outlined"
                size="small"
                disabled={addPoolMemberMutation.isPending}
                onClick={resetHubAddMemberForm}
                sx={{
                  minWidth: 0,
                  px: 1.5,
                  py: 0.5,
                  borderColor: "transparent",
                  color: theme.app.text.secondary,
                  fontWeight: 600,
                  textTransform: "none",
                  boxShadow: "none",
                  "&:hover": {
                    borderColor: theme.app.dashboard.overlayBorder,
                    bgcolor: alpha(theme.palette.common.white, theme.palette.mode === "light" ? 0.06 : 0.08),
                  },
                }}
              >
                Reset all fields
              </Button>
            </Box>

            <Box
              sx={{
                p: 2.25,
                borderRadius: 2,
                border: `1px solid ${theme.app.dashboard.overlayBorder}`,
                bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === "light" ? 0.06 : 0.12),
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  color: theme.app.text.secondary,
                }}
              >
                Target pool
              </Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <SelectField
                  label="Department type"
                  value={hubDeptKind}
                  onChange={(v) => {
                    const next = v as "Internal" | "External";
                    setHubDeptKind(next);
                    setHubResellerId("");
                    setHubParentCompanyId("");
                    setHubDepartmentId("");
                    setHubPoolId("");
                    setHubUserId("");
                    setHubUserSearchInput("");
                    setHubUserSearchApplied("");
                  }}
                  options={[
                    { value: "Internal", label: "Internal" },
                    { value: "External", label: "External" },
                  ]}
                  menuMaxRows={4}
                />

                {hubDeptKind === "External" ? (
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
                    <SelectField
                      label="Reseller"
                      value={hubResellerId}
                      onChange={(v) => {
                        setHubResellerId(v);
                        setHubParentCompanyId("");
                        setHubDepartmentId("");
                        setHubPoolId("");
                        setHubUserId("");
                        setHubUserSearchApplied("");
                      }}
                      options={resellerOptions}
                      menuMaxRows={8}
                    />
                    <SelectField
                      label="Parent company"
                      value={hubParentCompanyId}
                      onChange={(v) => {
                        setHubParentCompanyId(v);
                        setHubDepartmentId("");
                        setHubPoolId("");
                        setHubUserId("");
                        setHubUserSearchApplied("");
                      }}
                      options={hubModalParentCompanyOptions}
                      menuMaxRows={8}
                      disabled={!hubResellerId.trim()}
                    />
                  </Box>
                ) : null}

                <SelectField
                  label="Department"
                  value={hubDepartmentId}
                  onChange={(v) => {
                    setHubDepartmentId(v);
                    setHubPoolId("");
                    setHubUserId("");
                    setHubUserSearchApplied("");
                  }}
                  options={hubDepartmentOptions}
                  menuMaxRows={10}
                  disabled={hubDeptKind === "External" && (!hubResellerId.trim() || !hubParentCompanyId.trim())}
                />

                <SelectField
                  label="Pool"
                  value={hubPoolId}
                  onChange={setHubPoolId}
                  options={hubAddPoolOptions}
                  menuMaxRows={12}
                  disabled={!hubDepartmentId.trim()}
                />
              </Stack>
            </Box>

            <Divider sx={{ my: 2.5, borderColor: theme.app.dashboard.overlayBorder }} />

            <Box
              sx={{
                p: 2.25,
                borderRadius: 2,
                border: `1px solid ${theme.app.dashboard.overlayBorder}`,
                bgcolor:
                  theme.palette.mode === "light"
                    ? alpha(theme.palette.common.black, 0.03)
                    : alpha(theme.palette.common.white, 0.04),
              }}
            >
              <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      fontWeight: 700,
                      color: theme.app.text.secondary,
                    }}
                  >
                    User
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, color: theme.app.text.secondary, maxWidth: 560 }}>
                    Click a row to select one person. Search narrows the list.
                  </Typography>
                </Box>
                {hubUserSourceRows.length > 0 && !hubUsersLoading ? (
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.app.text.secondary,
                      fontWeight: hubUserSearchApplied.trim() ? 700 : 500,
                      whiteSpace: "nowrap",
                      pt: 0.5,
                    }}
                  >
                    {hubUserSearchApplied.trim()
                      ? `${hubFilteredUserRows.length} / ${hubUserSourceRows.length}`
                      : `${hubUserSourceRows.length} loaded`}
                  </Typography>
                ) : null}
              </Box>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center", mt: 2 }}>
                <Box sx={{ flex: "1 1 220px", minWidth: 0 }}>
                  <SearchBar
                    value={hubUserSearchInput}
                    onChange={setHubUserSearchInput}
                    placeholder="Search name or email…"
                  />
                </Box>
                <Button
                  variant="outlined"
                  disabled={hubUsersLoading}
                  onClick={() => {
                    setHubUserSearchApplied(hubUserSearchInput);
                    setHubUserId("");
                  }}
                >
                  Search
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={!hubUserSearchApplied.trim() && !hubUserSearchInput.trim()}
                  onClick={() => {
                    setHubUserSearchInput("");
                    setHubUserSearchApplied("");
                  }}
                >
                  Clear search
                </Button>
              </Box>

              <TableContainer
                sx={{
                  mt: 2,
                  maxHeight: HUB_ADD_USER_TABLE_MAX_PX,
                  minHeight: 200,
                  overflowY: "auto",
                  borderRadius: 2,
                  border: `1px solid ${theme.app.dashboard.overlayBorder}`,
                  bgcolor:
                    theme.palette.mode === "light"
                      ? theme.palette.background.paper
                      : theme.app.dashboard.overlayLight,
                  color: theme.app.text.primary,
                }}
              >
                {hubUsersLoading ? (
                  <Box sx={{ p: 2 }}>
                    <Typography variant="body2" sx={{ color: theme.app.text.secondary }}>
                      Loading users…
                    </Typography>
                  </Box>
                ) : hubUsersFetchError ? (
                  <Box sx={{ p: 2 }}>
                    <Typography variant="body2" sx={{ color: "error.light" }}>
                      Could not load users. Check reseller / parent company (external) or try again.
                    </Typography>
                  </Box>
                ) : hubDeptKind === "External" && (!hubResellerId.trim() || !hubParentCompanyId.trim()) ? (
                  <Box sx={{ p: 2 }}>
                    <Typography variant="body2" sx={{ color: theme.app.text.secondary }}>
                      Select reseller and parent company to load external users.
                    </Typography>
                  </Box>
                ) : hubFilteredUserRows.length === 0 ? (
                  <Box sx={{ p: 2 }}>
                    <Typography variant="body2" sx={{ color: theme.app.text.secondary, fontWeight: 500 }}>
                      {hubUserSourceRows.length === 0
                        ? "No users returned for this selection."
                        : "No users match this search. Clear search to see all."}
                    </Typography>
                  </Box>
                ) : (
                  <Table size="small" stickyHeader sx={{ minWidth: 480 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          padding="checkbox"
                          sx={{
                            bgcolor:
                              theme.palette.mode === "light"
                                ? theme.palette.background.paper
                                : theme.app.dashboard.overlayLight,
                            width: 48,
                          }}
                        />
                        <TableCell
                          sx={{
                            bgcolor:
                              theme.palette.mode === "light"
                                ? theme.palette.background.paper
                                : theme.app.dashboard.overlayLight,
                            color: theme.app.text.secondary,
                            fontWeight: 600,
                            fontSize: 11,
                            py: 0.75,
                          }}
                        >
                          User
                        </TableCell>
                        <TableCell
                          sx={{
                            bgcolor:
                              theme.palette.mode === "light"
                                ? theme.palette.background.paper
                                : theme.app.dashboard.overlayLight,
                            color: theme.app.text.secondary,
                            fontWeight: 600,
                            fontSize: 11,
                            py: 0.75,
                          }}
                        >
                          Department
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {hubFilteredUserRows.map((row) => {
                        const checked = hubUserId === row.id;
                        return (
                          <TableRow
                            key={row.id}
                            hover
                            selected={checked}
                            onClick={() => setHubUserId(checked ? "" : row.id)}
                            sx={{
                              cursor: "pointer",
                              "& td": { fontSize: 13, py: 0.85 },
                              "&.Mui-selected": {
                                bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === "light" ? 0.12 : 0.2),
                              },
                              "&.Mui-selected:hover": {
                                bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === "light" ? 0.16 : 0.24),
                              },
                            }}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                size="small"
                                checked={checked}
                                sx={{ ...hubUserCheckboxSx(theme), pointerEvents: "none", p: 0 }}
                              />
                            </TableCell>
                            <TableCell sx={{ color: theme.app.text.primary }}>
                              <Typography variant="body2" fontWeight={600} color={theme.app.text.primary} noWrap>
                                {row.user}
                              </Typography>
                              <Typography variant="caption" sx={{ color: theme.app.text.secondary }} noWrap>
                                {row.email}
                                {row.type ? ` · ${row.type}` : ""}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ color: theme.app.text.secondary, maxWidth: 160 }}>
                              {row.department}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </TableContainer>
            </Box>
          </Stack>
        </FormModal>
      ) : null}

      <PoolModals
        createOpen={!isMembersHub && createOpen}
        onCloseCreate={() => {
          if (createMutation.isPending) return;
          setCreateOpen(false);
          resetCreatePoolModal();
        }}
        onSaveCreate={() => {
          handleSavePool({
            onSuccess: () => {
              setCreateOpen(false);
              resetCreatePoolModal();
            },
          });
        }}
        isCreating={createMutation.isPending}
        createSaveDisabled={createSaveDisabled}
        createDeptKind={createDeptKind}
        onCreateDeptKindChange={(v) => {
          setCreateDeptKind(v);
          setCreateModalResellerId("");
          setCreateModalParentCompanyId("");
          setCreateModalDepartmentId("");
        }}
        createResellerId={createModalResellerId}
        onCreateResellerIdChange={(v) => {
          setCreateModalResellerId(v);
          setCreateModalParentCompanyId("");
          setCreateModalDepartmentId("");
        }}
        createParentCompanyId={createModalParentCompanyId}
        onCreateParentCompanyIdChange={(v) => {
          setCreateModalParentCompanyId(v);
          setCreateModalDepartmentId("");
        }}
        createDepartmentId={createModalDepartmentId}
        onCreateDepartmentIdChange={setCreateModalDepartmentId}
        createDepartmentOptions={createPoolDepartmentOptions}
        createResellerOptions={resellerOptions}
        createParentCompanyOptions={createModalParentCompanyOptionsForCreate}
        poolNameField={poolNameField}
        onPoolNameChange={setPoolNameField}
        editOpen={editTarget != null}
        onCloseEdit={() => {
          if (updateMutation.isPending) return;
          setEditTarget(null);
          setEditName("");
        }}
        onSaveEdit={() => {
          const target = editTarget;
          if (!target) return;
          const name = editName.trim();
          if (!name) {
            publishAppToast({ variant: "error", message: "Please enter a pool name." });
            return;
          }
          updateMutation.mutate(
            { id: target.id, body: { name } },
            {
              onSuccess: () => {
                publishAppToast({ variant: "success", message: "Pool updated." });
                setEditTarget(null);
              },
              onError: () => publishAppToast({ variant: "error", message: "Could not update pool." }),
            },
          );
        }}
        isEditing={updateMutation.isPending}
        editName={editName}
        onEditNameChange={setEditName}
        deleteOpen={deleteTarget != null}
        deleteDescription={deleteTarget ? `Delete pool “${deleteTarget.poolName}”?` : "Delete this pool?"}
        onCloseDelete={() => {
          if (deleteMutation.isPending) return;
          setDeleteTarget(null);
        }}
        onConfirmDelete={() => {
          const target = deleteTarget;
          if (!target) return;
          deleteMutation.mutate(target.id, {
            onSuccess: () => {
              publishAppToast({ variant: "success", message: "Pool deleted." });
              setDeleteTarget(null);
            },
            onError: () => publishAppToast({ variant: "error", message: "Could not delete pool." }),
          });
        }}
        isDeleting={deleteMutation.isPending}
      />
    </Box>
  );
}
