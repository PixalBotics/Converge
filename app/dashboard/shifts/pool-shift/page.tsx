"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import { AttachMoney as AttachMoneyIcon } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import type { SxProps, Theme } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Typography,
  DashboardCard,
  Button,
  SelectField,
  DataTable,
  dataTableActionButton,
  TablePagination,
  InputField,
  FormModal,
  ConfirmActionModal,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { rolesCard, rolesIconBox, rolesPageWrapper } from "../../roles/roles.styles";
import { footerMutedText, pageWrapper } from "../../companies/overview.styles";
import { publishAppToast } from "@/lib/notify";
import { isRecord, pickNum, pickStr, unwrapApiData } from "@/lib/utils";
import {
  useAssignPoolShiftMutation,
  useCompaniesByResellerQuery,
  useCompaniesSetupResellersQuery,
  useDepartmentsListQuery,
  usePoolShiftAssignmentsListQuery,
  usePoolsListQuery,
  useRemovePoolShiftAssignmentMutation,
  useShiftsListQuery,
} from "@/lib/hooks/query";
import { extractParentCompaniesFromByResellerTree, pickItemsArray, toIdNameOption } from "@/app/dashboard/user-page/components/add-user-modal.utils";
import { useAuth, sessionMayPickInternalUserScope } from "@/lib/auth";
import {
  poolShiftActionsSx,
  poolShiftCardHeaderSx,
  poolShiftFilterFieldsGridSx,
  poolShiftFilterHintSx,
  poolShiftFormGridSx,
  poolShiftHeaderWrapSx,
  poolShiftIconSx,
  poolShiftSubtextSx,
} from "./pool-shift.styles";

const PAGE_LIMIT = 8;

const DEPT_KIND_OPTIONS: { value: "Internal" | "External"; label: string }[] = [
  { value: "Internal", label: "Internal" },
  { value: "External", label: "External" },
];

type AssignmentRow = {
  id: string;
  poolName: string;
  shiftName: string;
  effectiveFrom: string;
  effectiveTo: string;
};

