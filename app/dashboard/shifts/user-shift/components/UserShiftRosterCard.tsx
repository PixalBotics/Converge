"use client";

import Box from "@mui/material/Box";
import { AttachMoney as AttachMoneyIcon } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, DashboardCard, MonthGridCalendar, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { rolesCard, rolesIconBox } from "@/app/dashboard/roles/roles.styles";
import { userShiftCardHeaderSx, userShiftIconSx } from "../user-shift.styles";

export type CalendarCell = {
  iso: string;
  day: number;
  inMonth: boolean;
};

export type CalendarAssignment = {
  id: string;
  shiftName: string;
  effectiveFrom: string;
  effectiveTo: string;
  /** Effective weekly mask (assignment override or template). */
  effectiveWorkingDaysMask?: number;
  /** Shift template IANA zone for weekly-off resolution. */
  shiftTimeZone?: string;
};

export type UserShiftRosterCardProps = {
  headerCaption: string;
  monthLabel: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  cells: CalendarCell[];
  todayIso: string;
  assignments: CalendarAssignment[];
  onPickDate: (iso: string) => void;
  onAddShift: () => void;
};

export function UserShiftRosterCard({
  headerCaption,
  monthLabel,
  onPrevMonth,
  onNextMonth,
  onToday,
  cells,
  todayIso,
  assignments,
  onPickDate,
  onAddShift,
}: UserShiftRosterCardProps) {
  const theme = useTheme() as AppTheme;

  return (
    <DashboardCard sx={rolesCard}>
      <Box
        sx={{
          ...userShiftCardHeaderSx,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
          <Box sx={rolesIconBox}>
            <AttachMoneyIcon sx={userShiftIconSx} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="mediumLarge" fontWeight={700} sx={{ color: "text.primary" }} noWrap>
              Roster
            </Typography>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }} noWrap>
              {headerCaption}
            </Typography>
          </Box>
        </Box>
        <Button variant="primary" sx={gradientPrimaryButtonSx} onClick={onAddShift}>
          Add user shift
        </Button>
      </Box>

      <MonthGridCalendar
        monthLabel={monthLabel}
        onPrevMonth={onPrevMonth}
        onNextMonth={onNextMonth}
        onToday={onToday}
        cells={cells}
        todayIso={todayIso}
        events={assignments.map((a) => ({
          id: a.id,
          label: a.shiftName,
          fromIso: a.effectiveFrom,
          toIso: a.effectiveTo,
          title: `${a.shiftName} (${a.effectiveFrom} → ${a.effectiveTo})`,
          effectiveWorkingDaysMask: a.effectiveWorkingDaysMask,
          shiftTimeZone: a.shiftTimeZone,
        }))}
        onPickDate={onPickDate}
      />
    </DashboardCard>
  );
}

