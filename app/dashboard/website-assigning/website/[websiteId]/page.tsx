"use client";

import { useMemo } from "react";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Language from "@mui/icons-material/Language";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import NextLink from "next/link";
import { useParams } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  DashboardCard,
  DataTable,
  Typography,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { useWebsiteAssignmentDetailQuery } from "@/lib/hooks";
import { publishAppToast } from "@/lib/notify";
import {
  nestedRecord,
  pickAssignmentsFromDetailPayload,
  pickString,
  pickWebsiteMetaFromDetail,
} from "../../website-assignment.payload";
import {
  websiteAssignmentHeaderActions,
  websiteAssignmentPageHeader,
  websiteAssignmentPageWrapper,
  websiteAssignmentRankPillSx,
  websiteAssignmentSectionIconSx,
  websiteAssignmentTableCard,
  websiteAssignmentUserDetailCard,
} from "../../website-assigning.styles";

type AssignmentRow = {
  id: string;
  tierLabel: string;
  tierPill: "Primary" | "Secondary" | "Backup";
  userName: string;
  websiteTitle: string;
  websiteUrl: string;
  email: string;
};

function tierToPillVariant(tier: string): "Primary" | "Secondary" | "Backup" {
  const s = tier.trim().toLowerCase();
  if (s === "primary" || s.includes("primary")) return "Primary";
  if (s === "secondary" || s.includes("secondary")) return "Secondary";
  if (s === "backup" || s.includes("backup")) return "Backup";
  return "Primary";
}

function summarizeAssignment(
  row: Record<string, unknown>,
  index: number,
  websiteTitle: string,
  websiteUrl: string,
): AssignmentRow {
  const tierLabel =
    pickString(row, ["assignmentType", "tier", "type", "rank", "role"]) || "—";
  const userObj =
    nestedRecord(row, ["user", "assignee", "agent", "assignedUser"]) ?? row;
  const first = pickString(userObj, ["firstName", "first_name"]);
  const last = pickString(userObj, ["lastName", "last_name"]);
  const combined = [first, last].filter(Boolean).join(" ").trim();
  const userName =
    combined ||
    pickString(userObj, ["name", "fullName", "username", "displayName"]) ||
    pickString(row, ["userName", "assigneeName", "agentName"]) ||
    "—";
  const email =
    pickString(userObj, ["email"]) || pickString(row, ["userEmail", "email"]) || "—";
  const id =
    pickString(row, ["id", "assignmentId", "userId"]) || `assignment-${index}`;
  return {
    id,
    tierLabel,
    tierPill: tierToPillVariant(tierLabel),
    userName,
    websiteTitle,
    websiteUrl,
    email,
  };
}

const siteOverviewGridSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, minmax(0, 1fr))",
    md: "repeat(3, minmax(0, 1fr))",
    lg: "repeat(5, minmax(0, 1fr))",
  },
  gap: { xs: 2, sm: 2.5 },
  alignItems: "start",
};

