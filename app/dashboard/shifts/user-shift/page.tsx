"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
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
import { addMonths, daysInMonth, formatIsoDate, isRecord, pickNum, pickStr, startOfMonth, toIsoDateString, unwrapApiData } from "@/lib/utils/core";
import {
  HRMS_SHIFTS_LIST_SEARCH_MAX,
  type HrmsShiftsListShiftScope,
  clampWorkingDaysMask,
  effectiveWorkingDaysMask,
  formatWorkingDaysMaskHuman,
  HRMS_DEFAULT_WORKING_DAYS_MASK,
} from "@/lib/utils/hrms";
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
  type CalendarAssignment,
  type CalendarCell,
  type SelectedUserMeta,
  type UserListRow,
  type UserShiftAssignmentRow,
  type UserType,
} from "./components";
import { useAuth, sessionMayPickInternalUserScope } from "@/lib/auth";

/** Map list/detail user payloads to UI `UserType` (nested `user`, snake_case, mixed casing). */
function mapApiRecordToUserType(obj: Record<string, unknown> | null): UserType {
  if (!obj) return "External";
  const nested = isRecord(obj["user"]) ? (obj["user"] as Record<string, unknown>) : null;
  if (typeof obj["isInternal"] === "boolean") return obj["isInternal"] ? "Internal" : "External";
  if (nested && typeof nested["isInternal"] === "boolean") return nested["isInternal"] ? "Internal" : "External";
  const picked =
    pickStr(obj, ["userType", "type", "user_type"]) || pickStr(nested, ["userType", "type", "user_type"]);
  if (picked) {
    const low = picked.toLowerCase();
    if (low === "internal") return "Internal";
    if (low === "external") return "External";
  }
  const loose = String(obj["userType"] ?? nested?.["userType"] ?? obj["type"] ?? nested?.["type"] ?? "").trim();
  const low = loose.toLowerCase();
  if (low === "internal" || loose === "Internal") return "Internal";
  if (low === "external" || loose === "External") return "External";
  return "External";
}

