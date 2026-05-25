"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ChatRounded from "@mui/icons-material/ChatRounded";
import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, SelectField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { WidgetFlowShell } from "@/features/chat-widget";
import { WidgetWizardPageLayout } from "@/features/chat-widget/components/WidgetWizardPageLayout";
import { SchedulingSectionCard } from "@/features/website-assignments/components/ServiceSchedulingSections";
import { LAUNCHER_ICON_PRESETS, LauncherPresetIcon } from "@/lib/chat-widget/launcherIcons";
import {
  patchRemoteWidgetConfiguration,
  summarizePatchResult,
} from "@/lib/chat-widget/widget-remote-sync";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { publishAppToast } from "@/lib/notify";
import {
  readChatWizardDraft,
  resolveEditWidgetKeyForNavigation,
  resolveRemoteWidgetKeyForChatWizard,
  saveChatWizardDraft,
  useChatWidgetWizardEdit,
  withChatEditQuery,
} from "@/lib/chat-widget/chat-wizard-edit";
import {
  readWidgetChatColorsFromDraft,
  widgetChatColorsDraftToPatch,
} from "@/lib/chat-widget/widget-colors-draft";
import { WidgetLauncherLivePreview } from "@/components/dashboard/chat-widget/WidgetLauncherLivePreview";
import { WidgetColorPickerField } from "@/components/dashboard/chat-widget/WidgetColorPickerField";
import {
  DESIGN_ACCENT_SELECT_OPTIONS,
  DESIGN_DENSITY_SELECT_OPTIONS,
} from "@/lib/chat-widget/design-accent-density";
import {
  defaultWidgetDraft,
  type LauncherIconPresetId,
} from "@/lib/chat-widget/widgetDraft";

