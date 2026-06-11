"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, DashboardCard, DataTable, Typography } from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import {
  fetchMonitorDirectoryAgents,
  fetchMonitorDirectoryDepartments,
  fetchMonitorDirectoryParentCompanies,
  fetchMonitorDirectoryPools,
  fetchMonitorDirectoryResellers,
} from "@/services/chat/monitor.api";
import type {
  MonitorCapabilities,
  MonitorDirectoryAgentRow,
  MonitorDirectoryDepartmentRow,
  MonitorDirectoryParentCompanyRow,
  MonitorDirectoryPoolRow,
  MonitorDirectoryResellerRow,
} from "@/services/chat/monitor.types";
import { chatMonitorKeys } from "../hooks/keys";

export type MonitorDirectorySelection = {
  resellerId: string;
  resellerName: string;
  parentCompanyId: string;
  parentCompanyName: string;
  departmentId: string;
  departmentName: string;
  poolId: string;
  poolName: string;
  agentUserId: string;
  agentDisplayName: string;
  agentEmail: string;
  agentUserType: string;
  websiteId: string;
  websiteName: string;
  assignmentRowKey: string;
};

interface MonitorDirectoryNavigatorProps {
  capabilities: MonitorCapabilities | undefined;
  apiEnabled: boolean;
  selection: MonitorDirectorySelection | null;
  onSelectAgent: (selection: MonitorDirectorySelection | null) => void;
}

const emptySel = {
  resellerId: "",
  resellerName: "",
  parentCompanyId: "",
  parentCompanyName: "",
  departmentId: "",
  departmentName: "",
  poolId: "",
  poolName: "",
  agentUserId: "",
  agentDisplayName: "",
  agentEmail: "",
  agentUserType: "",
  websiteId: "",
  websiteName: "",
  assignmentRowKey: "",
};

