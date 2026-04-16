"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Radio from "@mui/material/Radio";
import { Typography, InputField, SelectField, FormModal, Divider, DashboardCard } from "@/components/common";
import type { AppTheme } from "@/theme/theme";

const DEPARTMENTS = [
  "Human Resources",
  "Engineering",
  "Sales",
  "Customer Support",
  "Marketing",
  "Finance",
];

export function AddUserModal({
  open,
  onClose,
  theme,
}: {
  open: boolean;
  onClose: () => void;
  theme: AppTheme;
}) {
  const [userType, setUserType] = useState<"Internal" | "External">("Internal");
  const [parentCompany, setParentCompany] = useState("Support Manager");
  const [pocType, setPocType] = useState("Sales");
  const [childCompany, setChildCompany] = useState("John Wick");
  const [websiteValue, setWebsiteValue] = useState("John Wick");
  const [roleValue, setRoleValue] = useState("Support Manager");
  const [departmentValue, setDepartmentValue] = useState("Sales");

  return (
    <FormModal
      open={open}
      title="Add New User"
      description="Create a new user account with appropriate access levels."
      onClose={onClose}
      onSave={onClose}
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

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="mediumLarge" color="white">
          User Type & Access
        </Typography>
        <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, cursor: "pointer" }}>
          Select All
        </Typography>
      </Box>

      <Divider />

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 3 }}>
        <DashboardCard
          sx={{
            p: 2,
            borderRadius: 2,
            cursor: "pointer",
            background: userType === "Internal" ? theme.app.dashboard.navActiveBg : theme.app.dashboard.cardBg,
          }}
          onClick={() => setUserType("Internal")}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Radio
              checked={userType === "Internal"}
              onChange={() => setUserType("Internal")}
              value="Internal"
              disableRipple
              icon={<Box sx={{ width: 16, height: 16, borderRadius: "9999px", border: "2px solid rgba(148,163,184,0.6)", bgcolor: "transparent" }} />}
              checkedIcon={<Box sx={{ width: 16, height: 16, borderRadius: "9999px", bgcolor: theme.app.dashboard.accentGreen, boxShadow: "0 0 0 4px rgba(34,197,94,0.35)" }} />}
              sx={{ p: 0.25 }}
            />
            <Box>
              <Typography variant="medium" color="white" sx={{ mb: 0.25 }}>
                Internal User
              </Typography>
              <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted }}>
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
            background: userType === "External" ? theme.app.dashboard.navActiveBg : theme.app.dashboard.cardBg,
          }}
          onClick={() => setUserType("External")}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Radio
              checked={userType === "External"}
              onChange={() => setUserType("External")}
              value="External"
              disableRipple
              icon={<Box sx={{ width: 16, height: 16, borderRadius: "9999px", border: "2px solid rgba(148,163,184,0.6)", bgcolor: "transparent" }} />}
              checkedIcon={<Box sx={{ width: 16, height: 16, borderRadius: "9999px", bgcolor: theme.app.dashboard.accentGreen, boxShadow: "0 0 0 4px rgba(34,197,94,0.35)" }} />}
              sx={{ p: 0.25 }}
            />
            <Box>
              <Typography variant="medium" color="white" sx={{ mb: 0.25 }}>
                External User
              </Typography>
              <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted }}>
                Team member with company email
              </Typography>
            </Box>
          </Box>
        </DashboardCard>
      </Box>

      {userType === "External" && (
        <>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 2 }}>
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

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 2 }}>
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

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 2 }}>
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
  );
}
