"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import { AttachMoney as AttachMoneyIcon } from "@mui/icons-material";
import {
  Typography,
  DashboardCard,
  DataTable,
  SearchBar,
  SearchSubmitButton,
  Button,
  TablePagination,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import type { AppTheme } from "@/theme/theme";
import type { CompanyRow, UnknownRecord } from "../types";
import {
  departmentsCard,
  departmentsCardHeader,
  departmentsFooterRow,
  departmentsPaginationWrapper,
  departmentsSearchRow,
  departmentsSearchFieldWrapper,
} from "../../website-assigning/website-assigning.styles";
import {
  cardTitleRow,
  cardTitleIconBox,
  attachMoneyIconSx,
  footerMutedText,
} from "../overview.styles";
import { CompanyChildListModal } from "./CompanyChildListModal";
import { CompanyParentListModal } from "./CompanyParentListModal";

type Props = {
  theme: AppTheme;
  searchInput: string;
  onSearchInputChange: (v: string) => void;
  appliedSearch: string;
  onSearchSubmit: () => void;
  rows: CompanyRow[];
  isLoading: boolean;
  page: number;
  pageCount: number;
  totalEntries: number;
  limit: number;
  onPageChange: (p: number) => void;
  /** Detail link and read-only list modals (parent/child multi). */
  canViewCompanyDetail?: boolean;
  canViewCompanyList?: boolean;
  canUpdateCompany?: boolean;
  /** When set, Edit is only offered for this client-root parent row. */
  scopedParentCompanyId?: string;
};

export function CompaniesTableSection({
  theme,
  searchInput,
  onSearchInputChange,
  appliedSearch,
  onSearchSubmit,
  rows,
  isLoading,
  page,
  pageCount,
  totalEntries,
  limit,
  onPageChange,
  canViewCompanyDetail = true,
  canViewCompanyList = true,
  canUpdateCompany = true,
  scopedParentCompanyId,
}: Props) {
  const scopedParentId = scopedParentCompanyId?.trim() ?? "";
  const [childListOpen, setChildListOpen] = useState(false);
  const [childListParentName, setChildListParentName] = useState("");
  const [childListResellerName, setChildListResellerName] = useState("");
  const [childListCompanies, setChildListCompanies] = useState<CompanyRow["childCompanies"]>([]);

  const [parentListOpen, setParentListOpen] = useState(false);
  const [parentListResellerName, setParentListResellerName] = useState("");
  const [parentListRows, setParentListRows] = useState<UnknownRecord[]>([]);

  const handleOpenChildList = useCallback((row: CompanyRow) => {
    if (!row.childCompanies || row.childCompanies.length <= 1) return;
    setChildListParentName(row.parentCompany);
    setChildListResellerName(row.reseller);
    setChildListCompanies(row.childCompanies);
    setChildListOpen(true);
  }, []);

  const handleCloseChildList = () => {
    setChildListOpen(false);
    setChildListParentName("");
    setChildListResellerName("");
    setChildListCompanies([]);
  };

  const handleOpenParentList = useCallback((row: CompanyRow) => {
    if (!row.parentCompanies || row.parentCompanies.length <= 1) return;
    setParentListResellerName(row.reseller);
    setParentListRows(row.parentCompanies);
    setParentListOpen(true);
  }, []);

  const handleCloseParentList = () => {
    setParentListOpen(false);
    setParentListResellerName("");
    setParentListRows([]);
  };

  const columns = useMemo<DataTableColumn<CompanyRow>[]>(
    () => [
      { id: "reseller", label: "Client Of (Reseller)" },
      {
        id: "parentCompany",
        label: "Parent Company",
        render: (_value, row) =>
          row.parentCompanies && row.parentCompanies.length > 1 ? (
            canViewCompanyList ? (
              <Button
                variant="secondary"
                size="small"
                sx={{
                  alignSelf: "flex-start",
                  justifyContent: "flex-start",
                  px: 2,
                  minWidth: "auto",
                }}
                onClick={() => handleOpenParentList(row)}
              >
                {row.parentCompany}
              </Button>
            ) : (
              String(row.parentCompany ?? "—")
            )
          ) : (
            String(row.parentCompany ?? "—")
          ),
      },
      {
        id: "childCompany",
        label: "Child Company",
        render: (value, row) =>
          row.parentCompanies && row.parentCompanies.length > 1 ? (
            canViewCompanyList ? (
              <Button
                variant="secondary"
                size="small"
                sx={{
                  alignSelf: "flex-start",
                  justifyContent: "flex-start",
                  px: 2,
                  minWidth: "auto",
                }}
                onClick={() => handleOpenParentList(row)}
              >
                {String(value ?? row.childCompany)}
              </Button>
            ) : (
              String(value ?? row.childCompany)
            )
          ) : row.childCompanies && row.childCompanies.length > 1 ? (
            canViewCompanyList ? (
              <Button
                variant="secondary"
                size="small"
                sx={{
                  alignSelf: "flex-start",
                  justifyContent: "flex-start",
                  px: 2,
                  minWidth: "auto",
                }}
                onClick={() => handleOpenChildList(row)}
              >
                {String(value ?? row.childCompany)}
              </Button>
            ) : (
              String(value ?? row.childCompany)
            )
          ) : (
            String(value ?? row.childCompany)
          ),
      },
    ],
    [canViewCompanyList, handleOpenChildList, handleOpenParentList],
  );

  return (
    <>
      <DashboardCard sx={departmentsCard}>
        <Box sx={departmentsCardHeader}>
          <Box sx={cardTitleRow}>
            <Box sx={cardTitleIconBox}>
              <AttachMoneyIcon sx={attachMoneyIconSx(theme)} />
            </Box>
            <Typography
              variant="mediumLarge"
              color="white"
              fontWeight={600}
              sx={{ lineHeight: 1.25, display: "inline-flex", alignItems: "center" }}
            >
              Add Reseller / Company
            </Typography>
          </Box>

          <Box sx={departmentsSearchRow}>
            <Box sx={departmentsSearchFieldWrapper}>
              <SearchBar value={searchInput} onChange={onSearchInputChange} placeholder="Search anything.." />
            </Box>
            <SearchSubmitButton
              disabled={searchInput.trim() === appliedSearch.trim()}
              onClick={onSearchSubmit}
            />
          </Box>
        </Box>

        <DataTable<CompanyRow>
          columns={columns}
          rows={rows}
          getRowId={(row) => row.id}
          minWidth={980}
          actionColumn={{
            label: "Action",
            render: (row) => {
              const detailHref =
                row.parentCompanies && row.parentCompanies.length > 1 && row.resellerId?.trim()
                  ? `/dashboard/companies/reseller/${encodeURIComponent(row.resellerId.trim())}/detail`
                  : row.parentCompanyId.trim().length > 0
                    ? `/dashboard/companies/parent/${encodeURIComponent(row.parentCompanyId.trim())}/detail`
                    : "";
              const rowParentId = row.parentCompanyId.trim();
              const mayEditThisRow =
                canUpdateCompany &&
                rowParentId.length > 0 &&
                (!scopedParentId || rowParentId === scopedParentId);
              const editHref = mayEditThisRow
                ? `/dashboard/companies/${encodeURIComponent(rowParentId)}/edit?step=1`
                : "";

              return (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: 1,
                    flexWrap: "wrap",
                  }}
                >
                  {detailHref && canViewCompanyDetail ? (
                    <Button
                      component={Link}
                      href={detailHref}
                      variant="secondary"
                      size="small"
                      sx={{ minWidth: "auto", px: 1.75, whiteSpace: "nowrap" }}
                    >
                      Detail
                    </Button>
                  ) : null}
                  {row.parentCompanies && row.parentCompanies.length > 1 ? (
                    canViewCompanyList ? (
                      <Button
                        variant="secondary"
                        size="small"
                        sx={{ minWidth: "auto", px: 1.75, whiteSpace: "nowrap" }}
                        onClick={() => handleOpenParentList(row)}
                      >
                        List
                      </Button>
                    ) : null
                  ) : editHref ? (
                    <Button
                      component={Link}
                      href={editHref}
                      variant="primary"
                      size="small"
                      sx={{ minWidth: "auto", px: 1.75, whiteSpace: "nowrap" }}
                    >
                      Edit
                    </Button>
                  ) : !detailHref ? (
                    <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                      —
                    </Typography>
                  ) : null}
                </Box>
              );
            },
          }}
        />

        <Box sx={departmentsFooterRow}>
          <Typography variant="medium" sx={footerMutedText(theme)}>
            {isLoading
              ? "Loading companies..."
              : `Showing data ${rows.length > 0 ? (page - 1) * limit + 1 : 0} to ${
                  (page - 1) * limit + rows.length
                } of ${totalEntries} entries`}
          </Typography>
          <Box sx={departmentsPaginationWrapper}>
            <TablePagination page={page} pageCount={pageCount} onPageChange={onPageChange} />
          </Box>
        </Box>
      </DashboardCard>

      <CompanyChildListModal
        open={childListOpen}
        parentName={childListParentName}
        resellerName={childListResellerName}
        childRows={childListCompanies ?? []}
        onClose={handleCloseChildList}
      />

      <CompanyParentListModal
        open={parentListOpen}
        resellerName={parentListResellerName}
        parentRows={parentListRows}
        onClose={handleCloseParentList}
      />
    </>
  );
}
