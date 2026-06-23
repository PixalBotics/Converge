"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, SelectField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { WidgetFlowShell } from "@/features/chat-widget";
import { WidgetWizardPageLayout } from "@/features/chat-widget/components/WidgetWizardPageLayout";
import { WidgetWizardToggleRow } from "@/features/chat-widget/components/WidgetWizardToggleRow";
import { WidgetTextField } from "@/features/chat-widget/components/WidgetFormFields";
import { SchedulingSectionCard } from "@/features/website-assignments/components/ServiceSchedulingSections";
import { WidgetColorPickerField } from "@/components/dashboard/chat-widget/WidgetColorPickerField";
import { WidgetLauncherIconPicker } from "@/components/dashboard/chat-widget/WidgetLauncherIconPicker";
import { TextUsWizardLivePreview } from "@/components/dashboard/chat-widget/TextUsWizardLivePreview";
import { TextUsConfigJsonPreview } from "@/components/dashboard/chat-widget/TextUsConfigJsonPreview";
import { TextUsFormFieldsEditor } from "@/components/dashboard/chat-widget/TextUsFormFieldsEditor";
import { WIDGET_BRAND_COLOR_PRESETS } from "@/lib/chat-widget/brand-color-presets";
import {
  DESIGN_ACCENT_SELECT_OPTIONS,
  DESIGN_DENSITY_SELECT_OPTIONS,
} from "@/lib/chat-widget/design-accent-density";
import { WIDGET_LAUNCHER_STYLE_OPTIONS } from "@/lib/chat-widget/launcher-style";
import type { TextUsThemePreviewInput } from "@/lib/chat-widget/text-us-design-json";
import { persistAssetUrlsOnDraft } from "@/lib/chat-widget/resolve-widget-draft-asset-urls";
import {
  patchRemoteWidgetConfigurationWithMeta,
  resolveWizardKindFromDraft,
  summarizePatchResult,
} from "@/lib/chat-widget/widget-remote-sync";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { publishAppToast } from "@/lib/notify";
import {
  readChatWizardDraft,
  resolveEditWidgetKeyForNavigation,
  saveChatWizardDraft,
  withChatEditQuery,
} from "@/lib/chat-widget/chat-wizard-edit";
import {
  DEFAULT_TEXT_US_FORM_FIELDS,
  resolveTextUsFormFields,
} from "@/lib/chat-widget/text-us-form-defaults";
import {
  defaultWidgetDraft,
  type LauncherIconPresetId,
  type TextUsFormFieldDraft,
  type WidgetLauncherStyleId,
} from "@/lib/chat-widget/widgetDraft";
import { FIELD_MAX } from "@/lib/chat-widget/widget-field-validation";

function parseInsetPxString(raw: string, fallback: number): number {
  const n = Number.parseInt(raw.trim(), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(240, Math.max(0, n));
}

function parseBoxSizeString(raw: string, fallback: number, min: number, max: number): number {
  const n = Number.parseInt(raw.trim(), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function readLogoFile(event: ChangeEvent<HTMLInputElement>, onLoad: (dataUrl: string, name: string) => void) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) {
    publishAppToast({ variant: "error", message: "Logo must be 10 MB or smaller." });
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === "string") onLoad(reader.result, file.name);
  };
  reader.readAsDataURL(file);
}

