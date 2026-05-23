"use client";

import { useMemo } from "react";
import Skeleton from "@mui/material/Skeleton";
import { SelectField } from "@/components/common";
import { pickItemsArray, toIdNameOption } from "@/app/dashboard/user-page/components/add-user-modal.utils";
import { useCompaniesSetupResellersQuery } from "@/lib/hooks";
import {
  EmailConfigSection,
  EmailConfigStepTitle,
} from "../../styles/email-configuration.styled";

export function ConfigurationResellerSelect({
  value,
  onChange,
  disabled,
  locked,
}: {
  value: string;
  onChange: (resellerId: string) => void;
  disabled?: boolean;
  locked?: boolean;
}) {
  const resellersQuery = useCompaniesSetupResellersQuery({ enabled: true });

  const options = useMemo(() => {
    const base = pickItemsArray(resellersQuery.data)
      .map((row) => toIdNameOption(row))
      .filter((o): o is { value: string; label: string } => o !== null);
    if (base.length > 0) return base;
    return [
      {
        value: "",
        label: resellersQuery.isLoading ? "Loading resellers…" : "No resellers available",
      },
    ];
  }, [resellersQuery.data, resellersQuery.isLoading]);

  return (
    <EmailConfigSection>
      <EmailConfigStepTitle variant="mediumLarge">Reseller</EmailConfigStepTitle>
      {resellersQuery.isLoading ? (
        <Skeleton variant="rounded" height={48} />
      ) : (
        <SelectField
          label="Reseller"
          value={value}
          onChange={onChange}
          options={options}
          disabled={disabled || locked || (!value && options[0]?.value === "")}
        />
      )}
    </EmailConfigSection>
  );
}
