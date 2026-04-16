"use client";

import { useCallback, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  AttachMoney as AttachMoneyIcon,
  CheckCircle as CheckCircleIcon,
  MoreHoriz as MoreHorizIcon,
} from "@mui/icons-material";
import {
  Typography,
  DashboardCard,
  DataTable,
  dataTableActionButton,
  SearchBar,
  FilterButton,
  Button,
  TablePagination,
  FormModal,
  InputField,
  SelectField,
} from "@/components/common";
import { useCompaniesListQuery } from "@/lib/hooks/query";
import { DeleteCircleIcon } from "@/components/dashboard/icons/DeleteCircleIcon";
import { AddCircleIcon } from "@/components/dashboard/icons/AddCircleIcon";
import type { DataTableColumn } from "@/components/common";
import {
  departmentsAddButton,
  departmentsCard,
  departmentsCardHeader,
  departmentsFooterRow,
  departmentsPaginationWrapper,
  departmentsSearchRow,
  departmentsSearchFieldWrapper,
} from "../website-assigning/website-assigning.styles";
import {
  pageWrapper,
  pageHeaderRow,
  cardTitleRow,
  cardTitleIconBox,
  attachMoneyIconSx,
  footerMutedText,
  stepperOuter,
  stepperSegment,
  stepperDivider,
  stepperCheckIcon,
  stepperNumberCircleActive,
  stepperNumberCircleInactive,
  stepperLabelResellerDone,
  stepperLabelResellerActive,
  stepperLabelChildDone,
  stepperLabelChildInactive,
  stepOneIncompleteHint,
  sectionStack,
  sectionHeaderRow,
  sectionHeaderRowWebsiteFirst,
  sectionHeaderRowWebsiteRest,
  deleteIconButton,
  addAnotherButton,
  addAnotherIcon,
  addAnotherLabel,
  websiteTwoColGrid,
} from "./allCompaniesOverview.styles";

type CompanyRow = {
  id: string;
  reseller: string;
  parentCompany: string;
  childCompany: string;
  childCompanies?: UnknownRecord[];
};

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

