"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import BlurOnRounded from "@mui/icons-material/BlurOnRounded";
import AddIcCallRounded from "@mui/icons-material/AddIcCallRounded";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SxProps, Theme } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  DashboardCard,
  DataTable,
  InputField,
  SelectField,
  TablePagination,
  Typography,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { pageWrapper, footerMutedText } from "../companies/overview.styles";
import {
  rolesCard,
  rolesFooterRow,
  rolesIconBox,
  rolesPageWrapper,
  rolesPaginationWrapper,
} from "../roles/roles.styles";
import {
  phoneNumberSetupAddButtonSx,
  phoneNumberSetupCardHeaderSx,
  phoneNumberSetupFilterGridSx,
  phoneNumberSetupHeaderSx,
  phoneNumberSetupStatusApprovedSx,
  phoneNumberSetupSubtextSx,
} from "./phone-number-setup.styles";
import type { WebsiteSmsConfigListItem } from "@/api/sms/sms.api";
import { useWebsiteSmsConfigsQuery } from "@/features/sms/hooks/useSms";
import { useResellerListScope } from "@/lib/auth";
import {
  useCompaniesSetupResellersQuery,
  useScopedCompanyTreeQuery,
} from "@/lib/hooks";
import {
  extractChildCompanyOptionsForParentFromByResellerTree,
  extractParentCompaniesFromByResellerTree,
  pickItemsArray,
  toIdNameOption,
} from "@/app/dashboard/user-page/components/add-user-modal.utils";

const PAGE_SIZE = 10;

