"use client";

import { Fragment, type ReactNode } from "react";
import {
  SUPERVISOR_DASHBOARD_BLOCK_ORDER,
  type SupervisorDashboardBlockKey,
} from "../config/dashboard-layout.config";

type SupervisorDashboardBlockLayoutProps = Record<SupervisorDashboardBlockKey, ReactNode>;

/** Renders supervisor overview blocks in `SUPERVISOR_DASHBOARD_BLOCK_ORDER`. */
export function SupervisorDashboardBlockLayout(props: SupervisorDashboardBlockLayoutProps) {
  return (
    <>
      {SUPERVISOR_DASHBOARD_BLOCK_ORDER.map((blockKey) => (
        <Fragment key={blockKey}>{props[blockKey]}</Fragment>
      ))}
    </>
  );
}
