"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Skeleton from "@mui/material/Skeleton";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { alpha } from "@mui/material/styles";
import {
  AccountTreeOutlined as AccountTreeOutlinedIcon,
  ContactPageOutlined as ContactPageOutlinedIcon,
  CorporateFareOutlined as CorporateFareOutlinedIcon,
  ExpandMore as ExpandMoreIcon,
  StorefrontOutlined as StorefrontOutlinedIcon,
  ViewListOutlined as ViewListOutlinedIcon,
} from "@mui/icons-material";
import { Typography, DashboardCard, SearchBar, TablePagination } from "@/components/common";
import type { AppTheme } from "@/theme/theme";
import {
  overviewTableCard,
  overviewTableCardHeader,
  overviewIconBox,
  overviewFooterRow,
  overviewPaginationWrapper,
} from "../../overview.styles";
import type { PocListRow } from "../page";
import { EmptyPocListState } from "./EmptyPocListState";
import { PocChildCompanyAccordion } from "./PocChildCompanyAccordion";
import { PocListFlatTable } from "./PocListFlatTable";
import {
  buildPocDirectoryTree,
  childExpandKey,
  collectExpandIdsForSearch,
  formatChildPreview,
  type PocParentGroup,
  type PocResellerGroup,
} from "../utils/group-poc-directory";

type ViewMode = "grouped" | "table";
type ExpandCollapseAction = "expand-all" | "collapse-all" | "";

const POC_LIST_PAGE_SIZE = 20;

function CountBadge({
  label,
  theme,
  accent = false,
}: {
  label: string;
  theme: AppTheme;
  accent?: boolean;
}) {
  const accentColor = theme.app.dashboard.accentBlue;
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        minHeight: 26,
        px: 1.25,
        py: 0,
        borderRadius: "9999px",
        fontSize: "0.72rem",
        fontWeight: 600,
        lineHeight: 1,
        letterSpacing: "0.01em",
        whiteSpace: "nowrap",
        bgcolor: accent
          ? alpha(accentColor, 0.14)
          : alpha(theme.app.dashboard.white95, 0.06),
        color: accent ? accentColor : theme.app.dashboard.textMuted,
        border: `1px solid ${alpha(
          accent ? accentColor : theme.app.dashboard.cardBorder,
          accent ? 0.28 : 0.5,
        )}`,
      }}
    >
      {label}
    </Box>
  );
}

/** Grouped / Flat list and Expand all / Collapse all — shared segmented control chrome. */
function pocViewToggleGroupSx(theme: AppTheme) {
  return {
    flexShrink: 0,
    "& .MuiToggleButton-root": {
      px: 1.5,
      py: 0.65,
      textTransform: "none",
      fontSize: "0.8rem",
      fontWeight: 600,
      color: theme.app.dashboard.textMuted,
      borderColor: theme.app.dashboard.cardBorder,
      "&.Mui-selected": {
        color: theme.app.text.primary,
        bgcolor: alpha(theme.app.dashboard.accentBlue, 0.18),
      },
      "&:hover": {
        color: theme.app.text.primary,
        bgcolor: alpha(theme.app.dashboard.accentBlue, 0.1),
      },
    },
  };
}

function accordionShellSx(theme: AppTheme, nested = false) {
  return {
    bgcolor: theme.app.dashboard.pillBg,
    border: `1px solid ${alpha(theme.app.dashboard.cardBorder, nested ? 0.4 : 0.55)}`,
    borderRadius: nested ? "12px !important" : "14px !important",
    overflow: "hidden",
    "&:before": { display: "none" },
    boxShadow: "none",
    "&.Mui-expanded": { margin: 0 },
  };
}

