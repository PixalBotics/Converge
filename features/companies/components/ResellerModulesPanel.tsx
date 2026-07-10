"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import ExpandMore from "@mui/icons-material/ExpandMore";
import StorefrontOutlined from "@mui/icons-material/StorefrontOutlined";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  Checkbox,
  DashboardCard,
  Divider,
  SelectField,
  Typography,
} from "@/components/common";
import {
  getResellerModules,
  getResellerModulesCatalog,
  putResellerModules,
  type ResellerModulesCatalog,
  type SellableModuleCatalogItem,
} from "@/api/companies/reseller-modules.api";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import {
  OFFERING_TYPE_OPTIONS,
  deriveOfferingTypeFromModuleCodes,
  toEditableOfferingType,
  type EditableOfferingType,
} from "@/features/services/components/services-shared";
import {
  LIVE_CHAT_MODULE_CODE,
  WIDGET_SURFACE_PRODUCT_OPTIONS,
  applyWidgetSurfaceProduct,
  isLiveChatProductFamilyCode,
  widgetSurfaceFromModuleSelection,
  type WidgetSurfaceProduct,
} from "@/lib/products/live-chat-product-family";

function formatPageLabel(permission: string): string {
  return permission
    .replace(/^page:/, "")
    .split("-")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
}

type ModuleRowProps = {
  mod: SellableModuleCatalogItem;
  checked: boolean;
  readOnly: boolean;
  saving: boolean;
  onToggle: (code: string, checked: boolean) => void;
  theme: AppTheme;
};

function ModuleRow({ mod, checked, readOnly, saving, onToggle, theme }: ModuleRowProps) {
  const [open, setOpen] = useState(false);
  const pages = mod.pagePermissionNames ?? [];

  return (
    <Box
      sx={{
        borderRadius: 1,
        border: `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.65)}`,
        overflow: "hidden",
      }}
    >
      <Box
        role="button"
        tabIndex={readOnly || saving ? -1 : 0}
        onClick={() => onToggle(mod.code, !checked)}
        onKeyDown={(e) => {
          if (readOnly || saving) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle(mod.code, !checked);
          }
        }}
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1,
          py: 0.75,
          px: 1,
          cursor: readOnly || saving ? "default" : "pointer",
          "&:hover": readOnly || saving ? undefined : { bgcolor: alpha(theme.app.dashboard.accentBlue, 0.06) },
        }}
      >
        <Checkbox
          checked={checked}
          onChange={(_, next) => onToggle(mod.code, next)}
          disabled={saving || readOnly}
          onClick={(e) => e.stopPropagation()}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography fontWeight={600} sx={{ color: theme.app.text.primary }}>
            {mod.name}
            {mod.softwareOnly ? (
              <Typography component="span" variant="caption" sx={{ ml: 1, opacity: 0.7 }}>
                (software only)
              </Typography>
            ) : null}
          </Typography>
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block" }}>
            {mod.description}
          </Typography>
        </Box>
        {pages.length > 0 ? (
          <IconButton
            size="small"
            aria-label={open ? "Hide pages" : "Show pages"}
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
            sx={{
              transform: open ? "rotate(180deg)" : "none",
              transition: "transform 0.2s",
            }}
          >
            <ExpandMore fontSize="small" />
          </IconButton>
        ) : null}
      </Box>
      {pages.length > 0 ? (
        <Collapse in={open}>
          <Box
            sx={{
              px: 2,
              pb: 1.25,
              pt: 0.25,
              borderTop: `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.45)}`,
            }}
          >
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 0.5 }}>
              Pages in this product
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.25 }}>
              {pages.map((p) => (
                <Typography component="li" key={p} variant="caption" sx={{ color: theme.app.text.primary }}>
                  {formatPageLabel(p)}
                </Typography>
              ))}
            </Box>
          </Box>
        </Collapse>
      ) : null}
    </Box>
  );
}

type Props = {
  resellerId: string;
  resellerName?: string;
  embedded?: boolean;
  readOnly?: boolean;
  promptOfferingType?: boolean;
  onSaved?: () => void;
  hideSaveButton?: boolean;
  saveButtonLabel?: string;
};

export type ResellerModulesPanelHandle = {
  save: () => Promise<boolean>;
};

