"use client";

import { useMemo, useState, type ReactNode } from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import ArrowDownward from "@mui/icons-material/ArrowDownward";
import ArrowUpward from "@mui/icons-material/ArrowUpward";
import ChevronRightOutlined from "@mui/icons-material/ChevronRightOutlined";
import FooterOutlined from "@mui/icons-material/VerticalAlignBottomOutlined";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import LayersOutlined from "@mui/icons-material/LayersOutlined";
import PaletteOutlined from "@mui/icons-material/PaletteOutlined";
import TuneOutlined from "@mui/icons-material/TuneOutlined";
import ViewHeadlineOutlined from "@mui/icons-material/ViewHeadlineOutlined";
import { useTheme, alpha } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import type { EmailTemplateBlock, EmailTemplateBlockKey } from "../../types";
import {
  EMAIL_TEMPLATE_BLOCK_DESCRIPTIONS,
  EMAIL_TEMPLATE_BLOCK_LABELS,
} from "../../email.constants";
import {
  applyThemePreset,
  EMAIL_HEADER_LAYOUT_OPTIONS,
  EMAIL_LOGO_POSITION_OPTIONS,
  EMAIL_SECTION_STYLE_OPTIONS,
  EMAIL_THEME_PRESETS,
  type EmailTemplateTheme,
} from "../../utils/email-theme";
import {
  defaultStyleForBlock,
  patchBlockStyle,
  readBlockStyle,
  syncBlocksWithGlobalIconStyle,
} from "../../utils/email-block-style";
import { EMAIL_BLOCK_FIELD_CATALOG } from "../../constants/email-block-fields";
import { ImageUploadDropzone } from "../ImageUploadDropzone";
import { SectionBlockEditor } from "./SectionBlockEditor";
import { IconStylePicker } from "./IconStylePicker";
import {
  EmailBuilderColorField,
  EmailBuilderInputField,
  EmailBuilderSelectField,
  EmailBuilderFieldStack,
} from "./EmailBuilderFormField";
import { blockIconForKey } from "./block-icons";
import {
  EmailBuilderBlockCard,
  EmailBuilderBlockHeader,
  EmailBuilderCanvasHeader,
  EmailBuilderChrome,
  EmailBuilderExpandChevron,
  EmailBuilderExpandAction,
  EmailBuilderGroupTitle,
  EmailBuilderHintCallout,
  EmailBuilderIconBadge,
  EmailBuilderPanelBody,
  EmailBuilderRailHeader,
  EmailBuilderReorderButton,
  EmailBuilderReorderGroup,
  EmailBuilderSettingsGroup,
  EmailBuilderTabButton,
  EmailBuilderTabRail,
  EmailBuilderTemplateNameRow,
  EmailBuilderToolsPanel,
  EmailBuilderToolsScroll,
  EmailColorSwatch,
  EmailColorSwatchRow,
  EmailThemePresetCard,
} from "../../styles/email-design.styled";

function BuilderGroupHeading({ children }: { children: ReactNode }) {
  return (
    <EmailBuilderGroupTitle>
      <Box component="span" className="section-dot" />
      <Box component="span" className="section-label">
        {children}
      </Box>
    </EmailBuilderGroupTitle>
  );
}

type BuilderTab = "theme" | "header" | "sections" | "footer";

const TABS: {
  id: BuilderTab;
  label: string;
  title: string;
  description: string;
  Icon: typeof PaletteOutlined;
}[] = [
  {
    id: "theme",
    label: "Theme",
    title: "Colors & typography",
    description: "Brand palette, backgrounds, and default field icons.",
    Icon: PaletteOutlined,
  },
  {
    id: "header",
    label: "Header",
    title: "Header & banner",
    description: "Logo, hero banner, and alert headline.",
    Icon: ViewHeadlineOutlined,
  },
  {
    id: "sections",
    label: "Blocks",
    title: "Email sections",
    description: "Enable, reorder, and style each transcript block.",
    Icon: LayersOutlined,
  },
  {
    id: "footer",
    label: "Footer",
    title: "Footer",
    description: "Disclaimer and closing line.",
    Icon: FooterOutlined,
  },
];

