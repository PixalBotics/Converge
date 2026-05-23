"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { FormModal, SelectField } from "@/components/common";
import {
  extractChildCompanyOptionsForParentFromByResellerTree,
  extractParentCompaniesFromByResellerTree,
  pickItemsArray,
  toIdNameOption,
} from "@/app/dashboard/user-page/components/add-user-modal.utils";
import { useResellerListScope } from "@/lib/auth";
import {
  buildWebsitesInScopeParams,
  useCompaniesSetupResellersQuery,
  useScopedCompanyTreeQuery,
  useWebsiteAssignmentsWebsitesQuery,
} from "@/lib/hooks";
import { assignWebsiteFormGridSx } from "@/components/common/AssignWebsiteModal/assign-website-modal.styles";
import { SchedulingSectionCard } from "@/features/website-assignments/components/ServiceSchedulingSections";
import { assignmentStepChipSx, assignmentStepRowSx } from "../styles/website-assignment-ui.styles";
import { formatWebsiteSelectLabel } from "@/lib/websites/format-website-select-label";

export type PickWebsitePreset = {
  websiteId: string;
  parentCompanyId: string;
  childCompanyId?: string;
  resellerId?: string;
};

export function PickWebsiteModal({
  open,
  title,
  description,
  primaryLabel,
  onClose,
  onContinue,
  preset,
}: {
  open: boolean;
  title: string;
  description: string;
  primaryLabel: string;
  onClose: () => void;
  onContinue: (picked: PickWebsitePreset) => void;
  preset?: PickWebsitePreset | null;
}) {
  const { canFilterByResellerId, sessionResellerId } = useResellerListScope();
  const skipCascadeRef = useRef(false);

  const [resellerId, setResellerId] = useState("");
  const [parentCompanyId, setParentCompanyId] = useState("");
  const [childCompanyId, setChildCompanyId] = useState("");
  const [websiteId, setWebsiteId] = useState("");

  useEffect(() => {
    if (!open) {
      skipCascadeRef.current = false;
      setResellerId("");
      setParentCompanyId("");
      setChildCompanyId("");
      setWebsiteId("");
      return;
    }
    if (preset?.websiteId) {
      skipCascadeRef.current = true;
      setResellerId(preset.resellerId ?? "");
      setParentCompanyId(preset.parentCompanyId);
      setChildCompanyId(preset.childCompanyId ?? "");
      setWebsiteId(preset.websiteId);
    }
  }, [open, preset]);

  useEffect(() => {
    if (open && !canFilterByResellerId && sessionResellerId) {
      setResellerId(sessionResellerId);
    }
  }, [open, canFilterByResellerId, sessionResellerId]);

  useEffect(() => {
    if (skipCascadeRef.current) {
      skipCascadeRef.current = false;
      return;
    }
    setParentCompanyId("");
    setChildCompanyId("");
    setWebsiteId("");
  }, [resellerId]);

  useEffect(() => {
    if (skipCascadeRef.current) {
      skipCascadeRef.current = false;
      return;
    }
    setChildCompanyId("");
    setWebsiteId("");
  }, [parentCompanyId]);

  useEffect(() => {
    if (skipCascadeRef.current) {
      skipCascadeRef.current = false;
      return;
    }
    setWebsiteId("");
  }, [childCompanyId]);

  const resellersQuery = useCompaniesSetupResellersQuery({
    enabled: open && canFilterByResellerId,
  });
  const companiesTreeQuery = useScopedCompanyTreeQuery(
    resellerId,
    canFilterByResellerId,
    sessionResellerId,
    { enabled: open && (canFilterByResellerId ? resellerId.trim().length > 0 : true) },
  );

  const resellerOptions = useMemo(() => {
    const opts = pickItemsArray(resellersQuery.data)
      .map((row) => toIdNameOption(row))
      .filter((o): o is { value: string; label: string } => o !== null);
    return opts.length ? [{ value: "", label: "Select reseller" }, ...opts] : [{ value: "", label: "No resellers" }];
  }, [resellersQuery.data]);

  const parentCompanyOptions = useMemo(() => {
    if (canFilterByResellerId && !resellerId.trim()) {
      return [{ value: "", label: "Select reseller first" }];
    }
    const extracted = extractParentCompaniesFromByResellerTree(companiesTreeQuery.data).map((o) => ({
      value: o.value,
      label: o.label,
    }));
    return extracted.length
      ? [{ value: "", label: "Select parent company" }, ...extracted]
      : [{ value: "", label: "No parent companies" }];
  }, [canFilterByResellerId, resellerId, companiesTreeQuery.data]);

  const childCompanyOptions = useMemo(() => {
    if (!parentCompanyId.trim()) return [{ value: "", label: "Select parent company first" }];
    const children = extractChildCompanyOptionsForParentFromByResellerTree(
      companiesTreeQuery.data,
      parentCompanyId,
    );
    return children.length
      ? [{ value: "", label: "Select child company" }, ...children]
      : [{ value: "", label: "No child companies" }];
  }, [parentCompanyId, companiesTreeQuery.data]);

  const websitesQuery = useWebsiteAssignmentsWebsitesQuery(
    buildWebsitesInScopeParams({
      canFilterByResellerId,
      all: true,
      resellerId,
      parentCompanyId,
      childCompanyId: childCompanyId.trim() || undefined,
    }),
    {
      allowResellerIdFilter: canFilterByResellerId,
      enabled:
        open &&
        parentCompanyId.trim().length > 0 &&
        childCompanyId.trim().length > 0 &&
        (canFilterByResellerId ? resellerId.trim().length > 0 : true),
    },
  );

  const websiteItems = useMemo(() => websitesQuery.data?.data?.items ?? [], [websitesQuery.data?.data?.items]);

  const websiteSelectOptions = useMemo(() => {
    if (!websiteItems.length) {
      return [{ value: "", label: websitesQuery.isFetching ? "Loading…" : "No websites yet" }];
    }
    return [
      { value: "", label: "Select website" },
      ...websiteItems.map((w) => {
        const name = (w.name ?? "").trim() || "Website";
        const url = (w.url ?? "").trim();
        return {
          value: w.websiteId,
          label: formatWebsiteSelectLabel(name, url, w.websiteId),
        };
      }),
    ];
  }, [websiteItems, websitesQuery.isFetching]);

  const wizardStep: 1 | 2 | 3 = !parentCompanyId.trim()
    ? 1
    : !childCompanyId.trim()
      ? 2
      : 3;

  const canContinue = websiteId.trim().length > 0 && parentCompanyId.trim().length > 0;

  return (
    <FormModal
      open={open}
      fitContent
      maxWidth={600}
      title={title}
      description={description}
      onClose={onClose}
      onSave={() => {
        if (!canContinue) return;
        onContinue({
          websiteId: websiteId.trim(),
          parentCompanyId: parentCompanyId.trim(),
          childCompanyId: childCompanyId.trim() || undefined,
          resellerId: resellerId.trim() || undefined,
        });
      }}
      primaryButtonLabel={primaryLabel}
      primaryButtonDisabled={!canContinue}
      cancelButtonLabel="Cancel"
    >
      <Box sx={assignmentStepRowSx}>
        {[
          { n: 1, label: "Parent" },
          { n: 2, label: "Child company" },
          { n: 3, label: "Website" },
        ].map(({ n, label }) => (
          <Chip key={n} label={`${n}. ${label}`} size="small" sx={assignmentStepChipSx(wizardStep >= n)} />
        ))}
      </Box>

      <SchedulingSectionCard
        step={1}
        title="Parent company"
        subtitle="Pick the client root company for this schedule."
      >
        <Box sx={assignWebsiteFormGridSx}>
          {canFilterByResellerId ? (
            <SelectField
              label="Reseller"
              value={resellerId}
              onChange={setResellerId}
              options={resellerOptions}
              menuMaxRows={8}
            />
          ) : null}
          <SelectField
            label="Parent company"
            value={parentCompanyId}
            onChange={setParentCompanyId}
            options={parentCompanyOptions}
            menuMaxRows={8}
            disabled={canFilterByResellerId && !resellerId.trim()}
          />
        </Box>
      </SchedulingSectionCard>

      {parentCompanyId.trim() ? (
        <SchedulingSectionCard
          step={2}
          title="Child company"
          subtitle="Required — service scheduling is tied to a child company and its websites."
        >
          <SelectField
            label="Child company"
            value={childCompanyId}
            onChange={setChildCompanyId}
            options={childCompanyOptions}
            menuMaxRows={8}
          />
        </SchedulingSectionCard>
      ) : null}

      {childCompanyId.trim() ? (
        <SchedulingSectionCard
          step={3}
          title="Website"
          subtitle="Select a website from the list for this child company."
        >
          <SelectField
            label="Website"
            value={websiteId}
            onChange={setWebsiteId}
            options={websiteSelectOptions}
            menuMaxRows={10}
          />
        </SchedulingSectionCard>
      ) : null}
    </FormModal>
  );
}