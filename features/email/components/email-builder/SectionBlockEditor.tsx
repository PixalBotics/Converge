"use client";

import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import OpenInNewOutlined from "@mui/icons-material/OpenInNewOutlined";
import ViewAgendaOutlined from "@mui/icons-material/ViewAgendaOutlined";
import GridViewOutlined from "@mui/icons-material/GridViewOutlined";
import Link from "next/link";
import { useTheme, alpha } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import { EmailBuilderInputField } from "./EmailBuilderFormField";
import type { EmailTemplateBlock, EmailTemplateBlockKey } from "../../types";
import {
  EMAIL_BLOCK_DEFAULT_TITLES,
  EMAIL_BLOCK_FIELD_CATALOG,
  type EmailFieldIconStyle,
} from "../../constants/email-block-fields";
import { EMAIL_ROUTES } from "../../email.constants";
import { patchBlockStyle, readBlockStyle } from "../../utils/email-block-style";
import { IconStylePicker } from "./IconStylePicker";

function EmailFormBlockHint() {
  const theme = useTheme() as AppTheme;
  return (
    <Box
      sx={{
        p: 1.25,
        borderRadius: 1.25,
        border: `1px dashed ${alpha(theme.palette.info.main, 0.45)}`,
        bgcolor: alpha(theme.palette.info.main, 0.08),
      }}
    >
      <Typography variant="small" fontWeight={700} sx={{ mb: 0.5 }}>
        Field visibility — Email forms
      </Typography>
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1 }}>
        Which fields appear in outgoing emails is configured per website under Email forms. Disabled
        fields are not shown in the email, even if this section is enabled here.
      </Typography>
      <Link href={EMAIL_ROUTES.forms} style={{ textDecoration: "none" }}>
        <Typography
          variant="caption"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            color: theme.palette.primary.light,
            fontWeight: 700,
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Open Email forms
          <OpenInNewOutlined sx={{ fontSize: 14 }} />
        </Typography>
      </Link>
    </Box>
  );
}

const DATA_FIELD_BLOCKS: EmailTemplateBlockKey[] = [
  "visitor_info",
  "chat_info",
  "acquisition",
];

const PLATFORM_FORM_BLOCKS: EmailTemplateBlockKey[] = [
  "visitor_feedback",
  "additional_notes",
];

function PlatformFormBlockHint({ blockKey }: { blockKey: EmailTemplateBlockKey }) {
  const theme = useTheme() as AppTheme;
  const title =
    blockKey === "visitor_feedback" ? "Inquire (like / dislike)" : "Additional note";

  return (
    <Box
      sx={{
        p: 1.25,
        borderRadius: 1.25,
        border: `1px dashed ${alpha(theme.palette.info.main, 0.45)}`,
        bgcolor: alpha(theme.palette.info.main, 0.08),
      }}
    >
      <Typography variant="small" fontWeight={700} sx={{ mb: 0.5 }}>
        {title} — platform settings
      </Typography>
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1 }}>
        Button labels, placeholders, and submit text are configured once for all agents in Feedback
        settings — not in this email design.
      </Typography>
      <Link href={EMAIL_ROUTES.feedback} style={{ textDecoration: "none" }}>
        <Typography
          variant="caption"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            color: theme.palette.primary.light,
            fontWeight: 700,
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Open Feedback settings
          <OpenInNewOutlined sx={{ fontSize: 14 }} />
        </Typography>
      </Link>
    </Box>
  );
}

export function SectionBlockEditor({
  block,
  onChange,
  disabled,
  globalIconStyle = "mui",
  accentColor,
}: {
  block: EmailTemplateBlock;
  onChange: (next: EmailTemplateBlock) => void;
  disabled?: boolean;
  globalIconStyle?: EmailFieldIconStyle;
  accentColor?: string;
}) {
  const theme = useTheme() as AppTheme;
  const accent = accentColor ?? theme.palette.primary.main;
  const style = readBlockStyle(block);
  const fields = EMAIL_BLOCK_FIELD_CATALOG[block.blockKey] ?? [];
  const iconStyle = style.iconStyle ?? globalIconStyle;
  const isDataBlock = DATA_FIELD_BLOCKS.includes(block.blockKey);
  const isPlatformForm = PLATFORM_FORM_BLOCKS.includes(block.blockKey);

  const patch = (partial: Parameters<typeof patchBlockStyle>[1]) => {
    onChange(patchBlockStyle(block, partial));
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
      <EmailBuilderInputField
        label="Section title"
        name={`title-${block.blockKey}`}
        value={style.title ?? EMAIL_BLOCK_DEFAULT_TITLES[block.blockKey]}
        onChange={(e) => patch({ title: e.target.value })}
        disabled={disabled}
      />

      {isPlatformForm ? <PlatformFormBlockHint blockKey={block.blockKey} /> : null}

      {isDataBlock ? (
        <>
          <EmailFormBlockHint />

          <Box>
            <Typography variant="small" fontWeight={600} sx={{ mb: 0.75 }}>
              Section layout
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
                gap: 1,
                minWidth: 0,
                "& > *": { minWidth: 0 },
              }}
            >
              {(
                [
                  { value: "list" as const, label: "List", hint: "Stacked rows", Icon: ViewAgendaOutlined },
                  { value: "grid" as const, label: "Grid", hint: "Two columns", Icon: GridViewOutlined },
                ] as const
              ).map(({ value, label, hint, Icon }) => {
                const selected = (style.layout ?? "list") === value;
                return (
                  <Box
                    key={value}
                    component="button"
                    type="button"
                    disabled={disabled}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      patch({ layout: value, columns: value === "grid" ? 2 : 1 });
                    }}
                    sx={{
                      m: 0,
                      p: 1,
                      textAlign: "left",
                      borderRadius: 1.25,
                      border: `1px solid ${selected ? alpha(accent, 0.55) : theme.app.dashboard.cardBorder}`,
                      bgcolor: selected ? `${accent}18` : theme.app.dashboard.overlayLight,
                      cursor: disabled ? "not-allowed" : "pointer",
                      boxShadow: selected ? `0 4px 12px ${accent}22` : "none",
                      transition: "border-color 0.15s, background 0.15s, box-shadow 0.15s",
                      "&:hover": disabled
                        ? undefined
                        : { borderColor: accent, bgcolor: `${accent}14` },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Icon sx={{ fontSize: 20, color: selected ? accent : "text.secondary" }} />
                      <Box>
                        <Typography variant="small" fontWeight={selected ? 700 : 500}>
                          {label}
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                          {hint}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={style.showIcons !== false}
                onChange={(e) => patch({ showIcons: e.target.checked })}
                disabled={disabled}
              />
            }
            label={<Typography variant="small">Show icons in this section</Typography>}
          />

          {style.showIcons !== false ? (
            <IconStylePicker
              label="Icons for this section"
              value={iconStyle}
              onChange={(v) => patch({ iconStyle: v })}
              disabled={disabled}
              sampleField={fields[0]}
              accentColor={accent}
            />
          ) : null}
        </>
      ) : null}

      {!isDataBlock && !isPlatformForm ? (
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
          Toggle this block on or off and edit the section title — content follows your template
          sample data in the live preview.
        </Typography>
      ) : null}
    </Box>
  );
}
