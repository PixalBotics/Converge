"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  DashboardCard,
  DataTable,
  SearchBar,
  SearchSubmitButton,
  TablePagination,
  Typography,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import {
  useClientServicesAccessQuery,
  useResellerServicesAccessQuery,
} from "@/lib/hooks/query/companies/services-access";
import { getResellerModulesCatalog } from "@/api/companies/reseller-modules.api";
import type {
  ClientServicesAccessRow,
  ResellerServicesAccessRow,
} from "@/api/companies/services-access.api";
import { useAuth } from "@/lib/auth";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { pageWrapper, pageHeaderRow } from "@/app/dashboard/companies/overview.styles";
import {
  departmentsCard,
  departmentsCardHeader,
  departmentsFooterRow,
  departmentsPaginationWrapper,
  departmentsSearchRow,
  departmentsSearchFieldWrapper,
} from "@/app/dashboard/website-assigning/website-assigning.styles";
import {
  ModuleChips,
  OfferingTypeChip,
  formatServicesUpdatedAt,
} from "@/features/services/components/services-shared";
import { ResellerModulesEditModal } from "@/features/services/components/ResellerModulesEditModal";
import { ClientServicesDetailModal } from "@/features/services/components/ClientServicesDetailModal";

type ServicesTab = "reseller" | "client";

type EditResellerState = {
  resellerId: string;
  resellerName: string;
};

