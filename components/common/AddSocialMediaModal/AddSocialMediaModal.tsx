"use client";

import { useState } from "react";
import KeyboardDoubleArrowLeft from "@mui/icons-material/KeyboardDoubleArrowLeft";
import SyncAlt from "@mui/icons-material/SyncAlt";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Radio from "@mui/material/Radio";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { filterChromeButtonSx } from "@/components/common/FilterButton/filter-button.styles";
import { resolveSx } from "@/utils/resolveSx";
import { Button, FormModal, InputField, SelectField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  addSocialMediaFacebookFieldsSx,
  addSocialMediaFormGridSx,
  addSocialMediaPlatformCardSx,
  addSocialMediaPlatformIconWrapSx,
} from "./add-social-media-modal.styles";

export type SocialPlatform = "facebook" | "instagram" | "whatsapp";

const CLIENT_OPTIONS = [{ label: "Raja Saif", value: "raja" }];
const COMPANY_OPTIONS = [{ label: "Alpha - Alpha Enterprise", value: "alpha" }];
const DROPDOWN_OPTIONS = [{ label: "Raja Saif", value: "raja" }];

export interface AddSocialMediaModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: () => void;
}

function PlatformIcon({ platform }: { platform: SocialPlatform }) {
  if (platform === "facebook") {
    return (
      <Box sx={{ ...addSocialMediaPlatformIconWrapSx, bgcolor: "#1877F2" }}>
        <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "1.35rem", lineHeight: 1, fontFamily: "inherit" }}>
          f
        </Typography>
      </Box>
    );
  }
  if (platform === "instagram") {
    return (
      <Box
        sx={{
          ...addSocialMediaPlatformIconWrapSx,
          background: "linear-gradient(135deg, #F58529 0%, #DD2A7B 45%, #8134AF 100%)",
        }}
      >
        <Box
          component="span"
          sx={{
            width: 22,
            height: 22,
            border: "2px solid #fff",
            borderRadius: "6px",
            display: "block",
          }}
        />
      </Box>
    );
  }
  return (
    <Box sx={{ ...addSocialMediaPlatformIconWrapSx, bgcolor: "#25D366" }}>
      <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem", lineHeight: 1 }}>W</Typography>
    </Box>
  );
}

