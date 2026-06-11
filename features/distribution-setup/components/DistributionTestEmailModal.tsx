"use client";

import { FormModal } from "@/components/common";
import {
  DistributionSetupTestPanel,
  type DistributionSetupTestDepartment,
} from "./DistributionSetupTestPanel";

export type DistributionTestDepartment = DistributionSetupTestDepartment;

export type DistributionTestEmailModalProps = {
  open: boolean;
  onClose: () => void;
  websiteId: string;
  subject: string;
  emailConfigurationId?: string | null;
  departments: DistributionTestDepartment[];
};

export function DistributionTestEmailModal({
  open,
  onClose,
  websiteId,
  subject,
  emailConfigurationId,
  departments,
}: DistributionTestEmailModalProps) {
  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSave={onClose}
      title="Send test email"
      description="Sends to the To, CC, and BCC addresses saved for the selected department."
      primaryButtonLabel="Close"
      maxWidth={560}
      fitContent
    >
      <DistributionSetupTestPanel
        websiteId={websiteId}
        subject={subject}
        emailConfigurationId={emailConfigurationId}
        departments={departments}
      />
    </FormModal>
  );
}