export function EmailVisualBuilder({
  name,
  primaryColor,
  theme: emailTheme,
  blocks,
  logoUrl,
  bannerUrl,
  onNameChange,
  onPrimaryColorChange,
  onThemeChange,
  onBlocksChange,
  onToggleBlock,
  onReorderBlock,
  onUploadLogo,
  onRemoveLogo,
  onUploadBanner,
  onRemoveBanner,
  logoUploading,
  bannerUploading,
  disabled,
}: {
  name: string;
  primaryColor: string;
  theme: EmailTemplateTheme;
  blocks: EmailTemplateBlock[];
  logoUrl?: string | null;
  bannerUrl?: string | null;
  onNameChange: (value: string) => void;
  onPrimaryColorChange: (value: string) => void;
  onThemeChange: (theme: EmailTemplateTheme) => void;
  onBlocksChange: (blocks: EmailTemplateBlock[]) => void;
  onToggleBlock: (blockKey: EmailTemplateBlockKey, enabled: boolean) => void;
  onReorderBlock: (blockKey: EmailTemplateBlockKey, direction: "up" | "down") => void;
  onUploadLogo: (file: File) => void;
  onRemoveLogo: () => void;
  onUploadBanner: (file: File) => void;
  onRemoveBanner: () => void;
  logoUploading?: boolean;
  bannerUploading?: boolean;
  disabled?: boolean;
}) {
  const muiTheme = useTheme() as AppTheme;
  const [tab, setTab] = useState<BuilderTab>("theme");
  const [expandedKey, setExpandedKey] = useState<EmailTemplateBlockKey | null>(null);

  const sorted = useMemo(
    () => [...blocks].sort((a, b) => a.sortOrder - b.sortOrder),
    [blocks],
  );

  const sectionBlocks = useMemo(
    () => sorted.filter((b) => b.blockKey !== "footer"),
    [sorted],
  );

  const footerBlock = sorted.find((b) => b.blockKey === "footer");

  const patchTheme = (patch: Partial<EmailTemplateTheme>) => {
    onThemeChange({ ...emailTheme, ...patch });
  };

  const applyPreset = (presetId: string) => {
    const { primaryColor: pc, theme: t } = applyThemePreset(presetId);
    onPrimaryColorChange(pc);
    onThemeChange({
      ...t,
      globalIconStyle: emailTheme.globalIconStyle ?? t.globalIconStyle,
    });
  };

  const activeTab = TABS.find((t) => t.id === tab) ?? TABS[0];

  return (
    <EmailBuilderChrome sx={{ flex: 1, minHeight: 0, width: "100%", display: "flex" }}>
      <EmailBuilderTabRail>
        <EmailBuilderRailHeader>
          <TuneOutlined sx={{ fontSize: 18, color: muiTheme.app.dashboard.textSubtleMuted }} />
          <Box
            component="span"
            sx={{
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.12em",
              color: muiTheme.app.dashboard.textSubtleMuted,
            }}
          >
            TOOLS
          </Box>
        </EmailBuilderRailHeader>
        {TABS.map(({ id, label, Icon }) => (
          <EmailBuilderTabButton
            key={id}
            type="button"
            active={tab === id}
            onClick={() => setTab(id)}
            aria-current={tab === id ? "true" : undefined}
            aria-label={label}
          >
            <Box component="span" className="tab-icon">
              <Icon sx={{ fontSize: 18 }} />
            </Box>
            {label}
          </EmailBuilderTabButton>
        ))}
      </EmailBuilderTabRail>

      <EmailBuilderToolsPanel>
        <EmailBuilderCanvasHeader>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
            <EmailBuilderIconBadge active>
              <activeTab.Icon sx={{ fontSize: 18 }} />
            </EmailBuilderIconBadge>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="medium" fontWeight={700}>
                {activeTab.title}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: muiTheme.app.dashboard.textMuted, display: "block", mt: 0.25, lineHeight: 1.45 }}
              >
                {activeTab.description}
              </Typography>
            </Box>
          </Box>
          <EmailBuilderTemplateNameRow>
            <EmailBuilderInputField
              label="Template name"
              name="templateName"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              disabled={disabled}
              placeholder="Chat transcript email"
              sx={{ m: 0 }}
            />
          </EmailBuilderTemplateNameRow>
        </EmailBuilderCanvasHeader>

        <EmailBuilderToolsScroll>
        {tab === "theme" ? (
          <EmailBuilderPanelBody>
            <EmailBuilderSettingsGroup>
              <BuilderGroupHeading>Presets</BuilderGroupHeading>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 0.75,
                }}
              >
                {EMAIL_THEME_PRESETS.map((preset) => (
                  <EmailThemePresetCard
                    key={preset.id}
                    type="button"
                    selected={emailTheme.presetId === preset.id}
                    disabled={disabled}
                    onClick={() => applyPreset(preset.id)}
                  >
                    <Box
                      sx={{
                        height: 24,
                        borderRadius: 0.75,
                        mb: 0.5,
                        background: preset.swatch,
                      }}
                    />
                    <Typography variant="caption" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                      {preset.label}
                    </Typography>
                  </EmailThemePresetCard>
                ))}
              </Box>
            </EmailBuilderSettingsGroup>

            <EmailBuilderSettingsGroup>
              <BuilderGroupHeading>Field icons</BuilderGroupHeading>
              <IconStylePicker
                label="Default for all sections"
                compact
                value={emailTheme.globalIconStyle ?? "mui"}
                onChange={(v) => {
                  const prev = emailTheme.globalIconStyle ?? "mui";
                  patchTheme({ globalIconStyle: v });
                  onBlocksChange(syncBlocksWithGlobalIconStyle(blocks, prev));
                }}
                disabled={disabled}
                sampleField={EMAIL_BLOCK_FIELD_CATALOG.visitor_info[0]}
                accentColor={primaryColor}
              />
            </EmailBuilderSettingsGroup>

            <EmailBuilderSettingsGroup>
              <BuilderGroupHeading>Colors</BuilderGroupHeading>
              <EmailBuilderFieldStack>
              <Box>
                <Typography variant="caption" sx={{ mb: 0.5, color: muiTheme.app.dashboard.textMuted, fontWeight: 600 }}>
                  Accent color
                </Typography>
              <EmailColorSwatchRow>
                {EMAIL_THEME_PRESETS.map((p) => (
                  <EmailColorSwatch
                    key={p.id}
                    type="button"
                    selected={primaryColor.toLowerCase() === p.primaryColor.toLowerCase()}
                    style={{ background: p.primaryColor }}
                    disabled={disabled}
                    onClick={() => onPrimaryColorChange(p.primaryColor)}
                    aria-label={p.label}
                  />
                ))}
              </EmailColorSwatchRow>
              <EmailBuilderColorField
                label="Accent color"
                value={primaryColor}
                onChange={onPrimaryColorChange}
                disabled={disabled}
                fallback="#1a57a5"
              />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.25, alignItems: "start" }}>
              <EmailBuilderColorField
                label="Email background"
                value={emailTheme.backgroundColor ?? ""}
                onChange={(hex) => patchTheme({ backgroundColor: hex })}
                disabled={disabled}
                fallback="#eef2f7"
              />
              <EmailBuilderColorField
                label="Content card"
                value={emailTheme.contentBackground ?? ""}
                onChange={(hex) => patchTheme({ contentBackground: hex })}
                disabled={disabled}
                fallback="#ffffff"
              />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.25, alignItems: "start" }}>
              <EmailBuilderColorField
                label="Text color"
                value={emailTheme.textColor ?? ""}
                onChange={(hex) => patchTheme({ textColor: hex })}
                disabled={disabled}
                fallback="#1e293b"
              />
              <EmailBuilderColorField
                label="Label text color"
                value={emailTheme.mutedTextColor ?? ""}
                onChange={(hex) => patchTheme({ mutedTextColor: hex })}
                disabled={disabled}
                fallback="#475569"
              />
            </Box>

            <EmailBuilderSelectField
              label="Section header style"
              value={emailTheme.sectionHeaderStyle ?? "bar"}
              onChange={(v) =>
                patchTheme({
                  sectionHeaderStyle: v as EmailTemplateTheme["sectionHeaderStyle"],
                })
              }
              options={EMAIL_SECTION_STYLE_OPTIONS.map((o) => ({
                label: o.label,
                value: o.value,
              }))}
              disabled={disabled}
            />
              </EmailBuilderFieldStack>
            </EmailBuilderSettingsGroup>
          </EmailBuilderPanelBody>
        ) : null}

        {tab === "header" ? (
          <EmailBuilderPanelBody>
            <EmailBuilderSettingsGroup>
              <BuilderGroupHeading>Layout</BuilderGroupHeading>
              <EmailBuilderSelectField
                label="Header layout"
                value={emailTheme.headerLayout ?? "hero_banner"}
                onChange={(v) =>
                  patchTheme({ headerLayout: v as EmailTemplateTheme["headerLayout"] })
                }
                options={EMAIL_HEADER_LAYOUT_OPTIONS.map((o) => ({
                  label: o.label,
                  value: o.value,
                }))}
                disabled={disabled}
              />
              <Typography variant="caption" sx={{ color: muiTheme.app.dashboard.textMuted, mt: -0.75 }}>
                {
                  EMAIL_HEADER_LAYOUT_OPTIONS.find(
                    (o) => o.value === (emailTheme.headerLayout ?? "hero_banner"),
                  )?.hint
                }
              </Typography>
              <EmailBuilderSelectField
                label="Logo placement"
                value={emailTheme.logoPosition ?? "below_banner"}
                onChange={(v) =>
                  patchTheme({ logoPosition: v as EmailTemplateTheme["logoPosition"] })
                }
                options={EMAIL_LOGO_POSITION_OPTIONS.map((o) => ({
                  label: o.label,
                  value: o.value,
                }))}
                disabled={disabled}
              />
              {emailTheme.headerLayout === "platform_banner" ? (
                <FormControlLabel
                  control={
                    <Switch
                      checked={emailTheme.showPlatformHeader !== false}
                      onChange={(e) => patchTheme({ showPlatformHeader: e.target.checked })}
                      disabled={disabled}
                    />
                  }
                  label="Show platform header strip"
                />
              ) : null}
            </EmailBuilderSettingsGroup>

            <EmailBuilderSettingsGroup>
              <BuilderGroupHeading>Banner copy</BuilderGroupHeading>
              <EmailBuilderInputField
                label="Banner headline"
                name="bannerTitle"
                value={emailTheme.bannerTitle ?? "New Web Chat Alert"}
                onChange={(e) => patchTheme({ bannerTitle: e.target.value })}
                disabled={disabled}
                placeholder="New Web Chat Alert"
              />
              <EmailBuilderInputField
                label="Banner subtitle (optional)"
                name="bannerSubtitle"
                value={emailTheme.bannerSubtitle ?? ""}
                onChange={(e) => patchTheme({ bannerSubtitle: e.target.value })}
                disabled={disabled}
              />
              <EmailBuilderInputField
                label="Sub-header tagline (optional)"
                name="tagline"
                value={emailTheme.headerTagline ?? ""}
                onChange={(e) => patchTheme({ headerTagline: e.target.value })}
                disabled={disabled}
                placeholder="Thanks for chatting with us today"
              />
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                <EmailBuilderInputField
                  label="Headline size (px)"
                  name="bannerTitleFontSize"
                  type="number"
                  value={String(emailTheme.bannerTitleFontSize ?? 22)}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    patchTheme({
                      bannerTitleFontSize: Number.isFinite(n)
                        ? Math.min(48, Math.max(14, n))
                        : 22,
                    });
                  }}
                  disabled={disabled}
                />
                <EmailBuilderInputField
                  label="Overlay opacity"
                  name="bannerOverlayOpacity"
                  value={String(emailTheme.bannerOverlayOpacity ?? 0.55)}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    patchTheme({
                      bannerOverlayOpacity: Number.isFinite(n)
                        ? Math.min(1, Math.max(0, n))
                        : 0.55,
                    });
                  }}
                  disabled={disabled}
                />
              </Box>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.25, alignItems: "start" }}>
                <EmailBuilderColorField
                  label="Banner overlay color"
                  value={emailTheme.bannerOverlayColor ?? ""}
                  onChange={(hex) => patchTheme({ bannerOverlayColor: hex })}
                  disabled={disabled}
                  fallback="#0f2744"
                />
                <EmailBuilderColorField
                  label="Banner text color"
                  value={emailTheme.bannerTextColor ?? ""}
                  onChange={(hex) => patchTheme({ bannerTextColor: hex })}
                  disabled={disabled}
                  fallback="#ffffff"
                />
              </Box>
            </EmailBuilderSettingsGroup>

            <EmailBuilderSettingsGroup>
              <BuilderGroupHeading>Media</BuilderGroupHeading>
              <ImageUploadDropzone
                title="Hero banner image"
                description="Background behind the headline."
                imageUrl={bannerUrl}
                onUpload={onUploadBanner}
                onRemove={onRemoveBanner}
                uploading={bannerUploading}
                disabled={disabled}
                uploadLabel="Upload banner"
                previewHeight={120}
              />
              <ImageUploadDropzone
                title="Top logo"
                description="Brand logo per placement setting."
                imageUrl={logoUrl}
                onUpload={onUploadLogo}
                onRemove={onRemoveLogo}
                uploading={logoUploading}
                disabled={disabled}
                uploadLabel="Upload logo"
              />
            </EmailBuilderSettingsGroup>
          </EmailBuilderPanelBody>
        ) : null}

        {tab === "sections" ? (
          <EmailBuilderPanelBody>
            <EmailBuilderHintCallout>
              <InfoOutlined sx={{ fontSize: 18, color: muiTheme.palette.info.light, mt: 0.15 }} />
              <Box component="span">
                Reorder blocks with the arrows. Tap a section header or use{" "}
                <strong>Expand to edit</strong> to change title, layout, and icons. Footer settings
                live on the Footer tab.
              </Box>
            </EmailBuilderHintCallout>
            {sectionBlocks.map((block, index) => {
              const Icon = blockIconForKey(block.blockKey);
              const expanded = expandedKey === block.blockKey;
              const canExpand = block.enabled;

              return (
                <EmailBuilderBlockCard
                  key={block.blockKey}
                  selected={expanded && block.enabled}
                  disabled={!block.enabled}
                >
                  <EmailBuilderBlockHeader
                    role={canExpand ? "button" : undefined}
                    tabIndex={canExpand ? 0 : undefined}
                    aria-expanded={canExpand ? expanded : undefined}
                    aria-label={
                      canExpand
                        ? `${expanded ? "Collapse" : "Expand"} ${EMAIL_TEMPLATE_BLOCK_LABELS[block.blockKey]} settings`
                        : undefined
                    }
                    sx={{
                      cursor: canExpand ? "pointer" : "default",
                      ...(canExpand && !expanded
                        ? {
                            borderLeft: `3px solid ${alpha(muiTheme.palette.primary.main, 0.55)}`,
                          }
                        : {}),
                    }}
                    onClick={() => {
                      if (!canExpand) return;
                      setExpandedKey(expanded ? null : block.blockKey);
                    }}
                    onKeyDown={(e) => {
                      if (!canExpand) return;
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setExpandedKey(expanded ? null : block.blockKey);
                      }
                    }}
                  >
                    <EmailBuilderIconBadge active={block.enabled}>
                      <Icon sx={{ fontSize: 18 }} />
                    </EmailBuilderIconBadge>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
                        <Typography variant="small" fontWeight={700}>
                          {EMAIL_TEMPLATE_BLOCK_LABELS[block.blockKey]}
                        </Typography>
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: muiTheme.app.dashboard.textMuted,
                          display: "block",
                          lineHeight: 1.35,
                          mt: 0.15,
                        }}
                      >
                        {EMAIL_TEMPLATE_BLOCK_DESCRIPTIONS[block.blockKey]}
                      </Typography>
                    </Box>
                    {canExpand ? (
                      <>
                        <EmailBuilderExpandAction expanded={expanded}>
                          {expanded ? "Collapse" : "Expand to edit"}
                        </EmailBuilderExpandAction>
                        <EmailBuilderExpandChevron expanded={expanded}>
                          <ChevronRightOutlined sx={{ fontSize: 18 }} />
                        </EmailBuilderExpandChevron>
                      </>
                    ) : null}
                    <Switch
                      size="small"
                      checked={block.enabled}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        onToggleBlock(block.blockKey, e.target.checked);
                        if (e.target.checked) setExpandedKey(block.blockKey);
                      }}
                      disabled={disabled}
                    />
                    <EmailBuilderReorderGroup onClick={(e) => e.stopPropagation()}>
                      <EmailBuilderReorderButton
                        type="button"
                        disabled={disabled || index === 0}
                        onClick={() => onReorderBlock(block.blockKey, "up")}
                        aria-label="Move block up"
                      >
                        <ArrowUpward sx={{ fontSize: 16 }} />
                      </EmailBuilderReorderButton>
                      <EmailBuilderReorderButton
                        type="button"
                        disabled={disabled || index === sectionBlocks.length - 1}
                        onClick={() => onReorderBlock(block.blockKey, "down")}
                        aria-label="Move block down"
                      >
                        <ArrowDownward sx={{ fontSize: 16 }} />
                      </EmailBuilderReorderButton>
                    </EmailBuilderReorderGroup>
                  </EmailBuilderBlockHeader>
                  <Collapse in={block.enabled && expanded}>
                    <Box
                      sx={{
                        px: 1.5,
                        pb: 1.5,
                        pt: 1,
                        borderTop: `1px solid ${alpha(muiTheme.app.dashboard.cardBorder, 0.75)}`,
                        bgcolor: alpha(muiTheme.palette.common.black, 0.12),
                      }}
                    >
                      <SectionBlockEditor
                        block={block}
                        disabled={disabled}
                        globalIconStyle={emailTheme.globalIconStyle ?? "mui"}
                        accentColor={primaryColor}
                        onChange={(next) => {
                          onBlocksChange(
                            blocks.map((b) => (b.blockKey === block.blockKey ? next : b)),
                          );
                        }}
                      />
                    </Box>
                  </Collapse>
                </EmailBuilderBlockCard>
              );
            })}
          </EmailBuilderPanelBody>
        ) : null}

        {tab === "footer" ? (
          <EmailBuilderPanelBody>
            <EmailBuilderSettingsGroup>
              <BuilderGroupHeading>Footer block</BuilderGroupHeading>
              <FormControlLabel
                control={
                  <Switch
                    checked={footerBlock?.enabled !== false}
                    onChange={(e) => onToggleBlock("footer", e.target.checked)}
                    disabled={disabled}
                  />
                }
                label="Show footer in email"
              />
              <EmailBuilderInputField
                label="Footer section title (optional)"
                name="footerSectionTitle"
                value={
                  (footerBlock ? readBlockStyle(footerBlock) : defaultStyleForBlock("footer")).title ??
                  ""
                }
                onChange={(e) => {
                  const fb = footerBlock ?? blocks.find((b) => b.blockKey === "footer");
                  if (!fb) return;
                  onBlocksChange(
                    blocks.map((b) =>
                      b.blockKey === "footer"
                        ? patchBlockStyle(b, { title: e.target.value })
                        : b,
                    ),
                  );
                }}
                disabled={disabled || footerBlock?.enabled === false}
                placeholder="Leave blank for no heading"
              />
            </EmailBuilderSettingsGroup>

            <EmailBuilderSettingsGroup>
              <BuilderGroupHeading>Footer colors</BuilderGroupHeading>
              <EmailBuilderFieldStack>
                <EmailBuilderColorField
                  label="Footer background color"
                  value={emailTheme.footerBackground ?? ""}
                  onChange={(hex) => patchTheme({ footerBackground: hex })}
                  disabled={disabled}
                  fallback="#1a57a5"
                />
                <EmailBuilderColorField
                  label="Footer text color"
                  value={emailTheme.footerTextColor ?? ""}
                  onChange={(hex) => patchTheme({ footerTextColor: hex })}
                  disabled={disabled}
                  fallback="#ffffff"
                />
              </EmailBuilderFieldStack>
            </EmailBuilderSettingsGroup>

            <EmailBuilderSettingsGroup>
              <BuilderGroupHeading>Content</BuilderGroupHeading>
              <EmailBuilderInputField
                label="Company name"
                name="footerCompany"
                value={emailTheme.footerCompanyName ?? ""}
                onChange={(e) => patchTheme({ footerCompanyName: e.target.value })}
                disabled={disabled}
              />
              <EmailBuilderInputField
                label="Disclaimer / note"
                name="footerNote"
                value={emailTheme.footerNote ?? ""}
                onChange={(e) => patchTheme({ footerNote: e.target.value })}
                disabled={disabled}
                multiline
                rows={2}
              />
              <EmailBuilderInputField
                label="Support email"
                name="footerSupport"
                value={emailTheme.footerSupportEmail ?? ""}
                onChange={(e) => patchTheme({ footerSupportEmail: e.target.value })}
                disabled={disabled}
                placeholder="support@yourcompany.com"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={emailTheme.showPoweredBy !== false}
                    onChange={(e) => patchTheme({ showPoweredBy: e.target.checked })}
                    disabled={disabled}
                  />
                }
                label="Show “Powered by Conver”"
              />
            </EmailBuilderSettingsGroup>
          </EmailBuilderPanelBody>
        ) : null}
        </EmailBuilderToolsScroll>
      </EmailBuilderToolsPanel>
    </EmailBuilderChrome>
  );
}
