"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import IconButton from "@mui/material/IconButton";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { Login as LoginIcon, Edit as EditIcon } from "@mui/icons-material";
import NextLink from "next/link";
import { useParams } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  DashboardCard,
  DataTable,
  dataTableActionButton,
  Typography,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { useAuth } from "@/lib/auth/AuthContext";
import { useLoginAsMutation, useUserQuery, useWebsiteAssignmentsUserWebsitesQuery } from "@/lib/hooks";
import { extractUserRecordFromDetailPayload } from "@/app/dashboard/user-page/components/add-user-modal.utils";
import { pickItemsFromWebsitesPayload, pickString } from "@/app/dashboard/website-assigning/website-assignment.payload";
import { AddUserModal } from "@/app/dashboard/user-page/components/AddUserModal";
import { overviewPageWrapper } from "@/app/dashboard/user-page/overview.styles";

type AssignedWebsiteRow = {
  id: string;
  reseller: string;
  parentCompany: string;
  childCompany: string;
  websiteName: string;
  websiteUrl: string;
  tier: string;
};

function normalizeTier(raw: string): string {
  const s = raw.trim().toLowerCase();
  if (!s) return "—";
  if (s.includes("primary")) return "Primary";
  if (s.includes("secondary")) return "Secondary";
  if (s.includes("backup")) return "Backup";
  return raw.trim() || "—";
}

export default function UserDetailPage() {
  const theme = useTheme() as AppTheme;
  const params = useParams<{ userId: string }>();
  const userId = typeof params?.userId === "string" ? params.userId : "";

  const { hasOperational } = useAuth();
  const canUseLoginAs = hasOperational("user:login-as");

  const [isEditOpen, setIsEditOpen] = useState(false);

  const userQuery = useUserQuery(userId, { enabled: userId.trim().length > 0 });
  const userRecord = useMemo(() => extractUserRecordFromDetailPayload(userQuery.data), [userQuery.data]);

  const licenseKey = String(userRecord?.licenseKey ?? userRecord?.tenantLicenseKey ?? "").trim();

  const assignedWebsitesQuery = useWebsiteAssignmentsUserWebsitesQuery(
    userId,
    { page: 1, limit: 200 },
    { enabled: userId.trim().length > 0 },
  );

  const rawItems = useMemo(
    () => pickItemsFromWebsitesPayload(assignedWebsitesQuery.data),
    [assignedWebsitesQuery.data],
  );

  const rows = useMemo<AssignedWebsiteRow[]>(() => {
    return rawItems.map((item, index) => ({
      id: pickString(item, ["websiteId", "id"]) || `assigned-${index}`,
      reseller: pickString(item, ["resellerName"]) || "—",
      parentCompany: pickString(item, ["parentCompanyName"]) || "—",
      childCompany: pickString(item, ["childCompanyName"]) || "—",
      websiteName: pickString(item, ["name", "websiteName"]) || "—",
      websiteUrl: pickString(item, ["url", "websiteUrl"]) || "—",
      tier: normalizeTier(
        pickString(item, ["assignmentType", "tier", "type", "rank", "assignment"]) || "",
      ),
    }));
  }, [rawItems]);

  const columns = useMemo<DataTableColumn<AssignedWebsiteRow>[]>(
    () => [
      { id: "tier", label: "Tier" },
      { id: "reseller", label: "Reseller" },
      { id: "parentCompany", label: "Parent company" },
      { id: "childCompany", label: "Child company" },
      { id: "websiteName", label: "Website" },
      { id: "websiteUrl", label: "URL", cellVariant: "muted" },
    ],
    [],
  );

  const loginAsMutation = useLoginAsMutation();
  const canLoginAs = canUseLoginAs && !!userId && !!licenseKey;
  const isLoginAsPending =
    loginAsMutation.isPending && loginAsMutation.variables?.targetUserId === userId;

  return (
    <Box sx={overviewPageWrapper}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap", mb: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Button
            type="button"
            variant="secondary"
            component={NextLink}
            href="/dashboard/user-page"
            startIcon={<ArrowBack sx={{ fontSize: 18 }} />}
            sx={{ alignSelf: "flex-start", minWidth: 0 }}
          >
            Back to users
          </Button>
          <Typography variant="regularLarge" fontWeight={700} color="white">
            User detail
          </Typography>
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 720 }}>
            View profile details and assigned websites.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            size="small"
            aria-label="Login As"
            disabled={!canLoginAs || isLoginAsPending}
            onClick={() => {
              if (!canLoginAs) return;
              loginAsMutation.mutate(
                { targetUserId: userId, licenseKey },
                { onSuccess: () => window.location.assign("/dashboard") },
              );
            }}
            sx={{
              ...dataTableActionButton,
              color: theme.app.dashboard.accentBlue,
              opacity: !canLoginAs ? 0.4 : isLoginAsPending ? 0.7 : 1,
            }}
          >
            <LoginIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            aria-label="Edit user"
            disabled={!userId}
            onClick={() => setIsEditOpen(true)}
            sx={{ ...dataTableActionButton, color: theme.app.dashboard.white80 }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <DashboardCard sx={{ p: { xs: 1.5, sm: 2, md: 2.5 }, mb: 2 }}>
        <Typography variant="mediumLarge" color="white" fontWeight={600} sx={{ mb: 1 }}>
          Profile
        </Typography>
        {userQuery.isLoading ? (
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
            Loading user…
          </Typography>
        ) : userRecord ? (
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 1.5 }}>
            <Typography variant="body2" sx={{ color: theme.app.text.primary }}>
              <Box component="span" sx={{ color: theme.app.dashboard.textMuted, mr: 1 }}>Name</Box>
              {`${String(userRecord.firstName ?? userRecord.first_name ?? "").trim()} ${String(userRecord.lastName ?? userRecord.last_name ?? "").trim()}`.trim() || "—"}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.app.text.primary }}>
              <Box component="span" sx={{ color: theme.app.dashboard.textMuted, mr: 1 }}>Email</Box>
              {String(userRecord.email ?? "").trim() || "—"}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.app.text.primary }}>
              <Box component="span" sx={{ color: theme.app.dashboard.textMuted, mr: 1 }}>Type</Box>
              {String(userRecord.userType ?? userRecord.type ?? "").trim() || "—"}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.app.text.primary }}>
              <Box component="span" sx={{ color: theme.app.dashboard.textMuted, mr: 1 }}>License key</Box>
              {licenseKey || "—"}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" sx={{ color: theme.palette.error.light }}>
            Could not load this user.
          </Typography>
        )}
      </DashboardCard>

      <DashboardCard sx={{ p: { xs: 1.5, sm: 2, md: 2.5 } }}>
        <Typography variant="mediumLarge" color="white" fontWeight={600} sx={{ mb: 1.5 }}>
          Assigned websites ({rows.length})
        </Typography>
        <DataTable<AssignedWebsiteRow>
          columns={columns}
          rows={rows}
          isLoading={assignedWebsitesQuery.isLoading || assignedWebsitesQuery.isFetching}
          getRowId={(row) => row.id}
          minWidth={1100}
          actionColumn={{
            label: "Action",
            render: (row) => (
              <Link
                component={NextLink}
                href={`/dashboard/website-assigning/website/${encodeURIComponent(row.id)}`}
                sx={{
                  color: theme.palette.primary.main,
                  textDecoration: "none",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Website detail
              </Link>
            ),
          }}
        />
      </DashboardCard>

      <AddUserModal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        theme={theme}
        editUserId={userId}
        onSaved={() => {
          void userQuery.refetch();
        }}
      />
    </Box>
  );
}

