"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import { alpha, useTheme } from "@mui/material/styles";
import ArrowBack from "@mui/icons-material/ArrowBack";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import LanguageOutlined from "@mui/icons-material/LanguageOutlined";
import TuneOutlined from "@mui/icons-material/TuneOutlined";
import ViewListOutlined from "@mui/icons-material/ViewListOutlined";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  getEmailFormForWebsite,
  upsertEmailForm,
  type EmailFormFieldRow,
} from "@/api/email/email-forms.api";
import { EMAIL_ROUTES } from "../email.constants";
import { EmailFormFieldsPanel } from "../components/EmailFormFieldsPanel";
import { EmailFormPreviewPanel } from "../components/EmailFormPreviewPanel";
import { PickWebsiteModal } from "@/features/website-assignments/components/PickWebsiteModal";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { pageWrapper } from "@/app/dashboard/dashboard.styles";
import {
  EmailBuilderLayout,
  EmailBuilderPanel,
  EmailBuilderSectionTitle,
} from "../styles/email-design.styled";
import {
  emailFormBuilderPageSx,
  emailFormStickyFooterSx,
  emailFormTypeChoiceCardSx,
  emailFormWebsiteScopeSx,
} from "../styles/email-form-builder.styles";
import { emptyStatePanelSx } from "@/features/website-assignments/styles/website-assignment-ui.styles";

function FormTypeChoiceCard({
  selected,
  title,
  description,
  icon,
  onSelect,
}: {
  selected: boolean;
  title: string;
  description: string;
  icon: ReactNode;
  onSelect: () => void;
}) {
  const theme = useTheme() as AppTheme;

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      sx={emailFormTypeChoiceCardSx(selected)}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: selected ? alpha(theme.palette.primary.main, 0.22) : alpha(theme.palette.common.white, 0.08),
            color: selected ? theme.palette.primary.light : theme.app.dashboard.textMuted,
          }}
        >
          {icon}
        </Box>
        {selected ? <CheckCircleOutline sx={{ color: theme.palette.primary.light, fontSize: 22 }} /> : null}
      </Box>
      <Typography variant="small" fontWeight={700} color="white">
        {title}
      </Typography>
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.45 }}>
        {description}
      </Typography>
    </Box>
  );
}

