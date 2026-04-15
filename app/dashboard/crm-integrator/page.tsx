"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  Checkbox,
  DashboardCard,
  InputField,
  SelectField,
  Typography,
} from "@/components/common";
import { filterChromeButtonSx } from "@/components/common/FilterButton/filter-button.styles";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { resolveSx } from "@/utils/resolveSx";
import {
  crmIntegratorCardSx,
  crmIntegratorCardTitleRow,
  crmIntegratorFooterRow,
  crmIntegratorFormConfigGrid,
  crmIntegratorMappingPill,
  crmIntegratorPageHeader,
  crmIntegratorPageWrapper,
  crmIntegratorSectionIconBox,
  crmIntegratorTwoColumnGrid,
} from "./crm-integrator.styles";

const CLIENT_OPTIONS = [{ label: "Jeera", value: "jeera" }];
const PARENT_OPTIONS = [
  { label: "Select Parent Company", value: "" },
  { label: "ABC Holding", value: "abc-holding" },
];
const CHILD_OPTIONS = [
  { label: "Select Company", value: "" },
  { label: "ABC Lahore", value: "lahore" },
  { label: "ABC Karachi", value: "karachi" },
];
const WEBSITE_OPTIONS = [
  { label: "Select Website", value: "" },
  { label: "Jeera", value: "jeera-site" },
  { label: "example.com", value: "example" },
];

const FIELD_MAPPING_ROWS: { left: string; right: string }[] = [
  { left: "Visitor Name :", right: "Raja Saif" },
  { left: "CRM Contact Name", right: "Raja Saif" },
  { left: "Email", right: "rajasaif@gmail" },
  { left: "CRM Email", right: "rajasaif@gmail" },
  { left: "Phone", right: "23468799009" },
  { left: "CRM Phone", right: "68799009" },
  { left: "Chat Transcript", right: "9009" },
  { left: "CRM Notes", right: "9009" },
];

