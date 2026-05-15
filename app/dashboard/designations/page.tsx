"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { AttachMoney as AttachMoneyIcon } from "@mui/icons-material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { alpha, useTheme } from "@mui/material/styles";
import { useQueryClient } from "@tanstack/react-query";
import type { AppTheme } from "@/theme/theme";
import {
  Typography,
  DashboardCard,
  DataTable,
  dataTableActionButton,
  TablePagination,
  Button,
  SearchBar,
  SelectField,
  ToolbarFilterPopover,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { AddCircleIcon, SearchIcon } from "@/components/common/icons";
import {
  hrmsDesignationsKeys,
  useCompaniesSetupResellersQuery,
  useDepartmentsListQuery,
  useDesignationsListQuery,
  useSoftDeleteDesignationMutation,
} from "@/lib/hooks";
import { pickItemsArray, toIdNameOption } from "@/app/dashboard/user-page/components/add-user-modal.utils";
import {
  rolesHeader,
  rolesAddButtonWrapper,
  rolesAddButton,
  rolesCard,
  rolesFooterRow,
  rolesIconBox,
  rolesPageWrapper,
  rolesPaginationWrapper,
} from "../roles/roles.styles";
import { footerMutedText, pageWrapper } from "../companies/overview.styles";
import {
  departmentsCardHeader,
  departmentsSearchFieldWrapper,
  departmentsSearchRow,
} from "../website-assigning/website-assigning.styles";
import {
  type DesignationRow,
  extractDesignationsRows,
  extractDesignationsTotal,
  extractDesignationsTotalPages,
  extractDesignationsLimit,
} from "./utils";
import { AddDesignationModal } from "./components/AddDesignationModal";
import { DeleteDesignationConfirmModal } from "./components/DeleteDesignationConfirmModal";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { useAuth } from "@/lib/auth";
import { canDesignationAction } from "@/lib/permissions";

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

export default function DesignationsPage() {
  const theme = useTheme() as AppTheme;
  const { hasOperational } = useAuth();
  const canCreateDes = canDesignationAction(hasOperational, "create");
  const canUpdateDes = canDesignationAction(hasOperational, "update");
  const canDeleteDes = canDesignationAction(hasOperational, "delete");
  const queryClient = useQueryClient();
  const [designationFormOpen, setDesignationFormOpen] = useState(false);
  const [designationToEdit, setDesignationToEdit] = useState<DesignationRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DesignationRow | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filterResellerId, setFilterResellerId] = useState("");
  const [filterDepartmentId, setFilterDepartmentId] = useState("");
  const [page, setPage] = useState(1);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  const softDeleteDesignationMutation = useSoftDeleteDesignationMutation();

  const resellersQuery = useCompaniesSetupResellersQuery({ enabled: true });
  const departmentsQuery = useDepartmentsListQuery(
    filterResellerId.trim() ? { resellerId: filterResellerId.trim() } : undefined,
    { enabled: true, scope: "designations-page-filters" },
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

  const departmentOptions = useMemo(() => {
    return pickItemsArray(departmentsQuery.data)
      .map((row) => toIdNameOption(row))
      .filter((o): o is { value: string; label: string } => o !== null);
  }, [departmentsQuery.data]);

  const departmentFilterOptions = useMemo(() => {
    const all = { value: "", label: "All departments" };
    if (departmentOptions.length > 0) return [all, ...departmentOptions];
    return [{ value: "", label: departmentsQuery.isLoading ? "Loading departments…" : "No departments available" }];
  }, [departmentOptions, departmentsQuery.isLoading]);

  const listParams = useMemo(() => {
    const params: Record<string, string | number> = {
      page,
      limit: DEFAULT_PAGE_LIMIT,
    };
    const q = search.trim();
    if (q) params.search = q;
    if (filterResellerId.trim()) params.resellerId = filterResellerId.trim();
    if (filterDepartmentId.trim()) params.departmentId = filterDepartmentId.trim();
    return params;
  }, [page, search, filterResellerId, filterDepartmentId]);

  const designationsQuery = useDesignationsListQuery(listParams, {
    scope: "designations-page",
  });

  const tableRows = useMemo(
    () => extractDesignationsRows(designationsQuery.data),
    [designationsQuery.data],
  );

  const totalEntries = useMemo(() => extractDesignationsTotal(designationsQuery.data), [designationsQuery.data]);
  const pageCount = useMemo(() => extractDesignationsTotalPages(designationsQuery.data), [designationsQuery.data]);
  const pageLimit = useMemo(
    () => extractDesignationsLimit(designationsQuery.data) ?? DEFAULT_PAGE_LIMIT,
    [designationsQuery.data],
  );

  const hasActiveFilters =
    Boolean(search.trim()) ||
    Boolean(filterResellerId.trim()) ||
    Boolean(filterDepartmentId.trim());

  useEffect(() => {
    // When the SearchBar cross button clears the input, reset applied search to show full data.
    if (searchInput.trim().length > 0) return;
    if (!search.trim()) return;
    setSearch("");
    setPage(1);
  }, [searchInput, search]);

  useEffect(() => {
    setPage(1);
  }, [search, filterResellerId, filterDepartmentId]);

  useEffect(() => {
    setPage((p) => (p > pageCount ? pageCount : p));
  }, [pageCount]);

  const footerRangeStart = tableRows.length > 0 ? (page - 1) * pageLimit + 1 : 0;
  const footerRangeEnd = (page - 1) * pageLimit + tableRows.length;
  const isLoading = designationsQuery.isLoading || designationsQuery.isFetching;

  const columns = useMemo<DataTableColumn<DesignationRow>[]>(
    () => [
      { id: "designationName", label: "Designation Name" },
      { id: "department", label: "Department" },
    ],
    [],
  );

  const openDesignationFormForAdd = () => {
    setDesignationToEdit(null);
    setDesignationFormOpen(true);
  };

  const closeDesignationForm = () => {
    setDesignationFormOpen(false);
    setDesignationToEdit(null);
  };

  const handleDesignationSaved = () => {
    setDesignationToEdit(null);
    void queryClient.invalidateQueries({ queryKey: hrmsDesignationsKeys.all });
  };

  const clearFilters = useCallback(() => {
    setSearchInput("");
    setSearch("");
    setFilterResellerId("");
    setFilterDepartmentId("");
    setPage(1);
    setFilterPanelOpen(false);
  }, []);

  const handleResellerFilterChange = useCallback((v: string) => {
    setFilterResellerId(v);
    setFilterDepartmentId("");
  }, []);

  const designationsFilterPanel = useMemo(() => {
    const sectionRule = `1px solid ${alpha(theme.app.dashboard.white95, 0.1)}`;
    return (
      <Box sx={{ color: theme.app.text.primary }}>
        <Box sx={{ px: 2.25, pt: 2, pb: 1.5 }}>
          <Typography variant="medium" fontWeight={700} sx={{ color: theme.app.text.primary, mb: 1.5 }}>
            Filters
          </Typography>
          <Box sx={{ display: "grid", gap: 1.75 }}>
            <SelectField
              label="Reseller"
              value={filterResellerId}
              onChange={handleResellerFilterChange}
              options={resellerFilterOptions}
              menuMaxRows={6}
            />
            <SelectField
              label="Department"
              value={filterDepartmentId}
              onChange={setFilterDepartmentId}
              options={departmentFilterOptions}
              menuMaxRows={6}
            />
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "stretch",
            gap: 1.5,
            px: 2.25,
            py: 1.75,
            borderTop: sectionRule,
            bgcolor: alpha(theme.app.dashboard.white95, 0.06),
          }}
        >
          <Button
            type="button"
            variant="secondary"
            disabled={!hasActiveFilters}
            onClick={clearFilters}
            sx={(t) => ({
              minWidth: { xs: 0, sm: 140 },
              width: { xs: "100%", sm: "auto" },
              flexShrink: 0,
              border: `1px solid ${alpha((t as AppTheme).app.dashboard.white95, 0.22)}`,
            })}
          >
            Clear filters
          </Button>
          <Button type="button" variant="primary" sx={gradientPrimaryButtonSx} onClick={() => setFilterPanelOpen(false)}>
            Done
          </Button>
        </Box>
      </Box>
    );
  }, [
    theme,
    filterResellerId,
    filterDepartmentId,
    resellerFilterOptions,
    departmentFilterOptions,
    hasActiveFilters,
    handleResellerFilterChange,
    clearFilters,
  ]);

  const handleConfirmDeleteDesignation = () => {
    const rowId = deleteTarget?.id?.trim() ?? "";
    if (!rowId || softDeleteDesignationMutation.isPending) return;
    softDeleteDesignationMutation.mutate(rowId, {
      onSuccess: () => {
        setDeleteTarget(null);
      },
    });
  };

  return (
    <Box sx={pageWrapper}>
      <Box sx={rolesPageWrapper} width="100%">
        <Box sx={rolesHeader} width="100%">
          <Typography
            variant="regularLarge"
            fontWeight={700}
            sx={{ color: theme.app.text.primary }}
          >
            Designations
          </Typography>
          {canCreateDes ? (
            <Box sx={rolesAddButtonWrapper}>
              <Button variant="primary" sx={rolesAddButton} onClick={openDesignationFormForAdd}>
                <AddCircleIcon width={16} height={16} />
                <Typography component="span" variant="medium" sx={{ color: "inherit" }}>
                  Add New Designation
                </Typography>
              </Button>
            </Box>
          ) : null}
        </Box>
      </Box>

      <AddDesignationModal
        open={designationFormOpen}
        onClose={closeDesignationForm}
        onSaved={handleDesignationSaved}
        editDesignation={designationToEdit}
      />

      <DeleteDesignationConfirmModal
        open={deleteTarget != null}
        designationName={deleteTarget?.designationName ?? ""}
        onDismiss={() => {
          if (!softDeleteDesignationMutation.isPending) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDeleteDesignation}
        isDeleting={softDeleteDesignationMutation.isPending}
      />

      <DashboardCard sx={rolesCard}>
        <Box sx={departmentsCardHeader}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
            <Box sx={rolesIconBox}>
              <AttachMoneyIcon sx={{ fontSize: 20, color: theme.app.dashboard.iconMuted }} />
            </Box>
            <Typography
              variant="mediumLarge"
              fontWeight={600}
              sx={{ color: theme.app.text.primary }}
            >
              Designations
            </Typography>
          </Box>

          <Box sx={departmentsSearchRow}>
            <Box sx={departmentsSearchFieldWrapper}>
              <SearchBar
                value={searchInput}
                onChange={setSearchInput}
                placeholder="Search designation, department, reseller, or parent company…"
                sx={{ width: "100%" }}
              />
            </Box>
            <Button
              type="button"
              variant="primary"
              disabled={searchInput.trim() === search.trim()}
              onClick={() => {
                setSearch(searchInput.trim());
                setPage(1);
              }}
              sx={{ minWidth: 132, whiteSpace: "nowrap", alignSelf: { xs: "stretch", sm: "center" } }}
            >
              <Box component="span" sx={{ display: "inline-flex", lineHeight: 0, mr: 0.75 }}>
                <SearchIcon width={18} height={18} sx={{ color: "inherit" }} />
              </Box>
              Search
            </Button>
            <ToolbarFilterPopover open={filterPanelOpen} onOpenChange={setFilterPanelOpen} active={hasActiveFilters}>
              {designationsFilterPanel}
            </ToolbarFilterPopover>
          </Box>
        </Box>

        <DataTable<DesignationRow>
          columns={columns}
          rows={tableRows}
          isLoading={isLoading}
          getRowId={(row) => row.id}
          minWidth={640}
          tableSx={{
            tableLayout: "fixed",
            "& th:nth-of-type(1), & td:nth-of-type(1)": { width: "44%", whiteSpace: "normal", wordBreak: "break-word" },
            "& th:nth-of-type(2), & td:nth-of-type(2)": { width: "36%", whiteSpace: "normal", wordBreak: "break-word" },
            "& th:nth-of-type(3), & td:nth-of-type(3)": { width: "20%", textAlign: "right" },
          }}
          actionColumn={{
            label: "Action",
            render: (row) => {
              const rowId = row.id?.trim() ?? "";
              const isDeletingThis =
                softDeleteDesignationMutation.isPending &&
                softDeleteDesignationMutation.variables === rowId;
              return (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1 }}>
                  <IconButton
                    size="small"
                    aria-label="Edit designation"
                    disabled={!rowId || !canUpdateDes}
                    onClick={() => {
                      if (!rowId || !canUpdateDes) return;
                      setDesignationToEdit(row);
                      setDesignationFormOpen(true);
                    }}
                    sx={{ ...dataTableActionButton, color: theme.app.dashboard.white80 }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    aria-label="Delete designation"
                    disabled={!rowId || isDeletingThis || !canDeleteDes}
                    onClick={() => {
                      if (!rowId || !canDeleteDes) return;
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
          }}
        />

        <Box sx={rolesFooterRow}>
          <Typography variant="medium" sx={footerMutedText(theme)}>
            {isLoading
              ? "Loading designations..."
              : designationsQuery.isError
                ? "Could not load designations."
                : `Showing data ${footerRangeStart} to ${footerRangeEnd} of ${formatCompactEntryTotal(totalEntries)} entries`}
          </Typography>
          <Box sx={rolesPaginationWrapper}>
            <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
          </Box>
        </Box>
      </DashboardCard>
      </Box>
  
  );
}
