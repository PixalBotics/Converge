"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Apartment from "@mui/icons-material/Apartment";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useQueryClient } from "@tanstack/react-query";
import type { AppTheme } from "@/theme/theme";
import {
  Typography,
  DashboardCard,
  DataTable,
  dataTableActionButton,
  SearchBar,
  TablePagination,
  Button,
  SelectField,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { AddCircleIcon } from "@/components/dashboard/icons/AddCircleIcon";
import { SearchIcon } from "@/components/dashboard/icons/SearchIcon";
import { AddDepartmentModal } from "./components/AddDepartmentModal";
import { DeleteDepartmentConfirmModal } from "./components/DeleteDepartmentConfirmModal";
import {
  useCompaniesByResellerQuery,
  useCompaniesSetupResellersQuery,
  useDepartmentsListQuery,
  hrmsDepartmentsKeys,
  useSoftDeleteDepartmentMutation,
} from "@/lib/hooks";
import {
  extractParentCompaniesFromByResellerTree,
  pickItemsArray,
  toIdNameOption,
} from "@/app/dashboard/user-page/components/add-user-modal.utils";
import {
  departmentsAddButton,
  departmentsCard,
  departmentsFooterRow,
  departmentsPaginationWrapper,
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

const TYPE_FILTER_OPTIONS = [
  { label: "All types", value: "" },
  { label: "Internal", value: "Internal" },
  { label: "External", value: "External" },
];

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
  const [searchInput, setSearchInput] = useState("");
  /** Applied search string sent to API (set by Search button). */
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"" | "Internal" | "External">("");
  const [filterResellerId, setFilterResellerId] = useState("");
  const [filterParentCompanyId, setFilterParentCompanyId] = useState("");
  const [page, setPage] = useState(1);
  const [departmentFormOpen, setDepartmentFormOpen] = useState(false);
  const [departmentToEdit, setDepartmentToEdit] = useState<DepartmentRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DepartmentRow | null>(null);

  const softDeleteDepartmentMutation = useSoftDeleteDepartmentMutation();

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
    return [
      { value: "", label: resellersQuery.isLoading ? "Loading resellers…" : "No resellers available" },
    ];
  }, [resellerOptions, resellersQuery.isLoading]);

  const parentCompanyFilterOptions = useMemo(() => {
    if (!filterResellerId.trim()) {
      return [{ value: "", label: "All parent companies" }];
    }
    if (companiesByResellerQuery.isLoading) {
      return [{ value: "", label: "Loading companies…" }];
    }
    const extracted = extractParentCompaniesFromByResellerTree(companiesByResellerQuery.data);
    const all = { value: "", label: "All parent companies" };
    if (extracted.length > 0) return [all, ...extracted];
    return [{ value: "", label: "No companies for this reseller" }];
  }, [filterResellerId, companiesByResellerQuery.isLoading, companiesByResellerQuery.data]);

  const listParams = useMemo(() => {
    const params: Record<string, string | number> = {
      page,
      limit: DEFAULT_PAGE_LIMIT,
    };
    const q = search.trim();
    if (q) params.search = q;
    if (filterType) params.type = filterType;
    const rid = filterResellerId.trim();
    if (rid) {
      params.resellerId = rid;
      const pid = filterParentCompanyId.trim();
      if (pid) params.parentCompanyId = pid;
    }
    return params;
  }, [page, search, filterType, filterResellerId, filterParentCompanyId]);

  const departmentsQuery = useDepartmentsListQuery(listParams, {
    scope: "departments-page",
  });

  const tableRows = useMemo(
    () => extractDepartmentsRows(departmentsQuery.data),
    [departmentsQuery.data],
  );

  const totalEntries = useMemo(() => extractDepartmentsTotal(departmentsQuery.data), [departmentsQuery.data]);
  const pageCount = useMemo(() => extractDepartmentsTotalPages(departmentsQuery.data), [departmentsQuery.data]);
  const pageLimit = useMemo(
    () => extractDepartmentsLimit(departmentsQuery.data) ?? DEFAULT_PAGE_LIMIT,
    [departmentsQuery.data],
  );

  const hasActiveFilters =
    Boolean(search.trim()) ||
    Boolean(filterType) ||
    Boolean(filterResellerId.trim()) ||
    Boolean(filterParentCompanyId.trim());

  useEffect(() => {
    // When the SearchBar cross button clears the input, reset applied search to show full data.
    if (searchInput.trim().length > 0) return;
    if (!search.trim()) return;
    setSearch("");
    setPage(1);
  }, [searchInput, search]);

  useEffect(() => {
    setPage(1);
  }, [search, filterType, filterResellerId, filterParentCompanyId]);

  useEffect(() => {
    setPage((p) => (p > pageCount ? pageCount : p));
  }, [pageCount]);

  const footerRangeStart = tableRows.length > 0 ? (page - 1) * pageLimit + 1 : 0;
  const footerRangeEnd = (page - 1) * pageLimit + tableRows.length;
  const isLoading = departmentsQuery.isLoading || departmentsQuery.isFetching;

  const columns = useMemo<DataTableColumn<DepartmentRow>[]>(
    () => [
      { id: "name", label: "Department name" },
      { id: "type", label: "Type" },
    ],
    [],
  );

  const departmentsTableSx = useMemo(
    () =>
      ({
        tableLayout: "fixed",
        width: "100%",
        "& th, & td": {
          verticalAlign: "middle",
        },
        "& th:nth-of-type(1), & td:nth-of-type(1)": {
          width: "52%",
          whiteSpace: "normal",
          wordBreak: "break-word",
        },
        "& th:nth-of-type(2), & td:nth-of-type(2)": {
          width: "20%",
        },
        "& th:nth-of-type(3), & td:nth-of-type(3)": {
          width: "28%",
          textAlign: "right",
        },
      }) as const,
    [],
  );

  const actionColumn = useMemo(
    () => ({
      label: "Action",
      render: (row: DepartmentRow) => {
        const rowId = row.id?.trim() ?? "";
        const isDeletingThis =
          softDeleteDepartmentMutation.isPending &&
          softDeleteDepartmentMutation.variables === rowId;
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 1,
            }}
          >
            <IconButton
              size="small"
              aria-label="Edit department"
              disabled={!rowId}
              onClick={() => {
                if (!rowId) return;
                setDepartmentToEdit(row);
                setDepartmentFormOpen(true);
              }}
              sx={{
                ...dataTableActionButton,
                color: theme.app.dashboard.white80,
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              aria-label="Delete department"
              disabled={!rowId || isDeletingThis}
              onClick={() => {
                if (!rowId) return;
                setDeleteTarget(row);
              }}
              sx={{
                ...dataTableActionButton,
                color: theme.app.dashboard.accentRedLight,
                opacity: !rowId ? 0.35 : 1,
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        );
      },
    }),
    [theme, softDeleteDepartmentMutation.isPending, softDeleteDepartmentMutation.variables],
  );

  const handleDepartmentsSaved = () => {
    void queryClient.invalidateQueries({ queryKey: hrmsDepartmentsKeys.all });
  };

  const openDepartmentFormForAdd = () => {
    setDepartmentToEdit(null);
    setDepartmentFormOpen(true);
  };

  const closeDepartmentForm = () => {
    setDepartmentFormOpen(false);
    setDepartmentToEdit(null);
  };

  const handleConfirmDeleteDepartment = () => {
    const id = deleteTarget?.id?.trim();
    if (!id) return;
    softDeleteDepartmentMutation.mutate(id, {
      onSuccess: () => {
        setDeleteTarget(null);
        handleDepartmentsSaved();
      },
    });
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setFilterType("");
    setFilterResellerId("");
    setFilterParentCompanyId("");
  };

  const handleResellerFilterChange = (v: string) => {
    setFilterResellerId(v);
    setFilterParentCompanyId("");
  };

  return (
    <Box sx={pageWrapper}>
      <Box sx={pageHeaderRow}>
        <Typography variant="regularLarge" fontWeight={700} color="white">
          Departments
        </Typography>
        <Button variant="primary" sx={departmentsAddButton} onClick={openDepartmentFormForAdd}>
          <AddCircleIcon width={16} height={16} />
          <Typography component="span" variant="medium" sx={{ color: "inherit" }}>
            Add Department
          </Typography>
        </Button>
      </Box>

      <AddDepartmentModal
        open={departmentFormOpen}
        onClose={closeDepartmentForm}
        onSaved={handleDepartmentsSaved}
        editDepartment={departmentToEdit}
      />

      <DeleteDepartmentConfirmModal
        open={deleteTarget != null}
        departmentName={deleteTarget?.name ?? ""}
        onDismiss={() => {
          if (!softDeleteDepartmentMutation.isPending) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDeleteDepartment}
        isDeleting={softDeleteDepartmentMutation.isPending}
      />

      <DashboardCard sx={departmentsCard}>
        <Box
          sx={{
            ...cardTitleRow,
            width: "100%",
            flexShrink: 0,
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            flexWrap: { xs: "wrap", lg: "nowrap" },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Box sx={cardTitleIconBox}>
              <Apartment sx={{ fontSize: 18, color: theme.app.dashboard.white95 }} />
            </Box>
            <Typography variant="mediumLarge" color="white" fontWeight={600}>
              Departments
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 1.25,
              alignItems: "center",
              width: { xs: "100%", lg: "auto" },
              minWidth: 0,
              justifyContent: { xs: "stretch", lg: "flex-end" },
            }}
          >
            <Box sx={{ width: { xs: "100%", lg: 320 } }}>
              <SearchBar
                value={searchInput}
                onChange={setSearchInput}
                placeholder="Search department, reseller, or parent company…"
                sx={{ width: "100%" }}
              />
            </Box>
            <Button
              type="button"
              variant="primary"
              disabled={searchInput.trim() === search.trim()}
              onClick={() => setSearch(searchInput)}
              sx={{ minWidth: 120, whiteSpace: "nowrap" }}
            >
              <Box component="span" sx={{ display: "inline-flex", lineHeight: 0 }}>
                <SearchIcon width={18} height={18} sx={{ color: "inherit" }} />
              </Box>
              Search
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "140px 200px 220px auto",
            },
            gap: 1.5,
            alignItems: "end",
            width: "100%",
            flexShrink: 0,
          }}
        >
          <SelectField
            label="Type"
            value={filterType}
            onChange={(v) => setFilterType(v as "" | "Internal" | "External")}
            options={TYPE_FILTER_OPTIONS}
            menuMaxRows={6}
          />
          <SelectField
            label="Reseller"
            value={filterResellerId}
            onChange={handleResellerFilterChange}
            options={resellerFilterOptions}
            menuMaxRows={6}
          />
          <SelectField
            label="Parent company"
            value={filterParentCompanyId}
            onChange={setFilterParentCompanyId}
            options={
              filterResellerId.trim()
                ? parentCompanyFilterOptions
                : [{ value: "", label: "Choose a reseller first" }]
            }
            disabled={!filterResellerId.trim()}
            menuMaxRows={6}
          />
          <Button
            type="button"
            variant="secondary"
            disabled={!hasActiveFilters}
            onClick={clearFilters}
            sx={{
              minWidth: 140,
              whiteSpace: "nowrap",
              width: "auto",
              justifySelf: { xs: "stretch", sm: "start" },
            }}
          >
            Clear filters
          </Button>
        </Box>

        <DataTable<DepartmentRow>
          columns={columns}
          rows={tableRows}
          getRowId={(row) => row.id}
          minWidth={560}
          tableSx={departmentsTableSx}
          actionColumn={actionColumn}
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
