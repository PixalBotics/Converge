"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Add as AddIcon, MoreHoriz as MoreHorizIcon } from "@mui/icons-material";
import { Typography, DashboardCard, DataTable, dataTableActionButton, Button, SearchBar, FilterButton, TablePagination, FormModal, InputField, StatusRadioGroup, SelectField } from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { SearchIcon } from "@/components/dashboard/icons/SearchIcon";
import { userIconPath } from "@/assets";
import {
  departmentsPageWrapper,
  departmentsHeader,
  departmentsAddButtonWrapper,
  departmentsAddButton,
  departmentsCard,
  departmentsCardHeader,
  departmentsIconBox,
  departmentsSearchRow,
  departmentsSearchFieldWrapper,
  departmentsFooterRow,
  departmentsPaginationWrapper,
} from "./website-assigning.styles";

interface DepartmentRow extends Record<string, unknown> {
  departmentName: string;
  type: "Internal" | "External";
  linkedReseller: string;
  linkedCompany: string;
  status: "Active" | "Inactive";
}

const DEPARTMENTS: DepartmentRow[] = [
  {
    departmentName: "Engineering",
    type: "Internal",
    linkedReseller: "-",
    linkedCompany: "-",
    status: "Active",
  },
  {
    departmentName: "The Walt Disney Company",
    type: "Internal",
    linkedReseller: "Global Tech Resellers",
    linkedCompany: "-",
    status: "Active",
  },
  {
    departmentName: "MasterCard",
    type: "Internal",
    linkedReseller: "-",
    linkedCompany: "TechCorp Inc.",
    status: "Active",
  },
  {
    departmentName: "eBay",
    type: "External",
    linkedReseller: "-",
    linkedCompany: "Global Tech Resellers",
    status: "Active",
  },
  {
    departmentName: "McDonald's",
    type: "External",
    linkedReseller: "-",
    linkedCompany: "-",
    status: "Active",
  },
  {
    departmentName: "Starbucks",
    type: "Internal",
    linkedReseller: "-",
    linkedCompany: "-",
    status: "Inactive",
  },
  {
    departmentName: "Apple",
    type: "Internal",
    linkedReseller: "-",
    linkedCompany: "-",
    status: "Active",
  },
  {
    departmentName: "Louis Vuitton",
    type: "External",
    linkedReseller: "-",
    linkedCompany: "-",
    status: "Active",
  },
];