export function AddSocialMediaModal({ open, onClose, onSave }: AddSocialMediaModalProps) {
  const theme = useTheme() as AppTheme;

  const [client, setClient] = useState("raja");
  const [childCompany, setChildCompany] = useState("alpha");
  const [parentCompany, setParentCompany] = useState("alpha");
  const [website, setWebsite] = useState("www.figma.com");

  const [platform, setPlatform] = useState<SocialPlatform>("facebook");
  const [facebookPage, setFacebookPage] = useState("raja");
  const [instagramAccount, setInstagramAccount] = useState("raja");
  const [whatsappBusinessId, setWhatsappBusinessId] = useState("raja");
  const [pageId, setPageId] = useState("Seidf_raja1232");
  const [accessToken, setAccessToken] = useState("1234rc44");

  const handleSave = () => {
    onSave?.();
    onClose();
  };

  const connectBtnSx = resolveSx(filterChromeButtonSx, theme);

  const radioIcon = (
    <Box
      sx={{
        width: 20,
        height: 20,
        borderRadius: "50%",
        border: `2px solid ${theme.app.dashboard.iconMuted}`,
        boxSizing: "border-box",
      }}
    />
  );
  const radioCheckedIcon = (
    <Box
      sx={{
        width: 20,
        height: 20,
        borderRadius: "50%",
        border: `2px solid ${theme.palette.primary.main}`,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: theme.palette.common.white,
      }}
    >
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          bgcolor: theme.palette.primary.main,
        }}
      />
    </Box>
  );

  const PlatformCard = ({
    title,
    subtitle,
    p,
  }: {
    title: string;
    subtitle: string;
    p: SocialPlatform;
  }) => {
    const selected = platform === p;
    return (
      <Box sx={addSocialMediaPlatformCardSx(theme, selected)}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0, textAlign: "left" }}>
            <PlatformIcon platform={p} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="mediumLarge" fontWeight={600} sx={{ color: theme.app.text.primary }}>
                {title}
              </Typography>
              <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, mt: 0.25 }}>
                {subtitle}
              </Typography>
            </Box>
          </Box>
          <Radio
            disableRipple
            checked={selected}
            onChange={() => setPlatform(p)}
            value={p}
            icon={radioIcon}
            checkedIcon={radioCheckedIcon}
            inputProps={{ "aria-label": `Select ${title}` }}
            sx={{ p: 0.5 }}
          />
        </Box>
        {selected ? (
          <Button
            type="button"
            variant="primary"
            fullWidth
            startIcon={<SyncAlt sx={{ fontSize: 18 }} />}
            sx={{
              ...resolveSx(gradientPrimaryButtonSx, theme),
              py: 1.25,
            }}
          >
            Connected
          </Button>
        ) : (
          <Button
            type="button"
            variant="outlined"
            fullWidth
            startIcon={<SyncAlt sx={{ fontSize: 18 }} />}
            onClick={() => setPlatform(p)}
            sx={{
              ...connectBtnSx,
              py: 1.25,
              width: "100%",
            }}
          >
            Connect Account
          </Button>
        )}
      </Box>
    );
  };

  return (
    <FormModal
      open={open}
      title="Add Social Media Integration."
      description="Create a new user account with appropriate access levels."
      maxWidth={720}
      fitContent
      onClose={onClose}
      onSave={handleSave}
      cancelButtonLabel="Cancel"
      primaryButtonLabel="Save"
      primaryStartIcon={<KeyboardDoubleArrowLeft sx={{ fontSize: 18 }} />}
      sx={{
        borderRadius: 3,
        p: { xs: 2, sm: 3 },
      }}
    >
      <Box sx={addSocialMediaFormGridSx}>
        <SelectField label="Client" value={client} onChange={setClient} options={CLIENT_OPTIONS} />
        <SelectField label="Child Company" value={childCompany} onChange={setChildCompany} options={COMPANY_OPTIONS} />
        <SelectField label="Parent Company" value={parentCompany} onChange={setParentCompany} options={COMPANY_OPTIONS} />
        <InputField
          label="Website"
          name="website"
          placeholder="Website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </Box>

      <Box sx={{ width: "100%" }}>
        <Typography variant="mediumLarge" fontWeight={600} sx={{ color: theme.app.text.primary, mt: 0.5 }}>
          Select Platform
        </Typography>
        <Divider sx={{ mt: 1.5, mb: 0.5, borderColor: theme.app.dashboard.cardBorder, opacity: 0.9 }} />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box>
          <PlatformCard p="facebook" title="Facebook" subtitle="Manage pages and ad accounts" />
          {platform === "facebook" && (
            <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={addSocialMediaFacebookFieldsSx}>
                <SelectField
                  label="Facebook Page Name"
                  value={facebookPage}
                  onChange={setFacebookPage}
                  options={DROPDOWN_OPTIONS}
                />
                <InputField label="Page ID" name="pageIdFb" value={pageId} onChange={(e) => setPageId(e.target.value)} />
              </Box>
              <InputField label="Access Token" name="accessTokenFb" value={accessToken} onChange={(e) => setAccessToken(e.target.value)} />
            </Box>
          )}
        </Box>

        <Box>
          <PlatformCard p="instagram" title="Instagram" subtitle="Sync media and insights" />
          {platform === "instagram" && (
            <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={addSocialMediaFacebookFieldsSx}>
                <SelectField
                  label="Instagram"
                  value={instagramAccount}
                  onChange={setInstagramAccount}
                  options={DROPDOWN_OPTIONS}
                />
                <InputField label="Page ID" name="pageIdIg" value={pageId} onChange={(e) => setPageId(e.target.value)} />
              </Box>
              <InputField label="Access Token" name="accessTokenIg" value={accessToken} onChange={(e) => setAccessToken(e.target.value)} />
            </Box>
          )}
        </Box>

        <Box>
          <PlatformCard p="whatsapp" title="WhatsApp" subtitle="Automate business messaging" />
          {platform === "whatsapp" && (
            <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={addSocialMediaFacebookFieldsSx}>
                <SelectField
                  label="WhatsApp Business Account ID"
                  value={whatsappBusinessId}
                  onChange={setWhatsappBusinessId}
                  options={DROPDOWN_OPTIONS}
                />
                <InputField label="Page ID" name="pageIdWa" value={pageId} onChange={(e) => setPageId(e.target.value)} />
              </Box>
              <InputField label="Access Token" name="accessTokenWa" value={accessToken} onChange={(e) => setAccessToken(e.target.value)} />
            </Box>
          )}
        </Box>
      </Box>
    </FormModal>
  );
}