function ParentAccordion({
  resellerId,
  parent,
  expanded,
  expandedChildren,
  onToggle,
  onToggleChild,
  theme,
}: {
  resellerId: string;
  parent: PocParentGroup;
  expanded: boolean;
  expandedChildren: Set<string>;
  onToggle: (key: string, open: boolean) => void;
  onToggleChild: (key: string, open: boolean) => void;
  theme: AppTheme;
}) {
  const key = `${resellerId}::${parent.id}`;
  const childCount = parent.children.length;
  const preview = formatChildPreview(parent.children);
  const scrollChildren = childCount > 4;

  return (
    <Accordion
      disableGutters
      expanded={expanded}
      onChange={(_, open) => onToggle(key, open)}
      sx={accordionShellSx(theme, true)}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: alpha(theme.app.dashboard.white95, 0.75) }} />}
        sx={{
          px: 2,
          py: 0.75,
          minHeight: 58,
          alignItems: expanded ? "center" : "flex-start",
          "& .MuiAccordionSummary-content": {
            my: 0.85,
            alignItems: expanded ? "center" : "flex-start",
            gap: 1.25,
          },
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "10px",
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            bgcolor: alpha(theme.palette.info.main, 0.14),
            color: theme.palette.info.light,
            mt: expanded ? 0 : 0.15,
          }}
        >
          <CorporateFareOutlinedIcon sx={{ fontSize: 20 }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ color: theme.app.dashboard.white95, fontWeight: 600, fontSize: "0.9rem" }} noWrap>
            {parent.name}
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 0.75, mt: 0.625 }}>
            <CountBadge
              theme={theme}
              label={`${childCount} child ${childCount === 1 ? "company" : "companies"}`}
            />
            <CountBadge
              theme={theme}
              accent
              label={`${parent.pocCount} POC${parent.pocCount === 1 ? "" : "s"}`}
            />
          </Box>
          {!expanded && preview ? (
            <Typography
              variant="caption"
              sx={{
                color: theme.app.dashboard.textMuted,
                mt: 0.625,
                display: "-webkit-box",
                lineHeight: 1.45,
                overflow: "hidden",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {preview}
            </Typography>
          ) : null}
        </Box>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          px: 2,
          pb: 2,
          pt: 0.5,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {childCount > 1 ? (
          <Typography
            variant="caption"
            sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.5, pb: 0.25 }}
          >
            {childCount} child companies under this parent — expand only the one you need.
          </Typography>
        ) : null}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            ...(scrollChildren
              ? {
                  maxHeight: 360,
                  overflowY: "auto",
                  pr: 0.5,
                  "&::-webkit-scrollbar": { width: 6 },
                  "&::-webkit-scrollbar-thumb": {
                    borderRadius: 3,
                    bgcolor: alpha(theme.app.dashboard.cardBorder, 0.9),
                  },
                }
              : null),
          }}
        >
          {parent.children.map((child) => {
            const childKey = childExpandKey(resellerId, parent.id, child.id);
            return (
              <PocChildCompanyAccordion
                key={child.id}
                child={child}
                expanded={expandedChildren.has(childKey)}
                onToggle={(open) => onToggleChild(childKey, open)}
              />
            );
          })}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}

function ResellerAccordion({
  reseller,
  expandedReseller,
  expandedParents,
  expandedChildren,
  onToggleReseller,
  onToggleParent,
  onToggleChild,
  theme,
}: {
  reseller: PocResellerGroup;
  expandedReseller: boolean;
  expandedParents: Set<string>;
  expandedChildren: Set<string>;
  onToggleReseller: (id: string, open: boolean) => void;
  onToggleParent: (key: string, open: boolean) => void;
  onToggleChild: (key: string, open: boolean) => void;
  theme: AppTheme;
}) {
  const scrollParents = reseller.parents.length > 3;

  return (
    <Accordion
      disableGutters
      expanded={expandedReseller}
      onChange={(_, open) => onToggleReseller(reseller.id, open)}
      sx={accordionShellSx(theme)}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: alpha(theme.app.dashboard.white95, 0.75), fontSize: 22 }} />}
        sx={{
          px: 2.25,
          py: 1,
          minHeight: 68,
          "& .MuiAccordionSummary-content": { my: 0.85, alignItems: "center", gap: 1.5 },
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "12px",
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            bgcolor: alpha(theme.app.dashboard.accentBlue, 0.14),
            color: theme.app.dashboard.accentBlue,
          }}
        >
          <StorefrontOutlinedIcon sx={{ fontSize: 24 }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ color: theme.app.dashboard.white95, fontWeight: 700, fontSize: "1rem" }} noWrap>
            {reseller.name}
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 0.75, mt: 0.75 }}>
            <CountBadge
              theme={theme}
              label={`${reseller.parentCount} parent${reseller.parentCount === 1 ? "" : "s"}`}
            />
            <CountBadge
              theme={theme}
              label={`${reseller.childCount} child ${reseller.childCount === 1 ? "company" : "companies"}`}
            />
            <CountBadge theme={theme} accent label={`${reseller.pocCount} POC${reseller.pocCount === 1 ? "" : "s"}`} />
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails
        sx={{ px: 2.25, pb: 2.25, pt: 0.75, display: "flex", flexDirection: "column", gap: 1.25 }}
      >
        {reseller.parentCount > 1 ? (
          <Typography
            variant="caption"
            sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.5, mb: 0.25 }}
          >
            {reseller.parentCount} parent companies · {reseller.childCount} child companies total
          </Typography>
        ) : null}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1.25,
            ...(scrollParents
              ? {
                  maxHeight: 440,
                  overflowY: "auto",
                  pr: 0.5,
                  "&::-webkit-scrollbar": { width: 6 },
                  "&::-webkit-scrollbar-thumb": {
                    borderRadius: 3,
                    bgcolor: alpha(theme.app.dashboard.cardBorder, 0.9),
                  },
                }
              : null),
          }}
        >
          {reseller.parents.map((parent) => (
            <ParentAccordion
              key={parent.id}
              resellerId={reseller.id}
              parent={parent}
              expanded={expandedParents.has(`${reseller.id}::${parent.id}`)}
              expandedChildren={expandedChildren}
              onToggle={onToggleParent}
              onToggleChild={onToggleChild}
              theme={theme}
            />
          ))}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}

