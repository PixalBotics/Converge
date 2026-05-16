import type { ReactNode } from "react";

export interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  iconBgColor: string;
  /** Value text color (e.g. card-specific accent). Default: theme primary (accent). */
  valueColor?: string;
  /** Subtitle color (e.g. error for alert). Default: theme `dashboard.white60`. */
  subtitleColor?: string;
  /** Show green trend arrow before subtitle. Default: true */
  showTrendArrow?: boolean;
}
