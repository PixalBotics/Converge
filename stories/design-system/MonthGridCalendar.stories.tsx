import { useState } from "react";
import dayjs from "dayjs";
import type { Meta, StoryObj } from "@storybook/react";
import Box from "@mui/material/Box";
import { MonthGridCalendar } from "@/components/common/MonthGridCalendar/MonthGridCalendar";
import type {
  MonthGridCalendarCell,
  MonthGridCalendarEvent,
} from "@/components/common/MonthGridCalendar/MonthGridCalendar.types";

function cellsForMonth(year: number, monthIndex: number): MonthGridCalendarCell[] {
  const first = dayjs(new Date(year, monthIndex, 1));
  const pad = first.day();
  const dim = first.daysInMonth();
  const cells: MonthGridCalendarCell[] = [];
  for (let i = 0; i < pad; i++) {
    const d = first.subtract(pad - i, "day");
    cells.push({ iso: d.format("YYYY-MM-DD"), day: d.date(), inMonth: false });
  }
  for (let day = 1; day <= dim; day++) {
    const d = dayjs(new Date(year, monthIndex, day));
    cells.push({ iso: d.format("YYYY-MM-DD"), day, inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const lastIso = cells[cells.length - 1]!.iso;
    const d = dayjs(lastIso).add(1, "day");
    cells.push({ iso: d.format("YYYY-MM-DD"), day: d.date(), inMonth: false });
  }
  return cells;
}

const meta = {
  title: "Design System/MonthGridCalendar",
  component: MonthGridCalendar,
} satisfies Meta<typeof MonthGridCalendar>;

export default meta;

type Story = StoryObj<typeof meta>;

function Playground() {
  const [cursor, setCursor] = useState(dayjs("2026-05-01"));
  const cells = cellsForMonth(cursor.year(), cursor.month());
  const events: MonthGridCalendarEvent[] = [
    {
      id: "e1",
      label: "On-call",
      fromIso: "2026-05-12",
      toIso: "2026-05-18",
    },
  ];
  return (
    <Box sx={{ maxWidth: 720 }}>
      <MonthGridCalendar
        monthLabel={cursor.format("MMMM YYYY")}
        onPrevMonth={() => setCursor((c) => c.subtract(1, "month"))}
        onNextMonth={() => setCursor((c) => c.add(1, "month"))}
        onToday={() => setCursor(dayjs())}
        cells={cells}
        todayIso={dayjs().format("YYYY-MM-DD")}
        events={events}
        onPickDate={() => {}}
      />
    </Box>
  );
}

export const Default: StoryObj<typeof meta> = {
  render: () => <Playground />,
};
