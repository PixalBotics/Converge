"use client";

import { useEffect, useMemo, useState } from "react";
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
import { useCompaniesByResellerQuery, useCompaniesSetupResellersQuery, useWebsiteAssignmentsWebsitesQuery } from "@/lib/hooks";
import type { DataTableColumn } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { SearchIcon } from "@/components/dashboard/icons/SearchIcon";
import {
  extractParentCompaniesFromByResellerTree,
  pickItemsArray,
  toIdNameOption,
} from "@/app/dashboard/user-page/components/add-user-modal.utils";
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

const DEFAULT_PAGE_LIMIT = 20;

const ASSIGNED_FILTER_OPTIONS = [
  { value: "", label: "All" },
  { value: "assigned", label: "Assigned" },
  { value: "unassigned", label: "Unassigned" },
] as const;

type WebsiteRow = {
  id: string;
  reseller: string;
  parentCompany: string;
  childCompany: string;
  websiteName: string;
  websiteUrl: string;
  assignedCount: number;
  isFullyAssigned: boolean;
};

function buildChildCompanyOptionsFromCompaniesTree(payload: unknown, parentCompanyId: string) {
  const pid = parentCompanyId.trim();
  if (!pid) return [{ value: "", label: "All child companies" }];
  const items = pickItemsArray(payload);
  const byId = new Map<string, { value: string; label: string }>();
  for (const raw of items) {
    const item = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : null;
    const parents = Array.isArray(item?.parentCompanies) ? (item?.parentCompanies as unknown[]) : [];
    for (const pRaw of parents) {
      const p = typeof pRaw === "object" && pRaw !== null ? (pRaw as Record<string, unknown>) : null;
      const pId = String(p?.id ?? "").trim();
      if (!pId || pId !== pid) continue;
      const children = Array.isArray(p?.childCompanies) ? (p?.childCompanies as unknown[]) : [];
      for (const cRaw of children) {
        const c = typeof cRaw === "object" && cRaw !== null ? (cRaw as Record<string, unknown>) : null;
        const id = String(c?.id ?? "").trim();
        if (!id) continue;
        const label = String(c?.name ?? "").trim() || id;
        byId.set(id, { value: id, label });
      }
    }
  }
  const list = Array.from(byId.values()).sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
  return [{ value: "", label: "All child companies" }, ...(list.length ? list : [])];
}

