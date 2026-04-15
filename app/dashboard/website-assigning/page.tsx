"use client";

import { useMemo, useState } from "react";
import Assignment from "@mui/icons-material/Assignment";
import FilterList from "@mui/icons-material/FilterList";
import IosShare from "@mui/icons-material/IosShare";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import NextLink from "next/link";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { filterChromeButtonSx } from "@/components/common/FilterButton/filter-button.styles";
import { resolveSx } from "@/utils/resolveSx";
import {
  AssignWebsiteModal,
  Button,
  DashboardCard,
  DataTable,
  FilterButton,
  SearchBar,
  SelectField,
  TablePagination,
  Typography,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { SearchIcon } from "@/components/dashboard/icons/SearchIcon";
import {
  ASSIGNED_TOTAL,
  ASSIGNED_USERS,
  formatEntries,
  PAGE_COUNT,
  TOTAL_ENTRIES,
  type AssignedUserRow,
} from "./website-assignment-mock";
import {
  websiteAssignmentFilterCard,
  websiteAssignmentFilterGrid,
  websiteAssignmentFilterIconBox,
  websiteAssignmentFilterTitleRow,
  websiteAssignmentFooterRow,
  websiteAssignmentHeaderActions,
  websiteAssignmentPageHeader,
  websiteAssignmentPageWrapper,
  websiteAssignmentPaginationWrapper,
  websiteAssignmentSearchFieldWrapper,
  websiteAssignmentSearchRow,
  websiteAssignmentTableCard,
  websiteAssignmentTableIconBox,
  websiteAssignmentTableToolbar,
} from "./website-assigning.styles";

const WEBSITE_OPTIONS = [
  { label: "www.marketplace.io", value: "marketplace" },
  { label: "www.enterprise.app", value: "enterprise" },
  { label: "www.support.io", value: "support" },
];

export default function WebsiteAssigningPage() {
  const theme = useTheme() as AppTheme;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [websiteFilter, setWebsiteFilter] = useState("marketplace");
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ASSIGNED_USERS;
    return ASSIGNED_USERS.filter(
      (row) =>
        row.username.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q) ||
        row.department.toLowerCase().includes(q) ||
        String(row.chatCount).includes(q)
    );
  }, [search]);

  const columns = useMemo<DataTableColumn<AssignedUserRow>[]>(
    () => [
      { id: "username", label: "Username" },
      { id: "email", label: "Email", cellVariant: "muted" },
      { id: "department", label: "Department" },
      {
        id: "chatCount",
        label: "Chat Count",
        render: (value, row) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
            <Typography component="span" variant="body2" color="white" fontWeight={500}>
              {String(value ?? "—")}
            </Typography>
            <Typography
              component="span"
              variant="body2"
              sx={{
                color: theme.app.dashboard.accentGreen,
                fontWeight: 600,
                fontSize: "0.8125rem",
              }}
            >
              {row.chatDeltaPct}
            </Typography>
          </Box>
        ),
      },
    ],
    [theme]
  );

  return (
    <Box sx={websiteAssignmentPageWrapper}>
      <Box sx={websiteAssignmentPageHeader}>
        <Box>
          <Typography variant="regularLarge" color="white" sx={{ mb: 0.5 }}>
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

      <DashboardCard sx={websiteAssignmentFilterCard}>
        <Box sx={websiteAssignmentFilterTitleRow}>
          <Box sx={websiteAssignmentFilterIconBox}>
            <FilterList sx={{ fontSize: 20 }} />
          </Box>
          <Typography variant="mediumLarge" color="white" fontWeight={600}>
            Select Filter
          </Typography>
        </Box>
        <Box sx={websiteAssignmentFilterGrid}>
          <SelectField
            label="Website"
            value={websiteFilter}
            onChange={setWebsiteFilter}
            options={WEBSITE_OPTIONS}
          />
          <Box sx={{ display: "flex", justifyContent: { xs: "stretch", lg: "flex-end" } }}>
            <Button
              type="button"
              variant="outlined"
              sx={{
                ...resolveSx(filterChromeButtonSx, theme),
                width: { xs: "100%", lg: "auto" },
              }}
            >
              Apply Filter
            </Button>
          </Box>
        </Box>
      </DashboardCard>

      <DashboardCard sx={websiteAssignmentTableCard}>
        <Box sx={websiteAssignmentTableToolbar}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={websiteAssignmentTableIconBox}>
              <SearchIcon sx={{ fontSize: 20, color: theme.app.dashboard.iconMuted }} width={20} height={20} />
            </Box>
            <Typography variant="mediumLarge" color="white" fontWeight={600}>
              Assigned Users ({ASSIGNED_TOTAL})
            </Typography>
          </Box>
          <Box sx={websiteAssignmentSearchRow}>
            <Box sx={websiteAssignmentSearchFieldWrapper}>
              <SearchBar value={search} onChange={setSearch} placeholder="Search anything.." sx={{ minWidth: "100%" }} />
            </Box>
            <FilterButton sx={{ whiteSpace: "nowrap", alignSelf: { xs: "stretch", sm: "center" } }} />
          </Box>
        </Box>

        <DataTable<AssignedUserRow>
          columns={columns}
          rows={filteredRows}
          getRowId={(row) => row.id}
          minWidth={800}
          actionColumn={{
            label: "Action",
            render: (row) => (
              <Link
                component={NextLink}
                href={`/dashboard/website-assigning/${encodeURIComponent(row.id)}`}
                sx={{
                  color: theme.palette.primary.main,
                  textDecoration: "none",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                View Detail
              </Link>
            ),
          }}
        />

        <Box sx={websiteAssignmentFooterRow}>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
            Showing data 1 to {filteredRows.length} of {formatEntries(TOTAL_ENTRIES)} entries
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
