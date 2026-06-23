"use client";

import Add from "@mui/icons-material/Add";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Switch from "@mui/material/Switch";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, SelectField, Typography } from "@/components/common";
import {
  createEmptyCustomTextUsField,
  isDefaultTextUsFieldKey,
  slugifyTextUsFieldKey,
  TEXT_US_FIELD_TYPES,
} from "@/lib/chat-widget/text-us-form-defaults";
import type { TextUsFormFieldDraft } from "@/lib/chat-widget/widgetDraft";
import { FIELD_MAX } from "@/lib/chat-widget/widget-field-validation";

const DEFAULT_FIELD_LABELS: Record<string, string> = {
  name: "Name",
  email: "Email",
  message: "Message",
  phone: "Phone",
};

export function TextUsFormFieldsEditor({
  fields,
  onChange,
}: {
  fields: TextUsFormFieldDraft[];
  onChange: (next: TextUsFormFieldDraft[]) => void;
}) {
  const theme = useTheme() as AppTheme;
  const customCount = fields.filter((f) => !isDefaultTextUsFieldKey(f.key)).length;

  const updateField = (key: string, patch: Partial<TextUsFormFieldDraft>) => {
    onChange(fields.map((f) => (f.key === key ? { ...f, ...patch } : f)));
  };

  const removeCustomField = (key: string) => {
    onChange(fields.filter((f) => f.key !== key || isDefaultTextUsFieldKey(f.key)));
  };

  const addCustomField = () => {
    onChange([...fields, createEmptyCustomTextUsField(customCount)]);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      {fields.map((field) => {
        const isDefault = isDefaultTextUsFieldKey(field.key);
        return (
          <Box
            key={field.key}
            sx={{
              p: 1.75,
              borderRadius: 1.5,
              border: `1px solid ${theme.app.dashboard.cardBorder}`,
              bgcolor: theme.app.dashboard.overlayLight ?? "rgba(255,255,255,0.03)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1.25 }}>
              <Typography
                variant="caption"
                sx={{
                  color: theme.app.dashboard.textMuted,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {isDefault ? DEFAULT_FIELD_LABELS[field.key] ?? field.key : "Custom field"}
              </Typography>
              {!isDefault ? (
                <IconButton
                  size="small"
                  aria-label="Remove custom field"
                  onClick={() => removeCustomField(field.key)}
                  sx={{ mt: -0.5, mr: -0.5 }}
                >
                  <DeleteOutline fontSize="small" />
                </IconButton>
              ) : null}
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {!isDefault ? (
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
                  <InputField
                    label="Field key (JSON)"
                    name={`${field.key}-key`}
                    value={field.key}
                    onChange={(e) => {
                      const nextKey = slugifyTextUsFieldKey(e.target.value);
                      if (!nextKey || isDefaultTextUsFieldKey(nextKey)) return;
                      if (fields.some((f) => f.key === nextKey && f.key !== field.key)) return;
                      onChange(fields.map((f) => (f.key === field.key ? { ...f, key: nextKey } : f)));
                    }}
                    helperText="Lowercase, underscores — saved in form.fields"
                  />
                  <SelectField
                    label="Type"
                    value={field.fieldType}
                    onChange={(v) => updateField(field.key, { fieldType: v })}
                    options={TEXT_US_FIELD_TYPES.map((t) => ({ label: t.label, value: t.value }))}
                  />
                </Box>
              ) : (
                <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                  Key: <code>{field.key}</code> · type: {field.fieldType}
                </Typography>
              )}

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
                <InputField
                  label="Label"
                  name={`${field.key}-label`}
                  value={field.label}
                  onChange={(e) => updateField(field.key, { label: e.target.value })}
                />
                <InputField
                  label="Placeholder"
                  name={`${field.key}-placeholder`}
                  value={field.placeholder ?? ""}
                  onChange={(e) => updateField(field.key, { placeholder: e.target.value })}
                  inputProps={{ maxLength: FIELD_MAX.placeholder }}
                />
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography variant="body2" sx={{ color: theme.app.text.primary, fontWeight: 600 }}>
                  Required
                </Typography>
                <Switch
                  checked={Boolean(field.required)}
                  onChange={(_, checked) => updateField(field.key, { required: checked })}
                  color="success"
                />
              </Box>
            </Box>
          </Box>
        );
      })}

      <Button
        type="button"
        variant="secondary"
        size="small"
        onClick={addCustomField}
        sx={{ alignSelf: "flex-start", display: "inline-flex", gap: 0.75 }}
      >
        <Add fontSize="small" />
        Add custom field
      </Button>
    </Box>
  );
}
