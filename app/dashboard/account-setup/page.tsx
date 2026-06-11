"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, DashboardCard, InputField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { pageWrapper } from "../dashboard.styles";
import {
  accountSetupDashboardCardSx,
  accountSetupGridSx,
  accountSetupSectionIconSx,
} from "./account-setup.styles";

export default function AccountSetupPage() {
  const theme = useTheme() as AppTheme;
  const [companyName, setCompanyName] = useState("Jeera");
  const [email, setEmail] = useState("rajasaifali125@gmail.com");
  const [phone, setPhone] = useState("+920313939237");
  const [address, setAddress] = useState("Your Address Here");
  const [password, setPassword] = useState("Saif1234@");
  const [confirmPassword, setConfirmPassword] = useState("Saif1234@");

  return (
    <Box sx={[pageWrapper, { width: "100%" }] as SxProps<Theme>}>
      <Typography
        variant="regularLarge"
        sx={{
          color: theme.app.text.primary,
          mb: { xs: 2, sm: 2.5 },
          letterSpacing: "0.02em",
        }}
      >
        Account Setup
      </Typography>

      <DashboardCard sx={accountSetupDashboardCardSx}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.75,
            position: "relative",
            zIndex: 1,
            minWidth: 0,
          }}
        >
          <Box component="span" aria-hidden sx={accountSetupSectionIconSx}>
            $
          </Box>
          <Typography
            component="h2"
            sx={{
              fontFamily: theme.typography.fontFamily,
              fontWeight: 700,
              fontSize: { xs: "1.05rem", sm: "1.125rem" },
              lineHeight: 1.25,
              color: theme.app.text.primary,
            }}
          >
            Basic Information
          </Typography>
        </Box>

        <Box sx={accountSetupGridSx}>
          <InputField
            label="Reseller / Company Name"
            name="companyName"
            id="account-setup-company"
            placeholder="Reseller / Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            inputProps={{ maxLength: 120 }}
          />
          <InputField
            label="Email"
            name="email"
            id="account-setup-email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            inputProps={{ maxLength: 254 }}
          />
          <InputField
            label="Phone Number"
            name="phone"
            id="account-setup-phone"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputProps={{ maxLength: 32 }}
          />
          <InputField
            label="Address"
            name="address"
            id="account-setup-address"
            placeholder="Your Address Here"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            inputProps={{ maxLength: 200 }}
          />
          <InputField
            label="Password"
            name="password"
            id="account-setup-password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            inputProps={{ maxLength: 128 }}
          />
          <InputField
            label="Confirm Password"
            name="confirmPassword"
            id="account-setup-confirm-password"
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            inputProps={{ maxLength: 128 }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 1.5,
            pt: { xs: 0.5, sm: 1 },
            position: "relative",
            zIndex: 1,
          }}
        >
          <Button type="button" variant="secondary">
            Cancel
          </Button>
          <Button type="button" variant="primary" sx={gradientPrimaryButtonSx}>
            Next
          </Button>
        </Box>
      </DashboardCard>
    </Box>
  );
}
