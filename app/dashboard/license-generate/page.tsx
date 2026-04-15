"use client";

import { useCallback, useMemo, useState } from "react";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import FilterList from "@mui/icons-material/FilterList";
import Send from "@mui/icons-material/Send";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { filterChromeButtonSx } from "@/components/common/FilterButton/filter-button.styles";
import { resolveSx } from "@/utils/resolveSx";
import {
  Button,
  Checkbox,
  DashboardCard,
  DataTable,
  FilterButton,
  InputField,
  SearchBar,
  SelectField,
  TablePagination,
  Typography,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  licenseGenerateFilterCard,
  licenseGenerateFilterGrid,
  licenseGenerateFilterIconBox,
  licenseGenerateFilterTitleRow,
  licenseGenerateFooterRow,
  licenseGenerateHeaderActions,
  licenseGeneratePageHeader,
  licenseGeneratePageWrapper,
  licenseGeneratePaginationWrapper,
  licenseGenerateSearchFieldWrapper,
  licenseGenerateSearchRow,
  licenseGenerateTableCard,
  licenseGenerateTableToolbar,
} from "./license-generate.styles";

interface ChildCompanyRow extends Record<string, unknown> {
  id: string;
  childCompany: string;
  website: string;
  address: string;
  poc: string;
  email: string;
  phone: string;
}

const TOTAL_ENTRIES = 256_000;
const CHILD_COUNT = 12;

const TABLE_ROWS: ChildCompanyRow[] = [
  {
    id: "1",
    childCompany: "Mative Group",
    website: "mative.io",
    address: "Karachi, PK",
    poc: "Raja Saif",
    email: "rajasaifali125@gmail.com",
    phone: "+92 313 939237",
  },
  {
    id: "2",
    childCompany: "Northwind Labs",
    website: "northwind.io",
    address: "Lahore, PK",
    poc: "Ali Khan",
    email: "ali@northwind.io",
    phone: "+92 300 1112233",
  },
  {
    id: "3",
    childCompany: "BluePeak Media",
    website: "bluepeak.com",
    address: "Islamabad, PK",
    poc: "Sara Ahmed",
    email: "sara@bluepeak.com",
    phone: "+92 321 4445566",
  },
  {
    id: "4",
    childCompany: "Vertex Systems",
    website: "vertexsys.net",
    address: "Dubai, AE",
    poc: "Omar Hassan",
    email: "omar@vortex.net",
    phone: "+971 50 9876543",
  },
  {
    id: "5",
    childCompany: "CloudForge",
    website: "cloudforge.dev",
    address: "Remote",
    poc: "Emma Lee",
    email: "emma@cloudforge.dev",
    phone: "+1 415 555 0199",
  },
  {
    id: "6",
    childCompany: "DataNest",
    website: "datanest.ai",
    address: "Singapore, SG",
    poc: "Wei Chen",
    email: "wei@datanest.ai",
    phone: "+65 9123 4567",
  },
  {
    id: "7",
    childCompany: "PixelWorks",
    website: "pixelworks.co",
    address: "London, UK",
    poc: "James Cole",
    email: "james@pixelworks.co",
    phone: "+44 20 7946 0958",
  },
  {
    id: "8",
    childCompany: "StreamLine Co",
    website: "streamline.app",
    address: "Toronto, CA",
    poc: "Nina Patel",
    email: "nina@streamline.app",
    phone: "+1 647 555 0142",
  },
];

const RESELLER_OPTIONS = [
  { label: "TechDistributors", value: "techdistributors" },
  { label: "Global Tech Resellers", value: "global" },
];

const PARENT_OPTIONS = [
  { label: "ABC Group", value: "abc" },
  { label: "Enterprise Holdings", value: "enterprise" },
];

const CHILD_OPTIONS = [
  { label: "Mative Group", value: "mative" },
  { label: "Regional Unit A", value: "regional-a" },
];

