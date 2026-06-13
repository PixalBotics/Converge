"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { SelectField } from "@/components/common";
import { assignWebsiteFormGridSx } from "@/components/common/AssignWebsiteModal/assign-website-modal.styles";
import { SchedulingSectionCard } from "@/features/website-assignments/components/ServiceSchedulingSections";
import {
  assignmentStepChipSx,
  assignmentStepRowSx,
} from "@/features/website-assignments/styles/website-assignment-ui.styles";
import { resolveSessionListFilterScope } from "@/lib/auth/session-scope";
import { useAuth } from "@/lib/auth";
import type { IpBlockWizardDraft } from "../wizard-storage";
import { useIpBlockWizardScope } from "../hooks/useIpBlockWizardScope";
import { IpBlockWebsiteMultiSelect } from "./IpBlockWebsiteMultiSelect";

export type IpBlockOrgSelectFieldsProps = {
  draft: IpBlockWizardDraft;
  onPatch: (patch: Partial<IpBlockWizardDraft>) => void;
};

export function IpBlockOrgSelectFields({ draft, onPatch }: IpBlockOrgSelectFieldsProps) {
  const { user, isPlatformAdmin } = useAuth();
  const scope = useIpBlockWizardScope(draft, onPatch);
  const sessionScope = resolveSessionListFilterScope(isPlatformAdmin, user);
  const parentLocked = sessionScope.parentCompanyPickerMode === "locked";

  const wizardStep: 1 | 2 | 3 = !draft.parentCompanyId.trim()
    ? 1
    : !draft.childCompanyIds.length
      ? 2
      : 3;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <Box sx={assignmentStepRowSx}>
        {[
          { n: 1, label: "Parent" },
          { n: 2, label: "Child companies" },
          { n: 3, label: "Websites" },
        ].map(({ n, label }) => (
          <Chip key={n} label={`${n}. ${label}`} size="small" sx={assignmentStepChipSx(wizardStep >= n)} />
        ))}
      </Box>

      <SchedulingSectionCard
        step={1}
        title="Parent company"
        subtitle="Pick the client root. Reseller staff can span all parent companies; tenant admins stay on their company."
      >
        <Box sx={assignWebsiteFormGridSx}>
          {scope.canFilterByResellerId ? (
            <SelectField
              label="Reseller"
              value={draft.resellerId}
              onChange={(v) =>
                onPatch({
                  resellerId: v,
                  parentCompanyId: "",
                  childCompanyIds: [],
                  websiteIds: [],
                })
              }
              options={[
                { label: scope.loading ? "Loading…" : "Select reseller", value: "" },
                ...scope.resellerOptions,
              ]}
              menuMaxRows={8}
            />
          ) : null}
          <SelectField
            label="Parent company"
            value={draft.parentCompanyId}
            onChange={(v) =>
              onPatch({
                parentCompanyId: v,
                childCompanyIds: [],
                websiteIds: [],
              })
            }
            options={[
              { label: scope.loading ? "Loading…" : "Select parent company", value: "" },
              ...scope.parentCompanyOptions,
            ]}
            menuMaxRows={8}
            disabled={parentLocked || (scope.canFilterByResellerId && !draft.resellerId.trim())}
          />
        </Box>
      </SchedulingSectionCard>

      {draft.parentCompanyId.trim() ? (
        <SchedulingSectionCard
          step={2}
          title="Child companies"
          subtitle="Optional filter — leave empty to include all child companies under the parent."
        >
          <IpBlockWebsiteMultiSelect
            label="Child companies"
            values={draft.childCompanyIds}
            onChange={(childCompanyIds) => onPatch({ childCompanyIds, websiteIds: [] })}
            options={scope.childCompanyOptions}
          />
        </SchedulingSectionCard>
      ) : null}

      {draft.parentCompanyId.trim() ? (
        <SchedulingSectionCard
          step={3}
          title="Websites"
          subtitle="Select one or more websites where this IP should be blocked."
        >
          <IpBlockWebsiteMultiSelect
            label="Websites"
            values={draft.websiteIds}
            onChange={(websiteIds) => onPatch({ websiteIds })}
            options={scope.websiteOptions}
          />
        </SchedulingSectionCard>
      ) : null}
    </Box>
  );
}