export function MonitorDirectoryNavigator({
  capabilities,
  apiEnabled,
  selection,
  onSelectAgent,
}: MonitorDirectoryNavigatorProps) {
  const theme = useTheme() as AppTheme;
  const mode = capabilities?.mode ?? "parent_company";
  const showResellers = capabilities?.showResellerDirectory ?? false;

  const [resellerId, setResellerId] = useState(selection?.resellerId ?? "");
  const [parentCompanyId, setParentCompanyId] = useState(selection?.parentCompanyId ?? "");
  const [departmentId, setDepartmentId] = useState(selection?.departmentId ?? "");
  const [poolId, setPoolId] = useState(selection?.poolId ?? "");

  const resellersQuery = useQuery({
    queryKey: chatMonitorKeys.directoryResellers(),
    queryFn: fetchMonitorDirectoryResellers,
    enabled: apiEnabled && showResellers,
  });

  const parentQuery = useQuery({
    queryKey: chatMonitorKeys.directoryParents(resellerId || undefined),
    queryFn: () => fetchMonitorDirectoryParentCompanies(resellerId || undefined),
    enabled: apiEnabled && (showResellers ? Boolean(resellerId) : mode !== "involvement"),
  });

  const deptQuery = useQuery({
    queryKey: chatMonitorKeys.directoryDepartments(parentCompanyId),
    queryFn: () => fetchMonitorDirectoryDepartments(parentCompanyId),
    enabled: apiEnabled && Boolean(parentCompanyId),
  });

  const poolQuery = useQuery({
    queryKey: chatMonitorKeys.directoryPools(departmentId),
    queryFn: () => fetchMonitorDirectoryPools(departmentId),
    enabled:
      apiEnabled &&
      Boolean(departmentId) &&
      (mode === "parent_company" || mode === "department"),
  });

  const agentsQuery = useQuery({
    queryKey: chatMonitorKeys.directoryAgents({
      parentCompanyId: parentCompanyId || undefined,
      departmentId: departmentId || undefined,
      poolId: poolId || undefined,
    }),
    queryFn: () =>
      fetchMonitorDirectoryAgents({
        parentCompanyId: parentCompanyId || undefined,
        departmentId: departmentId || undefined,
        poolId: poolId || undefined,
      }),
    enabled: apiEnabled && Boolean(parentCompanyId),
  });

  const resellerRows = resellersQuery.data ?? [];
  const parentRows = parentQuery.data ?? [];
  const deptRows = deptQuery.data ?? [];
  const poolRows = poolQuery.data ?? [];
  const agentData = agentsQuery.data ?? {
    roster: [],
    platformAssigned: [],
    clientAgents: [],
    involvement: [],
  };

  const showPoolStep =
    mode === "parent_company" || mode === "department" || mode === "pool";

  useEffect(() => {
    if (parentRows.length === 1 && !parentCompanyId) {
      setParentCompanyId(parentRows[0].id);
    }
  }, [parentRows, parentCompanyId]);

  useEffect(() => {
    if (deptRows.length === 1 && !departmentId && parentCompanyId) {
      setDepartmentId(deptRows[0].id);
    }
  }, [deptRows, departmentId, parentCompanyId]);

  const resetBelow = (level: "reseller" | "parent" | "dept" | "pool") => {
    onSelectAgent(null);
    if (level === "reseller") {
      setParentCompanyId("");
      setDepartmentId("");
      setPoolId("");
    } else if (level === "parent") {
      setDepartmentId("");
      setPoolId("");
    } else if (level === "dept") {
      setPoolId("");
    }
  };

  const pickAgent = (
    row: MonitorDirectoryAgentRow,
    ctx: { parentName: string; deptName: string; poolName: string },
  ) => {
    const next: MonitorDirectorySelection = {
      ...emptySel,
      resellerId,
      resellerName:
        resellerRows.find((r) => r.id === resellerId)?.name ??
        selection?.resellerName ??
        "",
      parentCompanyId,
      parentCompanyName: ctx.parentName,
      departmentId: row.departmentId ?? departmentId,
      departmentName: row.departmentName ?? ctx.deptName,
      poolId,
      poolName: ctx.poolName,
      agentUserId: row.userId,
      agentDisplayName: row.displayName,
      agentEmail: row.email,
      agentUserType: row.userType,
      websiteId: row.websiteId ?? "",
      websiteName: row.websiteName ?? "",
      assignmentRowKey: `${row.kind}:${row.userId}:${row.websiteId ?? ""}:${row.departmentId ?? ""}`,
    };
    onSelectAgent(next);
  };

  const parentName =
    parentRows.find((p) => p.id === parentCompanyId)?.name ??
    selection?.parentCompanyName ??
    "";
  const deptName =
    deptRows.find((d) => d.id === departmentId)?.name ?? selection?.departmentName ?? "";
  const poolName = poolRows.find((p) => p.id === poolId)?.name ?? selection?.poolName ?? "";

  const agentColumns = useMemo(
    () => buildAgentDirectoryColumns(theme),
    [theme],
  );

  return (
    <DashboardCard sx={{ p: { xs: 1.5, md: 2 }, height: "auto", minHeight: 0, flexShrink: 0 }}>
      <Typography fontWeight={700} sx={{ fontSize: 15, mb: 0.5 }}>
        Monitor directory
      </Typography>
      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 1.5 }}>
        Choose reseller, parent company, department, and agent to open their live chats below.
      </Typography>

      {selection?.agentUserId ? (
        <Box
          sx={{
            mb: 1.5,
            p: 1,
            borderRadius: 1,
            bgcolor: "action.hover",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Typography
            variant="body2"
            component="div"
            sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0.5 }}
          >
            <Box component="span">
              Monitoring: <strong>{selection.agentDisplayName}</strong>
              {selection.agentEmail ? ` · ${selection.agentEmail}` : null}
            </Box>
            {selection.agentUserType ? (
              <Chip
                label={selection.agentUserType}
                size="small"
                sx={{ height: 20, fontSize: 10 }}
              />
            ) : null}
            {selection.websiteName || selection.parentCompanyName ? (
              <Box component="span">
                {selection.websiteName ? ` · ${selection.websiteName}` : null}
                {selection.parentCompanyName ? ` · ${selection.parentCompanyName}` : null}
              </Box>
            ) : null}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary", width: "100%" }}>
            Click a row to load all live and closed chats assigned to this user in your scope.
          </Typography>
          <Button
            type="button"
            variant="outlined"
            size="small"
            onClick={() => onSelectAgent(null)}
          >
            Clear agent
          </Button>
        </Box>
      ) : null}

      {showResellers ? (
        <DirectoryTable<MonitorDirectoryResellerRow>
          title="Resellers"
          rows={resellerRows}
          loading={resellersQuery.isLoading}
          selectedRowId={resellerId}
          getRowId={(r) => r.id}
          columns={[
            { id: "name", label: "Reseller", render: (_, r) => r.name },
            { id: "live", label: "Live chats", render: (_, r) => String(r.liveCount) },
          ]}
          onSelect={(r) => {
            setResellerId(r.id);
            resetBelow("reseller");
          }}
        />
      ) : null}

      {(showResellers ? Boolean(resellerId) : true) ? (
        <DirectoryTable<MonitorDirectoryParentCompanyRow>
          title="Parent companies"
          rows={parentRows}
          loading={parentQuery.isLoading}
          selectedRowId={parentCompanyId}
          getRowId={(r) => r.id}
          columns={[
            { id: "name", label: "Parent company", render: (_, r) => r.name },
            { id: "live", label: "Live", render: (_, r) => String(r.liveCount) },
          ]}
          onSelect={(r) => {
            setParentCompanyId(r.id);
            resetBelow("parent");
          }}
        />
      ) : null}

      {Boolean(parentCompanyId) || mode === "department" || mode === "pool" ? (
        <DirectoryTable<MonitorDirectoryDepartmentRow>
          title="Departments"
          rows={deptRows}
          loading={deptQuery.isLoading}
          selectedRowId={departmentId}
          getRowId={(r) => r.id}
          columns={[
            {
              id: "name",
              label: "Department",
              render: (_, r) => (
                <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                  <span>{r.name}</span>
                  <Chip label={r.type} size="small" sx={{ height: 18, fontSize: 10 }} />
                </Box>
              ),
            },
          ]}
          onSelect={(r) => {
            setDepartmentId(r.id);
            resetBelow("dept");
          }}
        />
      ) : null}

      {showPoolStep && Boolean(departmentId) && poolRows.length > 0 ? (
        <DirectoryTable<MonitorDirectoryPoolRow>
          title="Pools"
          rows={poolRows}
          loading={poolQuery.isLoading}
          selectedRowId={poolId}
          getRowId={(r) => r.id}
          columns={[{ id: "name", label: "Pool", render: (_, r) => r.name }]}
          onSelect={(r) => {
            setPoolId(r.id);
            resetBelow("pool");
          }}
        />
      ) : null}

      {Boolean(parentCompanyId) ? (
        <>
          <DirectoryTable<MonitorDirectoryAgentRow>
            title="Platform internal (assigned on client websites)"
            rows={agentData.platformAssigned}
            loading={agentsQuery.isLoading}
            selectedRowId={selection?.assignmentRowKey ?? null}
            getRowId={(r) => `roster:${r.userId}:${r.websiteId}:${r.departmentId}`}
            columns={agentColumns}
            onSelect={(r) => pickAgent(r, { parentName, deptName, poolName })}
          />
          {Boolean(departmentId) ? (
            <>
              <DirectoryTable<MonitorDirectoryAgentRow>
                title="Client agents (external roster)"
                rows={agentData.clientAgents}
                loading={agentsQuery.isLoading}
                selectedRowId={selection?.assignmentRowKey ?? null}
                getRowId={(r) => `roster:${r.userId}:${r.websiteId}:${r.departmentId}`}
                columns={agentColumns}
                onSelect={(r) => pickAgent(r, { parentName, deptName, poolName })}
              />
              {agentData.involvement.length > 0 ? (
                <DirectoryTable<MonitorDirectoryAgentRow>
                  title="Involvement users (external, website + department)"
                  rows={agentData.involvement}
                  loading={agentsQuery.isLoading}
                  selectedRowId={selection?.assignmentRowKey ?? null}
                  getRowId={(r) =>
                    `involvement:${r.userId}:${r.websiteId ?? ""}:${r.departmentId ?? ""}`
                  }
                  columns={agentColumns}
                  onSelect={(r) => pickAgent(r, { parentName, deptName, poolName })}
                />
              ) : null}
            </>
          ) : null}
        </>
      ) : null}
    </DashboardCard>
  );
}