export default function CrmIntegratorPage() {
  const theme = useTheme() as AppTheme;
  const [clientOf, setClientOf] = useState("jeera");
  const [parentCompany, setParentCompany] = useState("");
  const [childCompany, setChildCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [formName, setFormName] = useState("CRM Lead Form");
  const [visitorInfo, setVisitorInfo] = useState(true);
  const [deviceInfo, setDeviceInfo] = useState(true);
  const [chatConversation, setChatConversation] = useState(true);
  const [pageInformation, setPageInformation] = useState(false);

  return (
    <Box sx={crmIntegratorPageWrapper}>
      <Box sx={crmIntegratorPageHeader}>
        <Typography variant="regularLarge" fontWeight={700} color="white" sx={{ mb: 0.5 }}>
          CRM Integrator
        </Typography>
        <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 720 }}>
          Form Configuration & Mapping.
        </Typography>
      </Box>

      <Box sx={crmIntegratorTwoColumnGrid}>
        {/* Left: Organization Selection */}
        <DashboardCard sx={crmIntegratorCardSx}>
          <Box sx={crmIntegratorCardTitleRow}>
            <Box sx={crmIntegratorSectionIconBox} aria-hidden>
              <Typography
                sx={{
                  color: theme.app.dashboard.white95,
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  lineHeight: 1,
                }}
              >
                $
              </Typography>
            </Box>
            <Typography variant="mediumLarge" color="white" fontWeight={600}>
              Organization Selection
            </Typography>
          </Box>
          <SelectField label="Client Of" value={clientOf} onChange={setClientOf} options={CLIENT_OPTIONS} />
          <SelectField
            label="Parent Company"
            value={parentCompany}
            onChange={setParentCompany}
            options={PARENT_OPTIONS}
          />
          <SelectField
            label="Child Company"
            value={childCompany}
            onChange={setChildCompany}
            options={CHILD_OPTIONS}
          />
          <SelectField label="Website" value={website} onChange={setWebsite} options={WEBSITE_OPTIONS} />
        </DashboardCard>

        {/* Right: Form Configuration */}
        <DashboardCard sx={crmIntegratorCardSx}>
          <Box sx={crmIntegratorCardTitleRow}>
            <Box sx={crmIntegratorSectionIconBox} aria-hidden>
              <Typography
                sx={{
                  color: theme.app.dashboard.white95,
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  lineHeight: 1,
                }}
              >
                $
              </Typography>
            </Box>
            <Typography variant="mediumLarge" color="white" fontWeight={600}>
              Form Configuration
            </Typography>
          </Box>

          <InputField
            label="Form Name"
            name="formName"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />

          <Box sx={crmIntegratorFormConfigGrid}>
            {/* Included Sections */}
            <Box>
              <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: 1.5, fontWeight: 600 }}>
                Included Sections
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                <FormControlLabel
                  control={
                    <Checkbox checked={visitorInfo} onChange={(e) => setVisitorInfo(e.target.checked)} />
                  }
                  label={
                    <Typography variant="medium" sx={{ color: theme.app.text.primary }}>
                      Visitor Information
                    </Typography>
                  }
                  sx={{ ml: 0, alignItems: "center", gap: 1 }}
                />
                <FormControlLabel
                  control={
                    <Checkbox checked={deviceInfo} onChange={(e) => setDeviceInfo(e.target.checked)} />
                  }
                  label={
                    <Typography variant="medium" sx={{ color: theme.app.text.primary }}>
                      Device Information
                    </Typography>
                  }
                  sx={{ ml: 0, alignItems: "center", gap: 1 }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={chatConversation}
                      onChange={(e) => setChatConversation(e.target.checked)}
                    />
                  }
                  label={
                    <Typography variant="medium" sx={{ color: theme.app.text.primary }}>
                      Chat Conversation
                    </Typography>
                  }
                  sx={{ ml: 0, alignItems: "center", gap: 1 }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={pageInformation}
                      onChange={(e) => setPageInformation(e.target.checked)}
                    />
                  }
                  label={
                    <Typography variant="medium" sx={{ color: theme.app.text.primary }}>
                      Page Information
                    </Typography>
                  }
                  sx={{ ml: 0, alignItems: "center", gap: 1 }}
                />
              </Box>
            </Box>

            {/* Field Mapping */}
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: 1.5, fontWeight: 600 }}>
                Field Mapping
              </Typography>
              <Box
                sx={{
                  position: "relative",
                  pl: { xs: 0, sm: 1 },
                  borderLeft: { xs: "none", sm: `2px solid ${theme.app.dashboard.cardBorder}` },
                }}
              >
                {FIELD_MAPPING_ROWS.map((row, i) => (
                  <Box
                    key={`${row.left}-${i}`}
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: { xs: "stretch", sm: "center" },
                      gap: { xs: 0.75, sm: 1.5 },
                      mb: i < FIELD_MAPPING_ROWS.length - 1 ? 2 : 0,
                      position: "relative",
                    }}
                  >
                    <Box
                      sx={{
                        display: { xs: "none", sm: "block" },
                        position: "absolute",
                        left: -5,
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: theme.app.dashboard.white95,
                        border: `1px solid ${theme.app.dashboard.cardBorder}`,
                      }}
                    />
                    <Typography
                      variant="medium"
                      sx={{
                        color: theme.app.dashboard.textMuted,
                        minWidth: { sm: 140 },
                        flexShrink: 0,
                        textAlign: { sm: "right" },
                      }}
                    >
                      {row.left}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1, minWidth: 0 }}>
                      <Box
                        sx={{
                          display: { xs: "none", sm: "block" },
                          height: 2,
                          width: 28,
                          flexShrink: 0,
                          borderRadius: 1,
                          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                          opacity: 0.95,
                        }}
                      />
                      <Box component="span" sx={crmIntegratorMappingPill}>
                        {row.right}
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          <Box sx={crmIntegratorFooterRow}>
            <Button type="button" variant="secondary">
              Save Form
            </Button>
            <Button type="button" variant="secondary" sx={resolveSx(filterChromeButtonSx, theme)}>
              Test CRM Form
            </Button>
            <Button type="button" variant="primary" sx={gradientPrimaryButtonSx}>
              Preview CRM Form
            </Button>
          </Box>
        </DashboardCard>
      </Box>
    </Box>
  );
}
