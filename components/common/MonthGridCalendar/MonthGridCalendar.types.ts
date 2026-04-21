import type { ReactNode } from "react";

export type MonthGridCalendarCell = {
  iso: string; // YYYY-MM-DD
  day: number;
  inMonth: boolean;
};

export type MonthGridCalendarEvent = {
  id: string;
  label: string;
  fromIso: string;
  toIso: string;
  /** Optional tooltip/title text. */
  title?: string;
};

export type MonthGridCalendarProps = {
  monthLabel: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  cells: MonthGridCalendarCell[];
  todayIso: string;
  events: MonthGridCalendarEvent[];
  onPickDate: (iso: string) => void;
  renderEmpty?: () => ReactNode;
};

