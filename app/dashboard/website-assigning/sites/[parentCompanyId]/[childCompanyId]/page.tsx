"use client";

import { useEffect, useMemo, useState } from "react";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import NextLink from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { SxProps, Theme } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  DashboardCard,
  DataTable,
  FormModal,
  Typography,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import type { WebsiteAssignmentScopeItem } from "@/api/types/website-assignments.types";
import { WebsiteAssignmentTableActions } from "@/features/website-assignments/components/WebsiteAssignmentTableActions";
import { clearAllDepartmentRosters } from "@/features/website-assignments/utils/clear-website-roster";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import { useWebsiteAssignmentGates } from "@/lib/permissions/use-website-assignment-gates";
import { useWebsiteAssignmentsWebsitesQuery } from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { websiteAssignmentsKeys } from "@/lib/hooks/query/website-assignments/keys";
import {
  websiteAssignmentFooterRow,
  websiteAssignmentHeaderActions,
  websiteAssignmentPageHeader,
  websiteAssignmentPageWrapper,
  websiteAssignmentTableCard,
} from "../../../website-assigning.styles";

const NONE = "none";
const NO_CHILD = "__none__";
const PAGE_LIMIT = 50;

type SiteRow = {
  id: string;
  websiteName: string;
  websiteUrl: string;
  filledSlots: number;
  uniqueMemberCount: number;
  expectedRosterSlots: number;
  serviceSchedulingConfigured: boolean;
  isFullyAssigned: boolean;
  parentCompanyId: string;
  childCompanyId: string;
  resellerId: string;
};

function itemToRow(item: WebsiteAssignmentScopeItem): SiteRow {
  return {
    id: item.websiteId,
    websiteName: item.name || "—",
    websiteUrl: item.url || "—",
    filledSlots: item.filledSlots ?? item.assignedCount ?? 0,
    uniqueMemberCount: item.uniqueMemberCount ?? 0,
    expectedRosterSlots: item.expectedRosterSlots ?? 0,
    serviceSchedulingConfigured: Boolean(item.serviceSchedulingConfigured),
    isFullyAssigned: Boolean(item.isFullyAssigned),
    parentCompanyId: item.parentCompanyId,
    childCompanyId: item.childCompanyId,
    resellerId: item.resellerId ?? "",
  };
}

