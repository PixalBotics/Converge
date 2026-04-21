"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import BlurOnRounded from "@mui/icons-material/BlurOnRounded";
import type { SxProps, Theme } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, DashboardCard, InputField, SelectField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { pageWrapper } from "../../companies/overview.styles";
import { rolesCard, rolesIconBox, rolesPageWrapper } from "../../roles/roles.styles";
import {
  addPhoneActionsSx,
  addPhoneCardHeaderSx,
  addPhoneFetchRowSx,
  addPhoneFormGridTwoSx,
  addPhoneHeaderSx,
  addPhoneStatusLabelSx,
  addPhoneStatusRowSx,
  addPhoneSubtextSx,
} from "./add-phone-number.styles";

const ASSIGN_LEVEL_OPTIONS = [
  { label: "Food", value: "food" },
  { label: "Level 1", value: "level-1" },
  { label: "Level 2", value: "level-2" },
];

const RESELLER_OPTIONS = [
  { label: "Food", value: "food" },
  { label: "TechDistributors", value: "tech-distributors" },
];

const PARENT_COMPANY_BY_RESELLER: Record<string, { label: string; value: string }[]> = {
  food: [
    { label: "Food Group", value: "food-group" },
    { label: "Daily Foods", value: "daily-foods" },
  ],
  "tech-distributors": [
    { label: "ABC Group", value: "abc-group" },
    { label: "Vertex Group", value: "vertex-group" },
  ],
};

const CHILD_COMPANY_BY_PARENT: Record<string, { label: string; value: string }[]> = {
  "food-group": [
    { label: "Food Child A", value: "food-child-a" },
    { label: "Food Child B", value: "food-child-b" },
  ],
  "daily-foods": [{ label: "Daily Child", value: "daily-child" }],
  "abc-group": [
    { label: "Native Group", value: "native-group" },
    { label: "Cloud Group", value: "cloud-group" },
  ],
  "vertex-group": [{ label: "Matrix Group", value: "matrix-group" }],
};

export default function AddPhoneNumberPage() {
  const theme = useTheme() as AppTheme;
  const [accountSid, setAccountSid] = useState("Food");
  const [authToken, setAuthToken] = useState("Assign Department Head");
  const [selectedNumber, setSelectedNumber] = useState("Food");
  const [assignLevel, setAssignLevel] = useState("food");
  const [reseller, setReseller] = useState("food");
  const [parentCompany, setParentCompany] = useState("");
  const [childCompany, setChildCompany] = useState("");
  const [enabled, setEnabled] = useState(true);

  const parentCompanyOptions = useMemo(() => {
    const list = PARENT_COMPANY_BY_RESELLER[reseller] ?? [];
    return list.length > 0 ? list : [{ label: "No parent companies", value: "" }];
  }, [reseller]);

  const childCompanyOptions = useMemo(() => {
    if (!parentCompany) return [{ label: "Select parent company first", value: "" }];
    const list = CHILD_COMPANY_BY_PARENT[parentCompany] ?? [];
    return list.length > 0 ? list : [{ label: "No child companies", value: "" }];
  }, [parentCompany]);

  return (
    <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>
      <Box sx={addPhoneHeaderSx}>
        <Typography variant="regularLarge" fontWeight={700} color="white">
          Add Phone Number
        </Typography>
        <Typography variant="body2" sx={addPhoneSubtextSx}>
          Configure Twilio phone number and assignment
        </Typography>
      </Box>

      <DashboardCard sx={rolesCard}>
        <Box sx={addPhoneCardHeaderSx}>
          <Box sx={rolesIconBox}>
            <BlurOnRounded sx={{ fontSize: 18, color: theme.app.dashboard.white95 }} />
          </Box>
          <Typography variant="mediumLarge" color="white" fontWeight={600}>
            Twilio Configuration
          </Typography>
        </Box>

        <Box sx={addPhoneFormGridTwoSx}>
          <InputField label="Account SID" value={accountSid} onChange={(e) => setAccountSid(e.target.value)} />
          <InputField label="Auth Token" value={authToken} onChange={(e) => setAuthToken(e.target.value)} />
        </Box>

        <Box sx={addPhoneFetchRowSx}>
          <InputField
            label="Select Number"
            value={selectedNumber}
            onChange={(e) => setSelectedNumber(e.target.value)}
            sx={{ "& .MuiFormHelperText-root": { display: "none" } }}
          />
          <Box sx={{ display: "flex", alignItems: "flex-end" }}>
            <Button type="button" variant="primary" sx={{ minWidth: 132, ...(gradientPrimaryButtonSx as object) }}>
              Fetch Numbers
            </Button>
          </Box>
        </Box>
      </DashboardCard>

      <DashboardCard sx={rolesCard}>
        <Box sx={addPhoneCardHeaderSx}>
          <Box sx={rolesIconBox}>
            <BlurOnRounded sx={{ fontSize: 18, color: theme.app.dashboard.white95 }} />
          </Box>
          <Typography variant="mediumLarge" color="white" fontWeight={600}>
            Assignment
          </Typography>
        </Box>
        <Box sx={addPhoneFormGridTwoSx}>
          <SelectField label="Assign Level" value={assignLevel} onChange={setAssignLevel} options={ASSIGN_LEVEL_OPTIONS} />
          <SelectField
            label="Reseller"
            value={reseller}
            onChange={(value) => {
              setReseller(value);
              setParentCompany("");
              setChildCompany("");
            }}
            options={RESELLER_OPTIONS}
          />
          <SelectField
            label="Parent Company"
            value={parentCompany}
            onChange={(value) => {
              setParentCompany(value);
              setChildCompany("");
            }}
            options={parentCompanyOptions}
            disabled={!reseller}
          />
          <SelectField
            label="Child Company"
            value={childCompany}
            onChange={setChildCompany}
            options={childCompanyOptions}
            disabled={!parentCompany}
          />
        </Box>
      </DashboardCard>

      <DashboardCard sx={rolesCard}>
        <Box sx={addPhoneCardHeaderSx}>
          <Box sx={rolesIconBox}>
            <BlurOnRounded sx={{ fontSize: 18, color: theme.app.dashboard.white95 }} />
          </Box>
          <Typography variant="mediumLarge" color="white" fontWeight={600}>
            Status
          </Typography>
        </Box>

        <Box sx={addPhoneStatusRowSx}>
          <Box>
            <Typography variant="medium" color="white">
              Status
            </Typography>
            <Typography variant="small" sx={addPhoneStatusLabelSx}>
              Enable or disable this phone number
            </Typography>
          </Box>
          <Switch
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            color="primary"
          />
        </Box>

        <Box sx={addPhoneActionsSx}>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
          <Button type="button" variant="primary" sx={gradientPrimaryButtonSx}>
            Block IP
          </Button>
        </Box>
      </DashboardCard>
    </Box>
  );
}