export default function WebsiteAssignmentDetailPage() {
  const theme = useTheme() as AppTheme;
  const params = useParams<{ websiteId: string }>();
  const websiteId = typeof params?.websiteId === "string" ? params.websiteId : "";

  const detailQuery = useWebsiteAssignmentDetailQuery(websiteId, {
    enabled: websiteId.trim().length > 0,
  });

  const meta = useMemo(
    () => pickWebsiteMetaFromDetail(detailQuery.data),
    [detailQuery.data],
  );

  const title = pickString(meta, ["name", "websiteName"]) || "Website";
  const url = pickString(meta, ["url", "websiteUrl"]);
  const reseller = pickString(meta, ["resellerName"]);
  const parentCompany = pickString(meta, ["parentCompanyName"]);
  const childCompany = pickString(meta, ["childCompanyName"]);
  const metaWebsiteId = pickString(meta, ["websiteId", "id"]) || websiteId || "—";

  const assignmentRows = useMemo(() => {
    const raw = pickAssignmentsFromDetailPayload(detailQuery.data);
    const wTitle = pickString(meta, ["name", "websiteName"]) || "—";
    const wUrl = pickString(meta, ["url", "websiteUrl"]);
    return raw.map((row, index) =>
      summarizeAssignment(row, index, wTitle, wUrl),
    );
  }, [detailQuery.data, meta]);

  const columns = useMemo<DataTableColumn<AssignmentRow>[]>(
    () => [
      {
        id: "userName",
        label: "User",
        render: (value) => (
          <Typography variant="body2" fontWeight={600} sx={{ color: theme.app.text.primary }}>
            {String(value ?? "—")}
          </Typography>
        ),
      },
      {
        id: "websiteTitle",
        label: "Website",
        render: (_, row) => (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.35, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} sx={{ color: theme.app.text.primary }}>
              {row.websiteTitle}
            </Typography>
            {row.websiteUrl ? (
              <Link
                href={row.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  fontSize: 12,
                  color: theme.app.dashboard.textMuted,
                  wordBreak: "break-all",
                }}
              >
                {row.websiteUrl}
              </Link>
            ) : (
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                —
              </Typography>
            )}
          </Box>
        ),
      },
      { id: "email", label: "Email", cellVariant: "muted" },
      {
        id: "tierLabel",
        label: "Rank",
        render: (_, row) => (
          <Typography
            component="span"
            variant="body2"
            sx={websiteAssignmentRankPillSx(theme, row.tierPill)}
          >
            {row.tierLabel}
          </Typography>
        ),
      },
    ],
    [theme],
  );

  const isLoading = detailQuery.isLoading || detailQuery.isFetching;
  const showError = detailQuery.isError;

  const sendMailForRow = (row: AssignmentRow) => {
    publishAppToast({
      variant: "info",
      message: `Email sending for ${row.userName} will be available once it’s enabled for this workspace.`,
    });
  };

  return (
    <Box sx={websiteAssignmentPageWrapper}>
      <Box sx={websiteAssignmentPageHeader}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} sx={{ color: theme.app.text.primary, mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 640 }}>
            Site overview and assigned agents for this website.
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
            All websites
          </Button>
        </Box>
      </Box>

      {showError ? (
        <DashboardCard sx={websiteAssignmentTableCard}>
          <Typography variant="medium" sx={{ color: theme.palette.error.main }}>
            Could not load website assignments. Check your connection or try again.
          </Typography>
        </DashboardCard>
      ) : null}

      <DashboardCard sx={websiteAssignmentUserDetailCard}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <Box sx={websiteAssignmentSectionIconSx} aria-hidden>
            <Language sx={{ fontSize: 22 }} />
          </Box>
          <Typography variant="mediumLarge" color="white" fontWeight={600}>
            Website details
          </Typography>
        </Box>
        <Box sx={siteOverviewGridSx}>
          <Box>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 0.5 }}>
              URL
            </Typography>
            {url ? (
              <Link href={url} target="_blank" rel="noopener noreferrer" sx={{ wordBreak: "break-all" }}>
                {url}
              </Link>
            ) : (
              <Typography variant="medium">—</Typography>
            )}
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 0.5 }}>
              Website ID
            </Typography>
            <Typography variant="medium" sx={{ wordBreak: "break-all" }}>
              {metaWebsiteId}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 0.5 }}>
              Reseller
            </Typography>
            <Typography variant="medium">{reseller || "—"}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 0.5 }}>
              Parent company
            </Typography>
            <Typography variant="medium">{parentCompany || "—"}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 0.5 }}>
              Child company
            </Typography>
            <Typography variant="medium">{childCompany || "—"}</Typography>
          </Box>
        </Box>
      </DashboardCard>

      <DashboardCard sx={websiteAssignmentTableCard}>
        <Typography variant="mediumLarge" color="white" fontWeight={600} sx={{ mb: 1.5 }}>
          Assigned users ({assignmentRows.length})
        </Typography>
        <DataTable<AssignmentRow>
          columns={columns}
          rows={assignmentRows}
          isLoading={isLoading}
          getRowId={(row) => row.id}
          minWidth={880}
          actionColumn={{
            label: "Send mail",
            render: (row) => (
              <Button
                type="button"
                variant="outlined"
                size="small"
                onClick={() => sendMailForRow(row)}
                sx={{ whiteSpace: "nowrap" }}
              >
                Send mail
              </Button>
            ),
          }}
        />
      </DashboardCard>
    </Box>
  );
}
