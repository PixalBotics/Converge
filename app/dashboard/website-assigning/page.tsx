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
import { useWebsiteAssignmentsWebsitesQuery } from "@/lib/hooks/query";
import type { DataTableColumn } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { SearchIcon } from "@/components/dashboard/icons/SearchIcon";
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

type WebsiteRow = {
  id: string;
  reseller: string;
  parentCompany: string;
  childCompany: string;
  websiteName: string;
  websiteUrl: string;
  assignedCount: number;
};

export default function WebsiteAssigningPage() {
  const theme = useTheme() as AppTheme;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;
  const [websiteFilter, setWebsiteFilter] = useState("marketplace");
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  const { data: websitesResponse, isLoading: isWebsitesLoading } =
    useWebsiteAssignmentsWebsitesQuery({
      page,
      limit,
      search: search.trim() || undefined,
    });
  const websitesData = websitesResponse?.data;

  const filteredRows = useMemo(() => {
    const items = websitesData?.items ?? [];
    return items.map((item) => ({
      id: item.websiteId,
      reseller: item.resellerName || "-",
      parentCompany: item.parentCompanyName || "-",
      childCompany: item.childCompanyName || "-",
      websiteName: item.name || "-",
      websiteUrl: item.url || "-",
      assignedCount: item.assignedCount ?? 0,
    }));
  }, [websitesData?.items]);

  const pageCount = websitesData?.totalPages ?? 1;
  const totalEntries = websitesData?.total ?? 0;

  const columns = useMemo<DataTableColumn<WebsiteRow>[]>(
    () => [
      { id: "reseller", label: "Reseller" },
      { id: "parentCompany", label: "Parent Company" },
      { id: "childCompany", label: "Child Company" },
      { id: "websiteName", label: "Website Name" },
      { id: "websiteUrl", label: "Website URL", cellVariant: "muted" },
      { id: "assignedCount", label: "Assigned Count" },
    ],
    []
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
              Websites ({totalEntries})
            </Typography>
          </Box>
          <Box sx={websiteAssignmentSearchRow}>
            <Box sx={websiteAssignmentSearchFieldWrapper}>
              <SearchBar value={search} onChange={setSearch} placeholder="Search anything.." sx={{ minWidth: "100%" }} />
            </Box>
            <FilterButton sx={{ whiteSpace: "nowrap", alignSelf: { xs: "stretch", sm: "center" } }} />
          </Box>
        </Box>

        <DataTable<WebsiteRow>
          columns={columns}
          rows={filteredRows}
          getRowId={(row) => row.id}
          minWidth={1100}
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
            {isWebsitesLoading
              ? "Loading websites..."
              : `Showing data ${filteredRows.length > 0 ? (page - 1) * limit + 1 : 0} to ${
                  (page - 1) * limit + filteredRows.length
                } of ${totalEntries} entries`}
          </Typography>
          <Box sx={websiteAssignmentPaginationWrapper}>
            <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
          </Box>
        </Box>
      </DashboardCard>

      <AssignWebsiteModal open={isAssignOpen} onClose={() => setIsAssignOpen(false)} />
    </Box>
  );
}