export default function WebsiteSitesByOrgPage() {
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const queryClient = useQueryClient();
  const assignmentGates = useWebsiteAssignmentGates();
  const [page, setPage] = useState(1);
  const [clearTarget, setClearTarget] = useState<SiteRow | null>(null);
  const [clearing, setClearing] = useState(false);
  const params = useParams<{ parentCompanyId: string; childCompanyId: string }>();
  const parentRaw = typeof params?.parentCompanyId === "string" ? params.parentCompanyId : "";
  const childRaw = typeof params?.childCompanyId === "string" ? params.childCompanyId : "";

  const parentCompanyId = parentRaw && parentRaw !== NONE ? decodeURIComponent(parentRaw) : "";
  const childCompanyId =
    childRaw && childRaw !== NO_CHILD && childRaw !== NONE ? decodeURIComponent(childRaw) : "";

  const queryEnabled = parentCompanyId.length > 0 || childCompanyId.length > 0;

  useEffect(() => {
    setPage(1);
  }, [parentCompanyId, childCompanyId]);

  const { data, isLoading, isFetching } = useWebsiteAssignmentsWebsitesQuery(
    {
      page,
      limit: PAGE_LIMIT,
      ...(parentCompanyId ? { parentCompanyId } : {}),
      ...(childCompanyId ? { childCompanyId } : {}),
    },
    { enabled: queryEnabled },
  );

  const payload = data?.data;
  const itemsRaw = payload?.items;
  const items = useMemo(() => (Array.isArray(itemsRaw) ? itemsRaw : []), [itemsRaw]);
  const total = payload?.total ?? items.length;
  const totalPages = Math.max(1, payload?.totalPages ?? 1);
  const rangeStart = items.length === 0 ? 0 : (page - 1) * PAGE_LIMIT + 1;
  const rangeEnd = items.length === 0 ? 0 : (page - 1) * PAGE_LIMIT + items.length;

  const headerTitles = useMemo(() => {
    const first = items[0];
    return {
      parent: first?.parentCompanyName?.trim() || (parentCompanyId ? parentCompanyId : "—"),
      child: first?.childCompanyName?.trim() || (childCompanyId ? childCompanyId : "—"),
      reseller: first?.resellerName?.trim() || "—",
    };
  }, [items, parentCompanyId, childCompanyId]);

  const rows = useMemo(() => items.map(itemToRow), [items]);

  const openRosterEdit = (row: SiteRow) => {
    router.push(`/dashboard/website-assigning/website/${encodeURIComponent(row.id)}`);
  };

  const handleClearAgents = async () => {
    if (!clearTarget || !assignmentGates.assign) return;
    setClearing(true);
    try {
      await clearAllDepartmentRosters(clearTarget.id);
      void queryClient.invalidateQueries({ queryKey: websiteAssignmentsKeys.all });
      publishAppToast({ message: "All agent slots cleared.", variant: "success" });
      setClearTarget(null);
    } catch (e) {
      publishAppToast({
        message: extractApiErrorMessageForToast(e, "Could not clear assignments"),
        variant: "error",
      });
    } finally {
      setClearing(false);
    }
  };

  const columns = useMemo<DataTableColumn<SiteRow>[]>(
    () => [
      {
        id: "websiteName",
        label: "Website",
        render: (_, row) => (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.35, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} sx={{ color: theme.app.text.primary }}>
              {row.websiteName}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: theme.app.dashboard.textMuted, wordBreak: "break-all", lineHeight: 1.45 }}
            >
              {row.websiteUrl}
            </Typography>
          </Box>
        ),
      },
      {
        id: "status",
        label: "Status",
        render: (_, row) => {
          if (!row.serviceSchedulingConfigured) {
            return (
              <Chip
                label="Please add schedule"
                size="small"
                sx={{
                  height: 24,
                  fontSize: 11,
                  fontWeight: 600,
                  bgcolor: `${theme.palette.warning.main}22`,
                  color: theme.palette.warning.light,
                }}
              />
            );
          }
          if (row.isFullyAssigned) {
            return <Chip label="Roster complete" size="small" color="success" sx={{ height: 24, fontSize: 11, fontWeight: 600 }} />;
          }
          return <Chip label="Assign agents" size="small" sx={{ height: 24, fontSize: 11, fontWeight: 600 }} />;
        },
      },
      {
        id: "roster",
        label: "Roster",
        render: (_, row) => (
          <Typography variant="body2" fontWeight={600}>
            {row.expectedRosterSlots > 0
              ? `${row.filledSlots} / ${row.expectedRosterSlots}`
              : row.filledSlots}
          </Typography>
        ),
      },
      {
        id: "members",
        label: "Team",
        render: (_, row) => (
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
            {row.uniqueMemberCount} member{row.uniqueMemberCount === 1 ? "" : "s"}
          </Typography>
        ),
      },
    ],
    [theme],
  );

  if (!queryEnabled) {
    router.replace("/dashboard/website-assigning");
    return null;
  }

  return (
    <Box sx={websiteAssignmentPageWrapper}>
      <Box sx={websiteAssignmentPageHeader}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} sx={{ color: theme.app.text.primary, mb: 0.5 }}>
            Websites for this organization
          </Typography>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 720 }}>
            Client: {headerTitles.reseller} · Parent: {headerTitles.parent} · Child: {headerTitles.child}
          </Typography>
        </Box>
        <Box sx={websiteAssignmentHeaderActions}>
          <Button
            type="button"
            variant="outlined"
            component={NextLink}
            href="/dashboard/website-assigning"
            startIcon={<ArrowBack sx={{ fontSize: 18 }} />}
          >
            Back to assignment
          </Button>
        </Box>
      </Box>

      <DashboardCard sx={websiteAssignmentTableCard}>
        <Typography variant="mediumLarge" color="white" fontWeight={600} sx={{ mb: 1.5 }}>
          All websites ({total})
        </Typography>
        <DataTable<SiteRow>
          columns={columns}
          rows={rows}
          isLoading={isLoading || isFetching}
          getRowId={(row) => row.id}
          minWidth={640}
          actionColumn={{
            label: "Actions",
            render: (row) => (
              <WebsiteAssignmentTableActions
                row={{ websiteId: row.id, websiteName: row.websiteName }}
                canAssign={assignmentGates.assign}
                onSchedule={(r) =>
                  router.push(
                    `/dashboard/website-assigning/website/${encodeURIComponent(r.websiteId)}/service-scheduling`,
                  )
                }
                onEdit={() => openRosterEdit(row)}
                onClearAgents={() => setClearTarget(row)}
              />
            ),
          }}
        />
        <Box sx={[websiteAssignmentFooterRow, { flexWrap: "wrap", alignItems: "center" }] as SxProps<Theme>}>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
            {isLoading || isFetching
              ? "Loading…"
              : total === 0
                ? "No websites."
                : `Row ${rangeStart}–${rangeEnd} of ${total} · Page ${page} of ${totalPages}.`}
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button type="button" variant="outlined" size="small" disabled={page <= 1 || isLoading} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Previous
            </Button>
            <Button
              type="button"
              variant="outlined"
              size="small"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </Box>
        </Box>
      </DashboardCard>

      <FormModal
        open={Boolean(clearTarget)}
        title="Clear all agent slots?"
        description={
          clearTarget
            ? `Remove all roster assignments for ${clearTarget.websiteName}. Service scheduling stays unchanged.`
            : undefined
        }
        onClose={() => !clearing && setClearTarget(null)}
        onSave={() => void handleClearAgents()}
        primaryButtonLabel={clearing ? "Clearing…" : "Clear all agents"}
        primaryButtonVariant="danger"
        primaryButtonDisabled={clearing}
        cancelButtonLabel="Cancel"
        maxWidth={480}
      />
    </Box>
  );
}
