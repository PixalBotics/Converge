"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Typography,
  ConfirmActionModal,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { rolesPageWrapper } from "../../roles/roles.styles";
import { pageWrapper } from "../../companies/overview.styles";
import { publishAppToast } from "@/lib/notify";
import { useUserQuery, useUsersListQuery } from "@/lib/hooks/query/users";
import {
  useCompaniesByResellerQuery,
  useCompaniesSetupResellersQuery,
  useCreateUserShiftAssignmentMutation,
  useDepartmentsListQuery,
  useRemoveUserShiftAssignmentMutation,
  useShiftsListQuery,
  useUserShiftAssignmentsListQuery,
} from "@/lib/hooks/query";
import { addMonths, daysInMonth, isRecord, pickNum, pickStr, startOfMonth, toIsoDateString, unwrapApiData } from "@/lib/utils";
import { extractParentCompaniesFromByResellerTree, pickItemsArray, toIdNameOption } from "@/app/dashboard/user-page/components/add-user-modal.utils";
import {
  userShiftHeaderWrapSx,
  userShiftSubtextSx,
} from "./user-shift.styles";
import {
  UserShiftAssignmentsCard,
  UserShiftAssignModal,
  UserShiftRosterCard,
  UsersSidebar,
  type CalendarCell,
  type SelectedUserMeta,
  type UserListRow,
  type UserShiftAssignmentRow,
  type UserType,
} from "./components";

