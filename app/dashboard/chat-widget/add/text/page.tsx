"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import Settings from "@mui/icons-material/Settings";
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, SelectField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { WidgetFlowShell } from "@/features/chat-widget";
import {
  patchRemoteWidgetConfiguration,
  summarizePatchResult,
} from "@/lib/chat-widget/widget-remote-sync";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { publishAppToast } from "@/lib/notify";
import {
  readChatWizardDraft,
  saveChatWizardDraft,
} from "@/lib/chat-widget/chat-wizard-edit";
import type { TextUsFormFieldDraft } from "@/lib/chat-widget/widgetDraft";

const DEFAULT_FIELDS: TextUsFormFieldDraft[] = [
  { key: "name", label: "Name", fieldType: "text", required: true },
  { key: "email", label: "Email", fieldType: "email", required: true },
  { key: "message", label: "Message", fieldType: "textarea", required: false },
  { key: "phone", label: "Phone Number", fieldType: "phone", required: false },
];

export default function TextUsWidgetPage() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const [position, setPosition] = useState("center");
  const [contentEnabled, setContentEnabled] = useState(true);
  const [buttonColor, setButtonColor] = useState("#da9b2f");
  const [headerTitle, setHeaderTitle] = useState("Special Offer");
  const [welcomeMessage, setWelcomeMessage] = useState(
    "Get 20% off all premium plans today.",
  );
  const [fieldNameLabel, setFieldNameLabel] = useState("Name");
  const [fieldEmailLabel, setFieldEmailLabel] = useState("Email");
  const [fieldMessageLabel, setFieldMessageLabel] = useState("Message");
  const [fieldPhoneLabel, setFieldPhoneLabel] = useState("Phone Number");

  const [customFieldFileName, setCustomFieldFileName] = useState("");
  const customFieldUploadRef = useRef<HTMLInputElement | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const d = readChatWizardDraft(null);
    if (d.type === "text") {
      if (d.textUsPosition) setPosition(d.textUsPosition);
      if (d.textUsButtonColor) setButtonColor(d.textUsButtonColor);
      if (d.textUsHeaderTitle) setHeaderTitle(d.textUsHeaderTitle);
      if (d.textUsWelcomeMessage) setWelcomeMessage(d.textUsWelcomeMessage);
      const flds = d.textUsFormFields;
      if (flds?.length) {
        flds.forEach((f) => {
          if (f.key === "name") setFieldNameLabel(f.label);
          if (f.key === "email") setFieldEmailLabel(f.label);
          if (f.key === "message") setFieldMessageLabel(f.label);
          if (f.key === "phone") setFieldPhoneLabel(f.label);
        });
      }
    }
  }, []);

  const handlePickColor = (event: ChangeEvent<HTMLInputElement>) => {
    const color = event.target.value;
    if (!color) return;
    setButtonColor(color);
  };

  const handleCustomFieldUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setCustomFieldFileName(file.name);
  };

  const persistAndContinue = () => {
    if (saving) return;
    void (async () => {
      const textUsFormFields: TextUsFormFieldDraft[] = [
        { key: "name", label: fieldNameLabel, fieldType: "text", required: true },
        { key: "email", label: fieldEmailLabel, fieldType: "email", required: true },
        { key: "message", label: fieldMessageLabel, fieldType: "textarea", required: false },
        { key: "phone", label: fieldPhoneLabel, fieldType: "phone", required: false },
      ];

      const prev = readChatWizardDraft(null);
      const rk = prev.remoteWidgetKey?.trim();
      if (!rk) {
        publishAppToast({
          variant: "error",
          message:
            "Missing server widget draft. Go back to the first step and save again.",
        });
        return;
      }

      setSaving(true);
      try {
        saveChatWizardDraft(null, {
          ...prev,
          type: "text",
          completed: false,
          textUsButtonColor: buttonColor,
          textUsPosition: position,
          textUsHeaderTitle: headerTitle,
          textUsWelcomeMessage: contentEnabled ? welcomeMessage : "",
          textUsFormFields,
        });
        const latest = readChatWizardDraft(null);
        const patchInner = await patchRemoteWidgetConfiguration({
          widgetKey: rk,
          widgetKind: "text",
          draft: latest,
          publishNow: false,
        });
        const sum = summarizePatchResult(patchInner);
        saveChatWizardDraft(null, {
          requiresPublishBeforeEmbed: sum.requiresPublishBeforeEmbed,
        });
        router.push("/dashboard/chat-widget/add/text/script");
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
      pageTitle="Text Us Widget"
      subtitle="Draft is PATCHed after the first step; publish happens on the script step."
      cardTitle="Widget Button Design"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={() => router.push("/dashboard/chat-widget")}>Cancel</Button>
          <Button type="button" variant="primary" sx={gradientPrimaryButtonSx} disabled={saving} onClick={persistAndContinue}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </>
      }
    >
      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: -1.25 }}>Button Color</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
        <Box
          component="input"
          type="color"
          value={buttonColor}
          onChange={handlePickColor}
          sx={{
            width: 44,
            height: 44,
            p: 0,
            border: `1px solid ${theme.app.dashboard.cardBorder}`,
            borderRadius: "4px",
            bgcolor: "transparent",
            cursor: "pointer",
          }}
        />
        <Typography variant="mediumLarge" sx={{ color: theme.app.dashboard.textMuted }}>
          Choose color
        </Typography>
      </Box>
      <InputField label="Hex" name="button-color-hex" value={buttonColor} onChange={(e) => setButtonColor(e.target.value)} />

      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: -1.25 }}>Button Icon</Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Box key={i} sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: theme.app.dashboard.overlayLight, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <Settings sx={{ fontSize: 14, color: theme.app.dashboard.textMuted }} />
          </Box>
        ))}
        <Box sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: theme.app.dashboard.overlayLight, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <Settings sx={{ fontSize: 14, color: theme.app.dashboard.textMuted }} />
        </Box>
      </Box>

      <SelectField label="Button Position" value={position} onChange={setPosition} options={[{ label: "Center", value: "center" }, { label: "Left", value: "left" }, { label: "Right", value: "right" }]} />

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary }}>Widget Content</Typography>
        <Switch checked={contentEnabled} onChange={(_, checked) => setContentEnabled(checked)} color="success" />
      </Box>

      <InputField label="Header Title" name="header" value={headerTitle} onChange={(e) => setHeaderTitle(e.target.value)} />
      <InputField label="Welcome Message" name="welcome" value={welcomeMessage} onChange={(e) => setWelcomeMessage(e.target.value)} inputProps={{ maxLength: 240 }} />

      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: -1.25 }}>Visitor Form (labels)</Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.5 }}>
        <InputField label="Name label" name="name" value={fieldNameLabel} onChange={(e) => setFieldNameLabel(e.target.value)} />
        <InputField label="Email label" name="email" value={fieldEmailLabel} onChange={(e) => setFieldEmailLabel(e.target.value)} />
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.5 }}>
        <InputField label="Message label" name="message" value={fieldMessageLabel} onChange={(e) => setFieldMessageLabel(e.target.value)} />
        <InputField label="Phone label" name="phone" value={fieldPhoneLabel} onChange={(e) => setFieldPhoneLabel(e.target.value)} />
      </Box>

      <Box
        role="button"
        tabIndex={0}
        onClick={() => customFieldUploadRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            customFieldUploadRef.current?.click();
          }
        }}
        sx={{ border: `1px dashed ${theme.app.dashboard.accentBlue}`, borderRadius: 1.5, py: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", bgcolor: "rgba(6, 12, 54, 0.4)", gap: 0.75, cursor: "pointer" }}
      >
        <CloudUploadOutlined sx={{ color: theme.app.dashboard.accentBlue }} />
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>Add Custom Field</Typography>
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>{customFieldFileName || "Max 10 MB files are allowed"}</Typography>
      </Box>
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
        Extended fields UI only; structured fields POST as textUsFormConfig.fields ({DEFAULT_FIELDS.length} defaults).
      </Typography>
      <Box component="input" ref={customFieldUploadRef} type="file" onChange={handleCustomFieldUpload} sx={{ display: "none" }} />
    </WidgetFlowShell>
  );
}
