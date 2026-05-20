"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import PeopleOutline from "@mui/icons-material/PeopleOutline";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { FORM_MODAL_MUI_OVERLAY_Z_INDEX } from "@/lib/ui/dialogStacking";
import {
  applyOutlineFieldCursorPosition,
  resetOutlineFieldCursorPosition,
} from "@/components/common/InputField/outlineFieldCursor";
import { textFieldStyles } from "@/components/common/InputField/InputField.styles";
import {
  selectFieldStyles,
  selectMenuItemSx,
  selectMenuPaperSx,
} from "@/components/common/SelectField/SelectField.styles";
import {
  Button,
  Checkbox,
  DashboardCard,
  DataTable,
  FormModal,
  SearchBar,
  SelectField,
  Typography,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import {
  extractChildCompanyOptionsForParentFromByResellerTree,
  extractParentCompaniesFromByResellerTree,
  pickItemsArray,
  toIdNameOption,
} from "@/app/dashboard/user-page/components/add-user-modal.utils";
import type { UserRow } from "@/app/dashboard/user-page/types";
import { extractUsersRows } from "@/app/dashboard/user-page/utils";
import { useAuth, sessionMayPickInternalUserScope, useResellerListScope } from "@/lib/auth";
import {
  buildWebsitesInScopeParams,
  useAssignWebsiteTierMutation,
  useCompaniesSetupResellersQuery,
  useScopedCompanyTreeQuery,
  useUsersListQuery,
  useWebsiteAssignmentsWebsitesQuery,
} from "@/lib/hooks";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";
import { SearchIcon } from "@/components/common/icons";
import {
  assignWebsiteFormGridSx,
  assignWebsiteUserListCardSx,
  assignWebsiteUserListIconSx,
} from "./assign-website-modal.styles";

const MODAL_USER_PAGE_LIMIT = 100;
const MAX_SELECTED_USERS = 3;

const RANK_OPTIONS = [
  { label: "Primary", value: "Primary" },
  { label: "Secondary", value: "Secondary" },
  { label: "Backup", value: "Backup" },
] as const;

type Rank = (typeof RANK_OPTIONS)[number]["value"];

type AssignUserRow = {
  rowKey: string;
  id: string;
  displayName: string;
  email: string;
  department: string;
  userKind: "Internal" | "External";
};

type AssignmentState = {
  keys: string[];
  ranks: Record<string, Rank>;
};

function rowKeyForUser(kind: "Internal" | "External", id: string) {
  return `${kind}:${id}`;
}

/** Row keys are `Internal:<userId>` / `External:<userId>` — API only needs `userId`. */
function userIdFromAssignRowKey(rowKey: string): string {
  const i = rowKey.indexOf(":");
  return i === -1 ? rowKey : rowKey.slice(i + 1);
}

function ranksTakenByOthers(rowKey: string, keys: string[], ranks: Record<string, Rank>): Set<Rank> {
  const used = new Set<Rank>();
  for (const k of keys) {
    if (k === rowKey) continue;
    used.add(ranks[k] ?? "Primary");
  }
  return used;
}

function firstAvailableRank(keys: string[], ranks: Record<string, Rank>, newKey: string): Rank {
  const used = ranksTakenByOthers(newKey, keys, ranks);
  const found = RANK_OPTIONS.find((o) => !used.has(o.value));
  return found?.value ?? "Primary";
}

function userRowToAssignRow(row: UserRow): AssignUserRow {
  const userKind = row.type === "Internal" ? "Internal" : "External";
  return {
    rowKey: rowKeyForUser(userKind, row.id),
    id: row.id,
    displayName: row.user,
    email: row.email,
    department: row.department,
    userKind,
  };
}

function mergeAssignUserRows(...groups: UserRow[][]): AssignUserRow[] {
  const byKey = new Map<string, AssignUserRow>();
  for (const rows of groups) {
    for (const row of rows) {
      const assignRow = userRowToAssignRow(row);
      if (!byKey.has(assignRow.rowKey)) byKey.set(assignRow.rowKey, assignRow);
    }
  }
  return [...byKey.values()];
}

export interface AssignWebsiteModalProps {
  open: boolean;
  onClose: () => void;
  onAssign?: () => void;
}

export function AssignWebsiteModal({ open, onClose, onAssign }: AssignWebsiteModalProps) {
  const theme = useTheme() as AppTheme;
  const { isPlatformAdmin, user: authUser } = useAuth();
  const { canFilterByResellerId, sessionResellerId } = useResellerListScope();
  const mayListInternalUsers = useMemo(
    () => sessionMayPickInternalUserScope(isPlatformAdmin, authUser?.userType),
    [isPlatformAdmin, authUser?.userType],
  );
  const assignTierMutation = useAssignWebsiteTierMutation();
  /** Bumped when the assign modal closes so an in-flight assign does not toast after cancel. */
  const assignSaveGenerationRef = useRef(0);

  const [resellerId, setResellerId] = useState("");
  const [parentCompanyId, setParentCompanyId] = useState("");
  const [childCompanyId, setChildCompanyId] = useState("");
  const [websiteId, setWebsiteId] = useState("");

  const [userSearchInput, setUserSearchInput] = useState("");
  const [userSearchApplied, setUserSearchApplied] = useState("");

  const [assignment, setAssignment] = useState<AssignmentState>({ keys: [], ranks: {} });

  useEffect(() => {
    if (open && !canFilterByResellerId && sessionResellerId) {
      setResellerId(sessionResellerId);
    }
  }, [open, canFilterByResellerId, sessionResellerId]);

  useEffect(() => {
    if (!open) {
      assignSaveGenerationRef.current += 1;
      setResellerId("");
      setParentCompanyId("");
      setChildCompanyId("");
      setWebsiteId("");
      setUserSearchInput("");
      setUserSearchApplied("");
      setAssignment({ keys: [], ranks: {} });
    }
  }, [open]);

  useEffect(() => {
    setParentCompanyId("");
    setChildCompanyId("");
    setWebsiteId("");
  }, [resellerId]);

  useEffect(() => {
    setChildCompanyId("");
    setWebsiteId("");
  }, [parentCompanyId]);

  useEffect(() => {
    setWebsiteId("");
  }, [childCompanyId]);

  const searchParam = userSearchApplied.trim() || undefined;

  const resellersQuery = useCompaniesSetupResellersQuery({
    enabled: open && canFilterByResellerId,
  });
  const companiesTreeQuery = useScopedCompanyTreeQuery(
    resellerId,
    canFilterByResellerId,
    sessionResellerId,
    { enabled: open && (canFilterByResellerId ? resellerId.trim().length > 0 : true) },
  );

  const resellerOptions = useMemo(() => {
    return pickItemsArray(resellersQuery.data)
      .map((row) => toIdNameOption(row))
      .filter((o): o is { value: string; label: string } => o !== null);
  }, [resellersQuery.data]);

  const resellerSelectOptions = useMemo(() => {
    if (resellerOptions.length === 0) {
      return [{ value: "", label: resellersQuery.isLoading ? "Loading resellers…" : "No resellers available" }];
    }
    return [{ value: "", label: "Select reseller" }, ...resellerOptions];
  }, [resellerOptions, resellersQuery.isLoading]);

  const parentCompanyOptions = useMemo(() => {
    if (canFilterByResellerId && !resellerId.trim()) {
      return [{ value: "", label: "Select reseller first" }];
    }
    const extracted = extractParentCompaniesFromByResellerTree(companiesTreeQuery.data).map((o) => ({
      value: o.value,
      label: o.label,
    }));
    if (extracted.length > 0) return [{ value: "", label: "Select parent company" }, ...extracted];
    return [
      {
        value: "",
        label: companiesTreeQuery.isLoading ? "Loading parent companies…" : "No parent companies available",
      },
    ];
  }, [canFilterByResellerId, resellerId, companiesTreeQuery.data, companiesTreeQuery.isLoading]);

  const childCompanyOptions = useMemo(() => {
    if (canFilterByResellerId && !resellerId.trim()) {
      return [{ value: "", label: "Select reseller first" }];
    }
    if (!parentCompanyId.trim()) return [{ value: "", label: "Select parent company first" }];
    const children = extractChildCompanyOptionsForParentFromByResellerTree(
      companiesTreeQuery.data,
      parentCompanyId,
    );
    const withAll = [{ value: "", label: "All child companies (optional)" }, ...children];
    if (children.length > 0) return withAll;
    return [
      {
        value: "",
        label: companiesTreeQuery.isLoading ? "Loading child companies…" : "No child companies for this parent",
      },
    ];
  }, [canFilterByResellerId, resellerId, parentCompanyId, companiesTreeQuery.data, companiesTreeQuery.isLoading]);

  const websitesParams = useMemo(
    () =>
      buildWebsitesInScopeParams({
        canFilterByResellerId,
        all: true,
        resellerId,
        parentCompanyId,
        childCompanyId: childCompanyId.trim() || undefined,
      }),
    [canFilterByResellerId, resellerId, parentCompanyId, childCompanyId],
  );

  const websitesQuery = useWebsiteAssignmentsWebsitesQuery(websitesParams, {
    allowResellerIdFilter: canFilterByResellerId,
    enabled:
      open &&
      parentCompanyId.trim().length > 0 &&
      (canFilterByResellerId ? resellerId.trim().length > 0 : true),
  });

  const websiteSelectOptions = useMemo(() => {
    const items = websitesQuery.data?.data?.items ?? [];
    if (items.length === 0) {
      return [
        {
          value: "",
          label: websitesQuery.isFetching ? "Loading websites…" : "No websites for this selection",
        },
      ];
    }
    return [
      { value: "", label: "Select website" },
      ...items.map((w) => {
        const name = (w.name ?? "").trim() || "Website";
        const url = (w.url ?? "").trim();
        const label = url ? `${name} — ${url}` : name;
        return { value: w.websiteId, label };
      }),
    ];
  }, [websitesQuery.data?.data?.items, websitesQuery.isFetching]);

  const parentCompanyScopeId = parentCompanyId.trim();
  const externalUsersEnabled = open && parentCompanyScopeId.length > 0;

  /** Internal users: no reseller/parent line — load as soon as the modal opens. */
  const internalUsersQuery = useUsersListQuery(
    {
      all: true,
      userType: "Internal",
      page: 1,
      limit: MODAL_USER_PAGE_LIMIT,
      search: searchParam,
    },
    { enabled: open && mayListInternalUsers },
  );

  /** External users: only after parent company is selected (scoped to that company). */
  const externalUsersQuery = useUsersListQuery(
    {
      all: true,
      userType: "External",
      parentCompanyId: parentCompanyScopeId,
      page: 1,
      limit: MODAL_USER_PAGE_LIMIT,
      search: searchParam,
    },
    { enabled: externalUsersEnabled },
  );

  const mergedUserRows = useMemo((): AssignUserRow[] => {
    const internalRows = mayListInternalUsers
      ? extractUsersRows(internalUsersQuery.data).filter((r) => r.type === "Internal")
      : [];
    const externalRows = parentCompanyScopeId
      ? extractUsersRows(externalUsersQuery.data).filter((r) => r.type === "External")
      : [];
    return mergeAssignUserRows(internalRows, externalRows).sort((a, b) => {
      if (a.userKind !== b.userKind) return a.userKind === "Internal" ? -1 : 1;
      return a.displayName.localeCompare(b.displayName, undefined, { sensitivity: "base" });
    });
  }, [externalUsersQuery.data, internalUsersQuery.data, parentCompanyScopeId, mayListInternalUsers]);

  const usersLoading =
    (mayListInternalUsers &&
      (internalUsersQuery.isLoading || internalUsersQuery.isFetching)) ||
    (externalUsersEnabled &&
      (externalUsersQuery.isLoading || externalUsersQuery.isFetching));

  const usersEmptyState = useMemo(() => {
    if (usersLoading) {
      return { title: "Loading users…", description: "Please wait." };
    }
    if (mayListInternalUsers && internalUsersQuery.isError) {
      return {
        title: "Could not load Internal users",
        description: "Check your connection or permissions, then close and reopen this modal.",
      };
    }
    if (!mayListInternalUsers) {
      return {
        title: "Select parent company",
        description:
          "Your login can assign client (External) users only. Choose parent company above — those users load after that selection.",
      };
    }
    if (!parentCompanyScopeId) {
      return {
        title: "No Internal users found",
        description:
          "Type Internal = platform team (shown here without parent company). Add them from Dashboard → User page. Client company staff are type External — select parent company above to list them.",
      };
    }
    return {
      title: "No users in this list",
      description: "Try Search, or add users from the User page, then open this modal again.",
    };
  }, [
    usersLoading,
    mayListInternalUsers,
    parentCompanyScopeId,
    internalUsersQuery.isError,
  ]);

  const toggleRow = useCallback((rowKey: string) => {
    setAssignment((a) => {
      const set = new Set(a.keys);
      if (set.has(rowKey)) {
        set.delete(rowKey);
        const restRanks = { ...a.ranks };
        delete restRanks[rowKey];
        return { keys: [...set], ranks: restRanks };
      }
      if (set.size >= MAX_SELECTED_USERS) return a;
      set.add(rowKey);
      const nextKeys = [...set];
      const pick = firstAvailableRank(nextKeys, a.ranks, rowKey);
      return { keys: nextKeys, ranks: { ...a.ranks, [rowKey]: pick } };
    });
  }, []);

  const selectedSet = useMemo(() => new Set(assignment.keys), [assignment.keys]);

  const changeRank = useCallback((rowKey: string, rank: Rank) => {
    setAssignment((a) => {
      if (!a.keys.includes(rowKey)) return a;
      for (const k of a.keys) {
        if (k === rowKey) continue;
        if ((a.ranks[k] ?? "Primary") === rank) return a;
      }
      return { ...a, ranks: { ...a.ranks, [rowKey]: rank } };
    });
  }, []);

  const rankSelectSx = useMemo(
    () => [
      textFieldStyles(theme),
      ...selectFieldStyles(theme),
      {
        "& .MuiOutlinedInput-root": {
          minHeight: 40,
        },
        "& .MuiSelect-select": {
          color: theme.app.text.primary,
          fontFamily: "Manrope",
          fontWeight: 500,
          fontSize: "14px",
          py: 1,
          display: "flex",
          alignItems: "center",
        },
        "& .MuiSelect-icon": {
          color: theme.app.text.iconMuted,
        },
      },
    ],
    [theme],
  );

  const columns = useMemo<DataTableColumn<AssignUserRow>[]>(
    () => [
      {
        id: "select",
        label: "Select",
        render: (_, row) => {
          const isSelected = selectedSet.has(row.rowKey);
          const atCap = assignment.keys.length >= MAX_SELECTED_USERS && !isSelected;
          return (
            <Checkbox
              checked={isSelected}
              disabled={atCap}
              onChange={() => toggleRow(row.rowKey)}
              inputProps={{ "aria-label": `Select ${row.displayName}` }}
            />
          );
        },
      },
      { id: "displayName", label: "User" },
      { id: "email", label: "Email", cellVariant: "muted" },
      { id: "userKind", label: "Type" },
      { id: "department", label: "Department", cellVariant: "muted" },
      {
        id: "rank",
        label: "Rank",
        render: (_, row) => {
          const isSelected = selectedSet.has(row.rowKey);
          const current = assignment.ranks[row.rowKey] ?? "Primary";
          const takenByOthers = ranksTakenByOthers(row.rowKey, assignment.keys, assignment.ranks);
          return (
            <TextField
              id={`rank-select-${row.rowKey}`}
              select
              size="small"
              fullWidth
              disabled={!isSelected}
              value={current}
              onChange={(e) => changeRank(row.rowKey, e.target.value as Rank)}
              onMouseMove={applyOutlineFieldCursorPosition}
              onMouseLeave={resetOutlineFieldCursorPosition}
              sx={rankSelectSx}
              SelectProps={{
                MenuProps: {
                  sx: { zIndex: FORM_MODAL_MUI_OVERLAY_Z_INDEX },
                  PaperProps: { sx: selectMenuPaperSx(theme) },
                },
              }}
            >
              {RANK_OPTIONS.map((opt) => {
                const blocked = takenByOthers.has(opt.value) && opt.value !== current;
                return (
                  <MenuItem
                    key={opt.value}
                    value={opt.value}
                    disabled={blocked}
                    sx={selectMenuItemSx(theme)}
                  >
                    {opt.label}
                    {blocked ? " (taken)" : ""}
                  </MenuItem>
                );
              })}
            </TextField>
          );
        },
      },
    ],
    [toggleRow, selectedSet, assignment.keys, assignment.ranks, changeRank, rankSelectSx, theme],
  );

  const canSubmitAssignment =
    websiteId.trim().length > 0 && assignment.keys.length > 0 && !assignTierMutation.isPending;

  const handleModalClose = useCallback(() => {
    assignSaveGenerationRef.current += 1;
    onClose();
  }, [onClose]);

  const handleAssignClick = () => {
    if (!websiteId.trim()) {
      publishAppToast({ variant: "error", message: "Please select a website." });
      return;
    }
    if (assignment.keys.length === 0) {
      publishAppToast({ variant: "error", message: "Select at least one user to assign." });
      return;
    }
    const generation = ++assignSaveGenerationRef.current;
    void (async () => {
      const wid = websiteId.trim();
      if (!wid || assignment.keys.length === 0) return;
      try {
        for (const rowKey of assignment.keys) {
          const userId = userIdFromAssignRowKey(rowKey);
          const assignmentType = assignment.ranks[rowKey] ?? "Primary";
          await assignTierMutation.mutateAsync({
            websiteId: wid,
            userId,
            assignmentType,
          });
        }
        if (generation !== assignSaveGenerationRef.current) return;
        publishAppToast({ variant: "success", message: "Users assigned to the website." });
        onAssign?.();
        onClose();
      } catch (e) {
        if (generation !== assignSaveGenerationRef.current) return;
        publishAppToast({
          variant: "error",
          message: extractApiErrorMessageForToast(e) ?? "Could not assign users.",
        });
      }
    })();
  };

  const runUserSearch = () => {
    setUserSearchApplied(userSearchInput);
  };

  useEffect(() => {
    if (userSearchInput.trim().length > 0) return;
    if (!userSearchApplied.trim()) return;
    setUserSearchApplied("");
  }, [userSearchInput, userSearchApplied]);

  return (
    <FormModal
      open={open}
      fitContent
      title="Assign website"
      description="Choose reseller and companies, pick a website, then pick up to three users. Primary, Secondary, and Backup can each be used only once among selected users."
      maxWidth={920}
      onClose={handleModalClose}
      onSave={handleAssignClick}
      primaryButtonDisabled={!canSubmitAssignment}
      cancelButtonLabel="Cancel"
      primaryButtonLabel={assignTierMutation.isPending ? "Assigning…" : "Assign"}
      primaryStartIcon={<AutoAwesome sx={{ fontSize: 18 }} />}
      sx={{
        borderRadius: 3,
        p: { xs: 2, sm: 3 },
      }}
    >
      <Box sx={assignWebsiteFormGridSx}>
        {canFilterByResellerId ? (
          <SelectField
            label="Reseller (client)"
            value={resellerId}
            onChange={setResellerId}
            options={resellerSelectOptions}
            menuMaxRows={8}
          />
        ) : null}
        <SelectField
          label="Parent company"
          value={parentCompanyId}
          onChange={setParentCompanyId}
          options={parentCompanyOptions}
          menuMaxRows={8}
          disabled={canFilterByResellerId && !resellerId.trim()}
        />
        <SelectField
          label="Child company"
          value={childCompanyId}
          onChange={setChildCompanyId}
          options={childCompanyOptions}
          menuMaxRows={8}
          disabled={
            (canFilterByResellerId && !resellerId.trim()) || !parentCompanyId.trim()
          }
        />
        <SelectField
          label="Website"
          value={websiteId}
          onChange={setWebsiteId}
          options={websiteSelectOptions}
          menuMaxRows={10}
          disabled={
            !parentCompanyId.trim() || (canFilterByResellerId && !resellerId.trim())
          }
        />
      </Box>

      <Typography variant="mediumLarge" fontWeight={600} sx={{ color: theme.app.text.primary, mt: 0.5 }}>
        Users to assign
      </Typography>
      <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, mb: 1, maxWidth: 800 }}>
        Assign here: tick users in the table below, set Rank, then Assign. Type Internal = platform team (no parent
        company needed). Type External = client company users (select parent company first). Maximum{" "}
        {MAX_SELECTED_USERS} users.
        {!mayListInternalUsers ? " Your session can assign External users only." : null}
      </Typography>

      <DashboardCard sx={assignWebsiteUserListCardSx}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={assignWebsiteUserListIconSx} aria-hidden>
              <PeopleOutline sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="mediumLarge" color="white" fontWeight={600}>
                User list
              </Typography>
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                Selected {assignment.keys.length} / {MAX_SELECTED_USERS}
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "stretch", sm: "center" },
              gap: 1.5,
              flex: 1,
              minWidth: { xs: "100%", sm: 280 },
              maxWidth: 480,
            }}
          >
            <SearchBar
              value={userSearchInput}
              onChange={setUserSearchInput}
              placeholder="Search name, email, department…"
              sx={{ minWidth: 0, flex: 1 }}
            />
            <Button
              type="button"
              variant="primary"
              disabled={userSearchInput.trim() === userSearchApplied.trim()}
              onClick={runUserSearch}
              sx={{ minWidth: 100, whiteSpace: "nowrap" }}
              startIcon={<SearchIcon sx={{ fontSize: 18 }} width={18} height={18} />}
            >
              Search
            </Button>
          </Box>
        </Box>

        <DataTable<AssignUserRow>
          columns={columns}
          rows={mergedUserRows}
          isLoading={usersLoading}
          emptyState={usersEmptyState}
          getRowId={(row) => row.rowKey}
          minWidth={640}
          size="medium"
          scrollY={false}
        />
      </DashboardCard>
    </FormModal>
  );
}