function HierarchySkeleton({ theme }: { theme: AppTheme }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {[0, 1].map((i) => (
        <Box
          key={i}
          sx={{
            p: 2,
            borderRadius: 2,
            border: `1px solid ${theme.app.dashboard.cardBorder}`,
            bgcolor: alpha(theme.app.dashboard.white95, 0.03),
          }}
        >
          <Skeleton variant="rounded" height={52} sx={{ mb: 1.5, borderRadius: 2 }} />
          <Skeleton variant="rounded" height={120} sx={{ borderRadius: 2 }} />
        </Box>
      ))}
    </Box>
  );
}

type Props = {
  theme: AppTheme;
  search: string;
  onSearchChange: (value: string) => void;
  rows: PocListRow[];
  allRowsCount: number;
  isLoading: boolean;
  errorMessage: string | null;
};

export function PocHierarchySection({
  theme,
  search,
  onSearchChange,
  rows,
  allRowsCount,
  isLoading,
  errorMessage,
}: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("grouped");
  const [expandCollapseAction, setExpandCollapseAction] = useState<ExpandCollapseAction>("");
  const [page, setPage] = useState(1);
  const tree = useMemo(() => buildPocDirectoryTree(rows), [rows]);

  const [expandedResellers, setExpandedResellers] = useState<Set<string>>(() => new Set());
  const [expandedParents, setExpandedParents] = useState<Set<string>>(() => new Set());
  const [expandedChildren, setExpandedChildren] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const q = search.trim();
    if (q) {
      const { resellerIds, parentIds, childIds } = collectExpandIdsForSearch(tree, q);
      setExpandedResellers(new Set(resellerIds));
      setExpandedParents(new Set(parentIds));
      setExpandedChildren(new Set(childIds));
      setExpandCollapseAction("");
      return;
    }
    const first = tree.resellers[0];
    if (!first) {
      setExpandedResellers(new Set());
      setExpandedParents(new Set());
      setExpandedChildren(new Set());
      setExpandCollapseAction("");
      return;
    }
    setExpandedResellers(new Set([first.id]));
    const firstParent = first.parents[0];
    setExpandedParents(firstParent ? new Set([`${first.id}::${firstParent.id}`]) : new Set());
    setExpandedChildren(new Set());
    setExpandCollapseAction("");
  }, [tree, search]);

  const showEmpty = !isLoading && !errorMessage && allRowsCount === 0;
  const showFilteredEmpty = !isLoading && !errorMessage && allRowsCount > 0 && rows.length === 0;

  useEffect(() => {
    setPage(1);
  }, [search, viewMode, rows.length]);

  const tablePageCount = Math.max(1, Math.ceil(rows.length / POC_LIST_PAGE_SIZE));
  const tablePage = Math.min(page, tablePageCount);
  const tableRows = useMemo(() => {
    const start = (tablePage - 1) * POC_LIST_PAGE_SIZE;
    return rows.slice(start, start + POC_LIST_PAGE_SIZE);
  }, [rows, tablePage]);
  const tableFooterStart = rows.length === 0 ? 0 : (tablePage - 1) * POC_LIST_PAGE_SIZE + 1;
  const tableFooterEnd = Math.min(tablePage * POC_LIST_PAGE_SIZE, rows.length);

  const expandAll = () => {
    const resellers = new Set<string>();
    const parents = new Set<string>();
    const children = new Set<string>();
    for (const r of tree.resellers) {
      resellers.add(r.id);
      for (const p of r.parents) {
        parents.add(`${r.id}::${p.id}`);
        for (const c of p.children) {
          children.add(childExpandKey(r.id, p.id, c.id));
        }
      }
    }
    setExpandedResellers(resellers);
    setExpandedParents(parents);
    setExpandedChildren(children);
    setExpandCollapseAction("expand-all");
  };

  const collapseAll = () => {
    setExpandedResellers(new Set());
    setExpandedParents(new Set());
    setExpandedChildren(new Set());
    setExpandCollapseAction("collapse-all");
  };

  return (
    <DashboardCard sx={overviewTableCard}>
      <Box sx={overviewTableCardHeader}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, flex: 1, minWidth: 0 }}>
          <Box sx={overviewIconBox}>
            <ContactPageOutlinedIcon sx={{ fontSize: 20, color: "white" }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="mediumLarge" color="white" fontWeight={600}>
              POC directory
            </Typography>
            <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, mt: 0.25 }}>
              Open reseller → parent → child step by step. Many companies stay collapsed until you need them.
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1.25,
          alignItems: "center",
          mb: 0.5,
        }}
      >
        <SearchBar
          value={search}
          onChange={onSearchChange}
          placeholder="Search reseller, parent, child, POC…"
          sx={{ flex: "1 1 220px", minWidth: 0, maxWidth: 420 }}
        />
        <ToggleButtonGroup
          exclusive
          size="small"
          value={viewMode}
          onChange={(_, v: ViewMode | null) => {
            if (v) setViewMode(v);
          }}
          sx={pocViewToggleGroupSx(theme)}
        >
          <ToggleButton value="grouped">
            <AccountTreeOutlinedIcon sx={{ fontSize: 16, mr: 0.75 }} />
            Grouped
          </ToggleButton>
          <ToggleButton value="table">
            <ViewListOutlinedIcon sx={{ fontSize: 16, mr: 0.75 }} />
            Flat list
          </ToggleButton>
        </ToggleButtonGroup>
        {viewMode === "grouped" && tree.resellers.length > 0 ? (
          <ToggleButtonGroup
            exclusive
            size="small"
            value={expandCollapseAction}
            onChange={(_, v: ExpandCollapseAction | null) => {
              if (!v) return;
              if (v === "expand-all") expandAll();
              else collapseAll();
            }}
            sx={pocViewToggleGroupSx(theme)}
          >
            <ToggleButton value="expand-all">Expand all</ToggleButton>
            <ToggleButton value="collapse-all">Collapse all</ToggleButton>
          </ToggleButtonGroup>
        ) : null}
      </Box>

      {isLoading ? (
        <HierarchySkeleton theme={theme} />
      ) : errorMessage ? (
        <Box
          sx={{
            py: 3,
            px: 2,
            borderRadius: 2,
            border: `1px solid ${theme.palette.error.main}`,
            bgcolor: alpha(theme.palette.error.main, 0.1),
          }}
        >
          <Typography variant="body2" sx={{ color: theme.palette.error.main }}>
            {errorMessage}
          </Typography>
        </Box>
      ) : showEmpty ? (
        <EmptyPocListState />
      ) : showFilteredEmpty ? (
        <EmptyPocListState
          title="No matches for your search"
          description="Try another keyword or clear the search field to see all active contacts."
        />
      ) : viewMode === "table" ? (
        <PocListFlatTable theme={theme} rows={tableRows} />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
          {tree.resellers.map((reseller) => (
            <ResellerAccordion
              key={reseller.id}
              reseller={reseller}
              expandedReseller={expandedResellers.has(reseller.id)}
              expandedParents={expandedParents}
              expandedChildren={expandedChildren}
              onToggleReseller={(id, open) => {
                setExpandedResellers((prev) => {
                  const next = new Set(prev);
                  if (open) next.add(id);
                  else next.delete(id);
                  return next;
                });
              }}
              onToggleParent={(key, open) => {
                setExpandedParents((prev) => {
                  const next = new Set(prev);
                  if (open) next.add(key);
                  else next.delete(key);
                  return next;
                });
              }}
              onToggleChild={(key, open) => {
                setExpandedChildren((prev) => {
                  const next = new Set(prev);
                  if (open) next.add(key);
                  else next.delete(key);
                  return next;
                });
              }}
              theme={theme}
            />
          ))}
        </Box>
      )}

      {!isLoading && !errorMessage && allRowsCount > 0 ? (
        <Box sx={overviewFooterRow}>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
            {viewMode === "table" ? (
              <>
                Showing data {tableFooterStart} to {tableFooterEnd} of {rows.length} entries
                {search.trim() ? ` matching “${search.trim()}”` : ""}
              </>
            ) : (
              <>
                {tree.resellers.length} reseller{tree.resellers.length === 1 ? "" : "s"} · {rows.length} contact
                {rows.length === 1 ? "" : "s"}
                {search.trim() ? ` matching “${search.trim()}”` : ""}
                {" · grouped view"}
              </>
            )}
          </Typography>
          {viewMode === "table" ? (
            <Box sx={overviewPaginationWrapper}>
              <TablePagination page={tablePage} pageCount={tablePageCount} onPageChange={setPage} />
            </Box>
          ) : null}
        </Box>
      ) : null}
    </DashboardCard>
  );
}
