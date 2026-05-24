"use client";

import { useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { SelectField } from "@/components/common";
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
import type { PickWebsitePreset } from "./PickWebsiteModal";

export type PickWebsiteFieldsProps = {
  value: PickWebsitePreset;
  onChange: (next: PickWebsitePreset) => void;
  /** Hide websites that already have a distribution setup (new wizard only). */
  excludeWebsiteIds?: readonly string[];
};

export function PickWebsiteFields({
  value,
  onChange,
  excludeWebsiteIds,
}: PickWebsiteFieldsProps) {
  const { canFilterByResellerId, sessionResellerId } = useResellerListScope();

  const resellerId = value.resellerId ?? "";
  const parentCompanyId = value.parentCompanyId ?? "";
  const childCompanyId = value.childCompanyId ?? "";
  const websiteId = value.websiteId ?? "";

  useEffect(() => {
    if (!canFilterByResellerId && sessionResellerId && !resellerId) {
      onChange({
        ...value,
        resellerId: sessionResellerId,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed reseller once for scoped agents
  }, [canFilterByResellerId, sessionResellerId]);

  const resellersQuery = useCompaniesSetupResellersQuery({
    enabled: canFilterByResellerId,
  });
  const companiesTreeQuery = useScopedCompanyTreeQuery(
    resellerId,
    canFilterByResellerId,
    sessionResellerId,
    { enabled: canFilterByResellerId ? resellerId.trim().length > 0 : true },
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
        parentCompanyId.trim().length > 0 &&
        childCompanyId.trim().length > 0 &&
        (canFilterByResellerId ? resellerId.trim().length > 0 : true),
    },
  );

  const excludeSet = useMemo(
    () => new Set((excludeWebsiteIds ?? []).map((id) => id.trim()).filter(Boolean)),
    [excludeWebsiteIds],
  );

  const websiteItems = useMemo(() => websitesQuery.data?.data?.items ?? [], [websitesQuery.data?.data?.items]);

  const availableWebsiteItems = useMemo(
    () => websiteItems.filter((w) => !excludeSet.has(w.websiteId)),
    [websiteItems, excludeSet],
  );

  const websiteSelectOptions = useMemo(() => {
    if (!websiteItems.length) {
      return [{ value: "", label: websitesQuery.isFetching ? "Loading…" : "No websites yet" }];
    }
    if (!availableWebsiteItems.length) {
      return [
        {
          value: "",
          label: excludeSet.size
            ? "All websites here already have distribution"
            : "No websites yet",
        },
      ];
    }
    return [
      { value: "", label: "Select website" },
      ...availableWebsiteItems.map((w) => {
        const name = (w.name ?? "").trim() || "Website";
        const url = (w.url ?? "").trim();
        return {
          value: w.websiteId,
          label: formatWebsiteSelectLabel(name, url, w.websiteId),
        };
      }),
    ];
  }, [websiteItems, availableWebsiteItems, websitesQuery.isFetching, excludeSet.size]);

  useEffect(() => {
    if (!websiteId.trim() || !excludeSet.has(websiteId)) return;
    onChange({ ...value, websiteId: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- clear invalid selection once exclusions load
  }, [excludeSet, websiteId]);

  const wizardStep: 1 | 2 | 3 = !parentCompanyId.trim()
    ? 1
    : !childCompanyId.trim()
      ? 2
      : 3;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
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
        subtitle="Pick the client root company for this distribution setup."
      >
        <Box sx={assignWebsiteFormGridSx}>
          {canFilterByResellerId ? (
            <SelectField
              label="Reseller"
              value={resellerId}
              onChange={(v) =>
                onChange({
                  resellerId: v,
                  parentCompanyId: "",
                  childCompanyId: "",
                  websiteId: "",
                })
              }
              options={resellerOptions}
              menuMaxRows={8}
            />
          ) : null}
          <SelectField
            label="Parent company"
            value={parentCompanyId}
            onChange={(v) =>
              onChange({
                ...value,
                parentCompanyId: v,
                childCompanyId: "",
                websiteId: "",
              })
            }
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
          subtitle="Required — distribution is configured per website under a child company."
        >
          <SelectField
            label="Child company"
            value={childCompanyId}
            onChange={(v) =>
              onChange({
                ...value,
                childCompanyId: v,
                websiteId: "",
              })
            }
            options={childCompanyOptions}
            menuMaxRows={8}
          />
        </SchedulingSectionCard>
      ) : null}

      {childCompanyId.trim() ? (
        <SchedulingSectionCard
          step={3}
          title="Website"
          subtitle={
            excludeSet.size > 0
              ? "Websites that already have a distribution setup (draft or active) are hidden. Edit the existing row from the list to change it."
              : "Select the website that will use this distribution configuration."
          }
        >
          <SelectField
            label="Website"
            value={websiteId}
            onChange={(v) => onChange({ ...value, websiteId: v })}
            options={websiteSelectOptions}
            menuMaxRows={10}
          />
        </SchedulingSectionCard>
      ) : null}
    </Box>
  );
}

export function isPickWebsiteComplete(preset: PickWebsitePreset): boolean {
  return Boolean(preset.websiteId?.trim() && preset.parentCompanyId?.trim());
}
