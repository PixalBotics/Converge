"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ArrowBack from "@mui/icons-material/ArrowBack";
import AutoStories from "@mui/icons-material/AutoStories";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  extractChildCompanyOptionsForParentFromByResellerTree,
  extractParentCompaniesFromByResellerTree,
  pickItemsArray,
  toIdNameOption,
} from "@/app/dashboard/user-page/components/add-user-modal.utils";
import {
  integrationsHeaderActions,
  integrationsPageHeader,
  integrationsPageWrapper,
} from "@/app/dashboard/integrations/integrations.styles";
import {
  Button,
  DashboardCard,
  InputField,
  Label,
  SelectField,
  Typography,
} from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { textFieldStyles } from "@/components/common/InputField/InputField.styles";
import {
  postKbReindex,
  postKbSourceJson,
  postKbSourceMultipart,
  unwrapKbResponse,
  type KbSourceType,
} from "@/api/kb/kb.api";
import { useResellerListScope } from "@/lib/auth";
import {
  buildWebsitesInScopeParams,
  useCompaniesSetupResellersQuery,
  useScopedCompanyTreeQuery,
  useWebsiteAssignmentsWebsitesQuery,
} from "@/lib/hooks";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { publishAppToast } from "@/lib/notify";

const SOURCE_TYPE_OPTIONS: { label: string; value: KbSourceType }[] = [
  { label: "FAQ / policy text", value: "FAQ" },
  { label: "Single page URL", value: "URL" },
  { label: "PDF (URL or upload)", value: "PDF" },
  { label: "Web crawl (start URL)", value: "WEB_CRAWL" },
  { label: "Sitemap XML URL", value: "SITEMAP" },
];

function sourceRefHelperText(sourceType: KbSourceType): string {
  switch (sourceType) {
    case "FAQ":
      return "Paste full FAQ or policy text. It is stored and chunked for retrieval.";
    case "URL":
      return "Full https URL of one page; the server fetches HTML and strips markup.";
    case "WEB_CRAWL":
      return "Crawl entry point (full URL).";
    case "SITEMAP":
      return "Sitemap XML location (full URL).";
    case "PDF":
      return "Either a public HTTPS URL to a PDF, or choose a file below and use upload.";
    default:
      return "Value depends on source type.";
  }
}

function isValidOptionalMetadataJson(raw: string): boolean {
  const t = raw.trim();
  if (!t) return true;
  try {
    JSON.parse(t);
    return true;
  } catch {
    return false;
  }
}

