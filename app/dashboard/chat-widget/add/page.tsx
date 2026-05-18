"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ChatBubbleOutline from "@mui/icons-material/ChatBubbleOutline";
import MessageOutlined from "@mui/icons-material/MessageOutlined";
import RadioButtonChecked from "@mui/icons-material/RadioButtonChecked";
import RadioButtonUnchecked from "@mui/icons-material/RadioButtonUnchecked";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  extractChildCompanyOptionsForParentFromByResellerTree,
  extractParentCompaniesFromByResellerTree,
  pickItemsArray,
  toIdNameOption,
} from "@/app/dashboard/user-page/components/add-user-modal.utils";
import { Button, Typography, SelectField } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { WidgetFlowShell } from "@/components/dashboard/WidgetFlowShell";
import {
  useCompaniesByResellerQuery,
  useCompaniesSetupResellersQuery,
  useWebsiteAssignmentsWebsitesQuery,
} from "@/lib/hooks";
import {
  createRemoteWidgetDraft,
  isServerWidgetDraftAlive,
} from "@/lib/chat-widget/widget-remote-sync";
import {
  defaultWidgetDraft,
  readWidgetDraft,
  saveWidgetDraft,
  type WidgetDraft,
} from "@/lib/chat-widget/widgetDraft";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { publishAppToast } from "@/lib/notify";

type WidgetType = "chat" | "text";