export const ResellerModulesPanel = forwardRef<ResellerModulesPanelHandle, Props>(
  function ResellerModulesPanel(
    {
      resellerId,
      resellerName,
      embedded = false,
      readOnly = false,
      promptOfferingType = false,
      onSaved,
      hideSaveButton = false,
      saveButtonLabel = "Save modules",
    },
    ref,
  ) {
  const theme = useTheme() as AppTheme;
  const id = resellerId.trim();

  const [catalog, setCatalog] = useState<ResellerModulesCatalog | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serverCodes, setServerCodes] = useState<string[]>([]);
  const [offeringType, setOfferingType] = useState<EditableOfferingType>("both");

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [catRes, modRes] = await Promise.all([
          getResellerModulesCatalog(),
          getResellerModules(id),
        ]);
        if (cancelled) return;
        setCatalog(catRes.data);
        const codes = modRes.data.moduleCodes ?? [];
        setServerCodes(codes);
        const next: Record<string, boolean> = {};
        for (const m of catRes.data.modules ?? []) next[m.code] = false;
        for (const c of codes) next[c] = true;
        setSelected(next);
        setOfferingType(
          toEditableOfferingType(
            deriveOfferingTypeFromModuleCodes(codes, catRes.data.modules ?? []),
          ),
        );
      } catch (e) {
        if (!cancelled) {
          publishAppToast({
            message: extractApiErrorMessageForToast(e, "Could not load reseller modules"),
            variant: "error",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const selectedCodes = useMemo(
    () => Object.keys(selected).filter((k) => selected[k]),
    [selected],
  );

  const softwareModules = useMemo(
    () =>
      (catalog?.modules ?? []).filter(
        (m) => m.category === "software" && !isLiveChatProductFamilyCode(m.code),
      ),
    [catalog],
  );
  const liveChatModule = useMemo(
    () => (catalog?.modules ?? []).find((m) => m.code === LIVE_CHAT_MODULE_CODE),
    [catalog],
  );
  const widgetSurface = useMemo(
    () => widgetSurfaceFromModuleSelection(selected),
    [selected],
  );
  const widgetSurfaceHelp =
    WIDGET_SURFACE_PRODUCT_OPTIONS.find((o) => o.value === widgetSurface)?.description ?? "";
  const serviceModules = useMemo(
    () => (catalog?.modules ?? []).filter((m) => m.category === "service"),
    [catalog],
  );

  const dirty =
    JSON.stringify([...selectedCodes].sort()) !== JSON.stringify([...serverCodes].sort());

  const toggleModule = (code: string, checked: boolean) => {
    if (readOnly || saving) return;
    setSelected((prev) => ({ ...prev, [code]: checked }));
  };

  const setWidgetSurface = (surface: WidgetSurfaceProduct) => {
    if (readOnly || saving) return;
    setSelected((prev) => applyWidgetSurfaceProduct(prev, surface));
  };

  const applyOfferingType = (nextType: EditableOfferingType) => {
    setOfferingType(nextType);
    if (!catalog || readOnly) return;

    setSelected((prev) => {
      const next = { ...prev };
      for (const mod of catalog.modules) {
        if (nextType === "software" && mod.category === "service") {
          next[mod.code] = false;
        }
        if (nextType === "service" && mod.softwareOnly) {
          next[mod.code] = false;
        }
      }
      return next;
    });
  };

  const showServiceModules = !promptOfferingType || offeringType !== "software";
  const offeringTypeHelp =
    OFFERING_TYPE_OPTIONS.find((o) => o.value === offeringType)?.description ?? "";

  const save = useCallback(async (): Promise<boolean> => {
    if (!dirty) return true;
    setSaving(true);
    try {
      const res = await putResellerModules(id, { moduleCodes: selectedCodes });
      const codes = res.data.moduleCodes ?? [];
      setServerCodes(codes);
      setOfferingType(
        toEditableOfferingType(
          deriveOfferingTypeFromModuleCodes(codes, catalog?.modules ?? []),
        ),
      );
      publishAppToast({
        message: "Modules saved — parent companies synced",
        variant: "success",
      });
      onSaved?.();
      return true;
    } catch (e) {
      publishAppToast({
        message: extractApiErrorMessageForToast(e, "Could not save modules"),
        variant: "error",
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [catalog?.modules, dirty, id, onSaved, selectedCodes]);

  useImperativeHandle(ref, () => ({ save }), [save]);

  const renderModuleList = (mods: SellableModuleCatalogItem[]) => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {mods.map((mod) => (
        <ModuleRow
          key={mod.code}
          mod={mod}
          checked={Boolean(selected[mod.code])}
          readOnly={readOnly}
          saving={saving}
          onToggle={toggleModule}
          theme={theme}
        />
      ))}
    </Box>
  );

  const body = (
    <>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, mb: 2 }}>
        <StorefrontOutlined sx={{ color: theme.app.dashboard.accentBlue, mt: 0.25 }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography fontWeight={700} sx={{ color: theme.app.text.primary }}>
            Reseller product modules
          </Typography>
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mt: 0.5 }}>
            {resellerName
              ? `“${resellerName}” — enabled modules flow to every parent company under this reseller.`
              : "Enabled modules flow to every parent company under this reseller."}
          </Typography>
        </Box>
      </Box>

      {loading ? (
        <Typography sx={{ color: theme.app.dashboard.textMuted }}>Loading modules…</Typography>
      ) : !catalog ? (
        <Typography sx={{ color: theme.palette.error.light }}>Could not load module catalog.</Typography>
      ) : (
        <>
          {catalog.basePagePermissions?.length ? (
            <Box
              sx={{
                mb: 2,
                p: 1.5,
                borderRadius: 1,
                bgcolor: alpha(theme.app.dashboard.accentBlue, 0.05),
                border: `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.55)}`,
              }}
            >
              <Typography fontWeight={600} sx={{ color: theme.app.text.primary, mb: 0.5 }}>
                Platform base (every reseller)
              </Typography>
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 0.75 }}>
                Dashboard, settings, users, roles, departments, designations, pools — not toggled per product.
              </Typography>
              <Typography variant="caption" sx={{ color: theme.app.text.primary }}>
                {catalog.basePagePermissions.map(formatPageLabel).join(" · ")}
              </Typography>
            </Box>
          ) : null}

          {promptOfferingType ? (
            <Box sx={{ mb: 2 }}>
              <SelectField
                label="Offering type"
                value={offeringType}
                onChange={(value) => applyOfferingType(value as EditableOfferingType)}
                options={OFFERING_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                disabled={saving || readOnly}
                searchable={false}
              />
              {offeringTypeHelp ? (
                <Typography
                  variant="caption"
                  sx={{ color: theme.app.dashboard.textMuted, display: "block", mt: 0.75 }}
                >
                  {offeringTypeHelp}
                </Typography>
              ) : null}
            </Box>
          ) : null}

          {promptOfferingType && !readOnly ? <Divider sx={{ my: 2 }} /> : null}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {liveChatModule ? (
              <Box>
                <Typography fontWeight={700} sx={{ color: theme.app.text.primary, mb: 0.5 }}>
                  Live Chat & Widget
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1 }}
                >
                  Live chat operations and the visitor widget are one product family. Choose which widget
                  surfaces this reseller may configure — clients pick the same options when they add a
                  widget (Chat, Text Us, or both).
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <ModuleRow
                    mod={liveChatModule}
                    checked={Boolean(selected[liveChatModule.code])}
                    readOnly={readOnly}
                    saving={saving}
                    onToggle={toggleModule}
                    theme={theme}
                  />
                  <Box
                    sx={{
                      borderRadius: 1,
                      border: `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.65)}`,
                      p: 1.25,
                    }}
                  >
                    <SelectField
                      label="Widget surface (product)"
                      value={widgetSurface}
                      onChange={(value) => setWidgetSurface(value as WidgetSurfaceProduct)}
                      options={WIDGET_SURFACE_PRODUCT_OPTIONS.map((o) => ({
                        value: o.value,
                        label: o.label,
                      }))}
                      disabled={saving || readOnly}
                      searchable={false}
                    />
                    {widgetSurfaceHelp ? (
                      <Typography
                        variant="caption"
                        sx={{ color: theme.app.dashboard.textMuted, display: "block", mt: 0.75 }}
                      >
                        {widgetSurfaceHelp}
                      </Typography>
                    ) : null}
                  </Box>
                </Box>
              </Box>
            ) : null}

            <Box>
              <Typography fontWeight={700} sx={{ color: theme.app.text.primary, mb: 1 }}>
                Other software modules
              </Typography>
              {renderModuleList(softwareModules)}
            </Box>

            {showServiceModules ? (
              <Box>
                <Typography fontWeight={700} sx={{ color: theme.app.text.primary, mb: 1 }}>
                  Service modules
                </Typography>
                {renderModuleList(serviceModules)}
              </Box>
            ) : null}
          </Box>

          {!readOnly && !hideSaveButton ? (
            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              <Button variant="primary" disabled={!dirty || saving} onClick={() => void save()}>
                {saveButtonLabel}
              </Button>
            </Box>
          ) : null}
        </>
      )}
    </>
  );

  if (embedded) {
    return <Box>{body}</Box>;
  }

  return (
    <DashboardCard
      sx={{
        mt: 2.5,
        p: { xs: 2, md: 2.5 },
        borderColor: alpha(theme.app.dashboard.cardBorder, 0.9),
      }}
    >
      {body}
    </DashboardCard>
  );
},
);
