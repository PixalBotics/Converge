"use client";

import type { AppTheme } from "@/theme/theme";
import { ConfirmActionModal, FormModal, InputField, SelectField } from "@/components/common";

export type SelectOption = { value: string; label: string };

export type PoolModalsProps = {
  theme: AppTheme;
  createOpen: boolean;
  onCloseCreate: () => void;
  onSaveCreate: () => void;
  isCreating: boolean;
  departmentId: string;
  onDepartmentIdChange: (v: string) => void;
  departmentOptions: SelectOption[];
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
  departmentId,
  onDepartmentIdChange,
  departmentOptions,
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
        description="Create a new pool."
        onClose={onCloseCreate}
        onSave={onSaveCreate}
        primaryButtonLabel={isCreating ? "Saving…" : "Save pool"}
        primaryButtonDisabled={isCreating}
        cancelButtonLabel="Close"
        maxWidth={520}
        fitContent
      >
        <SelectField label="Department" value={departmentId} onChange={onDepartmentIdChange} options={departmentOptions} menuMaxRows={8} />
        <InputField
          label="Pool name"
          placeholder="e.g. Team Alpha"
          value={poolNameField}
          onChange={(e) => onPoolNameChange(e.target.value)}
        />
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

