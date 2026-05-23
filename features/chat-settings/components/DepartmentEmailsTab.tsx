"use client";

import { useEffect, useState } from "react";
import Add from "@mui/icons-material/Add";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import IconButton from "@mui/material/IconButton";
import { Button, InputField } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import type { DepartmentNotifyEmailRow } from "@/services/chat/chat-settings.types";
import type { CatalogOption } from "../utils/catalog";

type EmailDraft = {
  departmentId: string;
  email: string;
  label: string;
  isPrimary: boolean;
  sortOrder: number;
};

interface DepartmentEmailsTabProps {
  rows: DepartmentNotifyEmailRow[];
  departments: CatalogOption[];
  canEdit: boolean;
  saving: boolean;
  onSave: (items: EmailDraft[]) => void;
}

function toDraft(row: DepartmentNotifyEmailRow): EmailDraft {
  return {
    departmentId: row.departmentId,
    email: row.email,
    label: row.label ?? "",
    isPrimary: Boolean(row.isPrimary),
    sortOrder: row.sortOrder ?? 0,
  };
}

export function DepartmentEmailsTab({
  rows,
  departments,
  canEdit,
  saving,
  onSave,
}: DepartmentEmailsTabProps) {
  const [items, setItems] = useState<EmailDraft[]>(() => rows.map(toDraft));

  useEffect(() => {
    setItems(rows.map(toDraft));
  }, [rows]);

  const addRow = () => {
    const dept = departments[0]?.id ?? "";
    setItems((prev) => [
      ...prev,
      { departmentId: dept, email: "", label: "", isPrimary: false, sortOrder: prev.length },
    ]);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 720 }}>
      {items.map((item, index) => (
        <Box
          key={`email-${index}`}
          sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr auto" }, gap: 1.5 }}
        >
          <FormControl size="small" disabled={!canEdit}>
            <InputLabel>Department</InputLabel>
            <Select
              label="Department"
              value={item.departmentId}
              onChange={(e) =>
                setItems((prev) =>
                  prev.map((row, i) =>
                    i === index ? { ...row, departmentId: e.target.value } : row,
                  ),
                )
              }
            >
              {departments.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <InputField
            label="Email"
            disabled={!canEdit}
            value={item.email}
            onChange={(e) =>
              setItems((prev) =>
                prev.map((row, i) => (i === index ? { ...row, email: e.target.value } : row)),
              )
            }
          />
          <InputField
            label="Label"
            disabled={!canEdit}
            value={item.label}
            onChange={(e) =>
              setItems((prev) =>
                prev.map((row, i) => (i === index ? { ...row, label: e.target.value } : row)),
              )
            }
          />
          {canEdit ? (
            <IconButton
              aria-label="Remove email"
              onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
            >
              <DeleteOutline />
            </IconButton>
          ) : null}
        </Box>
      ))}

      {canEdit ? (
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Button type="button" variant="outlined" startIcon={<Add />} onClick={addRow}>
            Add email
          </Button>
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            disabled={saving}
            onClick={() =>
              onSave(
                items.filter((i) => i.email.trim() && i.departmentId),
              )
            }
          >
            {saving ? "Saving…" : "Save department emails"}
          </Button>
        </Box>
      ) : null}
    </Box>
  );
}