export default function AiTrainingPage() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const { canFilterByResellerId, sessionResellerId } = useResellerListScope();

  const [resellerId, setResellerId] = useState("");
  const [parentCompanyId, setParentCompanyId] = useState("");
  const [childCompanyId, setChildCompanyId] = useState("");
  const [websiteId, setWebsiteId] = useState("");

  const [sourceType, setSourceType] = useState<KbSourceType>("FAQ");
  const [sourceRef, setSourceRef] = useState("");
  const [title, setTitle] = useState("");
  const [metadataJson, setMetadataJson] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [reindexSourceId, setReindexSourceId] = useState("");
  const [reindexIncludeFailed, setReindexIncludeFailed] = useState(false);

  const [createBusy, setCreateBusy] = useState(false);
  const [reindexBusy, setReindexBusy] = useState(false);
  const [lastResult, setLastResult] = useState<unknown>(null);

  useEffect(() => {
    if (!canFilterByResellerId && sessionResellerId) {
      setResellerId(sessionResellerId);
    }
  }, [canFilterByResellerId, sessionResellerId]);

  const resellersQuery = useCompaniesSetupResellersQuery({
    enabled: canFilterByResellerId,
  });
  const companiesTreeQuery = useScopedCompanyTreeQuery(
    resellerId,
    canFilterByResellerId,
    sessionResellerId,
    { enabled: canFilterByResellerId ? resellerId.trim().length > 0 : true },
  );

  const websitesParams = useMemo(
    () =>
      buildWebsitesInScopeParams({
        canFilterByResellerId,
        all: true,
        resellerId,
        parentCompanyId,
        childCompanyId,
      }),
    [canFilterByResellerId, resellerId, parentCompanyId, childCompanyId],
  );

  const hierarchyReady =
    (canFilterByResellerId ? Boolean(resellerId.trim()) : true) &&
    Boolean(parentCompanyId.trim()) &&
    Boolean(childCompanyId.trim());

  const websitesQuery = useWebsiteAssignmentsWebsitesQuery(websitesParams, {
    allowResellerIdFilter: canFilterByResellerId,
    enabled: hierarchyReady,
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
    if (canFilterByResellerId && !resellerId.trim()) {
      return [{ value: "", label: "Select reseller first" }];
    }
    const extracted = extractParentCompaniesFromByResellerTree(
      companiesTreeQuery.data,
    ).map((o) => ({ value: o.value, label: o.label }));
    if (extracted.length > 0) {
      return [{ value: "", label: "Select parent company" }, ...extracted];
    }
    return [
      {
        value: "",
        label: companiesTreeQuery.isLoading
          ? "Loading parent companies…"
          : "No parent companies available",
      },
    ];
  }, [canFilterByResellerId, resellerId, companiesTreeQuery.data, companiesTreeQuery.isLoading]);

  const childCompanyRows = useMemo(() => {
    if ((canFilterByResellerId && !resellerId.trim()) || !parentCompanyId.trim()) return [];
    return extractChildCompanyOptionsForParentFromByResellerTree(
      companiesTreeQuery.data,
      parentCompanyId,
    );
  }, [canFilterByResellerId, resellerId, parentCompanyId, companiesTreeQuery.data]);

  const childCompanyOptions = useMemo(() => {
    if (canFilterByResellerId && !resellerId.trim()) {
      return [{ value: "", label: "Select reseller first" }];
    }
    if (!parentCompanyId.trim()) return [{ value: "", label: "Select parent company first" }];
    if (childCompanyRows.length > 0) {
      return [{ value: "", label: "Select child company" }, ...childCompanyRows];
    }
    return [
      {
        value: "",
        label: companiesTreeQuery.isLoading
          ? "Loading child companies…"
          : "No child companies for this parent",
      },
    ];
  }, [
    canFilterByResellerId,
    resellerId,
    parentCompanyId,
    childCompanyRows,
    companiesTreeQuery.isLoading,
  ]);

  const websiteRows = useMemo(() => websitesQuery.data?.data?.items ?? [], [websitesQuery.data?.data?.items]);

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

  useEffect(() => {
    if (!websiteId || websiteRows.length === 0) return;
    const ok = websiteRows.some((w) => w.websiteId === websiteId);
    if (!ok) setWebsiteId("");
  }, [websiteRows, websiteId]);

  useEffect(() => {
    if (!childCompanyId || childCompanyRows.length === 0) return;
    const ok = childCompanyRows.some((c) => c.value === childCompanyId);
    if (!ok) setChildCompanyId("");
  }, [childCompanyRows, childCompanyId]);

  const sitesError =
    websitesQuery.isError
      ? extractApiErrorMessageForToast(websitesQuery.error) ?? "Unable to load websites."
      : null;

  const websitesLoading = hierarchyReady && websitesQuery.isFetching && !websitesQuery.data;
  const hasWebsiteChoices = websiteRows.length > 0;
  const metadataValid = isValidOptionalMetadataJson(metadataJson);

  const canSubmitSource =
    Boolean(websiteId.trim()) &&
    metadataValid &&
    !createBusy &&
    (sourceType === "PDF" && pdfFile
      ? true
      : Boolean(sourceRef.trim()));

  const submitSource = async () => {
    if (!websiteId.trim()) {
      publishAppToast({ variant: "error", message: "Select a website so KB is tied to the correct site." });
      return;
    }
    if (!metadataValid) {
      publishAppToast({
        variant: "error",
        message: "metadataJson must be empty or valid JSON (object/array string).",
      });
      return;
    }
    if (sourceType !== "PDF" || !pdfFile) {
      if (!sourceRef.trim()) {
        publishAppToast({ variant: "error", message: "Source content / URL / text is required." });
        return;
      }
    }

    setCreateBusy(true);
    setLastResult(null);
    try {
      const wid = websiteId.trim();
      const metaTrim = metadataJson.trim();
      const metaPayload = metaTrim ? metaTrim : undefined;
      const titleTrim = title.trim() || undefined;

      let raw: unknown;
      if (sourceType === "PDF" && pdfFile) {
        raw = await postKbSourceMultipart({
          websiteId: wid,
          sourceType: "PDF",
          sourceRef: sourceRef.trim() || pdfFile.name || "document.pdf",
          title: titleTrim ?? "",
          metadataJson: metaTrim || "{}",
          file: pdfFile,
        });
      } else {
        raw = await postKbSourceJson({
          websiteId: wid,
          sourceType,
          sourceRef: sourceRef.trim(),
          title: titleTrim,
          ...(metaPayload ? { metadataJson: metaPayload } : {}),
        });
      }

      const peeled = unwrapKbResponse(raw);
      setLastResult(peeled ?? raw);
      publishAppToast({ variant: "success", message: "Knowledge source submitted for indexing." });
      setPdfFile(null);
    } catch (e) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(e) ?? "Could not create knowledge source.",
      });
    } finally {
      setCreateBusy(false);
    }
  };

  const runReindex = async (body: { sourceId?: string; includeFailed?: boolean }) => {
    setReindexBusy(true);
    setLastResult(null);
    try {
      const raw = await postKbReindex(body);
      const peeled = unwrapKbResponse(raw);
      setLastResult(peeled ?? raw);
      publishAppToast({ variant: "success", message: "Reindex request completed." });
    } catch (e) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(e) ?? "Reindex failed.",
      });
    } finally {
      setReindexBusy(false);
    }
  };

  return (
    <Box sx={integrationsPageWrapper}>
      <Box sx={integrationsPageHeader}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
          <Button
            type="button"
            variant="secondary"
            aria-label="Back to widgets"
            onClick={() => router.push("/dashboard/chat-widget")}
            sx={{ minWidth: 44, px: 1 }}
          >
            <ArrowBack sx={{ fontSize: 22 }} />
          </Button>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
              <AutoStories sx={{ color: theme.app.dashboard.accentBlue, fontSize: 28 }} />
              <Typography variant="regularLarge" fontWeight={700} color="white">
                AI training
              </Typography>
            </Stack>
            <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 720 }}>
              Ingest content into the knowledge base for the selected website&apos;s widget. Uses{" "}
              <Typography component="span" variant="medium" sx={{ color: theme.app.dashboard.white95 }}>
                POST /kb/sources
              </Typography>{" "}
              and{" "}
              <Typography component="span" variant="medium" sx={{ color: theme.app.dashboard.white95 }}>
                POST /kb/reindex
              </Typography>{" "}
              with your session JWT (requires chat-widget permissions).
            </Typography>
          </Box>
        </Box>
        <Box sx={integrationsHeaderActions}>
          <Button type="button" variant="secondary" onClick={() => router.push("/dashboard/ai-management")}>
            Legacy KB form
          </Button>
        </Box>
      </Box>

      {(createBusy || reindexBusy) && (
        <LinearProgress sx={{ borderRadius: 1, maxWidth: 1100, mx: "auto", width: "100%" }} />
      )}

      <Stack spacing={2.5} sx={{ maxWidth: 1100, mx: "auto", width: "100%" }}>
        <DashboardCard sx={{ p: 2.5 }}>
          <Typography variant="mediumLarge" color="white" fontWeight={600} sx={{ mb: 0.5 }}>
            1. Target website
          </Typography>
          <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, mb: 2 }}>
            Same hierarchy as widget setup — production indexing should always include{" "}
            <Typography component="span" variant="small" sx={{ fontWeight: 600, color: theme.app.dashboard.white95 }}>
              websiteId
            </Typography>{" "}
            so retrieval matches the visitor&apos;s site.
          </Typography>
          <Stack spacing={1.75}>
            {canFilterByResellerId ? (
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
                disabled={resellersQuery.isLoading}
                searchPlaceholder="Search reseller…"
                menuMaxRows={10}
              />
            ) : null}
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
              disabled={
                (canFilterByResellerId && !resellerId.trim()) || companiesTreeQuery.isLoading
              }
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
              disabled={!parentCompanyId.trim() || companiesTreeQuery.isLoading}
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
                No websites for this child company. Configure assignments under Website Assignments.
              </Typography>
            ) : null}
            {websiteId.trim() ? (
              <Alert severity="info" variant="outlined" sx={{ bgcolor: "transparent" }}>
                Selected <strong>websiteId</strong>:{" "}
                <Typography component="span" variant="body2" sx={{ fontFamily: "monospace", wordBreak: "break-all" }}>
                  {websiteId.trim()}
                </Typography>
              </Alert>
            ) : null}
          </Stack>
        </DashboardCard>

        <DashboardCard sx={{ p: 2.5 }}>
          <Typography variant="mediumLarge" color="white" fontWeight={600} sx={{ mb: 0.5 }}>
            2. Add knowledge source
          </Typography>
          <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, mb: 2 }}>
            Creates a source and runs ingest + embeddings immediately. For PDFs you can paste a public PDF URL, or
            upload a file (multipart) if your API accepts it.
          </Typography>

          <Stack spacing={1.75}>
            <SelectField
              label="Source type"
              placeholder="Type"
              value={sourceType}
              onChange={(v) => {
                setSourceType(v as KbSourceType);
                setPdfFile(null);
              }}
              options={SOURCE_TYPE_OPTIONS}
              searchable={false}
            />

            {sourceType === "FAQ" ? (
              <Box>
                <Label htmlFor="ai-training-faq" variant="mediumLarge" sx={{ display: "block", mb: 0.75 }}>
                  FAQ / policy text
                </Label>
                <TextField
                  id="ai-training-faq"
                  value={sourceRef}
                  onChange={(e) => setSourceRef(e.target.value)}
                  placeholder="Paste policies, FAQs, product notes…"
                  multiline
                  minRows={8}
                  fullWidth
                  sx={textFieldStyles(theme)}
                />
                <Typography variant="caption" sx={{ display: "block", mt: 0.75, color: theme.app.dashboard.textMuted }}>
                  {sourceRefHelperText("FAQ")}
                </Typography>
              </Box>
            ) : (
              <>
                <InputField
                  label={sourceType === "PDF" ? "PDF URL (optional if uploading a file)" : "Source reference (URL)"}
                  value={sourceRef}
                  onChange={(e) => setSourceRef(e.target.value)}
                  placeholder={
                    sourceType === "SITEMAP"
                      ? "https://example.com/sitemap.xml"
                      : "https://…"
                  }
                  inputProps={{ maxLength: 2048 }}
                  helperText={sourceRefHelperText(sourceType)}
                />
                {sourceType === "PDF" ? (
                  <Box>
                    <Button type="button" variant="secondary" component="label" disabled={createBusy}>
                      Choose PDF file
                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        hidden
                        onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                      />
                    </Button>
                    {pdfFile ? (
                      <Typography variant="caption" sx={{ display: "block", mt: 0.75, color: theme.app.dashboard.textMuted }}>
                        Selected: {pdfFile.name}
                      </Typography>
                    ) : null}
                  </Box>
                ) : null}
              </>
            )}

            <InputField
              label="Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short label for admins"
              inputProps={{ maxLength: 255 }}
            />

            <InputField
              label="metadataJson (optional)"
              value={metadataJson}
              onChange={(e) => setMetadataJson(e.target.value)}
              placeholder='{"segment":"support"}'
              error={!metadataValid}
              helperText={
                metadataValid
                  ? "Must be valid JSON string when non-empty."
                  : "Invalid JSON — fix or clear this field."
              }
            />

            <Divider sx={{ borderColor: "divider" }} />

            <Button
              type="button"
              variant="primary"
              sx={gradientPrimaryButtonSx}
              disabled={!canSubmitSource}
              onClick={() => void submitSource()}
            >
              {createBusy ? "Indexing…" : "Create source & index"}
            </Button>
          </Stack>
        </DashboardCard>

        <DashboardCard sx={{ p: 2.5 }}>
          <Typography variant="mediumLarge" color="white" fontWeight={600} sx={{ mb: 0.5 }}>
            3. Reindex
          </Typography>
          <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, mb: 2 }}>
            Refresh embeddings for one source, or bulk eligible sources. Empty body reindexes all non-deleted sources
            (pending + indexed); add <strong>includeFailed</strong> to retry failures too.
          </Typography>
          <Stack spacing={1.5}>
            <InputField
              label="Source ID (optional)"
              value={reindexSourceId}
              onChange={(e) => setReindexSourceId(e.target.value)}
              placeholder="UUID from a previous create response"
              inputProps={{ maxLength: 80 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={reindexIncludeFailed}
                  onChange={(e) => setReindexIncludeFailed(e.target.checked)}
                  size="small"
                  sx={{ color: theme.app.dashboard.textMuted }}
                />
              }
              label={
                <Typography variant="medium" sx={{ color: theme.app.dashboard.white95 }}>
                  Include previously failed sources (bulk only)
                </Typography>
              }
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} flexWrap="wrap">
              <Button
                type="button"
                variant="primary"
                sx={gradientPrimaryButtonSx}
                disabled={reindexBusy || !reindexSourceId.trim()}
                onClick={() =>
                  void runReindex({
                    sourceId: reindexSourceId.trim(),
                    ...(reindexIncludeFailed ? { includeFailed: true } : {}),
                  })
                }
              >
                Reindex this source
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={reindexBusy}
                onClick={() => void runReindex({})}
              >
                Reindex all eligible
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={reindexBusy}
                onClick={() => void runReindex({ includeFailed: true })}
              >
                Reindex all (+ failed)
              </Button>
            </Stack>
          </Stack>
        </DashboardCard>

        {lastResult !== null ? (
          <Alert severity="success" variant="outlined" sx={{ bgcolor: "transparent" }}>
            <Typography variant="small" sx={{ mb: 0.5, fontWeight: 600 }}>
              Last API payload (unwrapped)
            </Typography>
            <Box
              component="pre"
              sx={{
                m: 0,
                p: 1.5,
                borderRadius: 1,
                bgcolor: (t) => alpha(t.palette.common.black, 0.25),
                fontSize: 12,
                overflow: "auto",
                maxHeight: 280,
              }}
            >
              {JSON.stringify(lastResult, null, 2)}
            </Box>
          </Alert>
        ) : null}
      </Stack>
    </Box>
  );
}
