"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import { alpha, useTheme } from "@mui/material/styles";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import ChevronRight from "@mui/icons-material/ChevronRight";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMore from "@mui/icons-material/ExpandMore";
import LanguageOutlined from "@mui/icons-material/LanguageOutlined";
import StorefrontOutlined from "@mui/icons-material/StorefrontOutlined";
import type { AppTheme } from "@/theme/theme";
import { Typography, dataTableActionButton } from "@/components/common";
import type { EmailFormListItem } from "@/api/email/email-forms.api";
import { groupEmailFormsByOrg } from "../utils/group-email-forms";

function FormTypeChip({ formType }: { formType: string }) {
  const theme = useTheme() as AppTheme;
  const isCustom = formType === "custom";
  return (
    <Chip
      size="small"
      label={isCustom ? "Custom" : "Standard"}
      sx={{
        height: 22,
        fontWeight: 700,
        fontSize: 11,
        bgcolor: isCustom
          ? alpha(theme.palette.success.main, 0.14)
          : alpha(theme.palette.info.main, 0.14),
        color: isCustom ? theme.palette.success.light : theme.palette.info.light,
        border: `1px solid ${isCustom ? alpha(theme.palette.success.main, 0.35) : alpha(theme.palette.info.main, 0.35)}`,
      }}
    />
  );
}

function WebsiteFormRow({
  item,
  onEdit,
  onDelete,
  deleting,
}: {
  item: EmailFormListItem;
  onEdit: (item: EmailFormListItem) => void;
  onDelete: (item: EmailFormListItem) => void;
  deleting: boolean;
}) {
  const theme = useTheme() as AppTheme;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr auto auto auto" },
        gap: { xs: 1, md: 2 },
        alignItems: "center",
        px: 2,
        py: 1.35,
        borderBottom: `1px solid ${theme.app.dashboard.cardBorder}`,
        "&:last-of-type": { borderBottom: "none" },
        "&:hover": { bgcolor: alpha(theme.palette.common.white, 0.03) },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, minWidth: 0 }}>
        <LanguageOutlined sx={{ fontSize: 18, color: theme.app.dashboard.white60, mt: 0.25 }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="small" fontWeight={600} color="white" sx={{ wordBreak: "break-word" }}>
            {item.website}
          </Typography>
          {item.formName ? (
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block" }}>
              {item.formName}
            </Typography>
          ) : null}
        </Box>
      </Box>

      <Box sx={{ display: "flex", justifyContent: { md: "center" } }}>
        <FormTypeChip formType={item.formType} />
      </Box>

      <Typography
        variant="caption"
        sx={{ color: theme.app.dashboard.textMuted, textAlign: { md: "center" }, whiteSpace: "nowrap" }}
      >
        {item.fieldCount} fields
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
        <IconButton
          size="small"
          aria-label={`Edit form for ${item.website}`}
          sx={dataTableActionButton}
          onClick={() => onEdit(item)}
        >
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          aria-label={`Delete form for ${item.website}`}
          disabled={deleting}
          sx={{
            ...dataTableActionButton,
            color: theme.app.dashboard.accentRedLight,
          }}
          onClick={() => onDelete(item)}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}

