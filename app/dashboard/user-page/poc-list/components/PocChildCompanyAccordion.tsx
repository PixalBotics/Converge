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
  return (
    <Box
      component="span"
      sx={{
        px: 1,
        py: 0.2,
        borderRadius: "9999px",
        fontSize: "0.7rem",
        fontWeight: 600,
        whiteSpace: "nowrap",
        flexShrink: 0,
        bgcolor: accent
          ? alpha(theme.palette.primary.main, 0.18)
          : alpha(theme.app.dashboard.white95, 0.08),
        color: accent ? theme.palette.primary.light : theme.app.dashboard.textMuted,
        border: `1px solid ${alpha(theme.app.dashboard.cardBorder, accent ? 0.6 : 1)}`,
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
        bgcolor: alpha(theme.app.dashboard.white95, 0.02),
        border: `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.85)}`,
        borderRadius: "10px !important",
        overflow: "hidden",
        "&:before": { display: "none" },
        "&.Mui-expanded": { margin: 0 },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ fontSize: 20, color: theme.app.dashboard.textMuted }} />}
        sx={{
          px: 1.25,
          py: 0,
          minHeight: 48,
          "& .MuiAccordionSummary-content": { my: 0.65, alignItems: "center", gap: 1 },
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
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            color: theme.palette.primary.light,
          }}
        >
          <BusinessOutlinedIcon sx={{ fontSize: 17 }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" color="white" fontWeight={600} noWrap>
            {child.name}
          </Typography>
          {!expanded ? (
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }} noWrap>
              {pocCount} contact{pocCount === 1 ? "" : "s"} — expand to view
            </Typography>
          ) : null}
        </Box>
        <CountBadge theme={theme} accent label={`${pocCount} POC`} />
      </AccordionSummary>
      <AccordionDetails sx={{ px: 1.25, pb: 1.25, pt: 0 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: pocCount > 1 ? "repeat(2, minmax(0, 1fr))" : "1fr",
            },
            gap: 1,
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
              "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.08) },
            }}
          >
            Show all {pocCount} contacts
          </Box>
        ) : null}
      </AccordionDetails>
    </Accordion>
  );
}
