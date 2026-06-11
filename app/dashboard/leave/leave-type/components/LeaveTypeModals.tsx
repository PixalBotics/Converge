"use client";

import { ConfirmActionModal, FormModal, InputField } from "@/components/common";

export type LeaveTypeModalsProps = {
  createOpen: boolean;
  onCloseCreate: () => void;
  onSaveCreate: () => void;
  isCreating: boolean;
  nameField: string;
  onNameChange: (v: string) => void;
  descriptionField: string;
  onDescriptionChange: (v: string) => void;
  maxDaysField: string;
  onMaxDaysChange: (v: string) => void;

  editOpen: boolean;
  onCloseEdit: () => void;
  onSaveEdit: () => void;
  isEditing: boolean;
  editName: string;
  onEditNameChange: (v: string) => void;
  editDescription: string;
  onEditDescriptionChange: (v: string) => void;
  editMaxDays: string;
  onEditMaxDaysChange: (v: string) => void;

  deleteOpen: boolean;
  deleteDescription: string;
  onCloseDelete: () => void;
  onConfirmDelete: () => void;
  isDeleting: boolean;
};

export function LeaveTypeModals(props: LeaveTypeModalsProps) {
  return (
    <>
      <FormModal
        open={props.createOpen}
        title="Add leave type"
        description="Create a new leave type."
        onClose={props.onCloseCreate}
        onSave={props.onSaveCreate}
        primaryButtonLabel={props.isCreating ? "Saving…" : "Save"}
        primaryButtonDisabled={props.isCreating}
        cancelButtonLabel="Close"
        maxWidth={560}
        fitContent
      >
        <InputField label="Name" value={props.nameField} onChange={(e) => props.onNameChange(e.target.value)} />
        <InputField label="Description" value={props.descriptionField} onChange={(e) => props.onDescriptionChange(e.target.value)} />
        <InputField
          label="Max days per year"
          type="text"
          placeholder="e.g. 20"
          inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
          value={props.maxDaysField}
          onChange={(e) => props.onMaxDaysChange(e.target.value)}
        />
      </FormModal>

      <FormModal
        open={props.editOpen}
        title="Edit leave type"
        description="Update leave type."
        onClose={props.onCloseEdit}
        onSave={props.onSaveEdit}
        primaryButtonLabel={props.isEditing ? "Saving…" : "Save"}
        primaryButtonDisabled={props.isEditing}
        cancelButtonLabel="Close"
        maxWidth={560}
        fitContent
      >
        <InputField label="Name" value={props.editName} onChange={(e) => props.onEditNameChange(e.target.value)} />
        <InputField label="Description" value={props.editDescription} onChange={(e) => props.onEditDescriptionChange(e.target.value)} />
        <InputField
          label="Max days per year"
          type="text"
          placeholder="e.g. 20"
          inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
          value={props.editMaxDays}
          onChange={(e) => props.onEditMaxDaysChange(e.target.value)}
        />
      </FormModal>

      <ConfirmActionModal
        open={props.deleteOpen}
        title="Delete leave type?"
        description={props.deleteDescription}
        confirmLabel={props.isDeleting ? "Deleting…" : "Delete"}
        cancelLabel="Cancel"
        confirmButtonVariant="danger"
        isLoading={props.isDeleting}
        onDismiss={props.onCloseDelete}
        onConfirm={props.onConfirmDelete}
      />
    </>
  );
}

