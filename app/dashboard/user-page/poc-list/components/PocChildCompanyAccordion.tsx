"use client";

import { useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import {
  BusinessOutlined as BusinessOutlinedIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { Typography } from "@/components/common";
import type { AppTheme } from "@/theme/theme";
import type { PocChildGroup } from "../utils/group-poc-directory";
import { PocContactCard } from "./PocContactCard";

const POC_PREVIEW_LIMIT = 4;

function CountBadge({ label, theme, accent }: { label: string; theme: AppTheme; accent?: boolean }) {
  const accentColor = theme.app.dashboard.accentBlue;
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        minHeight: 26,
        px: 1.25,
        py: 0,
        borderRadius: "9999px",
        fontSize: "0.72rem",
        fontWeight: 600,
        lineHeight: 1,
        letterSpacing: "0.01em",
        whiteSpace: "nowrap",
        flexShrink: 0,
        bgcolor: accent
          ? alpha(accentColor, 0.14)
          : alpha(theme.app.dashboard.white95, 0.06),
        color: accent ? accentColor : theme.app.dashboard.textMuted,
        border: `1px solid ${alpha(
          accent ? accentColor : theme.app.dashboard.cardBorder,
          accent ? 0.28 : 0.5,
        )}`,
      }}
    >
      {label}
    </Box>
  );
}

type Props = {
  child: PocChildGroup;
  expanded: boolean;
  onToggle: (open: boolean) => void;
};

export function PocChildCompanyAccordion({ child, expanded, onToggle }: Props) {
  const theme = useTheme() as AppTheme;
  const [showAllPocs, setShowAllPocs] = useState(false);
  const pocCount = child.contacts.length;
  const hasMorePocs = pocCount > POC_PREVIEW_LIMIT;
  const visibleContacts =
    showAllPocs || !hasMorePocs ? child.contacts : child.contacts.slice(0, POC_PREVIEW_LIMIT);

  return (
    <Accordion
      disableGutters
      expanded={expanded}
      onChange={(_, open) => {
        onToggle(open);
        if (!open) setShowAllPocs(false);
      }}
      sx={{
        bgcolor: alpha(theme.app.dashboard.pillBg, 0.85),
        border: `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.38)}`,
        borderRadius: "12px !important",
        overflow: "hidden",
        "&:before": { display: "none" },
        "&.Mui-expanded": { margin: 0 },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ fontSize: 20, color: theme.app.dashboard.textMuted }} />}
        sx={{
          px: 1.5,
          py: 0.5,
          minHeight: 52,
          "& .MuiAccordionSummary-content": { my: 0.75, alignItems: "center", gap: 1.25 },
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: "8px",
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            bgcolor: alpha(theme.app.dashboard.accentBlue, 0.12),
            color: theme.app.dashboard.accentBlue,
          }}
        >
          <BusinessOutlinedIcon sx={{ fontSize: 17 }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Typography
              variant="body2"
              color="white"
              fontWeight={600}
              noWrap
              sx={{ flex: "1 1 auto", minWidth: 0 }}
            >
              {child.name}
            </Typography>
            <CountBadge
              theme={theme}
              accent
              label={`${pocCount} POC${pocCount === 1 ? "" : "s"}`}
            />
          </Box>
          {!expanded ? (
            <Typography
              variant="caption"
              sx={{ color: theme.app.dashboard.textMuted, mt: 0.375, display: "block" }}
              noWrap
            >
              {pocCount} contact{pocCount === 1 ? "" : "s"} — expand to view
            </Typography>
          ) : null}
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 1.5, pb: 1.5, pt: 0.5 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: pocCount > 1 ? "repeat(2, minmax(0, 1fr))" : "1fr",
            },
            gap: 1.25,
          }}
        >
          {visibleContacts.map((contact) => (
            <PocContactCard key={contact.companyContactId} contact={contact} />
          ))}
        </Box>
        {hasMorePocs && !showAllPocs ? (
          <Box
            component="button"
            type="button"
            onClick={() => setShowAllPocs(true)}
            sx={{
              mt: 1,
              width: "100%",
              border: `1px dashed ${theme.app.dashboard.cardBorder}`,
              borderRadius: 2,
              py: 0.75,
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
              bgcolor: "transparent",
              color: theme.app.dashboard.accentBlue,
              "&:hover": { bgcolor: alpha(theme.app.dashboard.accentBlue, 0.08) },
            }}
          >
            Show all {pocCount} contacts
          </Box>
        ) : null}
      </AccordionDetails>
    </Accordion>
  );
}