export default function WebsiteAssigningPage() {
  const theme = useTheme() as AppTheme;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageCount = 2;
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");
  const [departmentType, setDepartmentType] = useState("Internal");

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return DEPARTMENTS;
    return DEPARTMENTS.filter((row) =>
      row.departmentName.toLowerCase().includes(query) ||
      row.type.toLowerCase().includes(query) ||
      row.linkedReseller.toLowerCase().includes(query) ||
      row.linkedCompany.toLowerCase().includes(query) ||
      row.status.toLowerCase().includes(query)
    );
  }, [search]);

  const columns = useMemo<DataTableColumn<DepartmentRow>[]>(
    () => [
      {
        id: "departmentName",
        label: "Department Name",
        render: (value, row) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              src={userIconPath}
              sx={{
                width: 32,
                height: 32,
                bgcolor: theme.app.dashboard.buttonIndigo,
                color: theme.app.text.primary,
                fontSize: 14,
              }}
            >
              {(String(row.departmentName ?? "").charAt(0) || "D").toUpperCase()}
            </Avatar>
            <Typography component="span" variant="body2" color="white" fontWeight={500}>
              {String(value ?? "—")}
            </Typography>
          </Box>
        ),
      },
      {
        id: "type",
        label: "Type",
        render: (value) => (
          <Box
            component="span"
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: "9999px",
              fontSize: "0.75rem",
              fontWeight: 500,
              bgcolor: String(value) === "Internal" ? theme.app.dashboard.blueTintBg : theme.app.dashboard.pinkTintBg,
              color: String(value) === "Internal" ? theme.app.dashboard.blueTint : theme.app.dashboard.accentPinkLight,
            }}
          >
            {String(value ?? "—")}
          </Box>
        ),
      },
      { id: "linkedReseller", label: "Linked Reseller", cellVariant: "muted" },
      { id: "linkedCompany", label: "Linked Company", cellVariant: "muted" },
      {
        id: "status",
        label: "Status",
        render: (value) => {
          const isActive = String(value) === "Active";
          return (
            <Box
              component="span"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.75,
                px: 1.5,
                py: 0.5,
                borderRadius: "9999px",
                bgcolor: isActive ? theme.app.dashboard.successTintBg : theme.app.dashboard.errorTintBg,
                color: isActive ? theme.app.dashboard.accentGreenLight : theme.app.dashboard.accentRedLight,
                fontSize: "0.75rem",
                fontWeight: 500,
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "9999px",
                  bgcolor: isActive ? theme.app.dashboard.accentGreen : theme.app.dashboard.accentOrange,
                }}
              />
              {String(value ?? "—")}
            </Box>
          );
        },
      },
    ],
    [theme]
  );

  return (
    <Box sx={departmentsPageWrapper}>
      <Box sx={departmentsHeader}>
        <Typography variant="regularLarge" fontWeight={700} color="white">
          Departments
        </Typography>
        <Box sx={departmentsAddButtonWrapper}>
          <Button
            variant="primary"
            sx={departmentsAddButton}
            onClick={() => setIsAddOpen(true)}
          >
            <AddIcon sx={{ fontSize: 18 }} />
            <Typography component="span" variant="medium" color="white">
              Add Department
            </Typography>
          </Button>
        </Box>
      </Box>

      <DashboardCard sx={departmentsCard}>
        <Box sx={departmentsCardHeader}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={departmentsIconBox}
            >
              <SearchIcon sx={{ fontSize: 20, color: theme.app.dashboard.iconMuted }} width={20} height={20} />
            </Box>
            <Typography variant="mediumLarge" color="white">
              Departments
            </Typography>
          </Box>
          <Box sx={departmentsSearchRow}>
            <Box sx={departmentsSearchFieldWrapper}>
              <SearchBar
                value={search}
                onChange={setSearch}
                sx={{ minWidth: "100%" }}
              />
            </Box>
            <FilterButton sx={{ whiteSpace: "nowrap" }} />
          </Box>
        </Box>

        <DataTable<DepartmentRow>
          columns={columns}
          rows={filteredRows}
          getRowId={(row, idx) => `${row.departmentName}-${idx}`}
          minWidth={960}
          actionColumn={{
            label: "Action",
            render: () => (
              <IconButton size="small" sx={dataTableActionButton}>
                <MoreHorizIcon fontSize="small" />
              </IconButton>
            ),
          }}
        />

        <Box sx={departmentsFooterRow}>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
            Showing data 1–{filteredRows.length} of 25K entries
          </Typography>
          <Box sx={departmentsPaginationWrapper}>
            <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
          </Box>
        </Box>
      </DashboardCard>

      <FormModal
        open={isAddOpen}
        title="Add Department"
        description="Create a new user account with appropriate access levels."
        onClose={() => setIsAddOpen(false)}
        onSave={() => setIsAddOpen(false)}
      >
        <InputField label="Department Name" placeholder="Department Name" />
        <SelectField
          label="Department Type"
          value={departmentType}
          onChange={setDepartmentType}
          options={[
            { label: "Internal", value: "Internal" },
            { label: "External", value: "External" },
          ]}
        />
        {departmentType === "External" && (
          <>
            <InputField label="Client of / Reseller" placeholder="Client of / Reseller" />
            <InputField label="Parent Company" placeholder="Parent Company" />
            <InputField label="Child Company" placeholder="Child Company" />
            <InputField label="Website" placeholder="Website" />
          </>
        )}
        <Box sx={{ mt: 0.5, marginLeft: "13px" }}>
          <Typography variant="medium" color="white" sx={{ mb: 1 }}>
            Status
          </Typography>
          <StatusRadioGroup value={status} onChange={setStatus} />
        </Box>
      </FormModal>
    </Box>
  );
}