export default function PoolShiftPage() {
  const theme = useTheme() as AppTheme;
  const { isPlatformAdmin, user: authUser } = useAuth();
  const mayPickInternal = useMemo(
    () => sessionMayPickInternalUserScope(isPlatformAdmin, authUser?.userType),
    [isPlatformAdmin, authUser?.userType],
  );

  const [filterDeptKind, setFilterDeptKind] = useState<"Internal" | "External">("Internal");
  const effectiveFilterKind: "Internal" | "External" = mayPickInternal ? filterDeptKind : "External";

  const [filterResellerId, setFilterResellerId] = useState("");
  const [filterParentCompanyId, setFilterParentCompanyId] = useState("");
  const [filterDepartmentId, setFilterDepartmentId] = useState("");
  const [filterPoolId, setFilterPoolId] = useState("");

  const [page, setPage] = useState(1);
  const [assignOpen, setAssignOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<AssignmentRow | null>(null);

  const [assignDeptKind, setAssignDeptKind] = useState<"Internal" | "External">("Internal");
  const effectiveAssignKind: "Internal" | "External" = mayPickInternal ? assignDeptKind : "External";

  const [assignResellerId, setAssignResellerId] = useState("");
  const [assignParentCompanyId, setAssignParentCompanyId] = useState("");
  const [assignDepartmentId, setAssignDepartmentId] = useState("");
  const [assignPoolId, setAssignPoolId] = useState("");

  const [shiftId, setShiftId] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [effectiveTo, setEffectiveTo] = useState("");

  const filterInternalDepartmentsQuery = useDepartmentsListQuery(
    effectiveFilterKind === "Internal" ? { all: true, type: "Internal" } : undefined,
    { enabled: effectiveFilterKind === "Internal", scope: "pool-shift-filter-internal-depts" },
  );
  const filterResellersQuery = useCompaniesSetupResellersQuery({
    enabled: effectiveFilterKind === "External",
  });
  const filterParentCompaniesQuery = useCompaniesByResellerQuery(
    filterResellerId.trim(),
    { view: "tree", sortBy: "name", sortOrder: "asc", all: true },
    { enabled: effectiveFilterKind === "External" && Boolean(filterResellerId.trim()) },
  );
  const filterExternalDepartmentsQuery = useDepartmentsListQuery(
    effectiveFilterKind === "External" && filterResellerId.trim() && filterParentCompanyId.trim()
      ? {
          all: true,
          type: "External",
          resellerId: filterResellerId.trim(),
          parentCompanyId: filterParentCompanyId.trim(),
        }
      : undefined,
    {
      enabled:
        effectiveFilterKind === "External" &&
        Boolean(filterResellerId.trim()) &&
        Boolean(filterParentCompanyId.trim()),
      scope: "pool-shift-filter-external-depts",
    },
  );

  const filterPoolsQuery = usePoolsListQuery(
    filterDepartmentId.trim() ? { departmentId: filterDepartmentId.trim(), all: true } : undefined,
    { enabled: Boolean(filterDepartmentId.trim()), scope: "pool-shift-filter-pools" },
  );

  const assignInternalDepartmentsQuery = useDepartmentsListQuery(
    assignOpen && effectiveAssignKind === "Internal" ? { all: true, type: "Internal" } : undefined,
    { enabled: assignOpen && effectiveAssignKind === "Internal", scope: "pool-shift-assign-internal-depts" },
  );
  const assignResellersQuery = useCompaniesSetupResellersQuery({
    enabled: assignOpen && effectiveAssignKind === "External",
  });
  const assignParentCompaniesQuery = useCompaniesByResellerQuery(
    assignResellerId.trim(),
    { view: "tree", sortBy: "name", sortOrder: "asc", all: true },
    { enabled: assignOpen && effectiveAssignKind === "External" && Boolean(assignResellerId.trim()) },
  );
  const assignExternalDepartmentsQuery = useDepartmentsListQuery(
    assignOpen && effectiveAssignKind === "External" && assignResellerId.trim() && assignParentCompanyId.trim()
      ? {
          all: true,
          type: "External",
          resellerId: assignResellerId.trim(),
          parentCompanyId: assignParentCompanyId.trim(),
        }
      : undefined,
    {
      enabled:
        assignOpen &&
        effectiveAssignKind === "External" &&
        Boolean(assignResellerId.trim()) &&
        Boolean(assignParentCompanyId.trim()),
      scope: "pool-shift-assign-external-depts",
    },
  );
  const assignPoolsQuery = usePoolsListQuery(
    assignDepartmentId.trim() ? { departmentId: assignDepartmentId.trim(), all: true } : undefined,
    { enabled: assignOpen && Boolean(assignDepartmentId.trim()), scope: "pool-shift-assign-pools" },
  );

  useEffect(() => {
    setFilterResellerId("");
    setFilterParentCompanyId("");
    setFilterDepartmentId("");
    setFilterPoolId("");
  }, [filterDeptKind]);

  useEffect(() => {
    setFilterParentCompanyId("");
    setFilterDepartmentId("");
    setFilterPoolId("");
  }, [filterResellerId]);

  useEffect(() => {
    setFilterDepartmentId("");
    setFilterPoolId("");
  }, [filterParentCompanyId]);

  useEffect(() => {
    setFilterPoolId("");
  }, [filterDepartmentId]);

  useEffect(() => {
    setAssignResellerId("");
    setAssignParentCompanyId("");
    setAssignDepartmentId("");
    setAssignPoolId("");
  }, [assignDeptKind]);

  useEffect(() => {
    setAssignParentCompanyId("");
    setAssignDepartmentId("");
    setAssignPoolId("");
  }, [assignResellerId]);

  useEffect(() => {
    setAssignDepartmentId("");
    setAssignPoolId("");
  }, [assignParentCompanyId]);

  useEffect(() => {
    setAssignPoolId("");
  }, [assignDepartmentId]);

  const filterResellerOptions = useMemo(() => {
    const base = pickItemsArray(filterResellersQuery.data)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => o !== null);
    return [
      {
        value: "",
        label: filterResellersQuery.isLoading ? "Loading resellers…" : "— Select reseller —",
      },
      ...base,
    ];
  }, [filterResellersQuery.data, filterResellersQuery.isLoading]);

  const filterParentCompanyOptions = useMemo(() => {
    const base = extractParentCompaniesFromByResellerTree(filterParentCompaniesQuery.data);
    return [
      {
        value: "",
        label:
          !filterResellerId.trim()
            ? "Select reseller first"
            : filterParentCompaniesQuery.isLoading
              ? "Loading parent companies…"
              : "— Select parent company —",
      },
      ...base,
    ];
  }, [filterParentCompaniesQuery.data, filterParentCompaniesQuery.isLoading, filterResellerId]);

  const filterDepartmentOptions = useMemo(() => {
    const source =
      effectiveFilterKind === "Internal"
        ? filterInternalDepartmentsQuery.data
        : filterExternalDepartmentsQuery.data;
    const loading =
      effectiveFilterKind === "Internal"
        ? filterInternalDepartmentsQuery.isLoading
        : filterExternalDepartmentsQuery.isLoading;
    const base = pickItemsArray(source)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => o !== null);
    const prompt =
      effectiveFilterKind === "External" && !filterParentCompanyId.trim()
        ? "Select parent company first"
        : loading
          ? "Loading departments…"
          : "— Select department —";
    return [{ value: "", label: prompt }, ...base];
  }, [
    effectiveFilterKind,
    filterInternalDepartmentsQuery.data,
    filterInternalDepartmentsQuery.isLoading,
    filterExternalDepartmentsQuery.data,
    filterExternalDepartmentsQuery.isLoading,
    filterParentCompanyId,
  ]);

  const filterPoolOptions = useMemo(() => {
    const payload = unwrapApiData(filterPoolsQuery.data);
    const payloadObj = isRecord(payload) ? payload : null;
    const items = Array.isArray(payloadObj?.["items"]) ? (payloadObj?.["items"] as unknown[]).filter(isRecord) : [];
    const base = items
      .map((r) => {
        const id = pickStr(r, ["id"]);
        const name = pickStr(r, ["name"]);
        if (!id || !name) return null;
        return { value: id, label: name };
      })
      .filter((o): o is { value: string; label: string } => o !== null);
    const prompt = !filterDepartmentId.trim()
      ? "Select department first"
      : filterPoolsQuery.isLoading
        ? "Loading pools…"
        : "— Select pool —";
    return [{ value: "", label: prompt }, ...base];
  }, [filterPoolsQuery.data, filterPoolsQuery.isLoading, filterDepartmentId]);

  const assignResellerOptions = useMemo(() => {
    const base = pickItemsArray(assignResellersQuery.data)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => o !== null);
    return [
      {
        value: "",
        label: assignResellersQuery.isLoading ? "Loading resellers…" : "— Select reseller —",
      },
      ...base,
    ];
  }, [assignResellersQuery.data, assignResellersQuery.isLoading]);

  const assignParentCompanyOptions = useMemo(() => {
    const base = extractParentCompaniesFromByResellerTree(assignParentCompaniesQuery.data);
    return [
      {
        value: "",
        label:
          !assignResellerId.trim()
            ? "Select reseller first"
            : assignParentCompaniesQuery.isLoading
              ? "Loading parent companies…"
              : "— Select parent company —",
      },
      ...base,
    ];
  }, [assignParentCompaniesQuery.data, assignParentCompaniesQuery.isLoading, assignResellerId]);

  const assignDepartmentOptions = useMemo(() => {
    const source =
      effectiveAssignKind === "Internal" ? assignInternalDepartmentsQuery.data : assignExternalDepartmentsQuery.data;
    const loading =
      effectiveAssignKind === "Internal"
        ? assignInternalDepartmentsQuery.isLoading
        : assignExternalDepartmentsQuery.isLoading;
    const base = pickItemsArray(source)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => o !== null);
    const prompt =
      effectiveAssignKind === "External" && !assignParentCompanyId.trim()
        ? "Select parent company first"
        : loading
          ? "Loading departments…"
          : "— Select department —";
    return [{ value: "", label: prompt }, ...base];
  }, [
    effectiveAssignKind,
    assignInternalDepartmentsQuery.data,
    assignInternalDepartmentsQuery.isLoading,
    assignExternalDepartmentsQuery.data,
    assignExternalDepartmentsQuery.isLoading,
    assignParentCompanyId,
  ]);

  const assignPoolOptions = useMemo(() => {
    const payload = unwrapApiData(assignPoolsQuery.data);
    const payloadObj = isRecord(payload) ? payload : null;
    const items = Array.isArray(payloadObj?.["items"]) ? (payloadObj?.["items"] as unknown[]).filter(isRecord) : [];
    const base = items
      .map((r) => {
        const id = pickStr(r, ["id"]);
        const name = pickStr(r, ["name"]);
        if (!id || !name) return null;
        return { value: id, label: name };
      })
      .filter((o): o is { value: string; label: string } => o !== null);
    const prompt = !assignDepartmentId.trim()
      ? "Select department first"
      : assignPoolsQuery.isLoading
        ? "Loading pools…"
        : "— Select pool —";
    return [{ value: "", label: prompt }, ...base];
  }, [assignPoolsQuery.data, assignPoolsQuery.isLoading, assignDepartmentId]);

  const shiftsQuery = useShiftsListQuery({ all: true }, { enabled: true, scope: "pool-shift-templates" });
  const shiftOptions = useMemo(() => {
    const payload = unwrapApiData(shiftsQuery.data);
    const payloadObj = isRecord(payload) ? payload : null;
    const items = Array.isArray(payloadObj?.["items"]) ? (payloadObj?.["items"] as unknown[]).filter(isRecord) : [];
    const base = items
      .map((r) => {
        const id = pickStr(r, ["id"]);
        const name = pickStr(r, ["name"]);
        if (!id || !name) return null;
        return { value: id, label: name };
      })
      .filter((o): o is { value: string; label: string } => o !== null);
    return [{ value: "", label: "— Select shift —" }, ...base];
  }, [shiftsQuery.data]);

  const selectedPoolLabel = useMemo(() => {
    if (!filterPoolId.trim()) return "";
    return filterPoolOptions.find((o) => o.value === filterPoolId)?.label ?? "";
  }, [filterPoolId, filterPoolOptions]);

  const listParams = useMemo(
    () =>
      filterPoolId.trim()
        ? {
            poolId: filterPoolId.trim(),
            page,
            limit: PAGE_LIMIT,
          }
        : undefined,
    [filterPoolId, page],
  );
  const listQuery = usePoolShiftAssignmentsListQuery(listParams, {
    enabled: Boolean(filterPoolId.trim()),
    scope: "pool-shift",
  });
  const assignMutation = useAssignPoolShiftMutation();
  const removeMutation = useRemovePoolShiftAssignmentMutation();

  const payload = unwrapApiData(listQuery.data);
  const payloadObj = isRecord(payload) ? payload : null;
  const items = useMemo(() => {
    const arr = payloadObj?.["items"];
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
  }, [filterPoolId]);

  useEffect(() => {
    setPage((p) => (p > pageCount ? pageCount : p));
  }, [pageCount]);

  const tableRows = useMemo<AssignmentRow[]>(() => {
    return items
      .map((r) => {
        const id = pickStr(r, ["id"]);
        if (!id) return null;
        const poolName =
          pickStr(isRecord(r["pool"]) ? (r["pool"] as Record<string, unknown>) : null, ["name"]) ||
          selectedPoolLabel ||
          "—";
        const shiftName =
          pickStr(isRecord(r["shift"]) ? (r["shift"] as Record<string, unknown>) : null, ["name"]) ||
          pickStr(r, ["shiftName"]) ||
          "—";
        const from = pickStr(r, ["effectiveFrom", "from", "startDate"]) || "—";
        const to = pickStr(r, ["effectiveTo", "to", "endDate"]) || "—";
        return { id, poolName, shiftName, effectiveFrom: from, effectiveTo: to };
      })
      .filter((x): x is AssignmentRow => x !== null);
  }, [items, selectedPoolLabel]);

  const footerRangeStart = tableRows.length > 0 ? (page - 1) * PAGE_LIMIT + 1 : 0;
  const footerRangeEnd = (page - 1) * PAGE_LIMIT + tableRows.length;

  const columns = useMemo<DataTableColumn<AssignmentRow>[]>(
    () => [
      { id: "poolName", label: "Pool" },
      { id: "shiftName", label: "Shift" },
      { id: "effectiveFrom", label: "Effective from" },
      { id: "effectiveTo", label: "Effective to" },
    ],
    [],
  );

  const filterHint = useMemo(() => {
    if (filterPoolId.trim()) return "Filtered by pool";
    if (filterDepartmentId.trim()) return "Pick a pool to load assignments below";
    if (effectiveFilterKind === "External" && (filterResellerId.trim() || filterParentCompanyId.trim())) {
      return "Narrow pools with reseller / parent / department, then select a pool";
    }
    return "Select filters and a pool to view assignments";
  }, [effectiveFilterKind, filterPoolId, filterDepartmentId, filterResellerId, filterParentCompanyId]);

  const filterClearDisabled = useMemo(
    () =>
      !filterPoolId.trim() &&
      !filterDepartmentId.trim() &&
      !filterResellerId.trim() &&
      !filterParentCompanyId.trim() &&
      (!mayPickInternal || filterDeptKind === "Internal"),
    [mayPickInternal, filterDeptKind, filterPoolId, filterDepartmentId, filterResellerId, filterParentCompanyId],
  );

  const clearFilters = () => {
    setFilterDeptKind(mayPickInternal ? "Internal" : "External");
    setFilterResellerId("");
    setFilterParentCompanyId("");
    setFilterDepartmentId("");
    setFilterPoolId("");
  };

  const resetAssignModal = () => {
    setAssignDeptKind(mayPickInternal ? "Internal" : "External");
    setAssignResellerId("");
    setAssignParentCompanyId("");
    setAssignDepartmentId("");
    setAssignPoolId("");
    setShiftId("");
    setEffectiveFrom("");
    setEffectiveTo("");
  };

  const handleAssign = () => {
    if (!assignDepartmentId.trim()) {
      publishAppToast({ variant: "error", message: "Please select a department." });
      return;
    }
    if (!assignPoolId.trim()) {
      publishAppToast({ variant: "error", message: "Please select a pool." });
      return;
    }
    if (!shiftId.trim()) {
      publishAppToast({ variant: "error", message: "Please select a shift." });
      return;
    }
    if (!effectiveFrom.trim()) {
      publishAppToast({ variant: "error", message: "Please select effective from date." });
      return;
    }
    if (!effectiveTo.trim()) {
      publishAppToast({ variant: "error", message: "Please select effective to date." });
      return;
    }

    assignMutation.mutate(
      {
        poolId: assignPoolId.trim(),
        shiftId: shiftId.trim(),
        effectiveFrom: effectiveFrom.trim(),
        effectiveTo: effectiveTo.trim(),
      },
      {
        onSuccess: () => {
          publishAppToast({ variant: "success", message: "Pool shift assigned successfully." });
          setAssignOpen(false);
          resetAssignModal();
        },
        onError: () => publishAppToast({ variant: "error", message: "Could not assign shift." }),
      },
    );
  };

  return (
    <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>
      <Box sx={poolShiftHeaderWrapSx}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} color="white">
            Pool shift assignments
          </Typography>
          <Typography variant="body2" sx={poolShiftSubtextSx}>
            Default shifts for a pool (applies to users without a user override).
          </Typography>
        </Box>
        <Box sx={poolShiftActionsSx}>
          {filterPoolId.trim() ? (
            <Chip
              size="small"
              label={`${totalEntries} assignment${totalEntries === 1 ? "" : "s"}`}
              variant="outlined"
              sx={{ alignSelf: "center", borderColor: "rgba(255,255,255,0.35)", color: theme.app.dashboard.white95 }}
            />
          ) : null}
          <Button variant="primary" sx={gradientPrimaryButtonSx} onClick={() => setAssignOpen(true)}>
            Add pool shift
          </Button>
        </Box>
      </Box>

      <DashboardCard sx={rolesCard}>
        <Box sx={poolShiftCardHeaderSx}>
          <Box sx={rolesIconBox}>
            <AttachMoneyIcon sx={poolShiftIconSx} />
          </Box>
          <Typography variant="mediumLarge" fontWeight={600} color="white">
            Filters
          </Typography>
        </Box>

        <Box sx={poolShiftFilterFieldsGridSx}>
          {mayPickInternal ? (
            <SelectField
              label="Department type"
              value={filterDeptKind}
              onChange={(v) => setFilterDeptKind(v as "Internal" | "External")}
              options={DEPT_KIND_OPTIONS}
              menuMaxRows={4}
            />
          ) : null}
          {effectiveFilterKind === "External" ? (
            <>
              <SelectField
                label="Reseller"
                value={filterResellerId}
                onChange={setFilterResellerId}
                options={filterResellerOptions}
                menuMaxRows={8}
              />
              <SelectField
                label="Parent company"
                value={filterParentCompanyId}
                onChange={setFilterParentCompanyId}
                options={filterParentCompanyOptions}
                searchable
                searchPlaceholder="Search parent company…"
                menuMaxRows={7}
                disabled={!filterResellerId.trim()}
              />
            </>
          ) : null}
          <SelectField
            label="Department"
            value={filterDepartmentId}
            onChange={setFilterDepartmentId}
            options={filterDepartmentOptions}
            searchable
            searchPlaceholder="Search department…"
            menuMaxRows={8}
            disabled={effectiveFilterKind === "External" && !filterParentCompanyId.trim()}
          />
          <SelectField
            label="Pool"
            value={filterPoolId}
            onChange={setFilterPoolId}
            options={filterPoolOptions}
            searchable
            searchPlaceholder="Search pool…"
            menuMaxRows={7}
            disabled={!filterDepartmentId.trim()}
          />
        </Box>

        <Box sx={{ ...poolShiftFormGridSx, mt: 0.5 }}>
          <Typography variant="body2" sx={poolShiftFilterHintSx}>
            {filterHint}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "end", justifyContent: { xs: "flex-start", md: "flex-end" }, gap: 1.25, flexWrap: "wrap" }}>
            <Button variant="secondary" onClick={clearFilters} disabled={filterClearDisabled}>
              Clear filters
            </Button>
          </Box>
        </Box>
      </DashboardCard>

      <DashboardCard sx={rolesCard}>
        <Box sx={poolShiftCardHeaderSx}>
          <Box sx={rolesIconBox}>
            <AttachMoneyIcon sx={poolShiftIconSx} />
          </Box>
          <Typography variant="mediumLarge" fontWeight={600} color="white">
            Assigned shifts
          </Typography>
        </Box>

        <DataTable<AssignmentRow>
          columns={columns}
          rows={tableRows}
          isLoading={listQuery.isLoading || listQuery.isFetching}
          getRowId={(row) => row.id}
          minWidth={720}
          actionColumn={{
            label: "Action",
            render: (row) => (
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <IconButton
                  size="small"
                  sx={{
                    ...dataTableActionButton,
                    color: theme.app.dashboard.accentRedLight,
                    opacity: removeMutation.isPending ? 0.7 : 1,
                  }}
                  aria-label="Remove assignment"
                  disabled={removeMutation.isPending}
                  onClick={() => {
                    setRemoveTarget(row);
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ),
          }}
        />

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
          <Typography variant="medium" sx={footerMutedText(theme)}>
            {!filterPoolId.trim()
              ? "Select a pool to view assignments."
              : listQuery.isLoading
                ? "Loading…"
                : `Showing data ${footerRangeStart} to ${footerRangeEnd} of ${totalEntries} entries`}
          </Typography>
          <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
        </Box>
      </DashboardCard>

      <FormModal
        open={assignOpen}
        title="Add pool shift"
        description={
          mayPickInternal
            ? "Pick department type, department and pool here (independent from list filters)."
            : "Pick reseller, parent company, department and pool (independent from list filters)."
        }
        onClose={() => {
          if (assignMutation.isPending) return;
          setAssignOpen(false);
          resetAssignModal();
        }}
        onSave={handleAssign}
        primaryButtonLabel={assignMutation.isPending ? "Saving…" : "Assign"}
        primaryButtonDisabled={assignMutation.isPending}
        cancelButtonLabel="Close"
        maxWidth={600}
        fitContent
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {mayPickInternal ? (
            <SelectField
              label="Department type"
              value={assignDeptKind}
              onChange={(v) => setAssignDeptKind(v as "Internal" | "External")}
              options={DEPT_KIND_OPTIONS}
              menuMaxRows={4}
            />
          ) : null}
          {effectiveAssignKind === "External" ? (
            <>
              <SelectField
                label="Reseller"
                value={assignResellerId}
                onChange={setAssignResellerId}
                options={assignResellerOptions}
                menuMaxRows={8}
              />
              <SelectField
                label="Parent company"
                value={assignParentCompanyId}
                onChange={setAssignParentCompanyId}
                options={assignParentCompanyOptions}
                searchable
                searchPlaceholder="Search parent company…"
                menuMaxRows={7}
                disabled={!assignResellerId.trim()}
              />
            </>
          ) : null}
          <SelectField
            label="Department"
            value={assignDepartmentId}
            onChange={setAssignDepartmentId}
            options={assignDepartmentOptions}
            searchable
            searchPlaceholder="Search department…"
            menuMaxRows={8}
            disabled={effectiveAssignKind === "External" && !assignParentCompanyId.trim()}
          />
          <SelectField
            label="Pool"
            value={assignPoolId}
            onChange={setAssignPoolId}
            options={assignPoolOptions}
            searchable
            searchPlaceholder="Search pool…"
            menuMaxRows={7}
            disabled={!assignDepartmentId.trim()}
          />
          <SelectField
            label="Shift"
            value={shiftId}
            onChange={setShiftId}
            options={shiftOptions}
            searchable
            searchPlaceholder="Search shift…"
            menuMaxRows={7}
          />
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
            <InputField
              label="Effective from"
              type="date"
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.target.value)}
            />
            <InputField
              label="Effective to"
              type="date"
              value={effectiveTo}
              onChange={(e) => setEffectiveTo(e.target.value)}
            />
          </Box>
        </Box>
      </FormModal>

      <ConfirmActionModal
        open={removeTarget != null}
        title="Remove assignment?"
        description="Remove this pool shift assignment?"
        confirmLabel={removeMutation.isPending ? "Removing…" : "Remove"}
        cancelLabel="Cancel"
        isLoading={removeMutation.isPending}
        onDismiss={() => {
          if (removeMutation.isPending) return;
          setRemoveTarget(null);
        }}
        onConfirm={() => {
          const target = removeTarget;
          if (!target) return;
          removeMutation.mutate(target.id, {
            onSuccess: () => {
              publishAppToast({ variant: "success", message: "Assignment removed." });
              setRemoveTarget(null);
            },
            onError: () => publishAppToast({ variant: "error", message: "Could not remove assignment." }),
          });
        }}
      />
    </Box>
  );
}
