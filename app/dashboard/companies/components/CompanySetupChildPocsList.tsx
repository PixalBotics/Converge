"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import { AddCircleIcon } from "@/components/common/icons";
import { CompanySetupChildPocBlock } from "./CompanySetupChildPocBlock";
import {
  MAX_POC_PER_CHILD,
  emptyPocSlice,
  type PocDraftSlice,
} from "@/lib/companies/setup-draft.utils";
import { addAnotherButtonRight, addAnotherIcon, addAnotherLabel } from "../overview.styles";

type CompanySetupChildPocsListProps = {
  childIndex: number;
  pocRows: PocDraftSlice[];
  updatePocRow: (pocIndex: number, patch: Partial<PocDraftSlice>) => void;
  addPocRow: () => void;
  removePocRow: (pocIndex: number) => void;
  roleOptions: { value: string; label: string }[];
  departmentOptions: { value: string; label: string }[];
  rolesLoading: boolean;
  departmentsLoading: boolean;
  companySetupKind?: "new_reseller" | "existing_reseller";
  fieldErrors?: Record<string, string>;
};

export function CompanySetupChildPocsList({
  childIndex,
  pocRows,
  updatePocRow,
  addPocRow,
  removePocRow,
  roleOptions,
  departmentOptions,
  rolesLoading,
  departmentsLoading,
  companySetupKind,
  fieldErrors,
}: CompanySetupChildPocsListProps) {
  const theme = useTheme() as AppTheme;
  const multiPocOnChild = pocRows.length > 1;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, width: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
        <Typography variant="medium" color="white" fontWeight={600}>
          Points of contact
        </Typography>
        {pocRows.length < MAX_POC_PER_CHILD ? (
          <Box component="button" type="button" onClick={addPocRow} sx={addAnotherButtonRight}>
            <AddCircleIcon width={16} height={16} sx={addAnotherIcon} />
            <Typography variant="body2" sx={addAnotherLabel}>
              Add POC
            </Typography>
          </Box>
        ) : null}
      </Box>

      {pocRows.map((pocRow, pocIndex) => (
        <Box
          key={`child-${childIndex}-poc-${pocIndex}`}
          sx={{
            pt: pocIndex > 0 ? 2 : 0,
            borderTop: pocIndex > 0 ? `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.75)}` : "none",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, fontWeight: 600 }}>
              {`POC ${pocIndex + 1}`}
            </Typography>
            {pocIndex > 0 ? (
              <IconButton
                type="button"
                size="small"
                aria-label={`Remove POC ${pocIndex + 1}`}
                onClick={() => removePocRow(pocIndex)}
                sx={{ color: theme.app.dashboard.textMuted }}
              >
                <DeleteOutlineRoundedIcon sx={{ fontSize: 22 }} />
              </IconButton>
            ) : null}
          </Box>
          <CompanySetupChildPocBlock
            row={pocRow}
            childIndex={childIndex}
            pocIndex={pocIndex}
            multiPocOnChild={multiPocOnChild}
            updateChildRow={(_, patch) => updatePocRow(pocIndex, patch)}
            roleOptions={roleOptions}
            departmentOptions={departmentOptions}
            rolesLoading={rolesLoading}
            departmentsLoading={departmentsLoading}
            companySetupKind={companySetupKind}
            fieldErrors={fieldErrors}
          />
        </Box>
      ))}
    </Box>
  );
}

export { emptyPocSlice };
