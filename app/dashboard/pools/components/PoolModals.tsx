"use client";

import Box from "@mui/material/Box";
import { ConfirmActionModal, FormModal, InputField, SelectField } from "@/components/common";

export type SelectOption = { value: string; label: string };

export type PoolModalsProps = {
  createOpen: boolean;
  onCloseCreate: () => void;
  onSaveCreate: () => void;
  isCreating: boolean;
  createSaveDisabled: boolean;
  createDeptKind: "Internal" | "External";
  onCreateDeptKindChange: (v: "Internal" | "External") => void;
  createResellerId: string;
  onCreateResellerIdChange: (v: string) => void;
  createParentCompanyId: string;
  onCreateParentCompanyIdChange: (v: string) => void;
  createDepartmentId: string;
  onCreateDepartmentIdChange: (v: string) => void;
  createDepartmentOptions: SelectOption[];
  createResellerOptions: SelectOption[];
  createParentCompanyOptions: SelectOption[];
  poolNameField: string;
  onPoolNameChange: (v: string) => void;

  editOpen: boolean;
  onCloseEdit: () => void;
  onSaveEdit: () => void;
  isEditing: boolean;
  editName: string;
  onEditNameChange: (v: string) => void;

  deleteOpen: boolean;
  deleteDescription: string;
  onCloseDelete: () => void;
  onConfirmDelete: () => void;
  isDeleting: boolean;
};

export function PoolModals({
  createOpen,
  onCloseCreate,
  onSaveCreate,
  isCreating,
  createSaveDisabled,
  createDeptKind,
  onCreateDeptKindChange,
  createResellerId,
  onCreateResellerIdChange,
  createParentCompanyId,
  onCreateParentCompanyIdChange,
  createDepartmentId,
  onCreateDepartmentIdChange,
  createDepartmentOptions,
  createResellerOptions,
  createParentCompanyOptions,
  poolNameField,
  onPoolNameChange,
  editOpen,
  onCloseEdit,
  onSaveEdit,
  isEditing,
  editName,
  onEditNameChange,
  deleteOpen,
  deleteDescription,
  onCloseDelete,
  onConfirmDelete,
  isDeleting,
}: PoolModalsProps) {
  return (
    <>
      <FormModal
        open={createOpen}
        title="Add pool"
        description="Internal: choose department, then enter the pool name. External: choose reseller and parent company, then department, then pool name."
        onClose={onCloseCreate}
        onSave={onSaveCreate}
        primaryButtonLabel={isCreating ? "Saving…" : "Save pool"}
        primaryButtonDisabled={isCreating || createSaveDisabled}
        cancelButtonLabel="Close"
        maxWidth={640}
        fitContent
      >
        <SelectField
          label="Department type"
          value={createDeptKind}
          onChange={(v) => onCreateDeptKindChange(v as "Internal" | "External")}
          options={[
            { value: "Internal", label: "Internal" },
            { value: "External", label: "External" },
          ]}
          menuMaxRows={4}
        />

        {createDeptKind === "External" ? (
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5, mt: 1.5 }}>
            <SelectField
              label="Reseller"
              value={createResellerId}
              onChange={onCreateResellerIdChange}
              options={createResellerOptions}
              menuMaxRows={8}
            />
            <SelectField
              label="Parent company"
              value={createParentCompanyId}
              onChange={onCreateParentCompanyIdChange}
              options={createParentCompanyOptions}
              menuMaxRows={8}
              disabled={!createResellerId.trim()}
            />
          </Box>
        ) : null}

        <Box sx={{ mt: 1.5 }}>
          <SelectField
            label="Department"
            value={createDepartmentId}
            onChange={onCreateDepartmentIdChange}
            options={createDepartmentOptions}
            menuMaxRows={10}
            disabled={createDeptKind === "External" && (!createResellerId.trim() || !createParentCompanyId.trim())}
          />
        </Box>

        <Box sx={{ mt: 1.5 }}>
          <InputField
            label="Pool name"
            placeholder="e.g. Team Alpha"
            value={poolNameField}
            onChange={(e) => onPoolNameChange(e.target.value)}
          />
        </Box>
      </FormModal>

      <FormModal
        open={editOpen}
        title="Edit pool"
        description="Update pool name."
        onClose={onCloseEdit}
        onSave={onSaveEdit}
        primaryButtonLabel={isEditing ? "Saving…" : "Save changes"}
        primaryButtonDisabled={isEditing}
        cancelButtonLabel="Close"
        maxWidth={520}
        fitContent
      >
        <InputField label="Pool name" value={editName} onChange={(e) => onEditNameChange(e.target.value)} />
      </FormModal>

      <ConfirmActionModal
        open={deleteOpen}
        title="Delete pool?"
        description={deleteDescription}
        confirmLabel={isDeleting ? "Deleting…" : "Delete"}
        cancelLabel="Cancel"
        isLoading={isDeleting}
        onDismiss={onCloseDelete}
        onConfirm={onConfirmDelete}
      />
    </>
  );
}
