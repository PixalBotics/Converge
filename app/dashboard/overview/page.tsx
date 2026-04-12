"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Radio from "@mui/material/Radio";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { MoreHoriz as MoreHorizIcon, AttachMoney as AttachMoneyIcon } from "@mui/icons-material";
import { AddCircleIcon } from "@/components/dashboard/icons/AddCircleIcon";
import {
  Typography,
  DashboardCard,
  DataTable,
  dataTableActionButton,
  Button,
  InputField,
  SelectField,
  SearchBar,
  FilterButton,
  TablePagination,
  FormModal,
  Divider,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { outlineFieldCursorEventProps } from "@/components/common/InputField/outlineFieldCursor";
import { textFieldStyles } from "@/components/common/InputField/InputField.styles";
import {
  selectFieldStyles,
  selectMenuItemSx,
  selectMenuPaperSx,
} from "@/components/common/SelectField/SelectField.styles";
import { userIconPath } from "@/assets";
import {
  overviewPageWrapper,
  overviewHeader,
  overviewAddButtonWrapper,
  overviewAddButton,
  overviewCardsRow,
  overviewCard,
  overviewStatValue,
  overviewTableCard,
  overviewTableCardHeader,
  overviewIconBox,
  overviewSearchRow,
  overviewSearchFieldWrapper,
  overviewFooterRow,
  overviewPaginationWrapper,
} from "./overview.styles";

const DEPARTMENTS = [
  "Human Resources",
  "Engineering",
  "Sales",
  "Customer Support",
  "Marketing",
  "Finance",
];

interface UserRow extends Record<string, unknown> {
  user: string;
  email: string;
  type: "Internal" | "External";
  department: string;
  role: string;
  company: string;
  website: string;
  supervisor: string;
}

const USERS: UserRow[] = [
  {
    user: "Alex Satrio",
    email: "raja12@.com",
    type: "Internal",
    department: "Human Resources",
    role: "Manager",
    company: "-",
    website: "-",
    supervisor: "Sarah Wilson",
  },
  {
    user: "Emily Chen",
    email: "raja12@.com",
    type: "External",
    department: "Sales",
    role: "Account Manager",
    company: "-",
    website: "techcorp.com",
    supervisor: "Wilson",
  },
  {
    user: "Alex Satrio",
    email: "raja12@.com",
    type: "Internal",
    department: "Customer Support",
    role: "Manager",
    company: "techcorp.com",
    website: "-",
    supervisor: "Sarah Wilson",
  },
  {
    user: "Alex Satrio",
    email: "raja12@.com",
    type: "Internal",
    department: "Customer Support",
    role: "Manager",
    company: "-",
    website: "-",
    supervisor: "Sarah Wilson",
  },
  {
    user: "Emily Chen",
    email: "raja12@.com",
    type: "External",
    department: "Sales",
    role: "Account Manager",
    company: "-",
    website: "techcorp.com",
    supervisor: "Wilson",
  },
  {
    user: "Alex Satrio",
    email: "raja12@.com",
    type: "Internal",
    department: "Customer Support",
    role: "Manager",
    company: "techcorp.com",
    website: "-",
    supervisor: "Sarah Wilson",
  },
  {
    user: "Alex Satrio",
    email: "raja12@.com",
    type: "Internal",
    department: "Customer Support",
    role: "Manager",
    company: "-",
    website: "-",
    supervisor: "Sarah Wilson",
  },
  {
    user: "Emily Chen",
    email: "raja12@.com",
    type: "External",
    department: "Sales",
    role: "Account Manager",
    company: "-",
    website: "techcorp.com",
    supervisor: "Wilson",
  },
];

const INTERNAL_COUNT = 68;
const EXTERNAL_COUNT = 118;
const TOTAL_ENTRIES = "256K";

export default function OverviewPage() {
  const theme = useTheme() as AppTheme;
  const [department, setDepartment] = useState("Human Resources");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageCount = 2;
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [userType, setUserType] = useState<"Internal" | "External">("Internal");
  const [parentCompany, setParentCompany] = useState("Support Manager");
  const [pocType, setPocType] = useState("Sales");
  const [childCompany, setChildCompany] = useState("John Wick");
  const [websiteValue, setWebsiteValue] = useState("John Wick");
  const [roleValue, setRoleValue] = useState("Support Manager");
  const [departmentValue, setDepartmentValue] = useState("Sales");

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return USERS.filter((row) => {
      const matchesDepartment = department ? row.department === department : true;

      if (!query) {
        return matchesDepartment;
      }

      const matchesSearch =
        String(row.user).toLowerCase().includes(query) ||
        String(row.email).toLowerCase().includes(query) ||
        String(row.type).toLowerCase().includes(query) ||
        String(row.department).toLowerCase().includes(query) ||
        String(row.role).toLowerCase().includes(query) ||
        String(row.company).toLowerCase().includes(query) ||
        String(row.website).toLowerCase().includes(query) ||
        String(row.supervisor).toLowerCase().includes(query);

      return matchesDepartment && matchesSearch;
    });
  }, [department, search]);

  const columns = useMemo<DataTableColumn<UserRow>[]>(
    () => [
      {
        id: "user",
        label: "User",
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
              {(String(row.user ?? "").charAt(0) || "U").toUpperCase()}
            </Avatar>
            <Typography component="span" variant="body2" color="white" fontWeight={500}>
              {String(value ?? "—")}
            </Typography>
          </Box>
        ),
      },
      { id: "email", label: "Email", cellVariant: "muted" },
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
              bgcolor:
                String(value) === "Internal"
                  ? theme.app.dashboard.blueTintBg
                  : theme.app.dashboard.pinkTintBg,
              color:
                String(value) === "Internal"
                  ? theme.app.dashboard.blueTint
                  : theme.app.dashboard.accentPinkLight,
            }}
          >
            {String(value ?? "—")}
          </Box>
        ),
      },
      { id: "department", label: "Department", cellVariant: "default" },
      { id: "role", label: "Role", cellVariant: "muted" },
      { id: "company", label: "Company", cellVariant: "muted" },
      { id: "website", label: "Website", cellVariant: "muted" },
      { id: "supervisor", label: "Supervisor", cellVariant: "muted" },
    ],
    [theme]
  );

  return (
    <Box sx={overviewPageWrapper}>
      <Box sx={overviewHeader}>
        <Typography variant="regularLarge" fontWeight={700} color="white">
          Overview
        </Typography>
        <Box sx={overviewAddButtonWrapper}>
          <Button
            variant="primary"
            sx={overviewAddButton}
            onClick={() => setIsAddOpen(true)}
          >
            <AddCircleIcon width={16} height={16} />
            <Typography component="span" variant="medium" sx={{ color: "inherit" }}>
              Add New User
            </Typography>
          </Button>
        </Box>
      </Box>

      <Box sx={overviewCardsRow}>
        <DashboardCard sx={overviewCard}>
          <Typography variant="mediumLarge" color="white" fontWeight={500}>
            Department Filter
          </Typography>
          <TextField
            select
            fullWidth
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            variant="outlined"
            {...outlineFieldCursorEventProps}
            sx={[textFieldStyles(theme), ...selectFieldStyles(theme)]}
            SelectProps={{
              MenuProps: {
                sx: {
                  zIndex: 1600,
                },
                PaperProps: {
                  sx: selectMenuPaperSx(theme),
                },
              },
            }}
          >
            {DEPARTMENTS.map((opt) => (
              <MenuItem
                key={opt}
                value={opt}
                sx={selectMenuItemSx(theme)}
              >
                {opt}
              </MenuItem>
            ))}
          </TextField>
        </DashboardCard>

        <DashboardCard sx={overviewCard}>
          <Typography variant="mediumLarge" color="white" fontWeight={500}>
            Internal Users
          </Typography>
          <Box sx={overviewStatValue}>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{ color: theme.app.dashboard.accentBlue, lineHeight: 1.2 }}
            >
              {INTERNAL_COUNT}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
              /Active
            </Typography>
          </Box>
        </DashboardCard>

        <DashboardCard sx={overviewCard}>
          <Typography variant="mediumLarge" color="white" fontWeight={500}>
            External Users
          </Typography>
          <Box sx={overviewStatValue}>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{ color: theme.app.dashboard.accentBlue, lineHeight: 1.2 }}
            >
              {EXTERNAL_COUNT}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
              /Active
            </Typography>
          </Box>
        </DashboardCard>
      </Box>

      <DashboardCard sx={overviewTableCard}>
        <Box sx={overviewTableCardHeader}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={overviewIconBox}>
              <AttachMoneyIcon sx={{ fontSize: 20, color: "white" }} />
            </Box>
            <Typography variant="mediumLarge" color="white">
              Your Heading Here
            </Typography>
          </Box>
          <Box sx={overviewSearchRow}>
            <Box sx={overviewSearchFieldWrapper}>
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search anything..."
                sx={{ minWidth: "100%" }}
              />
            </Box>
            <FilterButton sx={{ whiteSpace: "nowrap" }} />
          </Box>
        </Box>

        <DataTable<UserRow>
          columns={columns}
          rows={filteredRows}
          getRowId={(row, idx) => `${row.user}-${row.email}-${idx}`}
          minWidth={1100}
          actionColumn={{
            label: "Action",
            render: () => (
              <IconButton size="small" sx={dataTableActionButton}>
                <MoreHorizIcon fontSize="small" />
              </IconButton>
            ),
          }}
        />

        <Box sx={overviewFooterRow}>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
            Showing data 1 to {filteredRows.length} of {TOTAL_ENTRIES} entries
          </Typography>
          <Box sx={overviewPaginationWrapper}>
            <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
          </Box>
        </Box>
      </DashboardCard>
      <FormModal
        open={isAddOpen}
        title="Add New User"
        description="Create a new user account with appropriate access levels."
        onClose={() => setIsAddOpen(false)}
        onSave={() => setIsAddOpen(false)}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
            mb: 3,
          }}
        >
          <InputField label="First Name" placeholder="First Name" />
          <InputField label="Last Name" placeholder="Last Name" />
          <InputField label="Email Address" placeholder="Email Address" />
          <InputField label="Phone Number" placeholder="Phone Number" />
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="mediumLarge" color="white">
            User Type & Access
          </Typography>
          <Typography
            variant="medium"
            sx={{ color: theme.app.dashboard.textMuted, cursor: "pointer" }}
          >
            Select All
          </Typography>
        </Box>

        <Divider/>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
            mb: 3,
          }}
        >
          <DashboardCard
            sx={{
              p: 2,
              borderRadius: 2,
              cursor: "pointer",
              background:
                userType === "Internal"
                  ? theme.app.dashboard.navActiveBg
                  : theme.app.dashboard.cardBg,
            }}
            onClick={() => setUserType("Internal")}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <Radio
                checked={userType === "Internal"}
                onChange={() => setUserType("Internal")}
                value="Internal"
                disableRipple
                icon={
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: "9999px",
                      border: "2px solid rgba(148,163,184,0.6)",
                      bgcolor: "transparent",
                    }}
                  />
                }
                checkedIcon={
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: "9999px",
                      bgcolor: theme.app.dashboard.accentGreen,
                      boxShadow: "0 0 0 4px rgba(34,197,94,0.35)",
                    }}
                  />
                }
                sx={{ p: 0.25 }}
              />
              <Box>
                <Typography variant="medium" color="white" sx={{ mb: 0.25 }}>
                  Internal User
                </Typography>
                <Typography
                  variant="small"
                  sx={{ color: theme.app.dashboard.textMuted }}
                >
                  Team member with company email
                </Typography>
              </Box>
            </Box>
          </DashboardCard>

          <DashboardCard
            sx={{
              p: 2,
              borderRadius: 2,
              cursor: "pointer",
              background:
                userType === "External"
                  ? theme.app.dashboard.navActiveBg
                  : theme.app.dashboard.cardBg,
            }}
            onClick={() => setUserType("External")}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <Radio
                checked={userType === "External"}
                onChange={() => setUserType("External")}
                value="External"
                disableRipple
                icon={
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: "9999px",
                      border: "2px solid rgba(148,163,184,0.6)",
                      bgcolor: "transparent",
                    }}
                  />
                }
                checkedIcon={
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: "9999px",
                      bgcolor: theme.app.dashboard.accentGreen,
                      boxShadow: "0 0 0 4px rgba(34,197,94,0.35)",
                    }}
                  />
                }
                sx={{ p: 0.25 }}
              />
              <Box>
                <Typography variant="medium" color="white" sx={{ mb: 0.25 }}>
                  External User
                </Typography>
                <Typography
                  variant="small"
                  sx={{ color: theme.app.dashboard.textMuted }}
                >
                  Team member with company email
                </Typography>
              </Box>
            </Box>
          </DashboardCard>
        </Box>

        {userType === "External" && (
          <>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
                mb: 2,
              }}
            >
              <SelectField
                label="Parent Company"
                value={parentCompany}
                onChange={setParentCompany}
                options={[
                  { label: "Support Manager", value: "Support Manager" },
                  { label: "TechCorp", value: "TechCorp" },
                ]}
              />
              <SelectField
                label="POC Type"
                value={pocType}
                onChange={setPocType}
                options={[
                  { label: "Sales", value: "Sales" },
                  { label: "Support", value: "Support" },
                ]}
              />
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
                mb: 2,
              }}
            >
              <SelectField
                label="Child Companies"
                value={childCompany}
                onChange={setChildCompany}
                options={[
                  { label: "John Wick", value: "John Wick" },
                  { label: "Jane Doe", value: "Jane Doe" },
                ]}
              />
              <SelectField
                label="Websites"
                value={websiteValue}
                onChange={setWebsiteValue}
                options={[
                  { label: "John Wick", value: "John Wick" },
                  { label: "acme.com", value: "acme.com" },
                ]}
              />
            </Box>
          </>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
            mb: 2,
          }}
        >
          <SelectField
            label="Role"
            value={roleValue}
            onChange={setRoleValue}
            options={[
              { label: "Support Manager", value: "Support Manager" },
              { label: "Agent", value: "Agent" },
            ]}
          />
          <SelectField
            label="Department"
            value={departmentValue}
            onChange={setDepartmentValue}
            options={DEPARTMENTS.map((dep) => ({ label: dep, value: dep }))}
          />
        </Box>

        <InputField label="Supervisor" placeholder="John Wick" />
      </FormModal>
    </Box>
  );
}