export default function UserShiftPage() {
  const theme = useTheme() as AppTheme;
  const [userId, setUserId] = useState("");
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()));
  const [assignOpen, setAssignOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<UserShiftAssignmentRow | null>(null);

  const [shiftId, setShiftId] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [effectiveTo, setEffectiveTo] = useState("");

  const [userSearch, setUserSearch] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [userTypeFilter, setUserTypeFilter] = useState<"all" | UserType>("all");
  const [externalResellerId, setExternalResellerId] = useState("");
  const [externalParentCompanyId, setExternalParentCompanyId] = useState("");
  const [externalDepartmentId, setExternalDepartmentId] = useState("");
  const [internalDepartmentId, setInternalDepartmentId] = useState("");

  const internalScopeReady = userTypeFilter !== "Internal" || internalDepartmentId.trim().length > 0;
  const externalScopeReady =
    userTypeFilter !== "External" ||
    (externalResellerId.trim().length > 0 &&
      externalParentCompanyId.trim().length > 0 &&
      externalDepartmentId.trim().length > 0);
  const canLoadUsers = internalScopeReady && externalScopeReady;

  const resellersQuery = useCompaniesSetupResellersQuery({ enabled: userTypeFilter === "External" });
  const companiesByResellerQuery = useCompaniesByResellerQuery(
    externalResellerId.trim(),
    { view: "tree", sortBy: "name", sortOrder: "asc", all: true },
    { enabled: userTypeFilter === "External" && externalResellerId.trim().length > 0 },
  );
  const externalDepartmentsQuery = useDepartmentsListQuery(
    userTypeFilter === "External" && externalResellerId.trim() && externalParentCompanyId.trim()
      ? {
          all: true,
          type: "External",
          resellerId: externalResellerId.trim(),
          parentCompanyId: externalParentCompanyId.trim(),
        }
      : undefined,
    {
      enabled:
        userTypeFilter === "External" &&
        externalResellerId.trim().length > 0 &&
        externalParentCompanyId.trim().length > 0,
      scope: "user-shift-external-departments",
    },
  );
  const internalDepartmentsQuery = useDepartmentsListQuery(
    userTypeFilter === "Internal" ? { all: true, type: "Internal" } : undefined,
    { enabled: userTypeFilter === "Internal", scope: "user-shift-internal-departments" },
  );

  const usersQuery = useUsersListQuery(
    {
      page: userPage,
      limit: 50,
      ...(userTypeFilter !== "all" ? { userType: userTypeFilter } : {}),
      ...(userTypeFilter === "Internal" && internalDepartmentId.trim()
        ? { departmentId: internalDepartmentId.trim() }
        : {}),
      ...(userTypeFilter === "External" && externalParentCompanyId.trim()
        ? { parentCompanyId: externalParentCompanyId.trim() }
        : {}),
      ...(userTypeFilter === "External" && externalDepartmentId.trim()
        ? { departmentId: externalDepartmentId.trim() }
        : {}),
      ...(userSearch.trim() ? { search: userSearch.trim() } : {}),
    },
    { enabled: canLoadUsers },
  );
  const userDetailQuery = useUserQuery(userId.trim(), { enabled: Boolean(userId.trim()) });

  const formatScopeId = (value: string | undefined) => {
    const v = (value ?? "").trim();
    return v || "—";
  };

  const { users, userOptions, userTypeById, userPageCount, userTotal } = useMemo(() => {
    const payload = unwrapApiData(usersQuery.data);
    const payloadObj = isRecord(payload) ? payload : null;
    const items = Array.isArray(payloadObj?.["items"]) ? (payloadObj?.["items"] as unknown[]).filter(isRecord) : [];
    const typeById = new Map<string, UserType>();
    const rows = items
      .map((r) => {
        const id = pickStr(r, ["id"]);
        if (!id) return null;
        const resellerObj = isRecord(r["reseller"]) ? (r["reseller"] as Record<string, unknown>) : null;
        const parentCompanyObj = isRecord(r["parentCompany"]) ? (r["parentCompany"] as Record<string, unknown>) : null;
        const name =
          pickStr(r, ["name"]) ||
          [pickStr(r, ["firstName"]), pickStr(r, ["lastName"])].filter(Boolean).join(" ") ||
          pickStr(r, ["email"]) ||
          "—";
        const email = pickStr(r, ["email"]) || "—";
        const rawType = pickStr(r, ["userType", "type"]);
        const type: UserType = rawType === "Internal" ? "Internal" : "External";
        const resellerId = formatScopeId(
          pickStr(r, ["resellerId", "reseller_id"]) ||
            pickStr(resellerObj, ["id", "name"]),
        );
        const parentCompanyId = formatScopeId(
          pickStr(r, ["parentCompanyId", "parent_company_id", "companyId", "company_id"]) ||
            pickStr(parentCompanyObj, ["id", "name"]),
        );
        typeById.set(id, type);
        return { id, name, email, type, resellerId, parentCompanyId } satisfies UserListRow;
      })
      .filter((x): x is UserListRow => x !== null);

    const baseOptions = rows.map((u) => ({
      value: u.id,
      // SelectField's underlying Autocomplete uses option labels as keys.
      // Names can collide, so include email to make labels stable + unique.
      label:
        u.type === "External"
          ? `${u.name} — ${u.email} (External | R:${u.resellerId} | P:${u.parentCompanyId})`
          : `${u.name} — ${u.email} (Internal)`,
    }));

    const pageCount = pickNum(payloadObj, ["totalPages"]) ?? 1;
    const total = pickNum(payloadObj, ["total", "count", "totalCount"]) ?? rows.length;

    return {
      users: rows,
      userOptions: [{ value: "", label: "— Select user —" }, ...baseOptions],
      userTypeById: typeById,
      userPageCount: pageCount && pageCount > 0 ? pageCount : 1,
      userTotal: total,
    };
  }, [usersQuery.data]);

  const resellerOptions = useMemo(() => {
    const base = pickItemsArray(resellersQuery.data)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => o !== null);
    return [{ value: "", label: resellersQuery.isLoading ? "Loading resellers..." : "— Select reseller —" }, ...base];
  }, [resellersQuery.data, resellersQuery.isLoading]);

  const parentCompanyOptions = useMemo(() => {
    const base = extractParentCompaniesFromByResellerTree(companiesByResellerQuery.data);
    return [
      {
        value: "",
        label:
          externalResellerId.trim().length === 0
            ? "Select reseller first"
            : companiesByResellerQuery.isLoading
              ? "Loading parent companies..."
              : "— Select parent company —",
      },
      ...base,
    ];
  }, [companiesByResellerQuery.data, companiesByResellerQuery.isLoading, externalResellerId]);

  const externalDepartmentOptions = useMemo(() => {
    const base = pickItemsArray(externalDepartmentsQuery.data)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => o !== null);
    return [
      {
        value: "",
        label:
          externalParentCompanyId.trim().length === 0
            ? "Select parent company first"
            : externalDepartmentsQuery.isLoading
              ? "Loading departments..."
              : "— Select department —",
      },
      ...base,
    ];
  }, [externalDepartmentsQuery.data, externalDepartmentsQuery.isLoading, externalParentCompanyId]);
  const internalDepartmentOptions = useMemo(() => {
    const base = pickItemsArray(internalDepartmentsQuery.data)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => o !== null);
    return [{ value: "", label: internalDepartmentsQuery.isLoading ? "Loading departments..." : "— Select department —" }, ...base];
  }, [internalDepartmentsQuery.data, internalDepartmentsQuery.isLoading]);

  const selectedUserMeta = useMemo<SelectedUserMeta | null>(() => {
    if (!userId.trim()) return null;

    const detailPayload = unwrapApiData(userDetailQuery.data);
    const detailObj = isRecord(detailPayload) ? detailPayload : null;
    const resellerObj = isRecord(detailObj?.["reseller"]) ? (detailObj?.["reseller"] as Record<string, unknown>) : null;
    const parentCompanyObj = isRecord(detailObj?.["parentCompany"])
      ? (detailObj?.["parentCompany"] as Record<string, unknown>)
      : null;
    const departmentObj = isRecord(detailObj?.["department"]) ? (detailObj?.["department"] as Record<string, unknown>) : null;
    const designationObj = isRecord(detailObj?.["designation"]) ? (detailObj?.["designation"] as Record<string, unknown>) : null;
    const detailId = pickStr(detailObj, ["id"]);

    if (detailObj && detailId && detailId === userId.trim()) {
      const rawType = pickStr(detailObj, ["userType", "type"]);
      const type: UserType = rawType === "Internal" ? "Internal" : "External";
      const name =
        pickStr(detailObj, ["name"]) ||
        [pickStr(detailObj, ["firstName"]), pickStr(detailObj, ["lastName"])].filter(Boolean).join(" ") ||
        pickStr(detailObj, ["email"]) ||
        "—";
      const email = pickStr(detailObj, ["email"]) || "—";
      const resellerId = formatScopeId(
        pickStr(detailObj, ["resellerId", "reseller_id"]) ||
          pickStr(resellerObj, ["id", "name"]),
      );
      const parentCompanyId = formatScopeId(
        pickStr(detailObj, ["parentCompanyId", "parent_company_id", "companyId", "company_id"]) ||
          pickStr(parentCompanyObj, ["id", "name"]),
      );
      const departmentName =
        pickStr(departmentObj, ["name"]) ||
        pickStr(detailObj, ["departmentName", "department_name"]) ||
        "—";
      const designationName =
        pickStr(designationObj, ["name"]) ||
        pickStr(detailObj, ["designationName", "designation_name"]) ||
        "—";
      return { name, email, type, resellerId, parentCompanyId, departmentName, designationName };
    }

    const listMatch = users.find((u) => u.id === userId.trim());
    if (!listMatch) return null;
    return {
      name: listMatch.name,
      email: listMatch.email,
      type: listMatch.type,
      resellerId: listMatch.resellerId,
      parentCompanyId: listMatch.parentCompanyId,
      departmentName: "—",
      designationName: "—",
    };
  }, [userId, userDetailQuery.data, users]);

  const selectedUserType: UserType | null = selectedUserMeta?.type ?? (userTypeById.get(userId.trim()) ?? null);

  const selectedUserLabel = useMemo(() => {
    if (!selectedUserMeta) return "";
    return selectedUserMeta.type === "External"
      ? `${selectedUserMeta.name} (${selectedUserMeta.type}) • R:${selectedUserMeta.resellerId} • P:${selectedUserMeta.parentCompanyId}`
      : `${selectedUserMeta.name} (${selectedUserMeta.type})`;
  }, [selectedUserMeta]);

  const filteredUsers = useMemo(() => {
    if (!canLoadUsers) return [];
    if (userTypeFilter === "all") return users;
    return users.filter((u) => u.type === userTypeFilter);
  }, [users, userTypeFilter, canLoadUsers]);

  const handleUserTypeFilterChange = (value: "all" | UserType) => {
    setUserTypeFilter(value);
    setUserPage(1);
    setUserId("");
    if (value !== "External") {
      setExternalResellerId("");
      setExternalParentCompanyId("");
      setExternalDepartmentId("");
    }
    if (value !== "Internal") {
      setInternalDepartmentId("");
    }
  };

  const shiftsQuery = useShiftsListQuery({ all: true }, { enabled: true, scope: "user-shift-templates" });
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

  const assignmentsQuery = useUserShiftAssignmentsListQuery(
    userId.trim() ? { userId: userId.trim(), all: true } : undefined,
    { enabled: Boolean(userId.trim()), scope: "user-shift-roster" },
  );
  const createMutation = useCreateUserShiftAssignmentMutation();
  const removeMutation = useRemoveUserShiftAssignmentMutation();

  const assignmentsPayload = unwrapApiData(assignmentsQuery.data);
  const assignmentsObj = isRecord(assignmentsPayload) ? assignmentsPayload : null;
  const assignmentItems = useMemo(() => {
    const arr = assignmentsObj?.["items"];
    return Array.isArray(arr) ? (arr as unknown[]).filter(isRecord) : [];
  }, [assignmentsObj]);

  const tableRows = useMemo<UserShiftAssignmentRow[]>(() => {
    return assignmentItems
      .map((r) => {
        const id = pickStr(r, ["id"]);
        if (!id) return null;
        const shiftName =
          pickStr(isRecord(r["shift"]) ? (r["shift"] as Record<string, unknown>) : null, ["name"]) ||
          pickStr(r, ["shiftName"]) ||
          "—";
        const from = pickStr(r, ["effectiveFrom", "from", "startDate"]) || "—";
        const to = pickStr(r, ["effectiveTo", "to", "endDate"]) || "—";
        return { id, shiftName, effectiveFrom: from, effectiveTo: to };
      })
      .filter((x): x is UserShiftAssignmentRow => x !== null);
  }, [assignmentItems]);

  const columns = useMemo<DataTableColumn<UserShiftAssignmentRow>[]>(
    () => [
      { id: "shiftName", label: "Shift" },
      { id: "effectiveFrom", label: "Effective from" },
      { id: "effectiveTo", label: "Effective to" },
    ],
    [],
  );

  const monthLabel = useMemo(() => {
    return monthCursor.toLocaleString(undefined, { month: "long", year: "numeric" });
  }, [monthCursor]);

  const monthDays = useMemo(() => {
    const first = startOfMonth(monthCursor);
    const total = daysInMonth(monthCursor);
    const firstWeekday = first.getDay(); // 0=Sun
    const cells: CalendarCell[] = [];
    const prevMonth = new Date(first.getFullYear(), first.getMonth(), 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = 0; i < firstWeekday; i++) {
      const d = prevMonthDays - (firstWeekday - 1 - i);
      const dt = new Date(first.getFullYear(), first.getMonth() - 1, d);
      cells.push({ iso: toIsoDateString(dt), day: d, inMonth: false });
    }
    for (let d = 1; d <= total; d++) {
      const dt = new Date(first.getFullYear(), first.getMonth(), d);
      cells.push({ iso: toIsoDateString(dt), day: d, inMonth: true });
    }
    while (cells.length % 7 !== 0) {
      const dt = new Date(first.getFullYear(), first.getMonth(), total + (cells.length - (firstWeekday + total) + 1));
      cells.push({ iso: toIsoDateString(dt), day: dt.getDate(), inMonth: false });
    }
    return cells;
  }, [monthCursor]);

  const assignmentsForCalendar = useMemo(() => {
    return tableRows
      .filter((r) => r.effectiveFrom !== "—" && r.effectiveTo !== "—")
      .slice()
      .sort((a, b) => (a.effectiveFrom < b.effectiveFrom ? 1 : -1)); // more recent wins
  }, [tableRows]);

  const todayIso = useMemo(() => toIsoDateString(new Date()), []);

  const handleCancel = () => {
    setShiftId("");
    setEffectiveFrom("");
    setEffectiveTo("");
  };

  const handleAssign = () => {
    if (!userId.trim()) {
      publishAppToast({ variant: "error", message: "Please select a user." });
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

    createMutation.mutate(
      {
        userId: userId.trim(),
        shiftId: shiftId.trim(),
        effectiveFrom: effectiveFrom.trim(),
        effectiveTo: effectiveTo.trim(),
      },
      {
        onSuccess: () => {
          publishAppToast({ variant: "success", message: "User shift assigned successfully." });
          setAssignOpen(false);
          handleCancel();
        },
        onError: () => publishAppToast({ variant: "error", message: "Could not assign shift." }),
      },
    );
  };

  return (
    <Box sx={pageWrapper}>
      <Box sx={[rolesPageWrapper, { maxWidth: "100%", mx: 0 }] as SxProps<Theme>}>
        <Box sx={userShiftHeaderWrapSx}>
          <Typography variant="regularLarge" fontWeight={700} color="white">
            User shift roster
          </Typography>
          <Typography variant="body2" sx={userShiftSubtextSx}>
            Select a user to see which shift is assigned from which date to which date.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "360px 1fr" },
            gap: 2,
            alignItems: "start",
          }}
        >
          <UsersSidebar
            users={filteredUsers}
            selectedUserId={userId}
            onSelectUserId={setUserId}
            search={userSearch}
            onSearchChange={setUserSearch}
            page={userPage}
            pageCount={userPageCount}
            totalLabel={
              userTypeFilter === "External" && !externalScopeReady
                ? "Select external scope to load users"
                : userTypeFilter === "Internal" && !internalScopeReady
                  ? "Select department to load users"
                : `Total ${userTotal} user(s)`
            }
            onPageChange={setUserPage}
            isLoading={usersQuery.isLoading || usersQuery.isFetching}
            typeFilter={userTypeFilter}
            onTypeFilterChange={handleUserTypeFilterChange}
            resellerId={externalResellerId}
            onResellerIdChange={(value) => {
              setExternalResellerId(value);
              setExternalParentCompanyId("");
              setExternalDepartmentId("");
              setUserId("");
              setUserPage(1);
            }}
            resellerOptions={resellerOptions}
            isResellersLoading={resellersQuery.isLoading || resellersQuery.isFetching}
            parentCompanyId={externalParentCompanyId}
            onParentCompanyIdChange={(value) => {
              setExternalParentCompanyId(value);
              setExternalDepartmentId("");
              setUserId("");
              setUserPage(1);
            }}
            parentCompanyOptions={parentCompanyOptions}
            isParentCompaniesLoading={companiesByResellerQuery.isLoading || companiesByResellerQuery.isFetching}
            isDepartmentsLoading={
              userTypeFilter === "Internal"
                ? internalDepartmentsQuery.isLoading || internalDepartmentsQuery.isFetching
                : externalDepartmentsQuery.isLoading || externalDepartmentsQuery.isFetching
            }
            externalScopeReady={externalScopeReady}
            internalScopeReady={internalScopeReady}
            departmentId={userTypeFilter === "Internal" ? internalDepartmentId : externalDepartmentId}
            onDepartmentIdChange={(value) => {
              if (userTypeFilter === "Internal") {
                setInternalDepartmentId(value);
              } else {
                setExternalDepartmentId(value);
              }
              setUserId("");
              setUserPage(1);
            }}
            departmentOptions={userTypeFilter === "Internal" ? internalDepartmentOptions : externalDepartmentOptions}
          />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
            <UserShiftRosterCard
              headerCaption={selectedUserLabel || "Select a user from the left"}
              monthLabel={monthLabel}
              onPrevMonth={() => setMonthCursor((d) => addMonths(d, -1))}
              onNextMonth={() => setMonthCursor((d) => addMonths(d, 1))}
              onToday={() => setMonthCursor(startOfMonth(new Date()))}
              cells={monthDays}
              todayIso={todayIso}
              assignments={assignmentsForCalendar}
              onPickDate={(iso) => {
                if (!userId.trim()) {
                  publishAppToast({ variant: "error", message: "Select a user first." });
                  return;
                }
                setEffectiveFrom(iso);
                setEffectiveTo(iso);
                setAssignOpen(true);
              }}
              onAddShift={() => setAssignOpen(true)}
            />

            <UserShiftAssignmentsCard
              selectedUserTypeLabel={selectedUserType}
              hasSelectedUser={Boolean(userId.trim())}
              isLoading={assignmentsQuery.isLoading || assignmentsQuery.isFetching}
              rows={tableRows}
              columns={columns}
              onRemove={setRemoveTarget}
              isRemoving={removeMutation.isPending}
            />
          </Box>
        </Box>

        <UserShiftAssignModal
          theme={theme}
          open={assignOpen}
          isSaving={createMutation.isPending}
          onClose={() => {
            if (createMutation.isPending) return;
            setAssignOpen(false);
            handleCancel();
          }}
          onSave={handleAssign}
          userId={userId}
          onUserIdChange={setUserId}
          userOptions={userOptions}
          shiftId={shiftId}
          onShiftIdChange={setShiftId}
          shiftOptions={shiftOptions}
          effectiveFrom={effectiveFrom}
          onEffectiveFromChange={setEffectiveFrom}
          effectiveTo={effectiveTo}
          onEffectiveToChange={setEffectiveTo}
          showPickUserHint={!userId.trim()}
          selectedUserMeta={selectedUserMeta}
        />

        <ConfirmActionModal
          open={removeTarget != null}
          title="Remove assignment?"
          description="Remove this user shift assignment?"
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
    </Box>
  );
}