export default function TextUsWidgetPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editWidgetKey = resolveEditWidgetKeyForNavigation(searchParams.get("edit") ?? "");
  const theme = useTheme() as AppTheme;
  const logoUploadRef = useRef<HTMLInputElement | null>(null);

  const [position, setPosition] = useState(defaultWidgetDraft.textUsPosition ?? "right");
  const [verticalAnchor, setVerticalAnchor] = useState<"top" | "bottom">(
    defaultWidgetDraft.textUsVerticalAnchor ?? "bottom",
  );
  const [insetBottomPx, setInsetBottomPx] = useState(String(defaultWidgetDraft.textUsInsetBottomPx ?? 28));
  const [insetTopPx, setInsetTopPx] = useState(String(defaultWidgetDraft.textUsInsetTopPx ?? 28));
  const [insetSidePx, setInsetSidePx] = useState(String(defaultWidgetDraft.textUsInsetSidePx ?? 28));
  const [boxWidth, setBoxWidth] = useState(String(defaultWidgetDraft.textUsBoxWidth ?? 360));
  const [boxHeight, setBoxHeight] = useState(String(defaultWidgetDraft.textUsBoxHeight ?? 480));

  const [welcomeEnabled, setWelcomeEnabled] = useState(true);
  const [buttonColor, setButtonColor] = useState(defaultWidgetDraft.textUsButtonColor ?? "#1E63D5");
  const [buttonHoverColor, setButtonHoverColor] = useState(
    defaultWidgetDraft.textUsButtonHoverColor ?? "#164EB0",
  );
  const [buttonLabel, setButtonLabel] = useState(defaultWidgetDraft.textUsButtonLabel ?? "Text us");
  const [iconColor, setIconColor] = useState(defaultWidgetDraft.textUsIconColor ?? "#FFFFFF");
  const [panelBackground, setPanelBackground] = useState(
    defaultWidgetDraft.textUsPanelBackground ?? "#f8fafc",
  );
  const [headerTitle, setHeaderTitle] = useState(defaultWidgetDraft.textUsHeaderTitle ?? "Text us");
  const [welcomeMessage, setWelcomeMessage] = useState(
    defaultWidgetDraft.textUsWelcomeMessage ?? "Send us a message — we reply by SMS.",
  );
  const [headerLogoDataUrl, setHeaderLogoDataUrl] = useState("");
  const [headerLogoFileName, setHeaderLogoFileName] = useState("");
  const [motionEnabled, setMotionEnabled] = useState(defaultWidgetDraft.textUsMotionEnabled !== false);
  const [launcherIconPreset, setLauncherIconPreset] = useState<LauncherIconPresetId>(
    defaultWidgetDraft.textUsLauncherIconPreset ?? "phosphor-chat-circle",
  );
  const [launcherIconEnabled, setLauncherIconEnabled] = useState(
    defaultWidgetDraft.textUsLauncherIconEnabled !== false,
  );
  const [launcherStyle, setLauncherStyle] = useState<WidgetLauncherStyleId>(
    defaultWidgetDraft.textUsLauncherStyle ?? "solid",
  );
  const [accent, setAccent] = useState(defaultWidgetDraft.textUsAccent ?? "blue");
  const [density, setDensity] = useState(defaultWidgetDraft.textUsDensity ?? "comfortable");

  const [formFields, setFormFields] = useState<TextUsFormFieldDraft[]>(DEFAULT_TEXT_US_FORM_FIELDS);
  const [saving, setSaving] = useState(false);

  const draft = readChatWizardDraft(editWidgetKey || undefined);
  const isBothFlow = draft.type === "both";

  useEffect(() => {
    const d = readChatWizardDraft(editWidgetKey || undefined);
    if (d.type !== "text" && d.type !== "both") return;
    if (d.textUsPosition) setPosition(d.textUsPosition);
    if (d.textUsVerticalAnchor) setVerticalAnchor(d.textUsVerticalAnchor);
    if (d.textUsInsetBottomPx != null) setInsetBottomPx(String(d.textUsInsetBottomPx));
    if (d.textUsInsetTopPx != null) setInsetTopPx(String(d.textUsInsetTopPx));
    if (d.textUsInsetSidePx != null) setInsetSidePx(String(d.textUsInsetSidePx));
    if (d.textUsBoxWidth != null) setBoxWidth(String(d.textUsBoxWidth));
    if (d.textUsBoxHeight != null) setBoxHeight(String(d.textUsBoxHeight));
    if (d.textUsButtonColor) setButtonColor(d.textUsButtonColor);
    if (d.textUsButtonHoverColor) setButtonHoverColor(d.textUsButtonHoverColor);
    if (d.textUsButtonLabel) setButtonLabel(d.textUsButtonLabel);
    if (d.textUsIconColor) setIconColor(d.textUsIconColor);
    if (d.textUsPanelBackground) setPanelBackground(d.textUsPanelBackground);
    if (d.textUsHeaderTitle) setHeaderTitle(d.textUsHeaderTitle);
    if (d.textUsWelcomeMessage !== undefined) {
      setWelcomeMessage(d.textUsWelcomeMessage);
      setWelcomeEnabled(Boolean(d.textUsWelcomeMessage?.trim()));
    }
    if (d.textUsHeaderLogoDataUrl) {
      setHeaderLogoDataUrl(d.textUsHeaderLogoDataUrl);
      setHeaderLogoFileName("Uploaded logo");
    }
    if (d.textUsMotionEnabled != null) setMotionEnabled(d.textUsMotionEnabled);
    if (d.textUsLauncherIconPreset) setLauncherIconPreset(d.textUsLauncherIconPreset);
    if (d.textUsLauncherIconEnabled != null) setLauncherIconEnabled(d.textUsLauncherIconEnabled);
    if (d.textUsLauncherStyle) setLauncherStyle(d.textUsLauncherStyle);
    if (d.textUsAccent) setAccent(d.textUsAccent);
    if (d.textUsDensity) setDensity(d.textUsDensity);
    setFormFields(resolveTextUsFormFields(d.textUsFormFields));
  }, [editWidgetKey]);

  const previewFields = useMemo(() => resolveTextUsFormFields(formFields), [formFields]);

  const themePreview: TextUsThemePreviewInput = useMemo(
    () => ({
      buttonColor,
      buttonHoverColor,
      iconColor,
      position,
      verticalAnchor,
      insetBottomPx: parseInsetPxString(insetBottomPx, 28),
      insetTopPx: parseInsetPxString(insetTopPx, 28),
      insetSidePx: parseInsetPxString(insetSidePx, 28),
      boxWidth: parseBoxSizeString(boxWidth, 360, 280, 520),
      boxHeight: parseBoxSizeString(boxHeight, 480, 320, 640),
      headerTitle,
      welcomeMessage: welcomeEnabled ? welcomeMessage : "",
      buttonLabel: buttonLabel.trim() || "Text us",
      headerLogoUrl: headerLogoDataUrl.startsWith("http") ? headerLogoDataUrl : undefined,
      motionEnabled,
      panelBackground,
      launcherIconPreset,
      launcherIconEnabled,
      launcherStyle,
      accent,
      density,
    }),
    [
      buttonColor,
      buttonHoverColor,
      buttonLabel,
      iconColor,
      position,
      verticalAnchor,
      insetBottomPx,
      insetTopPx,
      insetSidePx,
      boxWidth,
      boxHeight,
      headerTitle,
      welcomeEnabled,
      welcomeMessage,
      headerLogoDataUrl,
      motionEnabled,
      panelBackground,
      launcherIconPreset,
      launcherIconEnabled,
      launcherStyle,
      accent,
      density,
    ],
  );

  const persistAndContinue = () => {
    if (saving) return;
    if (!launcherIconEnabled && !buttonLabel.trim()) {
      publishAppToast({
        variant: "error",
        message: "Add launcher button text when the icon is turned off.",
      });
      return;
    }
    void (async () => {
      const textUsFormFields = resolveTextUsFormFields(formFields);
      const prev = readChatWizardDraft(editWidgetKey || undefined);
      const rk = prev.remoteWidgetKey?.trim();
      if (!rk) {
        publishAppToast({
          variant: "error",
          message: "Missing server widget draft. Go back to the first step and save again.",
        });
        return;
      }

      setSaving(true);
      try {
        saveChatWizardDraft(editWidgetKey || undefined, {
          ...prev,
          type: prev.type ?? "both",
          completed: false,
          textUsButtonColor: buttonColor,
          textUsButtonHoverColor: buttonHoverColor,
          textUsButtonLabel: buttonLabel.trim() || "Text us",
          textUsIconColor: iconColor,
          textUsPanelBackground: panelBackground,
          textUsPosition: position,
          textUsVerticalAnchor: verticalAnchor,
          textUsInsetBottomPx: parseInsetPxString(insetBottomPx, 28),
          textUsInsetTopPx: parseInsetPxString(insetTopPx, 28),
          textUsInsetSidePx: parseInsetPxString(insetSidePx, 28),
          textUsBoxWidth: parseBoxSizeString(boxWidth, 360, 280, 520),
          textUsBoxHeight: parseBoxSizeString(boxHeight, 480, 320, 640),
          textUsHeaderTitle: headerTitle,
          textUsWelcomeMessage: welcomeEnabled ? welcomeMessage.trim() : "",
          textUsHeaderLogoDataUrl: headerLogoDataUrl,
          textUsMotionEnabled: motionEnabled,
          textUsLauncherIconPreset: launcherIconPreset,
          textUsLauncherIconEnabled: launcherIconEnabled,
          textUsLauncherStyle: launcherStyle,
          textUsAccent: accent,
          textUsDensity: density,
          textUsFormFields,
        });

        const latest = readChatWizardDraft(editWidgetKey || undefined);
        const patchMeta = await patchRemoteWidgetConfigurationWithMeta({
          widgetKey: rk,
          widgetKind: resolveWizardKindFromDraft(latest),
          draft: latest,
          publishNow: false,
        });
        const sum = summarizePatchResult(patchMeta.inner);
        if (patchMeta.assetUrls) {
          saveChatWizardDraft(
            editWidgetKey || undefined,
            persistAssetUrlsOnDraft(latest, patchMeta.assetUrls),
          );
        }
        if (patchMeta.assetErrors?.length) {
          publishAppToast({ variant: "error", message: patchMeta.assetErrors.join(" ") });
        }
        saveChatWizardDraft(editWidgetKey || undefined, {
          requiresPublishBeforeEmbed: sum.requiresPublishBeforeEmbed,
        });

        const nextPath = isBothFlow
          ? "/dashboard/chat-widget/add/chat/script"
          : "/dashboard/chat-widget/add/text/script";
        router.push(withChatEditQuery(nextPath, editWidgetKey || rk));
      } catch (e) {
        publishAppToast({
          variant: "error",
          message:
            extractApiErrorMessageForToast(e) ??
            "Could not save Text Us configuration to the server.",
        });
      } finally {
        setSaving(false);
      }
    })();
  };

  return (
    <WidgetFlowShell
      pageTitle={isBothFlow ? "Text Us (Chat + Text)" : "Text Us Widget"}
      subtitle="Position, branding, form fields, and visitor analytics — same quality as chat widget."
      cardTitle="Text Us design"
      currentStep={isBothFlow ? 3 : undefined}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={() => router.push("/dashboard/chat-widget")}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            disabled={saving}
            onClick={persistAndContinue}
          >
            {saving ? "Saving…" : isBothFlow ? "Next: Install" : "Save"}
          </Button>
        </>
      }
    >
      <WidgetWizardPageLayout
        showChecklist={false}
        preview={
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextUsWizardLivePreview
              buttonColor={buttonColor}
              buttonHoverColor={buttonHoverColor}
              iconColor={iconColor}
              buttonLabel={buttonLabel}
              launcherIconPreset={launcherIconPreset}
              launcherIconEnabled={launcherIconEnabled}
              launcherStyle={launcherStyle}
              panelBackground={panelBackground}
              position={position}
              verticalAnchor={verticalAnchor}
              insetBottomPx={parseInsetPxString(insetBottomPx, 28)}
              insetTopPx={parseInsetPxString(insetTopPx, 28)}
              insetSidePx={parseInsetPxString(insetSidePx, 28)}
              boxWidth={parseBoxSizeString(boxWidth, 360, 280, 520)}
              boxHeight={parseBoxSizeString(boxHeight, 480, 320, 640)}
              headerTitle={headerTitle}
              headerLogoDataUrl={headerLogoDataUrl || undefined}
              welcomeMessage={welcomeMessage}
              welcomeEnabled={welcomeEnabled}
              fields={previewFields}
            />
            <TextUsConfigJsonPreview theme={themePreview} fields={previewFields} />
          </Box>
        }
      >
        <SchedulingSectionCard
          title="Placement & size"
          subtitle="Anchor the launcher and panel on any screen edge — set width and height in pixels."
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <SelectField
                label="Vertical anchor"
                value={verticalAnchor}
                onChange={(v) => setVerticalAnchor(v === "top" ? "top" : "bottom")}
                options={[
                  { label: "Bottom of screen", value: "bottom" },
                  { label: "Top of screen", value: "top" },
                ]}
              />
              <SelectField
                label="Horizontal alignment"
                value={position}
                onChange={setPosition}
                options={[
                  { label: "Left", value: "left" },
                  { label: "Center", value: "center" },
                  { label: "Right", value: "right" },
                ]}
              />
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 2 }}>
              {verticalAnchor === "bottom" ? (
                <InputField
                  label="Inset from bottom (px)"
                  name="text-us-inset-bottom"
                  value={insetBottomPx}
                  onChange={(e) => setInsetBottomPx(e.target.value)}
                />
              ) : (
                <InputField
                  label="Inset from top (px)"
                  name="text-us-inset-top"
                  value={insetTopPx}
                  onChange={(e) => setInsetTopPx(e.target.value)}
                />
              )}
              <InputField
                label="Inset from side (px)"
                name="text-us-inset-side"
                value={insetSidePx}
                onChange={(e) => setInsetSidePx(e.target.value)}
              />
              <InputField
                label="Panel width (280–520)"
                name="text-us-box-width"
                value={boxWidth}
                onChange={(e) => setBoxWidth(e.target.value)}
              />
            </Box>
            <InputField
              label="Panel height (320–640)"
              name="text-us-box-height"
              value={boxHeight}
              onChange={(e) => setBoxHeight(e.target.value)}
            />
          </Box>
        </SchedulingSectionCard>

        <SchedulingSectionCard
          title="Branding & launcher"
          subtitle="Colors, logo, icon, motion, and panel style — matches chat widget capabilities."
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 2 }}>
              <WidgetColorPickerField label="Button color" value={buttonColor} onChange={setButtonColor} />
              <WidgetColorPickerField
                label="Hover color"
                value={buttonHoverColor}
                onChange={setButtonHoverColor}
              />
              <WidgetColorPickerField label="Icon color" value={iconColor} onChange={setIconColor} />
            </Box>
            <WidgetColorPickerField
              label="Panel background"
              value={panelBackground}
              onChange={setPanelBackground}
              fallback="#f8fafc"
            />

            <WidgetTextField
              label="Launcher button text"
              name="text-us-button-label"
              value={buttonLabel}
              onChange={setButtonLabel}
              maxLength={FIELD_MAX.shortLabel}
              showCharCount
              helperText={
                launcherIconEnabled
                  ? "Shown on the floating pill next to the icon — e.g. Text us, SMS us."
                  : "Required when the icon is off — this is the only label visitors see."
              }
            />

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>
                Brand presets
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {WIDGET_BRAND_COLOR_PRESETS.map((preset) => (
                  <Button
                    key={preset.id}
                    type="button"
                    variant="secondary"
                    size="small"
                    onClick={() => {
                      setButtonColor(preset.buttonColor);
                      setButtonHoverColor(preset.buttonHoverColor);
                      setIconColor(preset.iconColor);
                    }}
                    sx={{ minWidth: 0, px: 1.25, py: 0.5, display: "inline-flex", alignItems: "center", gap: 0.75 }}
                  >
                    <Box
                      aria-hidden
                      sx={{
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        bgcolor: preset.buttonColor,
                        border: "1px solid rgba(255,255,255,0.35)",
                      }}
                    />
                    {preset.label}
                  </Button>
                ))}
              </Box>
            </Box>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>
                Header logo (optional)
              </Typography>
              <Box
                role="button"
                tabIndex={0}
                onClick={() => logoUploadRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    logoUploadRef.current?.click();
                  }
                }}
                sx={{
                  border: `1px dashed ${theme.app.dashboard.accentBlue}`,
                  borderRadius: 1.5,
                  py: 1.5,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.5,
                  cursor: "pointer",
                  bgcolor: "rgba(6, 12, 54, 0.25)",
                }}
              >
                <CloudUploadOutlined sx={{ color: theme.app.dashboard.accentBlue }} />
                <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                  {headerLogoFileName || "PNG or SVG, max 10 MB"}
                </Typography>
              </Box>
              {headerLogoDataUrl ? (
                <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    component="img"
                    src={headerLogoDataUrl}
                    alt=""
                    sx={{ height: 32, maxWidth: 120, objectFit: "contain" }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="small"
                    onClick={() => {
                      setHeaderLogoDataUrl("");
                      setHeaderLogoFileName("");
                      if (logoUploadRef.current) logoUploadRef.current.value = "";
                    }}
                  >
                    Remove
                  </Button>
                </Box>
              ) : null}
              <Box
                component="input"
                ref={logoUploadRef}
                type="file"
                accept="image/*"
                onChange={(e) =>
                  readLogoFile(e, (dataUrl, name) => {
                    setHeaderLogoDataUrl(dataUrl);
                    setHeaderLogoFileName(name);
                  })
                }
                sx={{ display: "none" }}
              />
            </Box>

            <WidgetWizardToggleRow
              label="Panel animations"
              description="Smooth open/close motion on the visitor site."
              checked={motionEnabled}
              onChange={setMotionEnabled}
            />

            <WidgetWizardToggleRow
              label="Launcher icon"
              description="Turn off to show only your button text (no glyph)."
              checked={launcherIconEnabled}
              onChange={setLauncherIconEnabled}
            />

            {launcherIconEnabled ? (
              <WidgetLauncherIconPicker
                buttonColor={buttonColor}
                hoverColor={buttonHoverColor}
                iconColor={iconColor}
                launcherIconPreset={launcherIconPreset}
                iconDataUrl=""
                onSelectPreset={setLauncherIconPreset}
                onSelectDefault={() => setLauncherIconPreset("phosphor-chat-circle")}
              />
            ) : (
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                Icon hidden — visitors will see your launcher button text only.
              </Typography>
            )}

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>
                Launcher style
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" }, gap: 1 }}>
                {WIDGET_LAUNCHER_STYLE_OPTIONS.map((opt) => (
                  <Button
                    key={opt.id}
                    type="button"
                    variant={launcherStyle === opt.id ? "primary" : "secondary"}
                    onClick={() => setLauncherStyle(opt.id)}
                    sx={{ flexDirection: "column", alignItems: "flex-start", textAlign: "left", py: 1.25 }}
                  >
                    <Typography variant="caption" fontWeight={700}>
                      {opt.label}
                    </Typography>
                  </Button>
                ))}
              </Box>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <SelectField
                label="Accent"
                value={accent}
                onChange={setAccent}
                options={DESIGN_ACCENT_SELECT_OPTIONS}
              />
              <SelectField
                label="Density"
                value={density}
                onChange={setDensity}
                options={DESIGN_DENSITY_SELECT_OPTIONS}
              />
            </Box>
          </Box>
        </SchedulingSectionCard>

        <SchedulingSectionCard
          title="Panel content"
          subtitle="Header title and optional welcome line."
        >
          <WidgetWizardToggleRow
            label="Welcome message"
            checked={welcomeEnabled}
            onChange={setWelcomeEnabled}
          />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <WidgetTextField
              label="Header title"
              name="text-us-header"
              value={headerTitle}
              onChange={setHeaderTitle}
              maxLength={FIELD_MAX.title}
              showCharCount
            />
            {welcomeEnabled ? (
              <WidgetTextField
                label="Welcome message"
                name="text-us-welcome"
                value={welcomeMessage}
                onChange={setWelcomeMessage}
                maxLength={FIELD_MAX.message}
                showCharCount
              />
            ) : null}
          </Box>
        </SchedulingSectionCard>

        <SchedulingSectionCard
          title="Visitor form"
          subtitle="Default fields plus custom fields — you control keys, labels, placeholders, and types."
        >
          <TextUsFormFieldsEditor fields={formFields} onChange={setFormFields} />
        </SchedulingSectionCard>

        <SchedulingSectionCard
          title="Visitor analytics"
          subtitle="How traffic is counted when this widget is embedded."
        >
          <Box sx={{ display: "flex", gap: 1.25, alignItems: "flex-start" }}>
            <InfoOutlined sx={{ fontSize: 20, color: theme.app.dashboard.accentBlue, mt: 0.15 }} />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="body2" sx={{ color: theme.app.text.primary }}>
                <strong>Text Us only:</strong> visitors are counted when your embed script loads on the
                page — they do <em>not</em> need to open Text Us or submit the form.
              </Typography>
              <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                <strong>Chat + Text Us (both):</strong> one script, one visitor per page load — Text Us does
                not add a second counter. Opening chat is tracked separately as widget engagement.
              </Typography>
              <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                Someone who only browses your site (never opens the widget) still appears in analytics as a
                traffic visit from script load.
              </Typography>
            </Box>
          </Box>
        </SchedulingSectionCard>
      </WidgetWizardPageLayout>
    </WidgetFlowShell>
  );
}
