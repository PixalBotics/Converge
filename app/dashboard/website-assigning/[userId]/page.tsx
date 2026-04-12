"use client";

import { useMemo, useState } from "react";
import Assignment from "@mui/icons-material/Assignment";
import IosShare from "@mui/icons-material/IosShare";
import Box from "@mui/material/Box";
import { alpha } from "@mui/material/styles";
import { useParams } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { filterChromeButtonSx } from "@/components/common/FilterButton/filter-button.styles";
import {
  AssignWebsiteModal,
  Button,
  DashboardCard,
  DataTable,
  FilterButton,
  InputField,
  SearchBar,
  TablePagination,
  Typography,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { SearchIcon } from "@/components/dashboard/icons/SearchIcon";
import {
  ASSIGNED_WEBSITE_ROWS,
  ASSIGNED_WEBSITES_ENTRIES,
  ASSIGNED_WEBSITES_TOTAL,
  formatEntries,
  getAssignedUserDetail,
  PAGE_COUNT,
  type AssignedWebsiteRow,
} from "../website-assignment-mock";
import {
  websiteAssignmentFooterRow,
  websiteAssignmentHeaderActions,
  websiteAssignmentPageHeader,
  websiteAssignmentPageWrapper,
  websiteAssignmentPaginationWrapper,
  websiteAssignmentRankPillSx,
  websiteAssignmentSearchFieldWrapper,
  websiteAssignmentSearchRow,
  websiteAssignmentSectionIconSx,
  websiteAssignmentTableCard,
  websiteAssignmentTableIconBox,
  websiteAssignmentTableToolbar,
  websiteAssignmentUserDetailCard,
  websiteAssignmentUserDetailGrid,
} from "../website-assigning.styles";

export default function WebsiteAssignmentUserDetailPage() {
  const theme = useTheme() as AppTheme;
  const params = useParams<{ userId: string }>();
  const userId = typeof params?.userId === "string" ? params.userId : "";

  const user = useMemo(() => getAssignedUserDetail(userId), [userId]);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  const readOnlyInputSx = useMemo(
    () => ({
      "& .MuiOutlinedInput-root": {
        backgroundColor: alpha(theme.app.dashboard.pillBg, 0.45),
        "& fieldset": {
          borderColor: theme.app.dashboard.cardBorder,
        },
        "&:hover fieldset": {
          borderColor: theme.app.dashboard.cardBorder,
        },
        "&.Mui-focused fieldset": {
          borderWidth: "1px",
          borderColor: theme.app.border.input,
          boxShadow: "none",
        },
      },
      "& input": {
        color: theme.app.dashboard.textMuted,
        WebkitTextFillColor: theme.app.dashboard.textMuted,
      },
    }),
    [theme]
  );

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ASSIGNED_WEBSITE_ROWS;
    return ASSIGNED_WEBSITE_ROWS.filter(
      (row) =>
        row.company.toLowerCase().includes(q) ||
        row.website.toLowerCase().includes(q) ||
        row.rank.toLowerCase().includes(q)
    );
  }, [search]);

  const columns = useMemo<DataTableColumn<AssignedWebsiteRow>[]>(
    () => [
      { id: "company", label: "Company" },
      { id: "website", label: "Website", cellVariant: "muted" },
      {
        id: "rank",
        label: "Rank",
        render: (value) => (
          <Typography
            component="span"
            variant="body2"
            sx={websiteAssignmentRankPillSx(theme, value as AssignedWebsiteRow["rank"])}
          >
            {String(value ?? "—")}
          </Typography>
        ),
      },
    ],
    [theme]
  );

  return (
    <Box sx={websiteAssignmentPageWrapper}>
      <Box sx={websiteAssignmentPageHeader}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} color="white" sx={{ mb: 0.5 }}>
            Website Assignment
          </Typography>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 520 }}>
            Manage user assignments across different websites
          </Typography>
        </Box>
        <Box sx={websiteAssignmentHeaderActions}>
          <Button type="button" variant="outlined" startIcon={<IosShare sx={{ fontSize: 18 }} />} sx={filterChromeButtonSx}>
            Export Data
          </Button>
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            startIcon={<Assignment sx={{ fontSize: 18 }} />}
            onClick={() => setIsAssignOpen(true)}
          >
            Assign Website
          </Button>
        </Box>
      </Box>

      <DashboardCard sx={websiteAssignmentUserDetailCard}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={websiteAssignmentSectionIconSx} aria-hidden>
            $
          </Box>
          <Typography variant="mediumLarge" color="white" fontWeight={600}>
            User Detail View
          </Typography>
        </Box>
        <Box sx={websiteAssignmentUserDetailGrid}>
          <InputField
            label="Username"
            value={user.username}
            readOnly
            placeholder=""
            inputProps={{ readOnly: true, maxLength: 80 }}
            sx={readOnlyInputSx}
          />
          <InputField
            label="Email"
            value={user.email}
            readOnly
            placeholder=""
            type="email"
            inputProps={{ readOnly: true, maxLength: 120 }}
            sx={readOnlyInputSx}
          />
          <InputField
            label="Department"
            value={user.department}
            readOnly
            placeholder=""
            inputProps={{ readOnly: true, maxLength: 80 }}
            sx={readOnlyInputSx}
          />
        </Box>
      </DashboardCard>

      <DashboardCard sx={websiteAssignmentTableCard}>
        <Box sx={websiteAssignmentTableToolbar}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={websiteAssignmentTableIconBox}>
              <SearchIcon sx={{ fontSize: 20, color: theme.app.dashboard.iconMuted }} width={20} height={20} />
            </Box>
            <Typography variant="mediumLarge" color="white" fontWeight={600}>
              Assigned Websites({ASSIGNED_WEBSITES_TOTAL})
            </Typography>
          </Box>
          <Box sx={websiteAssignmentSearchRow}>
            <Box sx={websiteAssignmentSearchFieldWrapper}>
              <SearchBar value={search} onChange={setSearch} placeholder="Search anything.." sx={{ minWidth: "100%" }} />
            </Box>
            <FilterButton sx={{ whiteSpace: "nowrap", alignSelf: { xs: "stretch", sm: "center" } }} />
          </Box>
        </Box>

        <DataTable<AssignedWebsiteRow> columns={columns} rows={filteredRows} getRowId={(row) => row.id} minWidth={720} />

        <Box sx={websiteAssignmentFooterRow}>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
            Showing data 1 to {filteredRows.length} of {formatEntries(ASSIGNED_WEBSITES_ENTRIES)} entries
          </Typography>
          <Box sx={websiteAssignmentPaginationWrapper}>
            <TablePagination page={page} pageCount={PAGE_COUNT} onPageChange={setPage} />
          </Box>
        </Box>
      </DashboardCard>

      <AssignWebsiteModal open={isAssignOpen} onClose={() => setIsAssignOpen(false)} />
    </Box>
  );
}
