"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { AddCircleIcon } from "@/components/common/icons";
import { Typography, Button, type FilterableComboOption } from "@/components/common";
import {
  useCompaniesByResellerQuery,
  useCompaniesSetupResellersQuery,
  useUserFilterSuggestionsQuery,
  useUsersListQuery,
} from "@/lib/hooks";
import { useAuth, resolveSessionListFilterScope } from "@/lib/auth";
import { isAuthTransitionActive } from "@/lib/auth/auth-transition";
import { PAGE } from "@/lib/permissions";
import { UserStatsCards } from "./components/UserStatsCards";
import { UsersTableSection } from "./components/UsersTableSection";
import { AddUserModal } from "./components/AddUserModal";
import { type FilterKind, type UserListTypeFilter } from "./types";
import {
  extractParentCompaniesFromByResellerTree,
  pickItemsArray,
  toIdNameOption,
} from "./components/add-user-modal.utils";
import {
  extractUserCounts,
  extractUserSuggestions,
  extractUsersRows,
  extractUsersTotal,
  extractUsersTotalPages,
} from "./utils";
import {
  overviewPageWrapper,
  overviewHeader,
  overviewAddButtonWrapper,
  overviewAddButton,
} from "./overview.styles";

export default function UserPage() {
  const theme = useTheme() as AppTheme;
  const { hasOperational, hasPage, isPlatformAdmin, user: authUser } = useAuth();
  const canAccessUsersPage = hasPage(PAGE.USERS);
  const listFilterScope = useMemo(
    () => resolveSessionListFilterScope(isPlatformAdmin, authUser),
    [isPlatformAdmin, authUser],
  );
  const showInternalUsersCard = listFilterScope.mayPickInternal;
  const canCreateUser = hasOperational("user:create");
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | undefined>(undefined);
  const [filterKind, setFilterKind] = useState<FilterKind>("user");
  const [selectedSuggestion, setSelectedSuggestion] = useState<{ id: string; label: string } | undefined>(undefined);
  const [appliedFilterIds, setAppliedFilterIds] = useState<{
    userId?: string;
    companyId?: string;
    parentCompanyId?: string;
    departmentId?: string;
    designationId?: string;
  }>({});
  const [listUserTypeFilter, setListUserTypeFilter] = useState<UserListTypeFilter>("all");
  const [listScopeResellerId, setListScopeResellerId] = useState("");
  const [listScopeParentCompanyId, setListScopeParentCompanyId] = useState("");

  const tenantScopeActive =
    listFilterScope.showTenantScopeFilters &&
    (listUserTypeFilter === "External" || !listFilterScope.mayPickInternal);

  useEffect(() => {
    if (listFilterScope.lockedResellerId) {
      setListScopeResellerId(listFilterScope.lockedResellerId);
    }
    if (listFilterScope.lockedParentCompanyId) {
      setListScopeParentCompanyId(listFilterScope.lockedParentCompanyId);
    }
    if (!listFilterScope.mayPickInternal) {
      setListUserTypeFilter((prev) =>
        prev === "Internal" ? listFilterScope.defaultUserTypeFilter : prev,
      );
    }
  }, [listFilterScope]);

  const resellersQuery = useCompaniesSetupResellersQuery({
    enabled: tenantScopeActive && listFilterScope.resellerPickerMode !== "hidden",
  });
  const companiesByResellerQuery = useCompaniesByResellerQuery(
    listScopeResellerId,
    { view: "tree", sortBy: "name", sortOrder: "asc", all: true },
    { enabled: tenantScopeActive && listScopeResellerId.trim().length > 0 },
  );

  const resellerOptions = useMemo(() => {
    return pickItemsArray(resellersQuery.data)
      .map((row) => toIdNameOption(row))
      .filter((o): o is { value: string; label: string } => o !== null);
  }, [resellersQuery.data]);

  const resellerSelectOptions = useMemo((): FilterableComboOption[] => {
    if (resellersQuery.isLoading) {
      return [{ value: "", label: "Loading resellers…", disabled: true }];
    }
    const head: FilterableComboOption = { value: "", label: "Any reseller (optional)" };
    return resellerOptions.length > 0 ? [head, ...resellerOptions] : [head];
  }, [resellerOptions, resellersQuery.isLoading]);

  const parentCompanySelectOptions = useMemo((): FilterableComboOption[] => {
    if (!tenantScopeActive) {
      return [{ value: "", label: "—", disabled: true }];
    }
    if (!listScopeResellerId.trim()) {
      return [{ value: "", label: "Choose a reseller first", disabled: true }];
    }
    const parents = extractParentCompaniesFromByResellerTree(companiesByResellerQuery.data);
    if (companiesByResellerQuery.isFetching && parents.length === 0) {
      return [{ value: "", label: "Loading parent companies…", disabled: true }];
    }
    const head: FilterableComboOption = { value: "", label: "Any parent under reseller" };
    return parents.length > 0
      ? [head, ...parents]
      : [{ value: "", label: "No parent companies for this reseller", disabled: true }];
  }, [tenantScopeActive, listScopeResellerId, companiesByResellerQuery.data, companiesByResellerQuery.isFetching]);

  const effectiveListUserType =
    listUserTypeFilter === "all"
      ? listFilterScope.mayPickInternal
        ? undefined
        : "External"
      : listUserTypeFilter;

  /** Reseller list ids are company rows — GET /users scopes reseller-only via `companyId`, not `resellerId`. */
  const externalResellerOnlyCompanyId =
    tenantScopeActive &&
    listScopeResellerId.trim().length > 0 &&
    !listScopeParentCompanyId.trim()
      ? listScopeResellerId.trim()
      : undefined;

  const usersQuery = useUsersListQuery(
    {
      page,
      limit: 20,
      search: appliedSearch.trim() || undefined,
      userType: effectiveListUserType,
      parentCompanyId:
        listUserTypeFilter === "External" && listScopeParentCompanyId.trim()
          ? listScopeParentCompanyId.trim()
          : appliedFilterIds.parentCompanyId,
      userId: appliedFilterIds.userId,
      companyId: externalResellerOnlyCompanyId ?? appliedFilterIds.companyId,
      departmentId: appliedFilterIds.departmentId,
      designationId: appliedFilterIds.designationId,
    },
    {
      enabled: canAccessUsersPage && !isAuthTransitionActive(),
    },
  );

  const userTypeaheadQuery = useUserFilterSuggestionsQuery(
    {
      kind: filterKind,
      q: searchInput,
    },
    {
      enabled: searchInput.trim().length > 0,
    },
  );

  const apiRows = useMemo(() => extractUsersRows(usersQuery.data), [usersQuery.data]);
  const tableRows = apiRows;

  const userSuggestions = useMemo(
    () => extractUserSuggestions(userTypeaheadQuery.data),
    [userTypeaheadQuery.data],
  );
  const isSuggestionsLoading = userTypeaheadQuery.isFetching && searchInput.trim().length > 0;

  const runSearch = () => {
    const nextIds: {
      userId?: string;
      companyId?: string;
      parentCompanyId?: string;
      departmentId?: string;
      designationId?: string;
    } = {};
    if (selectedSuggestion?.id) {
      if (filterKind === "user") nextIds.userId = selectedSuggestion.id;
      if (filterKind === "company" || filterKind === "reseller") nextIds.companyId = selectedSuggestion.id;
      if (filterKind === "parentCompany") nextIds.parentCompanyId = selectedSuggestion.id;
      if (filterKind === "department") nextIds.departmentId = selectedSuggestion.id;
      if (filterKind === "designation" || filterKind === "role") nextIds.designationId = selectedSuggestion.id;
    }
    setAppliedSearch(searchInput);
    setAppliedFilterIds(nextIds);
    setPage(1);
  };

  const searchSubmitDisabled = useMemo(() => {
    if (searchInput.trim() !== appliedSearch.trim()) return false;

    const draftIds: typeof appliedFilterIds = {};
    if (selectedSuggestion?.id) {
      if (filterKind === "user") draftIds.userId = selectedSuggestion.id;
      if (filterKind === "company" || filterKind === "reseller") draftIds.companyId = selectedSuggestion.id;
      if (filterKind === "parentCompany") draftIds.parentCompanyId = selectedSuggestion.id;
      if (filterKind === "department") draftIds.departmentId = selectedSuggestion.id;
      if (filterKind === "designation" || filterKind === "role") draftIds.designationId = selectedSuggestion.id;
    }

    const keys = ["userId", "companyId", "parentCompanyId", "departmentId", "designationId"] as const;
    return keys.every((key) => (draftIds[key] ?? undefined) === (appliedFilterIds[key] ?? undefined));
  }, [searchInput, appliedSearch, filterKind, selectedSuggestion, appliedFilterIds]);

  useEffect(() => {
    // When search is cleared via the SearchBar cross button, reset filters to show full data.
    if (searchInput.trim().length > 0) return;
    if (!appliedSearch && !appliedFilterIds.userId && !appliedFilterIds.companyId && !appliedFilterIds.parentCompanyId && !appliedFilterIds.departmentId && !appliedFilterIds.designationId) {
      return;
    }
    setSelectedSuggestion(undefined);
    setAppliedSearch("");
    setAppliedFilterIds({});
    setPage(1);
  }, [searchInput, appliedSearch, appliedFilterIds]);

  const { internalCount, externalCount } = useMemo(
    () => extractUserCounts(usersQuery.data),
    [usersQuery.data],
  );
  const totalEntries = useMemo(() => extractUsersTotal(usersQuery.data), [usersQuery.data]);
  const totalPages = useMemo(() => extractUsersTotalPages(usersQuery.data), [usersQuery.data]);

  useEffect(() => {
    if (page <= totalPages) return;
    setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    if (showInternalUsersCard || listUserTypeFilter !== "Internal") return;
    setListUserTypeFilter("all");
    setPage(1);
  }, [showInternalUsersCard, listUserTypeFilter]);

  const handleListUserTypeFilterChange = (value: UserListTypeFilter) => {
    setListUserTypeFilter(value);
    if (value !== "External" && !listFilterScope.lockedResellerId) {
      setListScopeResellerId("");
      setListScopeParentCompanyId("");
    } else if (value !== "External") {
      setListScopeResellerId(listFilterScope.lockedResellerId ?? "");
      setListScopeParentCompanyId(listFilterScope.lockedParentCompanyId ?? "");
    }
    setPage(1);
  };

  const handleListScopeResellerChange = (value: string) => {
    setListScopeResellerId(value);
    if (!listFilterScope.lockedParentCompanyId) {
      setListScopeParentCompanyId("");
    }
    setPage(1);
  };

  const handleListScopeParentCompanyChange = (value: string) => {
    setListScopeParentCompanyId(value);
    setPage(1);
  };

  const resetListFilters = () => {
    setListUserTypeFilter(listFilterScope.defaultUserTypeFilter);
    setListScopeResellerId(listFilterScope.lockedResellerId ?? "");
    setListScopeParentCompanyId(listFilterScope.lockedParentCompanyId ?? "");
    setPage(1);
  };

  return (
    <Box sx={overviewPageWrapper}>
      <Box sx={overviewHeader}>
        <Typography variant="regularLarge" fontWeight={700} color="white">
          User Page
        </Typography>
        {canCreateUser ? (
          <Box sx={overviewAddButtonWrapper}>
            <Button
              variant="primary"
              sx={overviewAddButton}
              onClick={() => {
                setEditingUserId(undefined);
                setIsAddOpen(true);
              }}
            >
              <AddCircleIcon width={16} height={16} />
              <Typography component="span" variant="medium" sx={{ color: "inherit" }}>
                Add New User
              </Typography>
            </Button>
          </Box>
        ) : null}
      </Box>

      <UserStatsCards
        theme={theme}
        totalUsers={totalEntries}
        internalCount={internalCount}
        externalCount={externalCount}
        showInternalUsersCard={showInternalUsersCard}
      />

      <UsersTableSection
        theme={theme}
        filterKind={filterKind}
        setFilterKind={setFilterKind}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        suggestions={userSuggestions}
        selectedSuggestion={selectedSuggestion}
        setSelectedSuggestion={setSelectedSuggestion}
        isSuggestionsLoading={isSuggestionsLoading}
        onSearch={runSearch}
        searchSubmitDisabled={searchSubmitDisabled}
        listUserTypeFilter={listUserTypeFilter}
        onListUserTypeFilterChange={handleListUserTypeFilterChange}
        showInternalUserTypeOption={showInternalUsersCard}
        listFilterScope={listFilterScope}
        listScopeResellerId={listScopeResellerId}
        listScopeParentCompanyId={listScopeParentCompanyId}
        onListScopeResellerChange={handleListScopeResellerChange}
        onListScopeParentCompanyChange={handleListScopeParentCompanyChange}
        resellerSelectOptions={resellerSelectOptions}
        parentCompanySelectOptions={parentCompanySelectOptions}
        resellerFilterDisabled={resellersQuery.isLoading}
        onResetListFilters={resetListFilters}
        rows={tableRows}
        page={page}
        pageCount={totalPages}
        onPageChange={setPage}
        totalEntries={totalEntries}
        onEditUser={(id) => {
          setEditingUserId(id);
          setIsAddOpen(true);
        }}
      />

      <AddUserModal
        open={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setEditingUserId(undefined);
        }}
        theme={theme}
        editUserId={editingUserId}
        onSaved={() => {
          void usersQuery.refetch();
        }}
      />
    </Box>
  );
}
