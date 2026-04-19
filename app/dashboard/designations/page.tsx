"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { AttachMoney as AttachMoneyIcon } from "@mui/icons-material";
import MoreHoriz from "@mui/icons-material/MoreHoriz";
import { useTheme } from "@mui/material/styles";
import { useQueryClient } from "@tanstack/react-query";
import type { AppTheme } from "@/theme/theme";
import {
  Typography,
  DashboardCard,
  DataTable,
  dataTableActionButton,
  TablePagination,
  Button,
  InputField,
  SelectField,
  SearchBar,
  FilterButton,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { useDesignationsListQuery, hrmsDesignationsKeys } from "@/lib/hooks";
import {
  rolesCard,
  rolesFooterRow,
  rolesIconBox,
  rolesPageWrapper,
  rolesPaginationWrapper,
} from "../roles/roles.styles";
import { footerMutedText, pageWrapper } from "../companies/overview.styles";
import {
  departmentsCardHeader,
  departmentsSearchRow,
  departmentsSearchFieldWrapper,
} from "../website-assigning/website-assigning.styles";
import { publishAppToast } from "@/lib/notify";
import {
  type DesignationRow,
  extractDesignationsRows,
  extractDesignationsTotal,
  extractDesignationsTotalPages,
  extractDesignationsLimit,
} from "./utils";

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

const DEPARTMENT_SELECT_OPTIONS = [
  { label: "Assign Department Head", value: "" },
  { label: "Engineering", value: "engineering" },
  { label: "Customer Support", value: "support" },
  { label: "Sales", value: "sales" },
  { label: "Product", value: "product" },
];

export default function DesignationsPage() {
  const theme = useTheme() as AppTheme;
  const queryClient = useQueryClient();
  const [departmentNameField, setDepartmentNameField] = useState("");
  const [assignedDepartment, setAssignedDepartment] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const listParams = useMemo(
    () => ({
      page,
      limit: DEFAULT_PAGE_LIMIT,
      ...(search.trim() ? { search: search.trim() } : {}),
    }),
    [page, search],
  );

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

  useEffect(() => {
    setPage(1);
  }, [search]);

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

  const resetForm = () => {
    setDepartmentNameField("");
    setAssignedDepartment("");
  };

  const handleCancelForm = () => {
    resetForm();
  };

  const handleSaveDesignation = () => {
    const name = departmentNameField.trim();
    if (!name) {
      publishAppToast({ variant: "error", message: "Please enter a department name." });
      return;
    }
    if (!assignedDepartment.trim()) {
      publishAppToast({ variant: "error", message: "Please assign a department." });
      return;
    }
    publishAppToast({ variant: "success", message: `Designation saved for “${name}”.` });
    resetForm();
    void queryClient.invalidateQueries({ queryKey: hrmsDesignationsKeys.all });
  };

  return (
    <Box sx={[pageWrapper, rolesPageWrapper]}>
      <Box sx={{ mb: 0.5 }}>
        <Typography variant="regularLarge" fontWeight={700} color="white">
          Designations
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.75, color: theme.app.dashboard.textMuted, maxWidth: 720 }}>
          Generate and distribute licenses to client companies
        </Typography>
      </Box>

      <DashboardCard sx={rolesCard}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
          <Box sx={rolesIconBox}>
            <AttachMoneyIcon sx={{ fontSize: 20, color: theme.app.dashboard.white95 }} />
          </Box>
          <Typography variant="mediumLarge" fontWeight={600} color="white">
            Add New Designation
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
            mb: 2.5,
          }}
        >
          <InputField
            label="Department Name"
            placeholder="Food"
            value={departmentNameField}
            onChange={(e) => setDepartmentNameField(e.target.value)}
          />
          <SelectField
            label="Department"
            value={assignedDepartment}
            onChange={setAssignedDepartment}
            options={DEPARTMENT_SELECT_OPTIONS}
          />
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, flexWrap: "wrap" }}>
          <Button variant="secondary" onClick={handleCancelForm}>
            Cancel
          </Button>
          <Button variant="primary" sx={gradientPrimaryButtonSx} onClick={handleSaveDesignation}>
            Save Designation
          </Button>
        </Box>
      </DashboardCard>

      <DashboardCard sx={rolesCard}>
        <Box sx={departmentsCardHeader}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={rolesIconBox}>
              <AttachMoneyIcon sx={{ fontSize: 20, color: theme.app.dashboard.white95 }} />
            </Box>
            <Typography variant="mediumLarge" fontWeight={600} color="white">
              Designations
            </Typography>
          </Box>

          <Box sx={departmentsSearchRow}>
            <Box sx={departmentsSearchFieldWrapper}>
              <SearchBar value={search} onChange={setSearch} placeholder="Search anything.." />
            </Box>
            <FilterButton />
          </Box>
        </Box>

        <DataTable<DesignationRow>
          columns={columns}
          rows={tableRows}
          getRowId={(row) => row.id}
          minWidth={640}
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