export default function WebsiteAssigningPage() {
  const theme = useTheme() as AppTheme;
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filterAssigned, setFilterAssigned] = useState<string>("");
  const [filterResellerId, setFilterResellerId] = useState("");
  const [filterParentCompanyId, setFilterParentCompanyId] = useState("");
  const [filterChildCompanyId, setFilterChildCompanyId] = useState("");
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  const resellersQuery = useCompaniesSetupResellersQuery({ enabled: true });
  const companiesByResellerQuery = useCompaniesByResellerQuery(
    filterResellerId,
    { view: "tree", sortBy: "name", sortOrder: "asc", all: true },
    { enabled: filterResellerId.trim().length > 0 },
  );

  const resellerOptions = useMemo(() => {
    return pickItemsArray(resellersQuery.data)
      .map((row) => toIdNameOption(row))
      .filter((o): o is { value: string; label: string } => o !== null);
  }, [resellersQuery.data]);

  const resellerFilterOptions = useMemo(() => {
    const all = { value: "", label: "All resellers" };
    if (resellerOptions.length > 0) return [all, ...resellerOptions];
    return [{ value: "", label: resellersQuery.isLoading ? "Loading resellers…" : "No resellers available" }];
  }, [resellerOptions, resellersQuery.isLoading]);

  const parentCompanyFilterOptions = useMemo(() => {
    if (!filterResellerId.trim()) return [{ value: "", label: "All parent companies" }];
    const extracted = extractParentCompaniesFromByResellerTree(companiesByResellerQuery.data).map((o) => ({
      value: o.value,
      label: o.label,
    }));
    if (extracted.length > 0) return [{ value: "", label: "All parent companies" }, ...extracted];
    return [
      { value: "", label: companiesByResellerQuery.isLoading ? "Loading parent companies…" : "No parent companies available" },
    ];
  }, [filterResellerId, companiesByResellerQuery.data, companiesByResellerQuery.isLoading]);

  const childCompanyFilterOptions = useMemo(() => {
    if (!filterResellerId.trim()) return [{ value: "", label: "All child companies" }];
    if (!filterParentCompanyId.trim()) return [{ value: "", label: "All child companies" }];
    const options = buildChildCompanyOptionsFromCompaniesTree(companiesByResellerQuery.data, filterParentCompanyId);
    if (options.length > 1) return options;
    return [{ value: "", label: companiesByResellerQuery.isLoading ? "Loading child companies…" : "No child companies available" }];
  }, [filterResellerId, filterParentCompanyId, companiesByResellerQuery.data, companiesByResellerQuery.isLoading]);

  const assignedParam = useMemo(() => {
    if (filterAssigned === "assigned") return true;
    if (filterAssigned === "unassigned") return false;
    return undefined;
  }, [filterAssigned]);

  const listParams = useMemo(() => {
    const params: Record<string, string | number | boolean> = {
      page,
      limit: DEFAULT_PAGE_LIMIT,
    };
    const q = search.trim();
    if (q) params.search = q;
    if (assignedParam !== undefined) params.assigned = assignedParam;
    if (filterResellerId.trim()) params.resellerId = filterResellerId.trim();
    if (filterParentCompanyId.trim()) params.parentCompanyId = filterParentCompanyId.trim();
    if (filterChildCompanyId.trim()) params.childCompanyId = filterChildCompanyId.trim();
    return params;
  }, [page, search, assignedParam, filterResellerId, filterParentCompanyId, filterChildCompanyId]);

  const { data: websitesResponse, isLoading: isWebsitesLoading, isFetching } =
    useWebsiteAssignmentsWebsitesQuery(listParams, { enabled: true });
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
      isFullyAssigned: Boolean(item.isFullyAssigned),
    }));
  }, [websitesData?.items]);

  const pageCount = websitesData?.totalPages ?? 1;
  const totalEntries = websitesData?.total ?? 0;
  const limit = websitesData?.limit ?? DEFAULT_PAGE_LIMIT;
  const isLoading = isWebsitesLoading || isFetching;

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

  useEffect(() => {
    // Clear applied search when SearchBar cross is used.
    if (searchInput.trim().length > 0) return;
    if (!search.trim()) return;
    setSearch("");
    setPage(1);
  }, [searchInput, search]);

  useEffect(() => {
    setPage(1);
  }, [filterAssigned, filterResellerId, filterParentCompanyId, filterChildCompanyId, search]);

  useEffect(() => {
    // Reset dependent filters
    setFilterParentCompanyId("");
    setFilterChildCompanyId("");
  }, [filterResellerId]);

  useEffect(() => {
    setFilterChildCompanyId("");
  }, [filterParentCompanyId]);

  return (
    <Box sx={websiteAssignmentPageWrapper}>
      <Box sx={websiteAssignmentPageHeader}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} sx={{ color: theme.app.text.primary, mb: 0.5 }}>
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
            label="Assigned"
            value={filterAssigned}
            onChange={setFilterAssigned}
            options={[...ASSIGNED_FILTER_OPTIONS]}
          />
          <SelectField
            label="Reseller"
            value={filterResellerId}
            onChange={setFilterResellerId}
            options={resellerFilterOptions}
            menuMaxRows={6}
          />
          <SelectField
            label="Parent Company"
            value={filterParentCompanyId}
            onChange={setFilterParentCompanyId}
            options={parentCompanyFilterOptions}
            menuMaxRows={7}
            disabled={!filterResellerId.trim()}
          />
          <SelectField
            label="Child Company"
            value={filterChildCompanyId}
            onChange={setFilterChildCompanyId}
            options={childCompanyFilterOptions}
            menuMaxRows={7}
            disabled={!filterResellerId.trim() || !filterParentCompanyId.trim()}
          />
          <Box sx={{ display: "flex", justifyContent: { xs: "stretch", lg: "flex-end" } }}>
            <Button
              type="button"
              variant="outlined"
              sx={{
                ...resolveSx(filterChromeButtonSx, theme),
                width: { xs: "100%", lg: "auto" },
              }}
              onClick={() => {
                setFilterAssigned("");
                setFilterResellerId("");
                setFilterParentCompanyId("");
                setFilterChildCompanyId("");
                setSearchInput("");
                setSearch("");
                setPage(1);
              }}
            >
              Clear filters
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
              <SearchBar
                value={searchInput}
                onChange={setSearchInput}
                placeholder="Search URL, website, company, reseller, or assigned user…"
                sx={{ minWidth: "100%" }}
              />
            </Box>
            <Button
              type="button"
              variant="primary"
              disabled={searchInput.trim() === search.trim()}
              onClick={() => setSearch(searchInput)}
              sx={{ minWidth: 132, whiteSpace: "nowrap", alignSelf: { xs: "stretch", sm: "center" } }}
            >
              Search
            </Button>
            <FilterButton sx={{ whiteSpace: "nowrap", alignSelf: { xs: "stretch", sm: "center" } }} />
          </Box>
        </Box>

        <DataTable<WebsiteRow>
          columns={columns}
          rows={filteredRows}
          isLoading={isLoading}
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
            {isLoading
              ? "Loading websites..."
              : `Showing data ${filteredRows.length > 0 ? (page - 1) * limit + 1 : 0} to ${(page - 1) * limit + filteredRows.length} of ${totalEntries} entries`}
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
