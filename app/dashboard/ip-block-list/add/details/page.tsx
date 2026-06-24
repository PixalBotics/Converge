"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { assignWebsiteFormGridSx } from "@/components/common/AssignWebsiteModal/assign-website-modal.styles";
import { DistributionWizardFooter } from "@/features/distribution-setup/components/DistributionWizardFooter";
import { SchedulingSectionCard } from "@/features/website-assignments/components/ServiceSchedulingSections";
import { IpBlockWizardShell } from "@/features/ip-block/IpBlockWizardShell";
import { useIpBlockWizardScope } from "@/features/ip-block/hooks/useIpBlockWizardScope";
import { IP_BLOCK_ROUTES } from "@/features/ip-block/ip-block.constants";
import {
  clearIpBlockWizardDraft,
  readIpBlockWizardDraft,
  type IpBlockWizardDraft,
} from "@/features/ip-block/wizard-storage";

function formatDateTime(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export default function AddIpBlockDetailsPage() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const [draft, setDraft] = useState<IpBlockWizardDraft | null>(null);

  useEffect(() => {
    const loaded = readIpBlockWizardDraft();
    if (!loaded.ipAddress.trim() || !loaded.websiteIds.length) {
      router.replace(IP_BLOCK_ROUTES.addOrg);
      return;
    }
    setDraft(loaded);
  }, [router]);

  const patchNoop = () => undefined;
  const scope = useIpBlockWizardScope(draft ?? readIpBlockWizardDraft(), patchNoop);

  const resellerLabel =
    scope.resellerOptions.find((o) => o.value === draft?.resellerId)?.label ?? "—";
  const parentLabel =
    scope.parentCompanyOptions.find((o) => o.value === draft?.parentCompanyId)?.label ?? "—";
  const childLabels = useMemo(() => {
    if (!draft?.childCompanyIds.length) return "All under parent";
    return draft.childCompanyIds
      .map((id) => scope.childCompanyOptions.find((o) => o.value === id)?.label ?? id)
      .join(", ");
  }, [draft?.childCompanyIds, scope.childCompanyOptions]);
  const websiteLabels = useMemo(() => {
    if (!draft) return "—";
    return draft.websiteIds
      .map((id) => scope.websiteOptions.find((o) => o.value === id)?.label ?? id)
      .join(", ");
  }, [draft, scope.websiteOptions]);

  if (!draft) return null;

  const fields = [
    { label: "Client of", value: resellerLabel },
    { label: "Parent company", value: parentLabel },
    { label: "Child companies", value: childLabels },
    { label: "Websites", value: websiteLabels },
    { label: "IP address", value: draft.ipAddress },
    { label: "Blocked date", value: formatDateTime(new Date().toISOString()) },
    { label: "Reason", value: draft.reason.trim() || "—" },
    { label: "Status", value: draft.isActive ? "Block (active)" : "Block (inactive)" },
  ];

  return (
    <IpBlockWizardShell
      step={2}
      showStepper={false}
      cardTitle="IP block created"
      subtitle="The rule is saved. Visitors from this IP cannot chat on the selected websites while the rule is active."
      footer={
        <DistributionWizardFooter
          onBack={() => router.push(IP_BLOCK_ROUTES.addConfigure)}
          backLabel="Back"
        >
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            onClick={() => {
              clearIpBlockWizardDraft();
              router.push(IP_BLOCK_ROUTES.list);
            }}
          >
            Done
          </Button>
        </DistributionWizardFooter>
      }
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1.5,
          mb: 2.5,
          p: 2,
          borderRadius: 2,
          border: `1px solid ${theme.palette.success.main}55`,
          bgcolor: `${theme.palette.success.main}14`,
        }}
      >
        <CheckCircle sx={{ color: theme.palette.success.light, fontSize: 28, mt: 0.25 }} />
        <Box>
          <Typography fontWeight={700} sx={{ mb: 0.5 }}>
            Block rule saved
          </Typography>
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.5 }}>
            Enforcement applies per website. Manage or unblock entries anytime from the IP block list.
          </Typography>
        </Box>
      </Box>

      <SchedulingSectionCard title="Summary" subtitle="Review what was configured.">
        <Box sx={assignWebsiteFormGridSx}>
          {fields.map((f) => (
            <InputField
              key={f.label}
              label={f.label}
              name={f.label.toLowerCase().replace(/\s+/g, "-")}
              value={f.value}
              readOnly
            />
          ))}
        </Box>
      </SchedulingSectionCard>
    </IpBlockWizardShell>
  );
}