function parseInsetPxString(raw: string, fallback: number): number {
  const n = Number.parseInt(raw.trim(), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(240, Math.max(0, n));
}

function clampNum(raw: string, min: number, max: number, fallback: number): number {
  const n = Number.parseInt(raw.trim(), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export default function ChatWidgetButtonDesignPage() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const { editWidgetKey, draftReady, hydrateError } = useChatWidgetWizardEdit();
  const [buttonShape, setButtonShape] = useState<"circle" | "rounded" | "square">("circle");
  const [buttonPosition, setButtonPosition] = useState("right");
  const [selectedButtonColor, setSelectedButtonColor] = useState("#2AA9E0");
  const [selectedHoverColor, setSelectedHoverColor] = useState("#1C8DC2");
  const [selectedIconColor, setSelectedIconColor] = useState("#FFFFFF");
  const [iconFileName, setIconFileName] = useState("");
  const [iconDataUrl, setIconDataUrl] = useState("");
  const [launcherIconPreset, setLauncherIconPreset] = useState<LauncherIconPresetId>("phosphor-chat-circle");
  const [launcherInsetBottom, setLauncherInsetBottom] = useState("28");
  const [launcherInsetSide, setLauncherInsetSide] = useState("28");
  const iconUploadRef = useRef<HTMLInputElement | null>(null);
  const [saving, setSaving] = useState(false);
  const [checklistRefreshKey, setChecklistRefreshKey] = useState(0);

  const [themeName, setThemeName] = useState(defaultWidgetDraft.themeName ?? "Brand Default");
  const [themePrimaryColor, setThemePrimaryColor] = useState(
    defaultWidgetDraft.themePrimaryColor ?? "",
  );
  const [themeSecondaryColor, setThemeSecondaryColor] = useState(
    defaultWidgetDraft.themeSecondaryColor ?? "#64748b",
  );
  const [themeFontFamily, setThemeFontFamily] = useState(
    defaultWidgetDraft.themeFontFamily ?? "Inter, system-ui, sans-serif",
  );
  const [themeBubbleStyle, setThemeBubbleStyle] = useState(defaultWidgetDraft.themeBubbleStyle ?? "rounded");
  const [themeBorderRadiusPxStr, setThemeBorderRadiusPxStr] = useState(
    String(defaultWidgetDraft.themeBorderRadiusPx ?? 12),
  );
  const [themeWelcomeFontStr, setThemeWelcomeFontStr] = useState(
    String(defaultWidgetDraft.themeWelcomeFontSizePx ?? 18),
  );
  const [themeBodyFontStr, setThemeBodyFontStr] = useState(String(defaultWidgetDraft.themeBodyFontSizePx ?? 14));
  const [themeInputFontStr, setThemeInputFontStr] = useState(String(defaultWidgetDraft.themeInputFontSizePx ?? 14));
  const [themeCtaFontStr, setThemeCtaFontStr] = useState(String(defaultWidgetDraft.themeCtaFontSizePx ?? 15));
  const [themeConsentFontStr, setThemeConsentFontStr] = useState(
    String(defaultWidgetDraft.themeConsentFontSizePx ?? 12),
  );
  const [themeLineHeightStr, setThemeLineHeightStr] = useState(String(defaultWidgetDraft.themeLineHeightPx ?? 22));
  const [themeDesignJsonAccent, setThemeDesignJsonAccent] = useState(
    defaultWidgetDraft.themeDesignJsonAccent ?? "blue",
  );
  const [themeDesignJsonDensity, setThemeDesignJsonDensity] = useState(
    defaultWidgetDraft.themeDesignJsonDensity ?? "comfortable",
  );

  useEffect(() => {
    if (!draftReady) return;
    const d = readChatWizardDraft(resolveEditWidgetKeyForNavigation(editWidgetKey) || undefined);
    setButtonShape(d.buttonShape);
    setButtonPosition(d.buttonPosition);
    setSelectedButtonColor(d.buttonColor || "#2AA9E0");
    setSelectedHoverColor(d.buttonHoverColor || "#1C8DC2");
    setSelectedIconColor(d.iconColor || "#FFFFFF");
    setIconDataUrl(d.iconDataUrl || "");
    setIconFileName(d.iconDataUrl ? "Uploaded icon" : "");
    setLauncherIconPreset(d.launcherIconPreset);
    setLauncherInsetBottom(String(d.launcherInsetBottomPx ?? 28));
    setLauncherInsetSide(String(d.launcherInsetSidePx ?? 28));
    setThemeName(d.themeName ?? "Brand Default");
    setThemePrimaryColor(d.themePrimaryColor ?? "");
    setThemeSecondaryColor(d.themeSecondaryColor ?? "#64748b");
    setThemeFontFamily(d.themeFontFamily ?? "Inter, system-ui, sans-serif");
    setThemeBubbleStyle(d.themeBubbleStyle ?? "rounded");
    setThemeBorderRadiusPxStr(String(d.themeBorderRadiusPx ?? 12));
    setThemeWelcomeFontStr(String(d.themeWelcomeFontSizePx ?? 18));
    setThemeBodyFontStr(String(d.themeBodyFontSizePx ?? 14));
    setThemeInputFontStr(String(d.themeInputFontSizePx ?? 14));
    setThemeCtaFontStr(String(d.themeCtaFontSizePx ?? 15));
    setThemeConsentFontStr(String(d.themeConsentFontSizePx ?? 12));
    setThemeLineHeightStr(String(d.themeLineHeightPx ?? 22));
    setThemeDesignJsonAccent(d.themeDesignJsonAccent ?? "blue");
    setThemeDesignJsonDensity(d.themeDesignJsonDensity ?? "comfortable");
  }, [draftReady, editWidgetKey]);

  const handleIconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIconFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setIconDataUrl(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  };

  const previewBottomPx = parseInsetPxString(launcherInsetBottom, 28);
  const previewSidePx = parseInsetPxString(launcherInsetSide, 28);

  const handleNext = () => {
    if (saving) return;
    const bottomPx = parseInsetPxString(launcherInsetBottom, 28);
    const sidePx = parseInsetPxString(launcherInsetSide, 28);
    void (async () => {
      const editKey = resolveEditWidgetKeyForNavigation(editWidgetKey);
      const prev = readChatWizardDraft(editKey || undefined);
      const rk = resolveRemoteWidgetKeyForChatWizard(editKey || undefined, prev);
      if (!rk) {
        publishAppToast({
          variant: "error",
          message:
            "Missing server widget draft. Go back to the first step and save again.",
        });
        router.push("/dashboard/chat-widget/add");
        return;
      }

      setSaving(true);
      try {
        const colorSeed = readWidgetChatColorsFromDraft({
          ...prev,
          buttonColor: selectedButtonColor || "#2AA9E0",
          buttonHoverColor: selectedHoverColor || "#1C8DC2",
          iconColor: selectedIconColor || "#FFFFFF",
          textColor: prev.textColor ?? defaultWidgetDraft.textColor,
          themeSecondaryColor: themeSecondaryColor.trim() || "#64748b",
          backgroundColor: prev.backgroundColor ?? defaultWidgetDraft.backgroundColor,
        });

        saveChatWizardDraft(editKey || undefined, {
          type: "chat",
          buttonShape,
          buttonPosition: buttonPosition as "left" | "center" | "right",
          launcherInsetBottomPx: bottomPx,
          launcherInsetSidePx: sidePx,
          buttonColor: selectedButtonColor || "#2AA9E0",
          buttonHoverColor: selectedHoverColor || "#1C8DC2",
          iconColor: selectedIconColor || "#FFFFFF",
          iconDataUrl,
          launcherIconPreset,
          completed: false,
          widgetId: prev.widgetId?.startsWith("wgt_") ? prev.widgetId : rk,
          themeName: themeName.trim() || "Brand Default",
          themePrimaryColor: themePrimaryColor.trim() || selectedButtonColor || undefined,
          themeSecondaryColor: themeSecondaryColor.trim() || "#64748b",
          ...widgetChatColorsDraftToPatch(colorSeed),
          themeFontFamily: themeFontFamily.trim() || "Inter, system-ui, sans-serif",
          themeBubbleStyle: themeBubbleStyle.trim() || "rounded",
          themeBorderRadiusPx: clampNum(themeBorderRadiusPxStr, 0, 48, 12),
          themeWelcomeFontSizePx: clampNum(themeWelcomeFontStr, 10, 32, 18),
          themeBodyFontSizePx: clampNum(themeBodyFontStr, 10, 28, 14),
          themeInputFontSizePx: clampNum(themeInputFontStr, 10, 28, 14),
          themeCtaFontSizePx: clampNum(themeCtaFontStr, 10, 28, 15),
          themeConsentFontSizePx: clampNum(themeConsentFontStr, 8, 24, 12),
          themeLineHeightPx: clampNum(themeLineHeightStr, 14, 40, 22),
          themeDesignJsonAccent: themeDesignJsonAccent.trim() || "blue",
          themeDesignJsonDensity: themeDesignJsonDensity.trim() || "comfortable",
        });
        const latest = readChatWizardDraft(editKey || undefined);
        const patchInner = await patchRemoteWidgetConfiguration({
          widgetKey: rk,
          widgetKind: "chat",
          draft: latest,
          publishNow: false,
          chatWizardPatchScope: "launcher_only",
        });
        const sum = summarizePatchResult(patchInner);
        saveChatWizardDraft(editKey || undefined, {
          requiresPublishBeforeEmbed: sum.requiresPublishBeforeEmbed,
        });
        setChecklistRefreshKey((k) => k + 1);
        router.push(
          withChatEditQuery(
            "/dashboard/chat-widget/add/chat/box",
            resolveEditWidgetKeyForNavigation(editKey),
          ),
        );
      } catch (e) {
        publishAppToast({
          variant: "error",
          message:
            extractApiErrorMessageForToast(e) ?? "Could not save button design to the server.",
        });
      } finally {
        setSaving(false);
      }
    })();
  };

  return (
    <WidgetFlowShell
      pageTitle="Widget Customization"
      subtitle="Connect your workflow with industry-leading CRM platform minutes."
      cardTitle="Button Shape"
      currentStep={0}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={() => router.push("/dashboard/chat-widget")}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            disabled={saving || !draftReady}
            onClick={handleNext}
          >
            {saving ? "Saving…" : "Next"}
          </Button>
        </>
      }
    >
      {!draftReady ? (
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 1 }}>
          Loading widget…
        </Typography>
      ) : null}
      {hydrateError ? (
        <Typography variant="body2" sx={{ color: theme.palette.error.main, mb: 1 }}>
          {hydrateError}
        </Typography>
      ) : null}
      <WidgetWizardPageLayout
        checklistRefreshKey={checklistRefreshKey}
        preview={
          <WidgetLauncherLivePreview
            buttonShape={buttonShape}
            buttonPosition={buttonPosition as "left" | "center" | "right"}
            insetBottomPx={previewBottomPx}
            insetSidePx={previewSidePx}
            buttonColor={selectedButtonColor || "#2AA9E0"}
            hoverColor={selectedHoverColor || "#1C8DC2"}
            iconColor={selectedIconColor || "#FFFFFF"}
            iconDataUrl={iconDataUrl}
            launcherIconPreset={launcherIconPreset}
            accent={themeDesignJsonAccent}
            density={themeDesignJsonDensity}
          />
        }
      >
        <SchedulingSectionCard title="Launcher shape & position" subtitle="Floating button geometry and screen placement.">
      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: -1.25 }}>Button Shape</Typography>
      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mt: 0.75 }}>
        <IconButton
          type="button"
          aria-label="Circle button shape"
          onClick={() => setButtonShape("circle")}
          sx={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            bgcolor: buttonShape === "circle" ? theme.app.dashboard.accentBlue : theme.app.dashboard.overlayLight,
          }}
        >
          <Box
            aria-hidden
            sx={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              bgcolor: theme.app.text.primary,
            }}
          />
        </IconButton>
        <IconButton
          type="button"
          aria-label="Rounded button shape"
          onClick={() => setButtonShape("rounded")}
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            bgcolor: buttonShape === "rounded" ? theme.app.dashboard.accentBlue : theme.app.dashboard.overlayLight,
          }}
        >
          <Box aria-hidden sx={{ width: 24, height: 18, borderRadius: "6px", bgcolor: theme.app.text.primary }} />
        </IconButton>
        <IconButton
          type="button"
          aria-label="Square button shape"
          onClick={() => setButtonShape("square")}
          sx={{
            width: 44,
            height: 44,
            borderRadius: 1,
            bgcolor: buttonShape === "square" ? theme.app.dashboard.accentBlue : theme.app.dashboard.overlayLight,
          }}
        >
          <Box aria-hidden sx={{ width: 20, height: 20, borderRadius: "4px", bgcolor: theme.app.text.primary }} />
        </IconButton>
      </Box>

      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mt: -0.75, mb: 0.5 }}>
        {buttonShape === "circle" ? "Circle" : buttonShape === "rounded" ? "Rounded" : "Square"}
      </Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 1.5 }}>
        <WidgetColorPickerField
          label="Button color"
          value={selectedButtonColor}
          onChange={setSelectedButtonColor}
          fallback="#2563eb"
        />
        <WidgetColorPickerField
          label="Hover color"
          value={selectedHoverColor}
          onChange={setSelectedHoverColor}
          fallback="#1d4ed8"
        />
        <WidgetColorPickerField
          label="Icon color"
          value={selectedIconColor}
          onChange={setSelectedIconColor}
          fallback="#ffffff"
        />
      </Box>

      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: -1.25 }}>
        Default launcher icon
      </Typography>
      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 0.75 }}>
       Upload your own file below to override.
      </Typography>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center", mb: 1.25 }}>
        <IconButton
          type="button"
          onClick={() => {
            setLauncherIconPreset("");
            setIconDataUrl("");
            setIconFileName("");
          }}
          title="Simple chat icon"
          sx={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            border: `2px solid ${launcherIconPreset === "" && !iconDataUrl ? theme.app.dashboard.accentBlue : theme.app.dashboard.cardBorder}`,
            bgcolor: selectedButtonColor || "#2AA9E0",
            "&:hover": { bgcolor: selectedHoverColor || "#1C8DC2" },
          }}
        >
          <ChatRounded sx={{ color: selectedIconColor || "#FFFFFF", fontSize: 24 }} />
        </IconButton>
        {LAUNCHER_ICON_PRESETS.map((preset) => {
          const selected = !iconDataUrl && launcherIconPreset === preset.id;
          return (
            <IconButton
              key={preset.id}
              type="button"
              onClick={() => {
                setLauncherIconPreset(preset.id);
                setIconDataUrl("");
                setIconFileName("");
              }}
              title={preset.label}
              sx={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: `2px solid ${selected ? theme.app.dashboard.accentBlue : theme.app.dashboard.cardBorder}`,
                bgcolor: selectedButtonColor || "#2AA9E0",
                "&:hover": { bgcolor: selectedHoverColor || "#1C8DC2" },
              }}
            >
              <LauncherPresetIcon presetId={preset.id} color={selectedIconColor || "#FFFFFF"} fontSizePx={26} />
            </IconButton>
          );
        })}
      </Box>

      <Box
        role="button"
        tabIndex={0}
        onClick={() => iconUploadRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            iconUploadRef.current?.click();
          }
        }}
        sx={{
          border: `1px dashed ${theme.app.dashboard.accentBlue}`,
          borderRadius: 1.5,
          py: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "rgba(6, 12, 54, 0.4)",
          gap: 0.75,
          cursor: "pointer",
        }}
      >
        <CloudUploadOutlined sx={{ color: theme.app.dashboard.accentBlue }} />
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
          Upload SVG icon or icon
        </Typography>
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
          {iconFileName || "Max 10 MB files are allowed"}
        </Typography>
      </Box>
      <Box component="input" ref={iconUploadRef} type="file" accept=".svg,.png,.jpg,.jpeg,.webp" onChange={handleIconUpload} sx={{ display: "none" }} />

      <SelectField
        label="Button Position"
        value={buttonPosition}
        onChange={setButtonPosition}
        options={[
          { label: "Left", value: "left" },
          { label: "Right", value: "right" },
          { label: "Center", value: "center" },
        ]}
      />

      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: -1 }}>
        Launcher position (fine tune)
      </Typography>
      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 0.75 }}>
        Bottom inset zyada = corner se aur upar / screen ke niche se door. Side inset = Left/Right se kinare ki spacing; Center choose karne par yeh horizontal shift (left/right slide) hai.
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
        <InputField
          label="Inset from bottom (px)"
          name="launcher-inset-bottom"
          type="text"
          value={launcherInsetBottom}
          onChange={(event) => setLauncherInsetBottom(event.target.value)}
          inputProps={{ inputMode: "numeric", pattern: "[0-9]*", min: 0, max: 240 }}
        />
        <InputField
          label={buttonPosition === "center" ? "Horizontal shift (px)" : "Inset from side (px)"}
          name="launcher-inset-side"
          type="text"
          value={launcherInsetSide}
          onChange={(event) => setLauncherInsetSide(event.target.value)}
          inputProps={{ inputMode: "numeric", pattern: "[0-9]*", min: 0, max: 240 }}
        />
      </Box>

        </SchedulingSectionCard>

        <SchedulingSectionCard title="Brand theme" subtitle="Typography, spacing, and panel styling saved with the launcher.">
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
        <InputField label="Theme name" name="theme-name" value={themeName} onChange={(e) => setThemeName(e.target.value)} />
        <WidgetColorPickerField
          label="Primary color"
          value={themePrimaryColor}
          onChange={setThemePrimaryColor}
          fallback={selectedButtonColor || "#2563eb"}
          optional
        />
        <WidgetColorPickerField
          label="Secondary color"
          value={themeSecondaryColor}
          onChange={setThemeSecondaryColor}
          fallback="#64748b"
        />
        <InputField
          label="Font family"
          name="theme-font"
          value={themeFontFamily}
          onChange={(e) => setThemeFontFamily(e.target.value)}
          sx={{ gridColumn: { sm: "1 / -1" } }}
        />
        <SelectField
          label="Bubble style"
          value={themeBubbleStyle}
          onChange={setThemeBubbleStyle}
          options={[
            { label: "Rounded", value: "rounded" },
            { label: "Square", value: "square" },
            { label: "Pill", value: "pill" },
          ]}
        />
        <InputField
          label="Border radius (px)"
          name="theme-radius"
          value={themeBorderRadiusPxStr}
          onChange={(e) => setThemeBorderRadiusPxStr(e.target.value)}
          inputProps={{ inputMode: "numeric" }}
        />
        <InputField
          label="Welcome font size (px)"
          name="theme-welcome-font"
          value={themeWelcomeFontStr}
          onChange={(e) => setThemeWelcomeFontStr(e.target.value)}
          inputProps={{ inputMode: "numeric" }}
        />
        <InputField
          label="Body font size (px)"
          name="theme-body-font"
          value={themeBodyFontStr}
          onChange={(e) => setThemeBodyFontStr(e.target.value)}
          inputProps={{ inputMode: "numeric" }}
        />
        <InputField
          label="Input font size (px)"
          name="theme-input-font"
          value={themeInputFontStr}
          onChange={(e) => setThemeInputFontStr(e.target.value)}
          inputProps={{ inputMode: "numeric" }}
        />
        <InputField
          label="CTA font size (px)"
          name="theme-cta-font"
          value={themeCtaFontStr}
          onChange={(e) => setThemeCtaFontStr(e.target.value)}
          inputProps={{ inputMode: "numeric" }}
        />
        <InputField
          label="Consent font size (px)"
          name="theme-consent-font"
          value={themeConsentFontStr}
          onChange={(e) => setThemeConsentFontStr(e.target.value)}
          inputProps={{ inputMode: "numeric" }}
        />
        <InputField
          label="Line height (px)"
          name="theme-line-height"
          value={themeLineHeightStr}
          onChange={(e) => setThemeLineHeightStr(e.target.value)}
          inputProps={{ inputMode: "numeric" }}
        />
        <SelectField
          label="Design accent"
          value={themeDesignJsonAccent}
          onChange={setThemeDesignJsonAccent}
          options={DESIGN_ACCENT_SELECT_OPTIONS}
        />
        <SelectField
          label="Design density"
          value={themeDesignJsonDensity}
          onChange={setThemeDesignJsonDensity}
          options={DESIGN_DENSITY_SELECT_OPTIONS}
        />
      </Box>
        </SchedulingSectionCard>
      </WidgetWizardPageLayout>
    </WidgetFlowShell>
  );
}