export default function UserShiftPage() {
  const searchParams = useSearchParams();
  const { isPlatformAdmin, user: authUser } = useAuth();
  const mayPickInternalUserTypeFilter = useMemo(
    () => sessionMayPickInternalUserScope(isPlatformAdmin, authUser),
    [isPlatformAdmin, authUser?.userType],
  );
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const fromUrl = searchParams.get("userId")?.trim() ?? "";
    if (fromUrl) setUserId(fromUrl);
  }, [searchParams]);
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()));
  const [assignOpen, setAssignOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<UserShiftAssignmentRow | null>(null);

  const [shiftId, setShiftId] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [effectiveTo, setEffectiveTo] = useState("");
  const [assignOverrideWeek, setAssignOverrideWeek] = useState(false);
  const [assignWorkingMask, setAssignWorkingMask] = useState(HRMS_DEFAULT_WORKING_DAYS_MASK);

  const [userSearchDraft, setUserSearchDraft] = useState("");
  const [userSearchApplied, setUserSearchApplied] = useState("");
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

  /**
   * GET /users (user:view) — documented filters only: userType, search, parentCompanyId,
   * departmentId, page, limit, etc. Reseller-channel: omit userType or External only (Internal → 400).
   * Subtree scope uses parentCompanyId, not resellerId on this endpoint.
   */
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
      ...(userSearchApplied.trim() ? { search: userSearchApplied.trim() } : {}),
    },
    { enabled: canLoadUsers },
  );
  const userDetailQuery = useUserQuery(userId.trim(), { enabled: Boolean(userId.trim()) });

  const formatScopeId = (value: string | undefined) => {
    const v = (value ?? "").trim();
    return v || "—";
  };

  const { users, userTypeById, userPageCount, userTotal } = useMemo(() => {
    const payload = unwrapApiData(usersQuery.data);
    const payloadObj = isRecord(payload) ? payload : null;
    const items = Array.isArray(payloadObj?.["items"]) ? (payloadObj?.["items"] as unknown[]).filter(isRecord) : [];
    const typeById = new Map<string, UserType>();
    const rows = items
      .map((r) => {
        const nestedUser = isRecord(r["user"]) ? (r["user"] as Record<string, unknown>) : null;
        const id = pickStr(r, ["id"]) || pickStr(nestedUser, ["id", "userId", "user_id"]);
        if (!id) return null;
        const resellerObj = isRecord(r["reseller"]) ? (r["reseller"] as Record<string, unknown>) : null;
        const parentCompanyObj = isRecord(r["parentCompany"]) ? (r["parentCompany"] as Record<string, unknown>) : null;
        const name =
          pickStr(r, ["name"]) ||
          [pickStr(r, ["firstName"]), pickStr(r, ["lastName"])].filter(Boolean).join(" ") ||
          pickStr(nestedUser, ["name"]) ||
          [pickStr(nestedUser, ["firstName"]), pickStr(nestedUser, ["lastName"])].filter(Boolean).join(" ") ||
          pickStr(r, ["email"]) ||
          pickStr(nestedUser, ["email"]) ||
          "—";
        const email = pickStr(r, ["email"]) || pickStr(nestedUser, ["email"]) || "—";
        const type = mapApiRecordToUserType(r);
        const resellerIdRaw = pickStr(r, ["resellerId", "reseller_id"]) || pickStr(resellerObj, ["id"]) || "";
        const parentCompanyIdRaw =
          pickStr(r, ["parentCompanyId", "parent_company_id", "companyId", "company_id"]) || pickStr(parentCompanyObj, ["id"]) || "";
        const resellerId = formatScopeId(resellerIdRaw);
        const parentCompanyId = formatScopeId(parentCompanyIdRaw);
        const resellerName =
          type === "Internal" ? "—" : (pickStr(resellerObj, ["name"]).trim() || resellerId || "—");
        const parentCompanyName =
          type === "Internal" ? "—" : (pickStr(parentCompanyObj, ["name"]).trim() || parentCompanyId || "—");
        typeById.set(id, type);
        return {
          id,
          name,
          email,
          type,
          resellerId,
          parentCompanyId,
          resellerName,
          parentCompanyName,
        } satisfies UserListRow;
      })
      .filter((x): x is UserListRow => x !== null);

    const pageCount = pickNum(payloadObj, ["totalPages"]) ?? 1;
    const total = pickNum(payloadObj, ["total", "count", "totalCount"]) ?? rows.length;

    return {
      users: rows,
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
      const type = mapApiRecordToUserType(detailObj);
      const name =
        pickStr(detailObj, ["name"]) ||
        [pickStr(detailObj, ["firstName"]), pickStr(detailObj, ["lastName"])].filter(Boolean).join(" ") ||
        pickStr(detailObj, ["email"]) ||
        "—";
      const email = pickStr(detailObj, ["email"]) || "—";
      const resellerIdRaw = pickStr(detailObj, ["resellerId", "reseller_id"]) || pickStr(resellerObj, ["id"]) || "";
      const parentCompanyIdRaw =
        pickStr(detailObj, ["parentCompanyId", "parent_company_id", "companyId", "company_id"]) ||
        pickStr(parentCompanyObj, ["id"]) ||
        "";
      const resellerId = formatScopeId(resellerIdRaw);
      const parentCompanyId = formatScopeId(parentCompanyIdRaw);
      const resellerName =
        type === "Internal" ? "—" : (pickStr(resellerObj, ["name"]).trim() || resellerId || "—");
      const parentCompanyName =
        type === "Internal" ? "—" : (pickStr(parentCompanyObj, ["name"]).trim() || parentCompanyId || "—");
      const departmentName =
        pickStr(departmentObj, ["name"]) ||
        pickStr(detailObj, ["departmentName", "department_name"]) ||
        "—";
      const designationName =
        pickStr(designationObj, ["name"]) ||
        pickStr(detailObj, ["designationName", "designation_name"]) ||
        "—";
      return { name, email, type, resellerId, parentCompanyId, resellerName, parentCompanyName, departmentName, designationName };
    }

    const listMatch = users.find((u) => u.id === userId.trim());
    if (!listMatch) return null;
    return {
      name: listMatch.name,
      email: listMatch.email,
      type: listMatch.type,
      resellerId: listMatch.resellerId,
      parentCompanyId: listMatch.parentCompanyId,
      resellerName: listMatch.resellerName,
      parentCompanyName: listMatch.parentCompanyName,
      departmentName: "—",
      designationName: "—",
    };
  }, [userId, userDetailQuery.data, users]);

  const selectedUserType: UserType | null = selectedUserMeta?.type ?? (userTypeById.get(userId.trim()) ?? null);

  /** `GET /hrms/shifts` catalog: follow selected user's type when set; else sidebar list filter. */
  const shiftsShiftScope = useMemo((): HrmsShiftsListShiftScope => {
    if (selectedUserType === "Internal") return "internal";
    if (selectedUserType === "External") return "external";
    if (userTypeFilter === "Internal") return "internal";
    if (userTypeFilter === "External") return "external";
    return "all";
  }, [selectedUserType, userTypeFilter]);

  const shiftsCatalogParentId = useMemo(() => {
    if (selectedUserType === "External") {
      const fromMeta = selectedUserMeta?.parentCompanyId?.trim();
      if (fromMeta && fromMeta !== "—") return fromMeta;
      const row = users.find((u) => u.id === userId.trim());
      const fromRow = row?.parentCompanyId?.trim();
      if (fromRow && fromRow !== "—") return fromRow;
      if (userTypeFilter === "External" && externalParentCompanyId.trim()) return externalParentCompanyId.trim();
      return "";
    }
    if (userTypeFilter === "External" && externalParentCompanyId.trim()) return externalParentCompanyId.trim();
    return "";
  }, [
    selectedUserType,
    selectedUserMeta?.parentCompanyId,
    userId,
    users,
    userTypeFilter,
    externalParentCompanyId,
  ]);

  const shiftsListScopeKey = `${shiftsShiftScope}:${shiftsCatalogParentId}`;

  useEffect(() => {
    setShiftId("");
  }, [shiftsListScopeKey]);

  const shiftsQuery = useShiftsListQuery(
    {
      all: true,
      shiftScope: shiftsShiftScope,
      ...(shiftsCatalogParentId.trim() ? { parentCompanyId: shiftsCatalogParentId.trim() } : {}),
    },
    { enabled: true, scope: "user-shift-templates" },
  );

  const selectedUserLabel = useMemo(() => {
    if (!selectedUserMeta) return "";
    return selectedUserMeta.type === "External"
      ? `${selectedUserMeta.name} (${selectedUserMeta.type}) • R:${selectedUserMeta.resellerName} • P:${selectedUserMeta.parentCompanyName}`
      : `${selectedUserMeta.name} (${selectedUserMeta.type})`;
  }, [selectedUserMeta]);

  const filteredUsers = useMemo(() => {
    if (!canLoadUsers) return [];
    if (userTypeFilter === "all") return users;
    return users.filter((u) => u.type === userTypeFilter);
  }, [users, userTypeFilter, canLoadUsers]);

  const handleUserSearchApply = useCallback(() => {
    setUserSearchApplied(userSearchDraft.trim().slice(0, HRMS_SHIFTS_LIST_SEARCH_MAX));
    setUserPage(1);
  }, [userSearchDraft]);

  const clearUserListFilters = useCallback(() => {
    setUserTypeFilter("all");
    setUserPage(1);
    setUserId("");
    setShiftId("");
    setExternalResellerId("");
    setExternalParentCompanyId("");
    setExternalDepartmentId("");
    setInternalDepartmentId("");
    setUserSearchDraft("");
    setUserSearchApplied("");
  }, []);

  const handleUserTypeFilterChange = (value: "all" | UserType) => {
    setUserTypeFilter(value);
    setUserPage(1);
    setUserId("");
    setShiftId("");
    setUserSearchDraft("");
    setUserSearchApplied("");
    if (value !== "External") {
      setExternalResellerId("");
      setExternalParentCompanyId("");
      setExternalDepartmentId("");
    }
    if (value !== "Internal") {
      setInternalDepartmentId("");
    }
  };

  useEffect(() => {
    if (mayPickInternalUserTypeFilter || userTypeFilter !== "Internal") return;
    setUserTypeFilter("all");
    setUserPage(1);
    setUserId("");
    setShiftId("");
    setExternalResellerId("");
    setExternalParentCompanyId("");
    setExternalDepartmentId("");
    setInternalDepartmentId("");
    setUserSearchDraft("");
    setUserSearchApplied("");
  }, [mayPickInternalUserTypeFilter, userTypeFilter]);

  const shiftOptions = useMemo(() => {
    const payload = unwrapApiData(shiftsQuery.data);
    const payloadObj = isRecord(payload) ? payload : null;
    const items = Array.isArray(payloadObj?.["items"]) ? (payloadObj?.["items"] as unknown[]).filter(isRecord) : [];
    const base = items
      .map((r) => {
        const id = pickStr(r, ["id"]);
        const name = pickStr(r, ["name"]);
        if (!id || !name) return null;
        const cat = pickStr(r, ["catalog"]).toLowerCase();
        const scopeLabel = cat === "platform" ? "Internal" : cat === "tenant" ? "External" : "";
        const label = scopeLabel ? `${name} (${scopeLabel})` : name;
        return { value: id, label };
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
        const shiftObj = isRecord(r["shift"]) ? (r["shift"] as Record<string, unknown>) : null;
        const shiftName =
          pickStr(shiftObj, ["name"]) ||
          pickStr(r, ["shiftName"]) ||
          "—";
        const from = pickStr(r, ["effectiveFrom", "from", "startDate"]) || "—";
        const to = pickStr(r, ["effectiveTo", "to", "endDate"]) || "—";
        const rawAssign = r["workingDaysMask"] ?? r["working_days_mask"];
        let assignMask: number | null = null;
        if (rawAssign !== null && rawAssign !== undefined && rawAssign !== "") {
          const n = typeof rawAssign === "number" ? rawAssign : Number(rawAssign);
          if (Number.isFinite(n) && n >= 1 && n <= 127) assignMask = Math.trunc(n);
        }
        const tmplMask = pickNum(shiftObj, ["workingDaysMask", "working_days_mask"]);
        const eff = effectiveWorkingDaysMask(assignMask, tmplMask);
        const weekSummary =
          assignMask != null
            ? formatWorkingDaysMaskHuman(clampWorkingDaysMask(assignMask))
            : `Inherited (${formatWorkingDaysMaskHuman(eff)})`;
        return { id, shiftName, effectiveFrom: from, effectiveTo: to, weekSummary };
      })
      .filter((x): x is UserShiftAssignmentRow => x !== null);
  }, [assignmentItems]);

  const calendarAssignments = useMemo((): CalendarAssignment[] => {
    const out: CalendarAssignment[] = [];
    for (const r of assignmentItems) {
      const id = pickStr(r, ["id"]);
      if (!id) continue;
      const shiftObj = isRecord(r["shift"]) ? (r["shift"] as Record<string, unknown>) : null;
      const shiftName =
        pickStr(shiftObj, ["name"]) ||
        pickStr(r, ["shiftName"]) ||
        "—";
      const fromRaw = pickStr(r, ["effectiveFrom", "from", "startDate"]);
      const toRaw = pickStr(r, ["effectiveTo", "to", "endDate"]);
      const from = formatIsoDate(fromRaw);
      const to = formatIsoDate(toRaw);
      if (!fromRaw || !toRaw || from === "—" || to === "—") continue;
      const tz =
        pickStr(shiftObj, ["timezone", "timeZone", "time_zone"]) ||
        pickStr(r, ["timezone", "timeZone", "time_zone"]) ||
        "UTC";
      const rawAssign = r["workingDaysMask"] ?? r["working_days_mask"];
      let assignMask: number | null = null;
      if (rawAssign !== null && rawAssign !== undefined && rawAssign !== "") {
        const n = typeof rawAssign === "number" ? rawAssign : Number(rawAssign);
        if (Number.isFinite(n) && n >= 1 && n <= 127) assignMask = Math.trunc(n);
      }
      const tmplMask = pickNum(shiftObj, ["workingDaysMask", "working_days_mask"]);
      const eff = effectiveWorkingDaysMask(assignMask, tmplMask);
      out.push({
        id,
        shiftName,
        effectiveFrom: from,
        effectiveTo: to,
        effectiveWorkingDaysMask: eff,
        shiftTimeZone: tz,
      });
    }
    return out.slice().sort((a, b) => (a.effectiveFrom < b.effectiveFrom ? 1 : -1));
  }, [assignmentItems]);

  const columns = useMemo<DataTableColumn<UserShiftAssignmentRow>[]>(
    () => [
      { id: "shiftName", label: "Shift" },
      { id: "weekSummary", label: "Working week" },
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

  const todayIso = useMemo(() => toIsoDateString(new Date()), []);

  const handleCancel = () => {
    setShiftId("");
    setEffectiveFrom("");
    setEffectiveTo("");
    setAssignOverrideWeek(false);
    setAssignWorkingMask(HRMS_DEFAULT_WORKING_DAYS_MASK);
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
        ...(assignOverrideWeek ? { workingDaysMask: clampWorkingDaysMask(assignWorkingMask) } : {}),
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
          <Typography variant="regularLarge" fontWeight={700} sx={{ color: "text.primary" }}>
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
            searchDraft={userSearchDraft}
            onSearchDraftChange={setUserSearchDraft}
            onSearchApply={handleUserSearchApply}
            searchApplyDisabled={userSearchDraft.trim() === userSearchApplied.trim()}
            searchApplied={userSearchApplied}
            onClearFilters={clearUserListFilters}
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
            showInternalTypeCapsule={mayPickInternalUserTypeFilter}
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
              assignments={calendarAssignments}
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
          users={users}
          usersLoading={usersQuery.isLoading || usersQuery.isFetching}
          showInternalUserTypeFilter={mayPickInternalUserTypeFilter}
          userListTypeFilter={userTypeFilter}
          shiftId={shiftId}
          onShiftIdChange={setShiftId}
          shiftOptions={shiftOptions}
          effectiveFrom={effectiveFrom}
          onEffectiveFromChange={setEffectiveFrom}
          effectiveTo={effectiveTo}
          onEffectiveToChange={setEffectiveTo}
          selectedUserMeta={selectedUserMeta}
          assignOverrideWeek={assignOverrideWeek}
          onAssignOverrideWeekChange={setAssignOverrideWeek}
          assignWorkingMask={assignWorkingMask}
          onAssignWorkingMaskChange={setAssignWorkingMask}
        />

        <ConfirmActionModal
          open={removeTarget != null}
          title="Remove assignment?"
          description="Remove this user shift assignment?"
          confirmLabel={removeMutation.isPending ? "Removing…" : "Remove"}
          cancelLabel="Cancel"
          confirmButtonVariant="danger"
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