export default function WidgetTypeSelectionPage() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const [selectedType, setSelectedType] = useState<WidgetType>("chat");
  /** Same as `selectedType`, updated synchronously on card click so Next never reads stale state. */
  const selectedTypeRef = useRef<WidgetType>("chat");

  const [resellerId, setResellerId] = useState("");
  const [parentCompanyId, setParentCompanyId] = useState("");
  const [childCompanyId, setChildCompanyId] = useState("");
  const [websiteId, setWebsiteId] = useState("");

  const [hydratedFromDraft, setHydratedFromDraft] = useState(false);
  const [creatingDraft, setCreatingDraft] = useState(false);

  useEffect(() => {
    const d = readWidgetDraft();
    if (d.tenantResellerId) setResellerId(d.tenantResellerId);
    if (d.tenantParentCompanyId) setParentCompanyId(d.tenantParentCompanyId);
    if (d.tenantChildCompanyId) setChildCompanyId(d.tenantChildCompanyId);
    if (d.websiteId) setWebsiteId(d.websiteId);
    if (d.type === "chat" || d.type === "text") {
      setSelectedType(d.type);
      selectedTypeRef.current = d.type;
    }
    setHydratedFromDraft(true);
  }, []);

  useEffect(() => {
    selectedTypeRef.current = selectedType;
  }, [selectedType]);

  const resellersQuery = useCompaniesSetupResellersQuery({
    enabled: hydratedFromDraft,
  });

  const companiesByResellerQuery = useCompaniesByResellerQuery(
    resellerId,
    { view: "tree", sortBy: "name", sortOrder: "asc", all: true },
    { enabled: hydratedFromDraft && resellerId.trim().length > 0 },
  );

  const websitesParams = useMemo(
    () => ({
      all: true as const,
      resellerId: resellerId.trim() || undefined,
      parentCompanyId: parentCompanyId.trim() || undefined,
      childCompanyId: childCompanyId.trim() || undefined,
    }),
    [resellerId, parentCompanyId, childCompanyId],
  );

  const websitesQuery = useWebsiteAssignmentsWebsitesQuery(websitesParams, {
    enabled:
      hydratedFromDraft &&
      resellerId.trim().length > 0 &&
      parentCompanyId.trim().length > 0 &&
      childCompanyId.trim().length > 0,
  });

  const resellerOptions = useMemo(() => {
    return pickItemsArray(resellersQuery.data)
      .map((row) => toIdNameOption(row))
      .filter((o): o is { value: string; label: string } => o !== null);
  }, [resellersQuery.data]);

  const resellerSelectOptions = useMemo(() => {
    if (resellerOptions.length === 0) {
      return [
        {
          value: "",
          label: resellersQuery.isLoading ? "Loading resellers…" : "No resellers available",
        },
      ];
    }
    return [{ value: "", label: "Select reseller" }, ...resellerOptions];
  }, [resellerOptions, resellersQuery.isLoading]);

  const parentCompanyOptions = useMemo(() => {
    if (!resellerId.trim()) return [{ value: "", label: "Select reseller first" }];
    const extracted = extractParentCompaniesFromByResellerTree(
      companiesByResellerQuery.data,
    ).map((o) => ({ value: o.value, label: o.label }));
    if (extracted.length > 0) {
      return [{ value: "", label: "Select parent company" }, ...extracted];
    }
    return [
      {
        value: "",
        label: companiesByResellerQuery.isLoading
          ? "Loading parent companies…"
          : "No parent companies available",
      },
    ];
  }, [resellerId, companiesByResellerQuery.data, companiesByResellerQuery.isLoading]);

  const childCompanyRows = useMemo(() => {
    if (!resellerId.trim() || !parentCompanyId.trim()) return [];
    return extractChildCompanyOptionsForParentFromByResellerTree(
      companiesByResellerQuery.data,
      parentCompanyId,
    );
  }, [resellerId, parentCompanyId, companiesByResellerQuery.data]);

  const childCompanyOptions = useMemo(() => {
    if (!resellerId.trim()) return [{ value: "", label: "Select reseller first" }];
    if (!parentCompanyId.trim()) return [{ value: "", label: "Select parent company first" }];
    if (childCompanyRows.length > 0) {
      return [{ value: "", label: "Select child company" }, ...childCompanyRows];
    }
    return [
      {
        value: "",
        label: companiesByResellerQuery.isLoading
          ? "Loading child companies…"
          : "No child companies for this parent",
      },
    ];
  }, [
    resellerId,
    parentCompanyId,
    childCompanyRows,
    companiesByResellerQuery.isLoading,
  ]);

  const websiteRows = useMemo(() => {
    return websitesQuery.data?.data?.items ?? [];
  }, [websitesQuery.data?.data?.items]);

  const websiteOptions = useMemo(() => {
    if (websiteRows.length === 0) {
      return [
        {
          value: "",
          label: websitesQuery.isFetching ? "Loading websites…" : "No websites for this child company",
        },
      ];
    }
    return [
      { value: "", label: "Select website" },
      ...websiteRows.map((w) => {
        const name = (w.name ?? "").trim() || "Website";
        const url = (w.url ?? "").trim();
        const label = url ? `${name} — ${url}`.slice(0, 120) : name;
        return { value: w.websiteId, label };
      }),
    ];
  }, [websiteRows, websitesQuery.isFetching]);

  /** If draft website is not in the filtered list, drop it (stale selection). */
  useEffect(() => {
    if (!websiteId || websiteRows.length === 0) return;
    const ok = websiteRows.some((w) => w.websiteId === websiteId);
    if (!ok) setWebsiteId("");
  }, [websiteRows, websiteId]);

  /** Invalidate child selection if it is not under the current parent (e.g. tree refresh). */
  useEffect(() => {
    if (!childCompanyId || childCompanyRows.length === 0) return;
    const ok = childCompanyRows.some((c) => c.value === childCompanyId);
    if (!ok) setChildCompanyId("");
  }, [childCompanyRows, childCompanyId]);

  const sitesError =
    websitesQuery.isError
      ? extractApiErrorMessageForToast(websitesQuery.error) ??
        "Unable to load websites."
      : null;

  const hierarchyReady =
    Boolean(resellerId.trim()) &&
    Boolean(parentCompanyId.trim()) &&
    Boolean(childCompanyId.trim());

  const hasWebsiteChoices = websiteRows.length > 0;
  const websitesLoading =
    hierarchyReady && websitesQuery.isFetching && !websitesQuery.data;

  const canContinue =
    hydratedFromDraft &&
    hierarchyReady &&
    Boolean(websiteId) &&
    hasWebsiteChoices &&
    !websitesLoading &&
    !sitesError &&
    !creatingDraft;

  const subtitle = useMemo(() => {
    if (!hydratedFromDraft) return "Loading…";
    if (websitesLoading) return "Loading websites for the selected child company…";
    return "Select reseller → parent company → child company, then choose a website.";
  }, [hydratedFromDraft, websitesLoading]);

  return (
    <WidgetFlowShell
      pageTitle="Widget Type Selection"
      subtitle={subtitle}
      cardTitle="Widget Type Selection"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={() => router.push("/dashboard/chat-widget")}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            disabled={!canContinue}
            onClick={() => {
              if (!websiteId || !hierarchyReady || creatingDraft) return;
              void (async () => {
                const prev = readWidgetDraft();
                const wid = websiteId.trim();
                const kind = selectedTypeRef.current;
                let needNewRemote =
                  !prev.remoteWidgetKey?.trim() ||
                  prev.websiteId?.trim() !== wid ||
                  prev.type !== kind;

                if (!needNewRemote && prev.remoteWidgetKey?.trim()) {
                  try {
                    const alive = await isServerWidgetDraftAlive(prev.remoteWidgetKey);
                    if (!alive) needNewRemote = true;
                  } catch (verifyErr) {
                    publishAppToast({
                      variant: "error",
                      message:
                        extractApiErrorMessageForToast(verifyErr) ??
                        "Could not verify existing widget draft.",
                    });
                    return;
                  }
                }

                const base: WidgetDraft = {
                  ...defaultWidgetDraft,
                  ...prev,
                  type: kind,
                  websiteId: wid,
                  tenantResellerId: resellerId.trim(),
                  tenantParentCompanyId: parentCompanyId.trim(),
                  tenantChildCompanyId: childCompanyId.trim(),
                  completed: false,
                };

                setCreatingDraft(true);
                try {
                  if (needNewRemote) {
                    const created = await createRemoteWidgetDraft({
                      draft: base,
                      widgetKind: kind,
                    });
                    saveWidgetDraft({
                      ...base,
                      remoteWidgetKey: created.widgetKey,
                      widgetId: created.widgetKey,
                      requiresPublishBeforeEmbed: created.requiresPublishBeforeEmbed,
                    });
                    publishAppToast({
                      variant: "success",
                      message: "Draft saved on server. Continue configuration.",
                    });
                  } else {
                    saveWidgetDraft({
                      ...base,
                    });
                  }

                  router.push(
                    kind === "chat"
                      ? "/dashboard/chat-widget/add/chat/button"
                      : "/dashboard/chat-widget/add/text",
                  );
                } catch (e) {
                  publishAppToast({
                    variant: "error",
                    message:
                      extractApiErrorMessageForToast(e) ??
                      "Could not create widget draft on the server.",
                  });
                } finally {
                  setCreatingDraft(false);
                }
              })();
            }}
          >
            {creatingDraft ? "Saving draft…" : "Next"}
          </Button>
        </>
      }
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
        <SelectField
          label="Reseller"
          placeholder="Select reseller"
          value={resellerId}
          onChange={(v) => {
            setResellerId(v);
            setParentCompanyId("");
            setChildCompanyId("");
            setWebsiteId("");
          }}
          options={resellerSelectOptions}
          disabled={!hydratedFromDraft || resellersQuery.isLoading}
          searchPlaceholder="Search reseller…"
          menuMaxRows={10}
        />
        <SelectField
          label="Parent company"
          placeholder="Select parent company"
          value={parentCompanyId}
          onChange={(v) => {
            setParentCompanyId(v);
            setChildCompanyId("");
            setWebsiteId("");
          }}
          options={parentCompanyOptions}
          disabled={!resellerId.trim() || companiesByResellerQuery.isLoading}
          searchPlaceholder="Search parent company…"
          menuMaxRows={10}
        />
        <SelectField
          label="Child company"
          placeholder="Select child company"
          value={childCompanyId}
          onChange={(v) => {
            setChildCompanyId(v);
            setWebsiteId("");
          }}
          options={childCompanyOptions}
          disabled={!parentCompanyId.trim() || companiesByResellerQuery.isLoading}
          searchPlaceholder="Search child company…"
          menuMaxRows={10}
        />
        <SelectField
          label="Website"
          placeholder={websitesLoading ? "Loading…" : "Select website"}
          value={websiteId}
          onChange={setWebsiteId}
          options={websiteOptions}
          disabled={!hierarchyReady || websitesLoading || !hasWebsiteChoices}
          searchPlaceholder="Search website…"
          menuMaxRows={10}
        />
        {sitesError ? (
          <Typography variant="body2" sx={{ color: theme.palette.error.main }}>
            {sitesError}
          </Typography>
        ) : null}
        {!sitesError && hierarchyReady && !websitesLoading && !hasWebsiteChoices ? (
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
            No websites returned for this child company. Confirm website assignments in Website
            Assignments.
          </Typography>
        ) : null}
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.25 }}>
        {[
          { id: "chat" as const, title: "Chat Widget", icon: <ChatBubbleOutline sx={{ fontSize: 18 }} />, iconColor: "#7DD3FC" },
          { id: "text" as const, title: "Text Us Widget", icon: <MessageOutlined sx={{ fontSize: 18 }} />, iconColor: "#FDBA74" },
        ].map((item) => {
          const active = selectedType === item.id;
          return (
            <Box
              key={item.id}
              onClick={() => {
                setSelectedType(item.id);
                selectedTypeRef.current = item.id;
              }}
              sx={{
                borderRadius: 2,
                border: `1px solid ${active ? theme.app.dashboard.accentBlue : theme.app.dashboard.cardBorder}`,
                p: 2.25,
                cursor: "pointer",
                background: theme.app.dashboard.overlayLight,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    bgcolor: item.iconColor,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#0B1024",
                  }}
                >
                  {item.icon}
                </Box>
                {active ? (
                  <RadioButtonChecked sx={{ color: theme.app.dashboard.accentBlue, fontSize: 20 }} />
                ) : (
                  <RadioButtonUnchecked sx={{ color: theme.app.dashboard.textMuted, fontSize: 20 }} />
                )}
              </Box>
              <Typography variant="mediumLarge" color="white" sx={{ mb: 0.25 }}>
                {item.title}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                Continuing saves a server draft (websiteId, widgetType, publishNow: false). Styling and text
                are merged on later steps via PATCH.
              </Typography>
            </Box>
          );
        })}
      </Box>
    </WidgetFlowShell>
  );
}
