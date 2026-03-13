"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
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
                bgcolor: "#4F46E5",
                color: "white",
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
              bgcolor: String(value) === "Internal" ? "rgba(59,130,246,0.16)" : "rgba(244,114,182,0.16)",
              color: String(value) === "Internal" ? "#93C5FD" : "#F9A8D4",
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
                bgcolor: isActive ? "rgba(22,163,74,0.12)" : "rgba(239,68,68,0.12)",
                color: isActive ? "#4ADE80" : "#FCA5A5",
                fontSize: "0.75rem",
                fontWeight: 500,
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "9999px",
                  bgcolor: isActive ? "#22C55E" : "#F97316",
                }}
              />
              {String(value ?? "—")}
            </Box>
          );
        },
      },
    ],
    []
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
              <SearchIcon sx={{ fontSize: 20, color: "#E5E7EB" }} width={20} height={20} />
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
          <Typography variant="medium" color="rgba(148,163,184,0.9)">
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
        <Box sx={{ mt: 0.5 }}>
          <Typography variant="medium" color="white" sx={{ mb: 1 }}>
            Status
          </Typography>
          <StatusRadioGroup value={status} onChange={setStatus} />
        </Box>
      </FormModal>
    </Box>
  );
}
