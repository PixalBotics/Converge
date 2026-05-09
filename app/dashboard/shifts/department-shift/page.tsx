"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import { AccessTime as AccessTimeIcon } from "@mui/icons-material";
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
import { formatIsoDate, isRecord, pickNum, pickStr, unwrapApiData } from "@/lib/utils";
import {
  useCompaniesByResellerQuery,
  useCompaniesSetupResellersQuery,
  useDepartmentsListQuery,
  useDepartmentShiftsListQuery,
  useEnableDepartmentShiftMutation,
  useRemoveDepartmentShiftMutation,
  useShiftsListQuery,
} from "@/lib/hooks/query";
import { extractParentCompaniesFromByResellerTree, pickItemsArray, toIdNameOption } from "@/app/dashboard/user-page/components/add-user-modal.utils";
import { useAuth, sessionMayPickInternalUserScope } from "@/lib/auth";
import {
  departmentShiftActionsSx,
  departmentShiftCardHeaderSx,
  departmentShiftFilterFieldsGridSx,
  departmentShiftFilterHintSx,
  departmentShiftFormGridSx,
  departmentShiftHeaderWrapSx,
  departmentShiftIconSx,
  departmentShiftSubtextSx,
} from "./department-shift.styles";

const PAGE_LIMIT = 8;

const DEPT_KIND_OPTIONS: { value: "Internal" | "External"; label: string }[] = [
  { value: "Internal", label: "Internal" },
  { value: "External", label: "External" },
];

type AssignmentRow = {
  id: string;
  departmentName: string;
  shiftName: string;
  effectiveFrom: string;
  effectiveTo: string;
};

