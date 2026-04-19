"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Apartment from "@mui/icons-material/Apartment";
import MoreHoriz from "@mui/icons-material/MoreHoriz";
import { useTheme } from "@mui/material/styles";
import { useQueryClient } from "@tanstack/react-query";
import type { AppTheme } from "@/theme/theme";
import {
  Typography,
  DashboardCard,
  DataTable,
  dataTableActionButton,
  SearchBar,
  FilterButton,
  TablePagination,
  Button,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { AddCircleIcon } from "@/components/dashboard/icons/AddCircleIcon";
import { AddDepartmentModal } from "./components/AddDepartmentModal";
import { useDepartmentsListQuery, hrmsDepartmentsKeys } from "@/lib/hooks";
import {
  departmentsAddButton,
  departmentsCard,
  departmentsCardHeader,
  departmentsFooterRow,
  departmentsPaginationWrapper,
  departmentsSearchRow,
  departmentsSearchFieldWrapper,
} from "../website-assigning/website-assigning.styles";
import {
  cardTitleRow,
  cardTitleIconBox,
  footerMutedText,
  pageHeaderRow,
  pageWrapper,
} from "../companies/overview.styles";
import {
  type DepartmentRow,
  extractDepartmentsRows,
  extractDepartmentsTotal,
  extractDepartmentsTotalPages,
  extractDepartmentsLimit,
} from "./utils";

/** Default page size sent to `GET /hrms/departments` — backend may echo a different `data.limit`. */
const DEFAULT_PAGE_LIMIT = 20;

function formatCompactEntryTotal(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `${m % 1 === 0 ? m : m.toFixed(1)}M`;
  }
  if (n >= 1000) {
    const k = n / 1000;
    return `${k % 1 === 0 ? k : k.toFixed(0)}K`;
  }
  return String(n);
}

export default function DepartmentsPage() {
  const theme = useTheme() as AppTheme;
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [addDepartmentOpen, setAddDepartmentOpen] = useState(false);

  const listParams = useMemo(
    () => ({
      page,
      limit: DEFAULT_PAGE_LIMIT,
      ...(search.trim() ? { search: search.trim() } : {}),
    }),
    [page, search],
  );

  const departmentsQuery = useDepartmentsListQuery(listParams, {
    scope: "departments-page",
  });

  const tableRows = useMemo(
    () => extractDepartmentsRows(departmentsQuery.data),
    [departmentsQuery.data],
  );

  const totalEntries = useMemo(() => extractDepartmentsTotal(departmentsQuery.data), [departmentsQuery.data]);
  const pageCount = useMemo(() => extractDepartmentsTotalPages(departmentsQuery.data), [departmentsQuery.data]);
  /** Rows per page as returned by API (`data.limit`) — matches footer “1 to N” with actual page size. */
  const pageLimit = useMemo(
    () => extractDepartmentsLimit(departmentsQuery.data) ?? DEFAULT_PAGE_LIMIT,
    [departmentsQuery.data],
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    setPage((p) => (p > pageCount ? pageCount : p));
  }, [pageCount]);

  const footerRangeStart = tableRows.length > 0 ? (page - 1) * pageLimit + 1 : 0;
  const footerRangeEnd = (page - 1) * pageLimit + tableRows.length;
  const isLoading = departmentsQuery.isLoading || departmentsQuery.isFetching;

  const columns = useMemo<DataTableColumn<DepartmentRow>[]>(
    () => [
      { id: "name", label: "Departments Name" },
      { id: "type", label: "Type" },
    ],
    [],
  );

  const handleDepartmentsSaved = () => {
    void queryClient.invalidateQueries({ queryKey: hrmsDepartmentsKeys.all });
  };

  return (
    <Box sx={pageWrapper}>
      <Box sx={pageHeaderRow}>
        <Typography variant="regularLarge" fontWeight={700} color="white">
          Departments
        </Typography>
        <Button variant="primary" sx={departmentsAddButton} onClick={() => setAddDepartmentOpen(true)}>
          <AddCircleIcon width={16} height={16} />
          <Typography component="span" variant="medium" sx={{ color: "inherit" }}>
            Add Department
          </Typography>
        </Button>
      </Box>

      <AddDepartmentModal
        open={addDepartmentOpen}
        onClose={() => setAddDepartmentOpen(false)}
        onSaved={handleDepartmentsSaved}
      />

      <DashboardCard sx={departmentsCard}>
        <Box sx={departmentsCardHeader}>
          <Box sx={cardTitleRow}>
            <Box sx={cardTitleIconBox}>
              <Apartment sx={{ fontSize: 18, color: theme.app.dashboard.white95 }} />
            </Box>
            <Typography variant="mediumLarge" color="white" fontWeight={600}>
              Departments
            </Typography>
          </Box>

          <Box sx={departmentsSearchRow}>
            <Box sx={departmentsSearchFieldWrapper}>
              <SearchBar value={search} onChange={setSearch} placeholder="Search anything.." />
            </Box>
            <FilterButton />
          </Box>
        </Box>

        <DataTable<DepartmentRow>
          columns={columns}
          rows={tableRows}
          getRowId={(row) => row.id}
          minWidth={560}
          actionColumn={{
            label: "Action",
            render: () => (
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <IconButton size="small" sx={dataTableActionButton}>
                  <MoreHoriz fontSize="small" />
                </IconButton>
              </Box>
            ),
          }}
        />

        <Box sx={departmentsFooterRow}>
          <Typography variant="medium" sx={footerMutedText(theme)}>
            {isLoading
              ? "Loading departments..."
              : departmentsQuery.isError
                ? "Could not load departments."
                : `Showing data ${footerRangeStart} to ${footerRangeEnd} of ${formatCompactEntryTotal(totalEntries)} entries`}
          </Typography>
          <Box sx={departmentsPaginationWrapper}>
            <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
          </Box>
        </Box>
      </DashboardCard>
    </Box>
  );
}
