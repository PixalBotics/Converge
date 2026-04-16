"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { AddCircleIcon } from "@/components/dashboard/icons/AddCircleIcon";
import { Typography, Button } from "@/components/common";
import { useUserFilterSuggestionsQuery, useUsersListQuery } from "@/lib/hooks";
import { UserStatsCards } from "./components/UserStatsCards";
import { UsersTableSection } from "./components/UsersTableSection";
import { AddUserModal } from "./components/AddUserModal";
import { type FilterKind } from "./types";
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
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [filterKind, setFilterKind] = useState<FilterKind>("user");
  const [selectedSuggestion, setSelectedSuggestion] = useState<{ id: string; label: string } | undefined>(undefined);
  const [appliedFilterIds, setAppliedFilterIds] = useState<{
    userId?: string;
    companyId?: string;
    parentCompanyId?: string;
    departmentId?: string;
    designationId?: string;
  }>({});

  const usersQuery = useUsersListQuery({
    page,
    limit: 20,
    search: appliedSearch.trim() || undefined,
    userId: appliedFilterIds.userId,
    companyId: appliedFilterIds.companyId,
    parentCompanyId: appliedFilterIds.parentCompanyId,
    departmentId: appliedFilterIds.departmentId,
    designationId: appliedFilterIds.designationId,
  });

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

  return (
    <Box sx={overviewPageWrapper}>
      <Box sx={overviewHeader}>
        <Typography variant="regularLarge" fontWeight={700} color="white">
          User Page
        </Typography>
        <Box sx={overviewAddButtonWrapper}>
          <Button
            variant="primary"
            sx={overviewAddButton}
            onClick={() => setIsAddOpen(true)}
          >
            <AddCircleIcon width={16} height={16} />
            <Typography component="span" variant="medium" sx={{ color: "inherit" }}>
              Add New User
            </Typography>
          </Button>
        </Box>
      </Box>

      <UserStatsCards
        theme={theme}
        totalUsers={totalEntries}
        internalCount={internalCount}
        externalCount={externalCount}
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
        rows={tableRows}
        page={page}
        pageCount={totalPages}
        onPageChange={setPage}
        totalEntries={totalEntries}
      />

      <AddUserModal open={isAddOpen} onClose={() => setIsAddOpen(false)} theme={theme} />
    </Box>
  );
}
