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
  useDepartmentsListQuery,
  useDepartmentShiftsListQuery,
  useEnableDepartmentShiftMutation,
  useRemoveDepartmentShiftMutation,
  useShiftsListQuery,
} from "@/lib/hooks/query";
import { pickItemsArray, toIdNameOption } from "@/app/dashboard/user-page/components/add-user-modal.utils";
import {
  departmentShiftCardHeaderSx,
  departmentShiftFilterHintSx,
  departmentShiftFormGridSx,
  departmentShiftHeaderWrapSx,
  departmentShiftIconSx,
  departmentShiftSubtextSx,
} from "./department-shift.styles";

const PAGE_LIMIT = 8;

type AssignmentRow = {
  id: string;
  departmentName: string;
  shiftName: string;
  effectiveFrom: string;
  effectiveTo: string;
};

export default function DepartmentShiftPage() {
  const theme = useTheme() as AppTheme;
  const [departmentId, setDepartmentId] = useState("");
  const [page, setPage] = useState(1);
  const [assignOpen, setAssignOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<AssignmentRow | null>(null);

  const [shiftId, setShiftId] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [effectiveTo, setEffectiveTo] = useState("");

  const departmentsQuery = useDepartmentsListQuery({ all: true }, { enabled: true, scope: "dept-shift-assignments" });
  const departmentOptions = useMemo(() => {
    const base = pickItemsArray(departmentsQuery.data)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => o !== null);
    return [{ value: "", label: "— Select department —" }, ...base];
  }, [departmentsQuery.data]);

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

  const listParams = useMemo(
    () =>
      ({
        ...(departmentId.trim() ? { departmentId: departmentId.trim() } : {}),
        page,
        limit: PAGE_LIMIT,
      }) satisfies { departmentId?: string; page: number; limit: number },
    [departmentId, page],
  );
  const listQuery = useDepartmentShiftsListQuery(listParams, {
    enabled: true,
    scope: "dept-shifts",
  });
  const assignMutation = useEnableDepartmentShiftMutation();
  const removeMutation = useRemoveDepartmentShiftMutation();

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
  }, [departmentId]);

  useEffect(() => {
    setPage((p) => (p > pageCount ? pageCount : p));
  }, [pageCount]);

  const selectedDepartmentLabel = useMemo(() => {
    if (!departmentId.trim()) return "";
    return departmentOptions.find((o) => o.value === departmentId)?.label ?? "";
  }, [departmentId, departmentOptions]);

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

  const handleCancel = () => {
    setShiftId("");
    setEffectiveFrom("");
    setEffectiveTo("");
  };

  const handleAssign = () => {
    if (!departmentId.trim()) {
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
        departmentId: departmentId.trim(),
        shiftId: shiftId.trim(),
        effectiveFrom: effectiveFrom.trim(),
        effectiveTo: effectiveTo.trim(),
      },
      {
        onSuccess: () => {
          publishAppToast({ variant: "success", message: "Department shift assigned successfully." });
          setAssignOpen(false);
          handleCancel();
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
        <Chip
          size="small"
          label={`${totalEntries} assignment${totalEntries === 1 ? "" : "s"}`}
          variant="outlined"
          sx={{ alignSelf: "flex-start", borderColor: "rgba(255,255,255,0.35)", color: theme.app.dashboard.white95 }}
        />
      </Box>

      <DashboardCard sx={rolesCard}>
        <Box sx={{ ...departmentShiftCardHeaderSx, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
            <Box sx={rolesIconBox}>
              <AccessTimeIcon sx={departmentShiftIconSx} />
            </Box>
            <Typography variant="mediumLarge" fontWeight={600} color="white" noWrap>
              Filters
            </Typography>
          </Box>

          <Button
            variant="primary"
            sx={gradientPrimaryButtonSx}
            onClick={() => setAssignOpen(true)}
            disabled={!departmentId.trim()}
          >
            Assign shift
          </Button>
        </Box>

        <Box sx={departmentShiftFormGridSx}>
          <SelectField
            label="Department"
            value={departmentId}
            onChange={setDepartmentId}
            options={departmentOptions}
            menuMaxRows={8}
          />
          <Box sx={{ display: "flex", alignItems: "end", justifyContent: { xs: "flex-start", md: "flex-end" }, gap: 1.25, flexWrap: "wrap" }}>
            <Typography variant="body2" sx={departmentShiftFilterHintSx}>
              {departmentId.trim() ? "Filtered by department" : "Showing all departments"}
            </Typography>
            <Button
              variant="secondary"
              onClick={() => setDepartmentId("")}
              disabled={!departmentId.trim()}
            >
              Clear filter
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
        description="Assign a default shift to everyone in the department (date range)."
        onClose={() => {
          if (assignMutation.isPending) return;
          setAssignOpen(false);
          handleCancel();
        }}
        onSave={handleAssign}
        primaryButtonLabel={assignMutation.isPending ? "Saving…" : "Assign"}
        primaryButtonDisabled={assignMutation.isPending}
        cancelButtonLabel="Close"
        maxWidth={600}
        fitContent
      >
        {!departmentId.trim() ? (
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
            Pick a department first, then assign a shift.
          </Typography>
        ) : null}
        <SelectField
          label="Department"
          value={departmentId}
          onChange={setDepartmentId}
          options={departmentOptions}
          menuMaxRows={8}
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
