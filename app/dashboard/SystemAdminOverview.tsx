"use client";

import { useMemo, useState } from "react";
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
} from "./website-assigning/website-assigning.styles";
import {
  pageWrapper,
  pageHeaderRow,
  cardTitleRow,
  cardTitleIconBox,
  attachMoneyIconSx,
  tableStatusPill,
  tableStatusDot,
  tableStatusCaption,
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
} from "./systemAdminOverview.styles";

type CompanyRow = {
  clientReseller: string;
  parentCompany: string;
  childCompaniesCount: string;
  websitesCount: string;
  status: "Active";
};

const COMPANY_ROWS: CompanyRow[] = [
  { clientReseller: "Jacob Jones", parentCompany: "Binford Ltd.", childCompaniesCount: "235", websitesCount: "21,0912", status: "Active" },
  { clientReseller: "Leslie Alexander", parentCompany: "Abstergo Ltd.", childCompaniesCount: "235", websitesCount: "21,0912", status: "Active" },
  { clientReseller: "Albert Flores", parentCompany: "Barone LLC.", childCompaniesCount: "345", websitesCount: "21,0912", status: "Active" },
  { clientReseller: "Cameron Williamson", parentCompany: "Acme Co.", childCompaniesCount: "2424", websitesCount: "21,0912", status: "Active" },
  { clientReseller: "Eleanor Pena", parentCompany: "Big Kahuna Burger Ltd.", childCompaniesCount: "242", websitesCount: "21,0912", status: "Active" },
  { clientReseller: "Darrell Steward", parentCompany: "Acme Co.", childCompaniesCount: "756", websitesCount: "21,0912", status: "Active" },
  { clientReseller: "Bessie Cooper", parentCompany: "Binford Ltd.", childCompaniesCount: "235", websitesCount: "21,0912", status: "Active" },
  { clientReseller: "Courtney Henry", parentCompany: "Binford Ltd.", childCompaniesCount: "653", websitesCount: "21,0912", status: "Active" },
];

export default function SystemAdminOverview() {
  const theme = useTheme() as AppTheme;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageCount = 2;
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [clientType, setClientType] = useState("External");
  const [parentCompanyName, setParentCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [childCompanySectionCount, setChildCompanySectionCount] = useState(1);
  const [websiteSectionCount, setWebsiteSectionCount] = useState(1);

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
    const q = search.trim().toLowerCase();
    if (!q) return COMPANY_ROWS;
    return COMPANY_ROWS.filter((row) =>
      row.clientReseller.toLowerCase().includes(q) ||
      row.parentCompany.toLowerCase().includes(q) ||
      row.childCompaniesCount.toLowerCase().includes(q) ||
      row.websitesCount.toLowerCase().includes(q) ||
      row.status.toLowerCase().includes(q),
    );
  }, [search]);

  const columns = useMemo<DataTableColumn<CompanyRow>[]>(
    () => [
      { id: "clientReseller", label: "Client Of (Reseller)" },
      { id: "parentCompany", label: "Parent Company" },
      { id: "childCompaniesCount", label: "Child Companies Count" },
      { id: "websitesCount", label: "Websites Count" },
      {
        id: "status",
        label: "Status",
        render: (_, row) => (
          <Box component="span" sx={tableStatusPill}>
            <Box sx={tableStatusDot} />
            <Typography component="span" variant="caption" sx={tableStatusCaption}>
              {row.status}
            </Typography>
          </Box>
        ),
      },
    ],
    [],
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
          getRowId={(row, idx) => `${row.clientReseller}-${idx}`}
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
            Showing data 1 to {filteredRows.length} of 25K entries
          </Typography>
          <Box sx={departmentsPaginationWrapper}>
            <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
          </Box>
        </Box>
      </DashboardCard>

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