export function EmailFormSetPage() {
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialWebsiteId = searchParams.get("websiteId")?.trim() ?? "";

  const [pickOpen, setPickOpen] = useState(!initialWebsiteId);
  const [websiteId, setWebsiteId] = useState(initialWebsiteId);
  const [formType, setFormType] = useState<"standard" | "custom">("standard");
  const [formName, setFormName] = useState("");
  const [fields, setFields] = useState<EmailFormFieldRow[]>([]);

  const formQuery = useQuery({
    queryKey: ["email-form", websiteId],
    queryFn: () => getEmailFormForWebsite(websiteId),
    enabled: Boolean(websiteId),
  });

  useEffect(() => {
    if (!formQuery.data) return;
    setFormType(formQuery.data.formType);
    setFormName(formQuery.data.formName ?? "");
    setFields(formQuery.data.fields);
  }, [formQuery.data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      upsertEmailForm({
        websiteId,
        formType,
        formName: formName.trim() || undefined,
        fields: fields
          .filter((f) => formType === "standard" || f.isRequired || f.enabled)
          .map((f) => ({
            fieldKey: f.fieldKey,
            label: f.label,
            fieldType: f.fieldType,
            sortOrder: f.sortOrder,
          })),
      }),
  });

  const toggleField = (key: string, enabled: boolean) => {
    setFields((prev) => prev.map((f) => (f.fieldKey === key ? { ...f, enabled } : f)));
  };

  const setAllOptionalFields = (enabled: boolean) => {
    setFields((prev) => prev.map((f) => (f.isRequired ? f : { ...f, enabled })));
  };

  const visibleFields = useMemo(
    () => fields.filter((f) => formType === "standard" || f.isRequired || f.enabled),
    [fields, formType],
  );

  const handleSave = () => {
    void saveMutation
      .mutateAsync()
      .then(() => {
        publishAppToast({ variant: "success", message: "Form saved." });
        router.push(EMAIL_ROUTES.forms);
      })
      .catch((err) => {
        publishAppToast({
          variant: "error",
          message: extractApiErrorMessageForToast(err, "Save failed."),
        });
      });
  };

  return (
    <Box sx={[pageWrapper, emailFormBuilderPageSx]}>
      <Box sx={{ mb: 2.5 }}>
        <Button
          component={Link}
          href={EMAIL_ROUTES.forms}
          variant="secondary"
          startIcon={<ArrowBack />}
          sx={{ mb: 1.5, px: 1.5 }}
        >
          Back to email forms
        </Button>
        <Typography variant="regularLarge" fontWeight={700} color="white" sx={{ mb: 0.5 }}>
          Configure wrap-up form
        </Typography>
        <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 640, lineHeight: 1.55 }}>
          Choose a website, pick standard or custom fields, and preview how they appear in distribution
          emails — same builder pattern as email design.
        </Typography>
      </Box>

      {!websiteId ? (
        <Box sx={emptyStatePanelSx}>
          <LanguageOutlined sx={{ fontSize: 48, color: theme.palette.primary.light, mb: 1.5 }} />
          <Typography variant="mediumLarge" fontWeight={700} color="white" sx={{ mb: 0.75 }}>
            Select a website to begin
          </Typography>
          <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 440, mx: "auto", mb: 2.5 }}>
            Wrap-up forms are scoped per website. Pick reseller, parent, child, and site from your org tree.
          </Typography>
          <Button type="button" variant="primary" sx={gradientPrimaryButtonSx} onClick={() => setPickOpen(true)}>
            Select website
          </Button>
        </Box>
      ) : formQuery.isLoading ? (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2 }}>
          <Skeleton variant="rounded" height={420} sx={{ borderRadius: 2.5 }} />
          <Skeleton variant="rounded" height={420} sx={{ borderRadius: 2.5 }} />
        </Box>
      ) : (
        <EmailBuilderLayout>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <EmailBuilderPanel>
              <EmailBuilderSectionTitle>
                <Typography variant="small" fontWeight={700} color="white">
                  Scope & template
                </Typography>
              </EmailBuilderSectionTitle>

              <Box sx={emailFormWebsiteScopeSx}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                    color: theme.palette.primary.light,
                    flexShrink: 0,
                  }}
                >
                  <LanguageOutlined />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="small" fontWeight={700} color="white">
                    Website scope
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block" }}>
                    ID {websiteId}
                  </Typography>
                </Box>
                <Button type="button" variant="secondary" onClick={() => setPickOpen(true)}>
                  Change
                </Button>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 1.5,
                }}
              >
                <FormTypeChoiceCard
                  selected={formType === "standard"}
                  title="Standard"
                  description="Full catalog — every field included in wrap-up emails for this site."
                  icon={<ViewListOutlined />}
                  onSelect={() => setFormType("standard")}
                />
                <FormTypeChoiceCard
                  selected={formType === "custom"}
                  title="Custom"
                  description="Pick optional fields; required fields always stay on."
                  icon={<TuneOutlined />}
                  onSelect={() => setFormType("custom")}
                />
              </Box>

              <InputField
                label="Form name"
                name="formName"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder={formType === "standard" ? "Standard wrap-up" : "Custom wrap-up"}
              />
            </EmailBuilderPanel>

            <EmailBuilderPanel>
              <EmailFormFieldsPanel
                fields={fields}
                formType={formType}
                onToggle={toggleField}
                onSetAllOptional={setAllOptionalFields}
              />
              <Box sx={emailFormStickyFooterSx}>
                <Button type="button" variant="secondary" onClick={() => router.push(EMAIL_ROUTES.forms)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  sx={gradientPrimaryButtonSx}
                  disabled={saveMutation.isPending || visibleFields.length === 0}
                  onClick={handleSave}
                >
                  {saveMutation.isPending ? "Saving…" : "Save configuration"}
                </Button>
              </Box>
            </EmailBuilderPanel>
          </Box>

          <EmailFormPreviewPanel formName={formName} formType={formType} fields={fields} />
        </EmailBuilderLayout>
      )}

      <PickWebsiteModal
        open={pickOpen}
        title="Select website for form"
        description="Pick organization scope for this email form."
        primaryLabel="Continue"
        onClose={() => setPickOpen(false)}
        onContinue={(picked) => {
          setWebsiteId(picked.websiteId);
          setPickOpen(false);
        }}
      />
    </Box>
  );
}
