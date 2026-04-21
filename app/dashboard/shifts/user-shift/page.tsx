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
import { useUsersListQuery } from "@/lib/hooks/query/users";
import { useCreateUserShiftAssignmentMutation, useRemoveUserShiftAssignmentMutation, useShiftsListQuery, useUserShiftAssignmentsListQuery } from "@/lib/hooks/query";
import { addMonths, daysInMonth, isRecord, pickNum, pickStr, startOfMonth, toIsoDateString, unwrapApiData } from "@/lib/utils";
import {
  userShiftHeaderWrapSx,
  userShiftSubtextSx,
} from "./user-shift.styles";
import { UserShiftAssignmentsCard, UserShiftAssignModal, UserShiftRosterCard, UsersSidebar, type CalendarCell, type UserListRow, type UserShiftAssignmentRow, type UserType } from "./components";

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

  const usersQuery = useUsersListQuery(
    {
      page: userPage,
      limit: 50,
      ...(userSearch.trim() ? { search: userSearch.trim() } : {}),
    },
    { enabled: true },
  );

  const { users, userOptions, userTypeById, userPageCount, userTotal } = useMemo(() => {
    const payload = unwrapApiData(usersQuery.data);
    const payloadObj = isRecord(payload) ? payload : null;
    const items = Array.isArray(payloadObj?.["items"]) ? (payloadObj?.["items"] as unknown[]).filter(isRecord) : [];
    const typeById = new Map<string, UserType>();
    const rows = items
      .map((r) => {
        const id = pickStr(r, ["id"]);
        if (!id) return null;
        const name =
          pickStr(r, ["name"]) ||
          [pickStr(r, ["firstName"]), pickStr(r, ["lastName"])].filter(Boolean).join(" ") ||
          pickStr(r, ["email"]) ||
          "—";
        const email = pickStr(r, ["email"]) || "—";
        const rawType = pickStr(r, ["userType", "type"]);
        const type: UserType = rawType === "Internal" ? "Internal" : "External";
        typeById.set(id, type);
        return { id, name, email, type } satisfies UserListRow;
      })
      .filter((x): x is UserListRow => x !== null);

    const baseOptions = rows.map((u) => ({
      value: u.id,
      // SelectField's underlying Autocomplete uses option labels as keys.
      // Names can collide, so include email to make labels stable + unique.
      label: `${u.name} — ${u.email} (${u.type})`,
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

  const selectedUserType: UserType | null = useMemo(() => {
    if (!userId.trim()) return null;
    return userTypeById.get(userId.trim()) ?? null;
  }, [userId, userTypeById]);

  const selectedUserLabel = useMemo(() => {
    if (!userId.trim()) return "";
    const match = users.find((u) => u.id === userId.trim());
    return match ? `${match.name} (${match.type})` : "";
  }, [userId, users]);

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
            users={users}
            selectedUserId={userId}
            onSelectUserId={setUserId}
            search={userSearch}
            onSearchChange={setUserSearch}
            page={userPage}
            pageCount={userPageCount}
            totalLabel={`Total ${userTotal} user(s)`}
            onPageChange={setUserPage}
            isLoading={usersQuery.isLoading || usersQuery.isFetching}
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