function formatEntries(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

export default function LicenseGeneratePage() {
  const theme = useTheme() as AppTheme;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageCount = 2;
  const [reseller, setReseller] = useState("techdistributors");
  const [parentCompany, setParentCompany] = useState("abc");
  const [childCompany, setChildCompany] = useState("mative");
  const [poc, setPoc] = useState("Raja Saif");
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return TABLE_ROWS;
    return TABLE_ROWS.filter(
      (row) =>
        row.childCompany.toLowerCase().includes(q) ||
        row.website.toLowerCase().includes(q) ||
        row.address.toLowerCase().includes(q) ||
        row.poc.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q) ||
        row.phone.toLowerCase().includes(q)
    );
  }, [search]);

  const toggleRow = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    const ids = filteredRows.map((r) => r.id);
    setSelected((prev) => {
      const allOn = ids.length > 0 && ids.every((id) => prev.has(id));
      if (allOn) return new Set();
      return new Set(ids);
    });
  }, [filteredRows]);

  const allSelected =
    filteredRows.length > 0 && filteredRows.every((r) => selected.has(r.id));
  const someSelected = selected.size > 0 && !allSelected;

  const columns = useMemo<DataTableColumn<ChildCompanyRow>[]>(
    () => [
      {
        id: "select",
        label: "",
        headerRender: () => (
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected}
            onChange={toggleAll}
            inputProps={{ "aria-label": "Select all rows" }}
          />
        ),
        render: (_, row) => (
          <Checkbox
            checked={selected.has(row.id)}
            onChange={() => toggleRow(row.id)}
            inputProps={{ "aria-label": `Select ${row.childCompany}` }}
          />
        ),
      },
      { id: "childCompany", label: "Child Company" },
      { id: "website", label: "Website", cellVariant: "muted" },
      { id: "address", label: "Address", cellVariant: "muted" },
      { id: "poc", label: "POC" },
      { id: "email", label: "Email", cellVariant: "muted" },
      { id: "phone", label: "Phone", cellVariant: "muted" },
    ],
    [allSelected, someSelected, toggleAll, toggleRow, selected]
  );

  return (
    <Box sx={licenseGeneratePageWrapper}>
      <Box sx={licenseGeneratePageHeader}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} color="white" sx={{ mb: 0.5 }}>
            License Generate
          </Typography>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 520 }}>
            Generate and distribute licenses to client companies
          </Typography>
        </Box>
        <Box sx={licenseGenerateHeaderActions}>
          <Button variant="outlined" type="button" startIcon={<Send sx={{ fontSize: 18 }} />}>
            Send Selected
          </Button>
          <Button type="button" variant="primary" sx={gradientPrimaryButtonSx} startIcon={<AutoAwesome sx={{ fontSize: 18 }} />}>
            Generate License
          </Button>
        </Box>
      </Box>

      <DashboardCard sx={licenseGenerateFilterCard}>
        <Box sx={licenseGenerateFilterTitleRow}>
          <Box sx={licenseGenerateFilterIconBox}>
            <FilterList sx={{ fontSize: 20 }} />
          </Box>
          <Typography variant="mediumLarge" color="white" fontWeight={600}>
            Select Filter
          </Typography>
        </Box>
        <Box sx={licenseGenerateFilterGrid}>
          <SelectField
            label="Client Of (Reseller)"
            value={reseller}
            onChange={setReseller}
            options={RESELLER_OPTIONS}
          />
          <SelectField label="Parent Company" value={parentCompany} onChange={setParentCompany} options={PARENT_OPTIONS} />
          <SelectField label="Child Company" value={childCompany} onChange={setChildCompany} options={CHILD_OPTIONS} />
          <InputField label="POC" name="poc" placeholder="POC" value={poc} onChange={(e) => setPoc(e.target.value)} />
          <Box sx={{ display: "flex", justifyContent: { xs: "stretch", lg: "flex-end" } }}>
            <Button
              type="button"
              variant="outlined"
              sx={{
                ...resolveSx(filterChromeButtonSx, theme),
                width: { xs: "100%", lg: "auto" },
              }}
            >
              Apply Filter
            </Button>
          </Box>
        </Box>
      </DashboardCard>

      <DashboardCard sx={licenseGenerateTableCard}>
        <Box sx={licenseGenerateTableToolbar}>
          <Typography variant="mediumLarge" color="white" fontWeight={600}>
            Child Companies ({CHILD_COUNT})
          </Typography>
          <Box sx={licenseGenerateSearchRow}>
            <Box sx={licenseGenerateSearchFieldWrapper}>
              <SearchBar value={search} onChange={setSearch} placeholder="Search anything.." sx={{ minWidth: "100%" }} />
            </Box>
            <FilterButton sx={{ whiteSpace: "nowrap", alignSelf: { xs: "stretch", sm: "center" } }} />
          </Box>
        </Box>

        <DataTable<ChildCompanyRow>
          columns={columns}
          rows={filteredRows}
          getRowId={(row) => row.id}
          minWidth={1100}
          actionColumn={{
            label: "Action",
            render: () => (
              <Link
                component="button"
                type="button"
                onClick={() => {}}
                sx={{
                  color: theme.app.text.primary,
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontSize: 14,
                  background: "none",
                  border: "none",
                  fontFamily: "inherit",
                  p: 0,
                }}
              >
                Send Mail
              </Link>
            ),
          }}
        />

        <Box sx={licenseGenerateFooterRow}>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
            Showing data 1 to {filteredRows.length} of {formatEntries(TOTAL_ENTRIES)} entries
          </Typography>
          <Box sx={licenseGeneratePaginationWrapper}>
            <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
          </Box>
        </Box>
      </DashboardCard>
    </Box>
  );
}