export default function PhoneNumberSetupPage() {
  const theme = useTheme() as AppTheme;
  const { canFilterByResellerId, sessionResellerId } = useResellerListScope();
  const [resellerId, setResellerId] = useState("");
  const [parentCompanyId, setParentCompanyId] = useState("");
  const [childCompanyId, setChildCompanyId] = useState("");
  const [page, setPage] = useState(1);
  const [applied, setApplied] = useState({
    resellerId: "",
    parentCompanyId: "",
    childCompanyId: "",
  });

  const listQuery = useWebsiteSmsConfigsQuery({
    page,
    limit: PAGE_SIZE,
    resellerId: applied.resellerId || undefined,
    parentCompanyId: applied.parentCompanyId || undefined,
    childCompanyId: applied.childCompanyId || undefined,
  });

  const resellersQuery = useCompaniesSetupResellersQuery({
    enabled: canFilterByResellerId,
  });
  const companiesTreeQuery = useScopedCompanyTreeQuery(
    resellerId || sessionResellerId || "",
    canFilterByResellerId,
    sessionResellerId,
    { enabled: Boolean(resellerId || sessionResellerId) },
  );

  const resellerOptions = useMemo(
    () =>
      pickItemsArray(resellersQuery.data)
        .map(toIdNameOption)
        .filter((o): o is { value: string; label: string } => o !== null),
    [resellersQuery.data],
  );
  const parentOptions = useMemo(
    () =>
      extractParentCompaniesFromByResellerTree(companiesTreeQuery.data)
        .map(toIdNameOption)
        .filter((o): o is { value: string; label: string } => o !== null),
    [companiesTreeQuery.data],
  );
  const childOptions = useMemo(
    () =>
      extractChildCompanyOptionsForParentFromByResellerTree(
        companiesTreeQuery.data,
        parentCompanyId,
      )
        .map(toIdNameOption)
        .filter((o): o is { value: string; label: string } => o !== null),
    [companiesTreeQuery.data, parentCompanyId],
  );

  const rows = listQuery.data?.items ?? [];
  const total = listQuery.data?.total ?? 0;
  const pageCount = listQuery.data?.totalPages ?? 1;
  const rangeStart = rows.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const rangeEnd = (page - 1) * PAGE_SIZE + rows.length;

  const columns = useMemo<DataTableColumn<WebsiteSmsConfigListItem>[]>(
    () => [
      { id: "accountSid", label: "Twilio Account" },
      { id: "fromNumber", label: "From (Twilio)" },
      { id: "notifyToNumber", label: "Notify To" },
      { id: "website", label: "Website" },
      { id: "resellerName", label: "Reseller" },
      { id: "parentCompany", label: "Parent Company" },
      { id: "childCompany", label: "Child Company" },
      {
        id: "isEnabled",
        label: "Status",
        render: (_, row) => (
          <Typography component="span" sx={phoneNumberSetupStatusApprovedSx}>
            {row.isEnabled ? "Active" : "Disabled"}
          </Typography>
        ),
      },
    ],
    [],
  );

  return (
    <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>
      <Box sx={phoneNumberSetupHeaderSx}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} color="white">
            Phone Number Setup
          </Typography>
          <Typography variant="body2" sx={phoneNumberSetupSubtextSx}>
            Each website connects its own Twilio account for Text Us SMS alerts
          </Typography>
        </Box>
        <Button
          type="button"
          component={Link}
          href="/dashboard/phone-number-setup/add"
          variant="primary"
          startIcon={<AddIcCallRounded sx={{ fontSize: 17 }} />}
          sx={{ ...phoneNumberSetupAddButtonSx, ...(gradientPrimaryButtonSx as object) }}
        >
          Add Phone Number
        </Button>
      </Box>

      <DashboardCard sx={rolesCard}>
        <Box sx={phoneNumberSetupCardHeaderSx}>
          <Box sx={rolesIconBox}>
            <BlurOnRounded sx={{ fontSize: 18, color: theme.app.dashboard.white95 }} />
          </Box>
          <Typography variant="mediumLarge" color="white" fontWeight={600}>
            Filter
          </Typography>
        </Box>
        <Box sx={phoneNumberSetupFilterGridSx}>
          {canFilterByResellerId ? (
            <SelectField
              label="Reseller"
              value={resellerId}
              onChange={(v) => {
                setResellerId(v);
                setParentCompanyId("");
                setChildCompanyId("");
              }}
              options={resellerOptions}
            />
          ) : null}
          <SelectField
            label="Parent Company"
            value={parentCompanyId}
            onChange={(v) => {
              setParentCompanyId(v);
              setChildCompanyId("");
            }}
            options={parentOptions}
          />
          <SelectField
            label="Child Company"
            value={childCompanyId}
            onChange={setChildCompanyId}
            options={childOptions}
            disabled={!parentCompanyId}
          />
          <Button
            type="button"
            variant="primary"
            sx={{ minWidth: 126, width: { xs: "100%", lg: "auto" }, ...(gradientPrimaryButtonSx as object) }}
            onClick={() => {
              setPage(1);
              setApplied({
                resellerId: canFilterByResellerId ? resellerId : sessionResellerId ?? "",
                parentCompanyId,
                childCompanyId,
              });
            }}
          >
            Apply Filter
          </Button>
        </Box>
      </DashboardCard>

      <DashboardCard sx={rolesCard}>
        <Box sx={phoneNumberSetupCardHeaderSx}>
          <Box sx={rolesIconBox}>
            <BlurOnRounded sx={{ fontSize: 18, color: theme.app.dashboard.white95 }} />
          </Box>
          <Typography variant="mediumLarge" color="white" fontWeight={600}>
            Website phone assignments
          </Typography>
        </Box>

        <DataTable<WebsiteSmsConfigListItem>
          columns={columns}
          rows={rows}
          getRowId={(row) => row.id}
          minWidth={1100}
        />

        <Box sx={rolesFooterRow}>
          <Typography variant="medium" sx={footerMutedText(theme)}>
            {listQuery.isLoading
              ? "Loading…"
              : `Showing ${rangeStart} to ${rangeEnd} of ${total} entries`}
          </Typography>
          <Box sx={rolesPaginationWrapper}>
            <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
          </Box>
        </Box>
      </DashboardCard>
    </Box>
  );
}
