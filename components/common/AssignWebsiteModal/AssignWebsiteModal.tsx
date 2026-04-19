"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { FORM_MODAL_MUI_OVERLAY_Z_INDEX } from "@/lib/ui/dialogStacking";
import {
  applyOutlineFieldCursorPosition,
  resetOutlineFieldCursorPosition,
} from "@/components/common/InputField/outlineFieldCursor";
import { textFieldStyles } from "@/components/common/InputField/InputField.styles";
import {
  selectFieldStyles,
  selectMenuItemSx,
  selectMenuPaperSx,
} from "@/components/common/SelectField/SelectField.styles";
import {
  Checkbox,
  DashboardCard,
  DataTable,
  FormModal,
  InputField,
  SelectField,
  SendLicenseConfirmModal,
  Typography,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import {
  assignWebsiteFormGridSx,
  assignWebsiteUserListCardSx,
  assignWebsiteUserListIconSx,
} from "./assign-website-modal.styles";

const PARENT_OPTIONS = [{ label: "Raja Saif", value: "raja" }];
const CHILD_OPTIONS = [{ label: "Alpha - Alpha Enterprise", value: "alpha" }];
const USER_TYPE_OPTIONS = [{ label: "Alpha - Alpha Enterprise", value: "alpha" }];

const RANK_OPTIONS = [
  { label: "Primary", value: "Primary" },
  { label: "Secondary", value: "Secondary" },
  { label: "Backup", value: "Backup" },
];

type Rank = "Primary" | "Secondary" | "Backup";

interface UserListRow extends Record<string, unknown> {
  id: string;
  username: string;
  department: string;
  rank: Rank;
}

const USER_LIST_ROWS: UserListRow[] = [
  { id: "1", username: "Ronald Richards", department: "Sales", rank: "Backup" },
  { id: "2", username: "Eleanor Pena", department: "Marketing", rank: "Primary" },
  { id: "3", username: "Albert Flores", department: "Sales", rank: "Secondary" },
];

export interface AssignWebsiteModalProps {
  open: boolean;
  onClose: () => void;
  onAssign?: () => void;
}

export function AssignWebsiteModal({ open, onClose, onAssign }: AssignWebsiteModalProps) {
  const theme = useTheme() as AppTheme;
  const [confirmSendOpen, setConfirmSendOpen] = useState(false);

  useEffect(() => {
    if (!open) setConfirmSendOpen(false);
  }, [open]);

  const [parentCompany, setParentCompany] = useState("raja");
  const [childCompany, setChildCompany] = useState("alpha");
  const [website, setWebsite] = useState("www.figma.com");
  const [userType, setUserType] = useState("alpha");

  const [selected, setSelected] = useState<Set<string>>(() => new Set(["1", "3"]));
  const [ranks, setRanks] = useState<Record<string, Rank>>(() => ({
    "1": "Backup",
    "2": "Primary",
    "3": "Secondary",
  }));

  const toggleRow = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    const ids = USER_LIST_ROWS.map((r) => r.id);
    setSelected((prev) => {
      const allOn = ids.length > 0 && ids.every((id) => prev.has(id));
      if (allOn) return new Set();
      return new Set(ids);
    });
  }, []);

  const allSelected = USER_LIST_ROWS.length > 0 && USER_LIST_ROWS.every((r) => selected.has(r.id));
  const someSelected = selected.size > 0 && !allSelected;

  const rankSelectSx = useMemo(
    () => [
      textFieldStyles(theme),
      ...selectFieldStyles(theme),
      {
        "& .MuiOutlinedInput-root": {
          minHeight: 40,
        },
        "& .MuiSelect-select": {
          color: theme.app.text.primary,
          fontFamily: "Manrope",
          fontWeight: 500,
          fontSize: "14px",
          py: 1,
          display: "flex",
          alignItems: "center",
        },
        "& .MuiSelect-icon": {
          color: theme.app.text.iconMuted,
        },
      },
    ],
    [theme]
  );

  const columns = useMemo<DataTableColumn<UserListRow>[]>(
    () => [
      {
        id: "select",
        label: "Select",
        headerRender: () => (
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected}
            onChange={toggleAll}
            inputProps={{ "aria-label": "Select all users" }}
          />
        ),
        render: (_, row) => (
          <Checkbox
            checked={selected.has(row.id)}
            onChange={() => toggleRow(row.id)}
            inputProps={{ "aria-label": `Select ${row.username}` }}
          />
        ),
      },
      { id: "username", label: "Username" },
      { id: "department", label: "Department", cellVariant: "muted" },
      {
        id: "rank",
        label: "Rank",
        render: (_, row) => (
          <TextField
            id={`rank-select-${row.id}`}
            select
            size="small"
            fullWidth
            value={ranks[row.id] ?? row.rank}
            onChange={(e) =>
              setRanks((prev) => ({
                ...prev,
                [row.id]: e.target.value as Rank,
              }))
            }
            onMouseMove={applyOutlineFieldCursorPosition}
            onMouseLeave={resetOutlineFieldCursorPosition}
            sx={rankSelectSx}
            SelectProps={{
              MenuProps: {
                sx: { zIndex: FORM_MODAL_MUI_OVERLAY_Z_INDEX },
                PaperProps: { sx: selectMenuPaperSx(theme) },
              },
            }}
          >
            {RANK_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value} sx={selectMenuItemSx(theme)}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        ),
      },
    ],
    [allSelected, someSelected, toggleAll, toggleRow, selected, ranks, rankSelectSx, theme]
  );

  const handleAssignClick = () => {
    setConfirmSendOpen(true);
  };

  const handleConfirmSend = () => {
    setConfirmSendOpen(false);
    onAssign?.();
    onClose();
  };

  const handleDismissConfirm = () => {
    setConfirmSendOpen(false);
  };

  return (
    <>
    <FormModal
      open={open}
      fitContent
      title="Assign Website"
      description="Create a new user account with appropriate access levels."
      maxWidth={920}
      onClose={onClose}
      onSave={handleAssignClick}
      cancelButtonLabel="Cancel"
      primaryButtonLabel="Assign"
      primaryStartIcon={<AutoAwesome sx={{ fontSize: 18 }} />}
      sx={{
        borderRadius: 3,
        p: { xs: 2, sm: 3 },
      }}
    >
      <Box sx={assignWebsiteFormGridSx}>
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
        <InputField
          label="Website"
          name="website"
          placeholder="Website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
        <SelectField label="User Type" value={userType} onChange={setUserType} options={USER_TYPE_OPTIONS} />
      </Box>

      <Typography variant="mediumLarge" fontWeight={600} sx={{ color: theme.app.text.primary, mt: 0.5 }}>
        Add User
      </Typography>

      <DashboardCard sx={assignWebsiteUserListCardSx}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={assignWebsiteUserListIconSx} aria-hidden>
            $
          </Box>
          <Typography variant="mediumLarge" color="white" fontWeight={600}>
            User List
          </Typography>
        </Box>

        <DataTable<UserListRow>
          columns={columns}
          rows={USER_LIST_ROWS}
          getRowId={(row) => row.id}
          minWidth={560}
          size="medium"
          scrollY={false}
        />
      </DashboardCard>
    </FormModal>

    <SendLicenseConfirmModal
      open={confirmSendOpen}
      onDismiss={handleDismissConfirm}
      onConfirm={handleConfirmSend}
    />
    </>
  );
}