function ChildCompanyBlock({
  parentCompany,
  childCompany,
  websites,
  onEdit,
  onDelete,
  deletingId,
}: {
  parentCompany: string;
  childCompany: string;
  websites: EmailFormListItem[];
  onEdit: (item: EmailFormListItem) => void;
  onDelete: (item: EmailFormListItem) => void;
  deletingId: string | null;
}) {
  const theme = useTheme() as AppTheme;
  const showParent = parentCompany.trim().toLowerCase() !== childCompany.trim().toLowerCase();

  return (
    <Box
      sx={{
        borderRadius: 1.5,
        border: `1px solid ${theme.app.dashboard.cardBorder}`,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.25,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 1,
          borderBottom: `1px solid ${theme.app.dashboard.cardBorder}`,
          bgcolor: alpha(theme.palette.common.white, 0.02),
        }}
      >
        <BusinessOutlined sx={{ fontSize: 18, color: theme.app.dashboard.white60 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="small" fontWeight={700} color="white">
            {childCompany}
          </Typography>
          {showParent ? (
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
              Parent · {parentCompany}
            </Typography>
          ) : null}
        </Box>
        <Chip
          size="small"
          label={`${websites.length} site${websites.length === 1 ? "" : "s"}`}
          sx={{
            height: 22,
            fontWeight: 600,
            fontSize: 11,
            bgcolor: alpha(theme.palette.common.white, 0.06),
            color: theme.app.dashboard.textMuted,
          }}
        />
      </Box>

      <Box>
        <Box
          sx={{
            display: { xs: "none", md: "grid" },
            gridTemplateColumns: "1fr auto auto auto",
            gap: 2,
            px: 2,
            py: 0.85,
            borderBottom: `1px solid ${theme.app.dashboard.cardBorder}`,
          }}
        >
          <Typography variant="caption" fontWeight={600} sx={{ color: theme.app.dashboard.white80 }}>
            Website
          </Typography>
          <Typography
            variant="caption"
            fontWeight={600}
            sx={{ color: theme.app.dashboard.white80, textAlign: "center", minWidth: 88 }}
          >
            Form type
          </Typography>
          <Typography
            variant="caption"
            fontWeight={600}
            sx={{ color: theme.app.dashboard.white80, textAlign: "center", minWidth: 64 }}
          >
            Fields
          </Typography>
          <Typography
            variant="caption"
            fontWeight={600}
            sx={{ color: theme.app.dashboard.white80, textAlign: "right", minWidth: 72 }}
          >
            Actions
          </Typography>
        </Box>
        {websites.map((item) => (
          <WebsiteFormRow
            key={item.id}
            item={item}
            onEdit={onEdit}
            onDelete={onDelete}
            deleting={deletingId === item.id}
          />
        ))}
      </Box>
    </Box>
  );
}

function ResellerGroupCard({
  group,
  defaultOpen,
  onEdit,
  onDelete,
  deletingId,
}: {
  group: ReturnType<typeof groupEmailFormsByOrg>[number];
  defaultOpen: boolean;
  onEdit: (item: EmailFormListItem) => void;
  onDelete: (item: EmailFormListItem) => void;
  deletingId: string | null;
}) {
  const theme = useTheme() as AppTheme;
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Box
      sx={{
        borderRadius: 1.5,
        border: `1px solid ${theme.app.dashboard.cardBorder}`,
        overflow: "hidden",
      }}
    >
      <Box
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2,
          py: 1.5,
          cursor: "pointer",
          bgcolor: alpha(theme.palette.common.white, 0.02),
          borderBottom: open ? `1px solid ${theme.app.dashboard.cardBorder}` : "none",
          "&:hover": { bgcolor: alpha(theme.palette.common.white, 0.04) },
        }}
      >
        <StorefrontOutlined sx={{ color: theme.app.dashboard.white60 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="medium" fontWeight={700} color="white">
            {group.resellerName}
          </Typography>
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
            {group.childGroups.length} child compan{group.childGroups.length === 1 ? "y" : "ies"} ·{" "}
            {group.websiteCount} configured site{group.websiteCount === 1 ? "" : "s"}
          </Typography>
        </Box>
        <Chip
          size="small"
          label="Reseller"
          sx={{
            height: 22,
            fontWeight: 600,
            fontSize: 11,
            bgcolor: alpha(theme.palette.common.white, 0.06),
            color: theme.app.dashboard.textMuted,
          }}
        />
        <IconButton
          size="small"
          aria-label={open ? "Collapse reseller group" : "Expand reseller group"}
          sx={{ ...dataTableActionButton, color: theme.app.dashboard.white80 }}
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
        >
          {open ? <ExpandMore /> : <ChevronRight />}
        </IconButton>
      </Box>

      <Collapse in={open}>
        <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
          {group.childGroups.map((child) => (
            <ChildCompanyBlock
              key={child.key}
              parentCompany={child.parentCompany}
              childCompany={child.childCompany}
              websites={child.websites}
              onEdit={onEdit}
              onDelete={onDelete}
              deletingId={deletingId}
            />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}

export function EmailFormsGroupedList({
  items,
  onEdit,
  onDelete,
  deletingId,
}: {
  items: EmailFormListItem[];
  onEdit: (item: EmailFormListItem) => void;
  onDelete: (item: EmailFormListItem) => void;
  deletingId: string | null;
}) {
  const theme = useTheme() as AppTheme;
  const groups = useMemo(() => groupEmailFormsByOrg(items), [items]);

  const stats = useMemo(
    () => ({
      resellers: groups.length,
      children: groups.reduce((n, g) => n + g.childGroups.length, 0),
      websites: items.length,
    }),
    [groups, items.length],
  );

  if (items.length === 0) return null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        <Chip
          size="small"
          label={`${stats.resellers} reseller${stats.resellers === 1 ? "" : "s"}`}
          sx={{
            fontWeight: 600,
            bgcolor: alpha(theme.palette.common.white, 0.06),
            color: theme.app.dashboard.textMuted,
          }}
        />
        <Chip
          size="small"
          label={`${stats.children} child compan${stats.children === 1 ? "y" : "ies"}`}
          sx={{
            fontWeight: 600,
            bgcolor: alpha(theme.palette.common.white, 0.06),
            color: theme.app.dashboard.textMuted,
          }}
        />
        <Chip
          size="small"
          label={`${stats.websites} website form${stats.websites === 1 ? "" : "s"}`}
          sx={{
            fontWeight: 600,
            bgcolor: alpha(theme.palette.common.white, 0.06),
            color: theme.app.dashboard.textMuted,
          }}
        />
      </Box>

      {groups.map((group, index) => (
        <ResellerGroupCard
          key={group.key}
          group={group}
          defaultOpen={index === 0}
          onEdit={onEdit}
          onDelete={onDelete}
          deletingId={deletingId}
        />
      ))}
    </Box>
  );
}