export function ServicesPageClient() {
  const theme = useTheme() as AppTheme;
  const { hasPage, user } = useAuth();
  const isInternalUser = user?.userType === "Internal";
  const canView = isInternalUser && hasPage("page:account-setup");
  const canEditReseller = canView;

  const [tab, setTab] = useState<ServicesTab>("reseller");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const [moduleLabels, setModuleLabels] = useState<Record<string, string>>({});
  const [editReseller, setEditReseller] = useState<EditResellerState | null>(null);
  const [viewClient, setViewClient] = useState<ClientServicesAccessRow | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getResellerModulesCatalog();
        if (cancelled) return;
        const labels: Record<string, string> = {};
        for (const mod of res.data.modules ?? []) {
          labels[mod.code] = mod.name;
        }
        setModuleLabels(labels);
      } catch {
        // Labels fall back to code strings in chips.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setPage(1);
  }, [tab, search]);

  const listParams = useMemo(
    () => ({
      page,
      limit,
      search: search.trim() || undefined,
    }),
    [page, limit, search],
  );

  const resellerQuery = useResellerServicesAccessQuery(listParams, {
    enabled: canView && tab === "reseller",
  });
  const clientQuery = useClientServicesAccessQuery(listParams, {
    enabled: canView && tab === "client",
  });

  const activeQuery = tab === "reseller" ? resellerQuery : clientQuery;
  const listData = activeQuery.data?.data;
  const rows = listData?.items ?? [];
  const pageCount = listData?.totalPages ?? 1;
  const totalEntries = listData?.total ?? 0;
  const listError = activeQuery.isError ? activeQuery.error : null;

  const resellerColumns = useMemo<DataTableColumn<ResellerServicesAccessRow & Record<string, unknown>>[]>(
    () => [
      { id: "name", label: "Reseller" },
      {
        id: "offeringType",
        label: "Type",
        render: (_v, row) => <OfferingTypeChip type={row.offeringType} />,
      },
      {
        id: "moduleCodes",
        label: "Products",
        render: (_v, row) => (
          <ModuleChips moduleCodes={row.moduleCodes} moduleLabels={moduleLabels} />
        ),
      },
      {
        id: "parentCompanyCount",
        label: "Clients",
        render: (_v, row) => String(row.parentCompanyCount),
      },
      {
        id: "updatedAt",
        label: "Updated",
        render: (_v, row) => formatServicesUpdatedAt(row.updatedAt),
      },
      {
        id: "actions",
        label: "Actions",
        render: (_v, row) => (
          <Button
            variant="secondary"
            size="small"
            onClick={() =>
              setEditReseller({ resellerId: row.resellerId, resellerName: row.name })
            }
          >
            {canEditReseller ? "Edit" : "View"}
          </Button>
        ),
      },
    ],
    [canEditReseller, moduleLabels],
  );

  const clientColumns = useMemo<DataTableColumn<ClientServicesAccessRow & Record<string, unknown>>[]>(
    () => [
      { id: "name", label: "Parent company" },
      { id: "resellerName", label: "Reseller" },
      {
        id: "offeringType",
        label: "Type",
        render: (_v, row) => <OfferingTypeChip type={row.offeringType} />,
      },
      {
        id: "moduleCodes",
        label: "Products",
        render: (_v, row) => (
          <ModuleChips moduleCodes={row.moduleCodes} moduleLabels={moduleLabels} />
        ),
      },
      {
        id: "websiteCount",
        label: "Websites",
        render: (_v, row) => String(row.websiteCount),
      },
      {
        id: "actions",
        label: "Actions",
        render: (_v, row) => (
          <Button variant="secondary" size="small" onClick={() => setViewClient(row)}>
            View
          </Button>
        ),
      },
    ],
    [moduleLabels],
  );

  if (!canView) {
    return (
      <Box sx={pageWrapper}>
        <Typography sx={{ color: theme.app.dashboard.textMuted }}>
          Services is for platform internal users only. Reseller accounts cannot access this page.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={pageWrapper}>
      <Box sx={pageHeaderRow}>
        <Box>
          <Typography variant="regularLarge" fontWeight={700} color="white">
            Services &amp; Access
          </Typography>
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mt: 0.75 }}>
            Manage reseller product modules and see what each client inherits.
          </Typography>
        </Box>
      </Box>

      <Tabs
        value={tab}
        onChange={(_, value: ServicesTab) => setTab(value)}
        sx={{
          minHeight: 40,
          "& .MuiTab-root": {
            color: theme.app.dashboard.textMuted,
            textTransform: "none",
            fontWeight: 600,
            minHeight: 40,
          },
          "& .Mui-selected": { color: theme.app.text.primary },
          "& .MuiTabs-indicator": { bgcolor: theme.app.dashboard.accentBlue },
        }}
      >
        <Tab value="reseller" label="Reseller" />
        <Tab value="client" label="Client" />
      </Tabs>

      <DashboardCard sx={departmentsCard}>
        <Box sx={departmentsCardHeader}>
          <Typography fontWeight={700} sx={{ color: theme.app.text.primary }}>
            {tab === "reseller" ? "Reseller product access" : "Client product access"}
          </Typography>
        </Box>

        <Box sx={departmentsSearchRow}>
          <Box sx={departmentsSearchFieldWrapper}>
            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
              placeholder={
                tab === "reseller" ? "Search resellers…" : "Search clients or resellers…"
              }
            />
          </Box>
          <SearchSubmitButton
            onClick={() => {
              setSearch(searchInput.trim());
              setPage(1);
            }}
          />
        </Box>

        {listError ? (
          <Typography sx={{ color: "rgba(248,113,113,0.95)", px: 2, pb: 1 }}>
            {extractApiErrorMessageForToast(listError, "Could not load services access.")}
          </Typography>
        ) : null}

        {tab === "reseller" ? (
          <DataTable<ResellerServicesAccessRow & Record<string, unknown>>
            columns={resellerColumns}
            rows={rows as (ResellerServicesAccessRow & Record<string, unknown>)[]}
            getRowId={(row) => row.resellerId}
            isLoading={resellerQuery.isLoading}
            minWidth={900}
            emptyState={{ title: "No resellers found" }}
          />
        ) : (
          <DataTable<ClientServicesAccessRow & Record<string, unknown>>
            columns={clientColumns}
            rows={rows as (ClientServicesAccessRow & Record<string, unknown>)[]}
            getRowId={(row) => row.parentCompanyId}
            isLoading={clientQuery.isLoading}
            minWidth={900}
            emptyState={{ title: "No client companies found" }}
          />
        )}

        <Box sx={departmentsFooterRow}>
          <Typography variant="body2" sx={{ color: alpha(theme.app.dashboard.textMuted, 0.95) }}>
            {totalEntries} {totalEntries === 1 ? "entry" : "entries"}
          </Typography>
          <Box sx={departmentsPaginationWrapper}>
            <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
          </Box>
        </Box>
      </DashboardCard>

      <ResellerModulesEditModal
        open={Boolean(editReseller)}
        resellerId={editReseller?.resellerId ?? ""}
        resellerName={editReseller?.resellerName}
        canEdit={canEditReseller}
        onClose={() => setEditReseller(null)}
      />

      <ClientServicesDetailModal
        open={Boolean(viewClient)}
        row={viewClient}
        moduleLabels={moduleLabels}
        canEditReseller={canEditReseller}
        onClose={() => setViewClient(null)}
        onEditReseller={(resellerId: string, resellerName: string) => {
          setTab("reseller");
          setEditReseller({ resellerId, resellerName });
        }}
      />
    </Box>
  );
}