function userTypeChipColor(
  userType: string,
  theme: AppTheme,
): { bgcolor: string; color: string } {
  if (userType === "Internal") {
    return {
      bgcolor: `${theme.app.dashboard.accentBlue}22`,
      color: theme.app.dashboard.accentBlue,
    };
  }
  return {
    bgcolor: `${theme.app.dashboard.accentOrange}22`,
    color: theme.app.dashboard.accentOrange,
  };
}

function buildAgentDirectoryColumns(
  theme: AppTheme,
): DataTableColumn<MonitorDirectoryAgentRow>[] {
  return [
    {
      id: "name",
      label: "User",
      render: (_, row) => (
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{row.displayName}</Typography>
          <Typography sx={{ fontSize: 11, color: theme.app.dashboard.textMuted }}>
            {row.email}
          </Typography>
        </Box>
      ),
    },
    {
      id: "type",
      label: "Type",
      render: (_, row) => {
        const colors = userTypeChipColor(row.userType, theme);
        return (
          <Chip
            label={row.userType}
            size="small"
            sx={{ height: 20, fontSize: 10, bgcolor: colors.bgcolor, color: colors.color }}
          />
        );
      },
    },
    {
      id: "site",
      label: "Website",
      render: (_, row) => row.websiteName ?? "—",
    },
    {
      id: "dept",
      label: "Department",
      render: (_, row) => row.departmentName ?? "—",
    },
    {
      id: "live",
      label: "Live",
      render: (_, row) => String(row.liveCount),
    },
    {
      id: "wait",
      label: "Waiting",
      render: (_, row) => String(row.waitingCount),
    },
  ];
}

function DirectoryTable<T>({
  title,
  rows,
  loading,
  selectedRowId,
  getRowId,
  columns,
  onSelect,
}: {
  title: string;
  rows: T[];
  loading: boolean;
  selectedRowId?: string | number | null;
  getRowId: (row: T, index: number) => string | number;
  columns: DataTableColumn<T>[];
  onSelect: (row: T) => void;
}) {
  if (!rows.length && !loading) return null;
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 0.75, fontWeight: 600 }}>
        {title}
      </Typography>
      <DataTable
        columns={columns as DataTableColumn<Record<string, unknown>>[]}
        rows={rows as Record<string, unknown>[]}
        getRowId={(row, index) => getRowId(row as T, index)}
        selectedRowId={selectedRowId}
        isLoading={loading}
        onRowClick={(row) => onSelect(row as T)}
        emptyState={{ title: "None in scope", description: "" }}
      />
    </Box>
  );
}
