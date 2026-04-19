"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import {
  FormModal,
  InputField,
  SelectField,
  StatusRadioGroup,
  Label,
} from "@/components/common";
import { publishAppToast } from "@/lib/notify";

const DEPARTMENT_TYPE_OPTIONS = [
  { label: "Internal", value: "Internal" },
  { label: "External", value: "External" },
];

export type AddDepartmentModalProps = {
  open: boolean;
  onClose: () => void;
  /** Called after a successful save (e.g. refetch list). */
  onSaved?: () => void;
};

export function AddDepartmentModal({ open, onClose, onSaved }: AddDepartmentModalProps) {
  const [departmentName, setDepartmentName] = useState("");
  const [departmentType, setDepartmentType] = useState<"Internal" | "External">("Internal");
  const [clientOfReseller, setClientOfReseller] = useState("");
  const [parentCompany, setParentCompany] = useState("");
  const [childCompany, setChildCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");

  useEffect(() => {
    if (!open) return;
    setDepartmentName("");
    setDepartmentType("Internal");
    setClientOfReseller("");
    setParentCompany("");
    setChildCompany("");
    setWebsite("");
    setStatus("Active");
  }, [open]);

  const handleDepartmentTypeChange = (v: string) => {
    const next = v as "Internal" | "External";
    setDepartmentType(next);
    if (next === "Internal") {
      setClientOfReseller("");
      setParentCompany("");
      setChildCompany("");
      setWebsite("");
    }
  };

  const handleSave = () => {
    const name = departmentName.trim();
    if (!name) {
      publishAppToast({ variant: "error", message: "Please enter a department name." });
      return;
    }
    publishAppToast({
      variant: "success",
      message: `Department “${name}” saved (${departmentType}, ${status}).`,
    });
    onSaved?.();
    onClose();
  };

  return (
    <FormModal
      open={open}
      title="Add Department"
      description="Create a new department with the appropriate type and access levels."
      onClose={onClose}
      onSave={handleSave}
      primaryButtonLabel="Save"
      cancelButtonLabel="Cancel"
      maxWidth={560}
      fitContent
    >
      <InputField
        label="Department Name"
        placeholder="Department Name"
        value={departmentName}
        onChange={(e) => setDepartmentName(e.target.value)}
      />

      <SelectField
        label="Department Type"
        value={departmentType}
        onChange={handleDepartmentTypeChange}
        options={DEPARTMENT_TYPE_OPTIONS}
      />

      {departmentType === "External" ? (
        <>
          <InputField
            label="Client of / Reseller"
            placeholder="Client of / Reseller"
            value={clientOfReseller}
            onChange={(e) => setClientOfReseller(e.target.value)}
          />
          <InputField
            label="Parent Company"
            placeholder="Parent Company"
            value={parentCompany}
            onChange={(e) => setParentCompany(e.target.value)}
          />
          <InputField
            label="Child Company"
            placeholder="Child Company"
            value={childCompany}
            onChange={(e) => setChildCompany(e.target.value)}
          />
          <InputField
            label="Website"
            placeholder="Website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </>
      ) : null}

      <Box sx={{ ml: 1.5 }}>
        <Label variant="mediumLarge" sx={{ mb: 0.75 }}>
          Status
        </Label>
        <StatusRadioGroup value={status} onChange={setStatus} />
      </Box>
    </FormModal>
  );
}