export default function DepartmentShiftPage() {
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

  const [page, setPage] = useState(1);
  const [assignOpen, setAssignOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<AssignmentRow | null>(null);

  const [assignDeptKind, setAssignDeptKind] = useState<"Internal" | "External">("Internal");
  const effectiveAssignKind: "Internal" | "External" = mayPickInternal ? assignDeptKind : "External";

  const [assignResellerId, setAssignResellerId] = useState("");
  const [assignParentCompanyId, setAssignParentCompanyId] = useState("");
  const [assignDepartmentId, setAssignDepartmentId] = useState("");

  const [shiftId, setShiftId] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [effectiveTo, setEffectiveTo] = useState("");

  const filterInternalDepartmentsQuery = useDepartmentsListQuery(
    effectiveFilterKind === "Internal" ? { all: true, type: "Internal" } : undefined,
    { enabled: effectiveFilterKind === "Internal", scope: "dept-shift-filter-internal-depts" },
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
      scope: "dept-shift-filter-external-depts",
    },
  );

  const assignInternalDepartmentsQuery = useDepartmentsListQuery(
    assignOpen && effectiveAssignKind === "Internal" ? { all: true, type: "Internal" } : undefined,
    { enabled: assignOpen && effectiveAssignKind === "Internal", scope: "dept-shift-assign-internal-depts" },
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
      scope: "dept-shift-assign-external-depts",
    },
  );

  useEffect(() => {
    setFilterResellerId("");
    setFilterParentCompanyId("");
    setFilterDepartmentId("");
  }, [filterDeptKind]);

  useEffect(() => {
    setFilterParentCompanyId("");
    setFilterDepartmentId("");
  }, [filterResellerId]);

  useEffect(() => {
    setFilterDepartmentId("");
  }, [filterParentCompanyId]);

  useEffect(() => {
    setAssignResellerId("");
    setAssignParentCompanyId("");
    setAssignDepartmentId("");
  }, [assignDeptKind]);

  useEffect(() => {
    setAssignParentCompanyId("");
    setAssignDepartmentId("");
  }, [assignResellerId]);

  useEffect(() => {
    setAssignDepartmentId("");
  }, [assignParentCompanyId]);

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

  const listParams = useMemo(
    () =>
      ({
        ...(filterDepartmentId.trim() ? { departmentId: filterDepartmentId.trim() } : {}),
        page,
        limit: PAGE_LIMIT,
      }) satisfies { departmentId?: string; page: number; limit: number },
    [filterDepartmentId, page],
  );
  const listQuery = useDepartmentShiftsListQuery(listParams, {
    enabled: true,
    scope: "dept-shifts",
  });
  const assignMutation = useEnableDepartmentShiftMutation();
  const removeMutation = useRemoveDepartmentShiftMutation();

  const shiftsQuery = useShiftsListQuery({ all: true }, { enabled: true, scope: "dept-shift-templates" });
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
  }, [filterDepartmentId]);

  useEffect(() => {
    setPage((p) => (p > pageCount ? pageCount : p));
  }, [pageCount]);

  const selectedDepartmentLabel = useMemo(() => {
    if (!filterDepartmentId.trim()) return "";
    return filterDepartmentOptions.find((o) => o.value === filterDepartmentId)?.label ?? "";
  }, [filterDepartmentId, filterDepartmentOptions]);

  const tableRows = useMemo<AssignmentRow[]>(() => {
    return items
      .map((r) => {
        const id = pickStr(r, ["id"]);
        if (!id) return null;
        const departmentName =
          pickStr(isRecord(r["department"]) ? (r["department"] as Record<string, unknown>) : null, ["name"]) ||
          selectedDepartmentLabel ||
          "—";
        const shiftName =
          pickStr(isRecord(r["shift"]) ? (r["shift"] as Record<string, unknown>) : null, ["name"]) ||
          pickStr(r, ["shiftName"]) ||
          "—";
        const fromRaw = pickStr(r, ["effectiveFrom", "from", "startDate"]);
        const toRaw = pickStr(r, ["effectiveTo", "to", "endDate"]);
        return {
          id,
          departmentName,
          shiftName,
          effectiveFrom: formatIsoDate(fromRaw),
          effectiveTo: formatIsoDate(toRaw),
        };
      })
      .filter((x): x is AssignmentRow => x !== null);
  }, [items, selectedDepartmentLabel]);

  const footerRangeStart = tableRows.length > 0 ? (page - 1) * PAGE_LIMIT + 1 : 0;
  const footerRangeEnd = (page - 1) * PAGE_LIMIT + tableRows.length;

  const columns = useMemo<DataTableColumn<AssignmentRow>[]>(
    () => [
      { id: "departmentName", label: "Department" },
      { id: "shiftName", label: "Shift" },
      { id: "effectiveFrom", label: "Effective from" },
      { id: "effectiveTo", label: "Effective to" },
    ],
    [],
  );

  const filterHint = useMemo(() => {
    if (filterDepartmentId.trim()) return "Filtered by department";
    if (effectiveFilterKind === "External" && (filterResellerId.trim() || filterParentCompanyId.trim())) {
      return "Narrow assignments with reseller / parent filters, or pick a department";
    }
    return "Showing all departments";
  }, [effectiveFilterKind, filterDepartmentId, filterResellerId, filterParentCompanyId]);

  const filterClearDisabled = useMemo(
    () =>
      !filterDepartmentId.trim() &&
      !filterResellerId.trim() &&
      !filterParentCompanyId.trim() &&
      (!mayPickInternal || filterDeptKind === "Internal"),
    [mayPickInternal, filterDeptKind, filterDepartmentId, filterResellerId, filterParentCompanyId],
  );

  const clearFilters = () => {
    setFilterDeptKind(mayPickInternal ? "Internal" : "External");
    setFilterResellerId("");
    setFilterParentCompanyId("");
    setFilterDepartmentId("");
  };

  const resetAssignModal = () => {
    setAssignDeptKind(mayPickInternal ? "Internal" : "External");
    setAssignResellerId("");
    setAssignParentCompanyId("");
    setAssignDepartmentId("");
    setShiftId("");
    setEffectiveFrom("");
    setEffectiveTo("");
  };

  const handleAssign = () => {
    if (!assignDepartmentId.trim()) {
      publishAppToast({ variant: "error", message: "Please select a department." });
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
        departmentId: assignDepartmentId.trim(),
        shiftId: shiftId.trim(),
        effectiveFrom: effectiveFrom.trim(),
        effectiveTo: effectiveTo.trim(),
      },
      {
        onSuccess: () => {
          publishAppToast({ variant: "success", message: "Department shift assigned successfully." });
          setAssignOpen(false);
          resetAssignModal();
        },
        onError: () => publishAppToast({ variant: "error", message: "Could not assign shift." }),
      },
    );
  };

  return (
    <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>
      <Box sx={departmentShiftHeaderWrapSx}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} color="white">
            Department shift assignments
          </Typography>
          <Typography variant="body2" sx={departmentShiftSubtextSx}>
            Default shifts for a department (applies to users without user/pool overrides).
          </Typography>
        </Box>
        <Box sx={departmentShiftActionsSx}>
          <Chip
            size="small"
            label={`${totalEntries} assignment${totalEntries === 1 ? "" : "s"}`}
            variant="outlined"
            sx={{ alignSelf: "center", borderColor: "rgba(255,255,255,0.35)", color: theme.app.dashboard.white95 }}
          />
          <Button variant="primary" sx={gradientPrimaryButtonSx} onClick={() => setAssignOpen(true)}>
            Assign shift
          </Button>
        </Box>
      </Box>

      <DashboardCard sx={rolesCard}>
        <Box sx={departmentShiftCardHeaderSx}>
          <Box sx={rolesIconBox}>
            <AccessTimeIcon sx={departmentShiftIconSx} />
          </Box>
          <Typography variant="mediumLarge" fontWeight={600} color="white">
            Filters
          </Typography>
        </Box>

        <Box sx={departmentShiftFilterFieldsGridSx}>
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
        </Box>

        <Box sx={{ ...departmentShiftFormGridSx, mt: 0.5 }}>
          <Typography variant="body2" sx={departmentShiftFilterHintSx}>
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
        <Box sx={departmentShiftCardHeaderSx}>
          <Box sx={rolesIconBox}>
            <AccessTimeIcon sx={departmentShiftIconSx} />
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
                    color: "#ff6b6b",
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
            {listQuery.isLoading
              ? "Loading…"
              : tableRows.length === 0
                ? "No shift assignments found for the current filter."
              : `Showing data ${footerRangeStart} to ${footerRangeEnd} of ${totalEntries} entries`}
          </Typography>
          <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
        </Box>
      </DashboardCard>

      <FormModal
        open={assignOpen}
        title="Assign shift to department"
        description={
          mayPickInternal
            ? "Pick department type (Internal or External), then department, shift, and dates."
            : "Pick reseller, parent company, department, shift, and dates."
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
        description="Remove this department shift assignment?"
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