export default function AllCompaniesPage() {
  const theme = useTheme() as AppTheme;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [clientType, setClientType] = useState("External");
  const [parentCompanyName, setParentCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [childCompanySectionCount, setChildCompanySectionCount] = useState(1);
  const [websiteSectionCount, setWebsiteSectionCount] = useState(1);
  const [isChildListOpen, setIsChildListOpen] = useState(false);
  const [childListParentName, setChildListParentName] = useState("");
  const [childListResellerName, setChildListResellerName] = useState("");
  const [childListCompanies, setChildListCompanies] = useState<UnknownRecord[]>([]);

  const { data: companiesResponse, isLoading: isCompaniesLoading } = useCompaniesListQuery({
    page,
    limit,
    search: search.trim() || undefined,
  });

  const companiesData = companiesResponse?.data;
  const pageCount = companiesData?.totalPages ?? 1;

  const isStepOneComplete =
    clientType.trim().length > 0 &&
    parentCompanyName.trim().length > 0 &&
    address.trim().length > 0 &&
    email.trim().length > 0 &&
    phoneNumber.trim().length > 0;

  const resetModalState = () => {
    setModalStep(1);
    setClientType("External");
    setParentCompanyName("");
    setAddress("");
    setEmail("");
    setPhoneNumber("");
    setChildCompanySectionCount(1);
    setWebsiteSectionCount(1);
  };

  const handleOpenChildListModal = useCallback((row: CompanyRow) => {
    if (!row.childCompanies || row.childCompanies.length <= 1) return;
    setChildListParentName(row.parentCompany);
    setChildListResellerName(row.reseller);
    setChildListCompanies(row.childCompanies);
    setIsChildListOpen(true);
  }, []);

  const handleCloseChildListModal = () => {
    setIsChildListOpen(false);
    setChildListParentName("");
    setChildListResellerName("");
    setChildListCompanies([]);
  };

  const handleOpenModal = () => {
    resetModalState();
    setIsAddOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddOpen(false);
    resetModalState();
  };

  const handleModalPrimaryAction = () => {
    if (modalStep === 1) {
      if (!isStepOneComplete) return;
      setModalStep(2);
      return;
    }
    handleCloseModal();
  };

  const filteredRows = useMemo(() => {
    const items = Array.isArray(companiesData?.items) ? companiesData.items : [];
    const rows: CompanyRow[] = [];

    for (const item of items) {
      const treeNode = asRecord(item);
      const resellerObj = asRecord(treeNode?.reseller);
      const resellerName = String(resellerObj?.name ?? "").trim() || "-";
      const parentCompanies = Array.isArray(treeNode?.parentCompanies)
        ? treeNode.parentCompanies
        : [];

      for (const parent of parentCompanies) {
        const parentObj = asRecord(parent);
        const parentName = String(parentObj?.name ?? "").trim() || "-";
        const childCompanies = Array.isArray(parentObj?.childCompanies)
          ? parentObj.childCompanies
          : [];

        if (childCompanies.length === 0) {
          rows.push({
            id: String(parentObj?.id ?? `${resellerName}-${parentName}`),
            reseller: resellerName,
            parentCompany: parentName,
            childCompany: "-",
          });
          continue;
        }

        if (childCompanies.length === 1) {
          const childObj = asRecord(childCompanies[0]);
          const childName = String(childObj?.name ?? "").trim() || "-";
          rows.push({
            id: String(childObj?.id ?? `${resellerName}-${parentName}-${childName}`),
            reseller: resellerName,
            parentCompany: parentName,
            childCompany: childName,
          });
        } else {
          rows.push({
            id: String(parentObj?.id ?? `${resellerName}-${parentName}-children`),
            reseller: resellerName,
            parentCompany: parentName,
            childCompany: `${childCompanies.length} Child Companies`,
            childCompanies: childCompanies as UnknownRecord[],
          });
        }
      }
    }

    return rows;
  }, [companiesData?.items]);

  const columns = useMemo<DataTableColumn<CompanyRow>[]>(
    () => [
      { id: "reseller", label: "Client Of (Reseller)" },
      { id: "parentCompany", label: "Parent Company" },
      {
        id: "childCompany",
        label: "Child Company",
        render: (value, row) =>
          row.childCompanies && row.childCompanies.length > 1 ? (
            <Button
              variant="secondary"
              size="small"
              sx={{
                alignSelf: "flex-start",
                justifyContent: "flex-start",
                px: 2,
                minWidth: "auto",
              }}
              onClick={() => handleOpenChildListModal(row)}
            >
              {String(value ?? row.childCompany)}
            </Button>
          ) : (
            String(value ?? row.childCompany)
          ),
      },
    ],
    [handleOpenChildListModal],
  );

  return (
    <Box sx={pageWrapper}>
      <Box sx={pageHeaderRow}>
        <Typography variant="regularLarge" fontWeight={700} color="white">
          All Companies
        </Typography>
        <Button variant="primary" sx={departmentsAddButton} onClick={handleOpenModal}>
          <AddCircleIcon width={16} height={16} />
          <Typography component="span" variant="medium" color="inherit">
            Add Reseller / Company
          </Typography>
        </Button>
      </Box>

      <DashboardCard sx={departmentsCard}>
        <Box sx={departmentsCardHeader}>
          <Box sx={cardTitleRow}>
            <Box sx={cardTitleIconBox}>
              <AttachMoneyIcon sx={attachMoneyIconSx(theme)} />
            </Box>
            <Typography variant="mediumLarge" color="white" fontWeight={600}>
              Add Reseller / Company
            </Typography>
          </Box>

          <Box sx={departmentsSearchRow}>
            <Box sx={departmentsSearchFieldWrapper}>
              <SearchBar value={search} onChange={setSearch} placeholder="Search anything.." />
            </Box>
            <FilterButton />
          </Box>
        </Box>

        <DataTable<CompanyRow>
          columns={columns}
          rows={filteredRows}
          getRowId={(row) => row.id}
          minWidth={980}
          actionColumn={{
            label: "Action",
            render: () => (
              <IconButton size="small" sx={dataTableActionButton}>
                <MoreHorizIcon fontSize="small" />
              </IconButton>
            ),
          }}
        />

        <Box sx={departmentsFooterRow}>
          <Typography variant="medium" sx={footerMutedText(theme)}>
            {isCompaniesLoading
              ? "Loading companies..."
              : `Showing data ${filteredRows.length > 0 ? (page - 1) * limit + 1 : 0} to ${
                  (page - 1) * limit + filteredRows.length
                } of ${companiesData?.total ?? 0} entries`}
          </Typography>
          <Box sx={departmentsPaginationWrapper}>
            <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
          </Box>
        </Box>
      </DashboardCard>

      <FormModal
        open={isChildListOpen}
        title={
          childListParentName
            ? `${childListParentName} – Child Companies`
            : "Child Companies"
        }
        description={
          childListResellerName
            ? `Reseller: ${childListResellerName}. Showing ${childListCompanies.length} child companies.`
            : `Showing ${childListCompanies.length} child companies.`
        }
        onClose={handleCloseChildListModal}
        onSave={handleCloseChildListModal}
        primaryButtonLabel="Close"
        showCancelButton={false}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            columnGap: 3,
            rowGap: 2.5,
          }}
        >
          {childListCompanies.map((child, index) => {
            const childObj = asRecord(child) ?? {};
            const name = String(childObj.name ?? "").trim() || "-";
            const email = String(childObj.email ?? "").trim() || "-";
            const phone = String(childObj.phone ?? "").trim() || "-";
            const address = String(childObj.address ?? "").trim() || "-";

            return (
              <Box key={String(childObj.id ?? `${name}-${index}`)}>
                <Typography variant="mediumLarge" color="white">
                  {name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Email: {email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Phone: {phone}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Address: {address}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </FormModal>

      <FormModal
        open={isAddOpen}
        title={modalStep === 1 ? "Reseller / Parent Company" : "Add Child Companies"}
        description={
          modalStep === 1
            ? "Provide basic details about the parent company."
            : "Set up multiple child companies and their associated websites."
        }
        onClose={handleCloseModal}
        onSave={handleModalPrimaryAction}
        primaryButtonLabel={modalStep === 1 ? "Next" : "Create"}
        cancelButtonLabel="Cancel"
      >
        <Box sx={stepperOuter}>
          <Box sx={stepperSegment}>
            {modalStep >= 2 ? (
              <CheckCircleIcon sx={stepperCheckIcon} />
            ) : (
              <Box sx={stepperNumberCircleActive}>1</Box>
            )}
            <Typography
              variant="body2"
              sx={modalStep >= 2 ? stepperLabelResellerDone : stepperLabelResellerActive}
            >
              Reseller / Parent Company
            </Typography>
          </Box>
          <Box sx={stepperDivider} />
          <Box sx={stepperSegment}>
            {modalStep === 2 ? (
              <CheckCircleIcon sx={stepperCheckIcon} />
            ) : (
              <Box sx={stepperNumberCircleInactive}>2</Box>
            )}
            <Typography
              variant="body2"
              sx={modalStep === 2 ? stepperLabelChildDone : stepperLabelChildInactive}
            >
              Child Company Setup
            </Typography>
          </Box>
        </Box>

        {modalStep === 1 ? (
          <>
            <SelectField
              label="Client"
              value={clientType}
              onChange={setClientType}
              options={[
                { label: "External", value: "External" },
                { label: "Internal", value: "Internal" },
              ]}
            />
            <InputField
              label="Parent Company Name"
              placeholder="Roadmap"
              value={parentCompanyName}
              onChange={(event) => setParentCompanyName(event.target.value)}
            />
            <InputField
              label="Address"
              placeholder="Linked Department"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />
            <InputField
              label="Email"
              placeholder="Linked Department"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <InputField
              label="Phone Number"
              placeholder="Linked Department"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
            />
            {!isStepOneComplete && (
              <Typography variant="body2" sx={stepOneIncompleteHint}>
                Fill all fields to continue to next step.
              </Typography>
            )}
          </>
        ) : (
          <>
            {Array.from({ length: childCompanySectionCount }).map((_, index) => (
              <Box key={`child-company-section-${index}`} sx={sectionStack}>
                <Box sx={sectionHeaderRow}>
                  <Typography variant="mediumLarge" color="white">
                    {`Child Company ${index + 1}`}
                  </Typography>
                  <IconButton size="small" sx={deleteIconButton}>
                    <DeleteCircleIcon width={43} height={43} />
                  </IconButton>
                </Box>
                <InputField label="Child Company Name" placeholder="External" />
                <InputField label="Address" placeholder="Role Type" />
                <InputField label="POC Name" placeholder="Linked Department" />
                <InputField label="Phone Number" placeholder="Linked Department" />
              </Box>
            ))}
            <Box
              component="button"
              type="button"
              onClick={() => setChildCompanySectionCount((prev) => prev + 1)}
              sx={addAnotherButton}
            >
              <AddCircleIcon width={16} height={16} sx={addAnotherIcon} />
              <Typography variant="body2" sx={addAnotherLabel}>
                Add Another Child Company
              </Typography>
            </Box>

            {Array.from({ length: websiteSectionCount }).map((_, index) => (
              <Box key={`website-section-${index}`} sx={sectionStack}>
                <Box sx={index === 0 ? sectionHeaderRowWebsiteFirst : sectionHeaderRowWebsiteRest}>
                  <Typography variant="mediumLarge" color="white">
                    {index === 0 ? "Associated Website" : `Associated Website ${index + 1}`}
                  </Typography>
                  <IconButton size="small" sx={deleteIconButton}>
                    <DeleteCircleIcon width={43} height={43} />
                  </IconButton>
                </Box>
                <InputField label="Website URL" placeholder="External" />
                <InputField label="Website Address (Physical)" placeholder="Role Type" />
                <Box sx={websiteTwoColGrid}>
                  <InputField label="Site POC Name" placeholder="Support Manager" />
                  <InputField label="Site Phone" placeholder="Sals" />
                </Box>
              </Box>
            ))}
            <Box
              component="button"
              type="button"
              onClick={() => setWebsiteSectionCount((prev) => prev + 1)}
              sx={addAnotherButton}
            >
              <AddCircleIcon width={16} height={16} sx={addAnotherIcon} />
              <Typography variant="body2" sx={addAnotherLabel}>
                Add Another website
              </Typography>
            </Box>
          </>
        )}
      </FormModal>
    </Box>
  );
}
