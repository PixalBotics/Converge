"use client";

import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import type { NormalizedPocDisplayRow } from "@/lib/companies/parent-detail-pocs";

const sectionOverlineSx = (theme: AppTheme) => ({
  display: "block",
  letterSpacing: "0.04em",
  fontSize: "0.6875rem",
  fontWeight: 600,
  color: theme.app.dashboard.textMuted,
  mb: 1.25,
});

/** Read-only POC list (shared by edit flow and detail page). */
export function CompanyPocSummaryBlock({
  title = "Primary contact",
  rows,
}: {
  title?: string;
  rows: NormalizedPocDisplayRow[];
}) {
  const theme = useTheme() as AppTheme;
  const line = theme.app.dashboard.cardBorder;

  return (
    <Box
      sx={{
        width: "100%",
        mt: 0.5,
        pt: 2.25,
        borderTop: `1px solid ${alpha(line, 0.85)}`,
      }}
    >
      <Typography component="h3" sx={{ ...sectionOverlineSx(theme), mb: 1.1 }}>
        {title}
      </Typography>
      {rows.length === 0 ? (
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.6 }}>
          No contact linked to this company yet.
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: rows.length > 1 ? 2.25 : 0 }}>
          {rows.map((row, idx) => (
            <Box
              key={row.key}
              sx={{
                pl: 1.5,
                borderLeft: `2px solid ${alpha(theme.app.dashboard.accentBlue, 0.55)}`,
                display: "flex",
                flexDirection: "column",
                gap: 0.75,
                pt: idx > 0 ? 2 : 0,
                mt: idx > 0 ? 0.5 : 0,
                borderTop: idx > 0 ? `1px solid ${alpha(line, 0.5)}` : "none",
              }}
            >
              {rows.length > 1 ? (
                <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, fontWeight: 500 }}>
                  Contact {idx + 1}
                </Typography>
              ) : null}
              <Typography
                variant="body1"
                sx={{ color: theme.app.dashboard.white95, fontWeight: 600, lineHeight: 1.35 }}
              >
                {row.name}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.55 }}>
                {[row.email, row.phone].filter((s) => String(s).trim().length > 0).join(" · ") || "—"}
              </Typography>
              {row.departmentName || row.designationTitle ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.35, mt: 0.25 }}>
                  {row.departmentName ? (
                    <Typography variant="body2" sx={{ color: alpha(theme.app.dashboard.white95, 0.92) }}>
                      <Box component="span" sx={{ color: theme.app.dashboard.textMuted, mr: 0.75 }}>
                        Department
                      </Box>
                      {row.departmentName}
                      {row.departmentDetails ? (
                        <Box component="span" sx={{ color: theme.app.dashboard.textMuted }}>
                          {" "}
                          · {row.departmentDetails}
                        </Box>
                      ) : null}
                    </Typography>
                  ) : null}
                  {row.designationTitle ? (
                    <Typography variant="body2" sx={{ color: alpha(theme.app.dashboard.white95, 0.92) }}>
                      <Box component="span" sx={{ color: theme.app.dashboard.textMuted, mr: 0.75 }}>
                        Role
                      </Box>
                      {row.designationTitle}
                      {row.designationDetails ? (
                        <Box component="span" sx={{ color: theme.app.dashboard.textMuted }}>
                          {" "}
                          · {row.designationDetails}
                        </Box>
                      ) : null}
                    </Typography>
                  ) : null}
                </Box>
              ) : null}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
