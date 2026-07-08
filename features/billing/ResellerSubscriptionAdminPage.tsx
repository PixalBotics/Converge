"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import { useQuery } from "@tanstack/react-query";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  DashboardCard,
  DataTable,
  InputField,
  SelectField,
  Typography,
} from "@/components/common";
import type { DataTableColumn } from "@/components/common";
import { pageWrapper } from "@/app/dashboard/companies/overview.styles";
import { useAuth } from "@/lib/auth";
import {
  usePlatformResellerPlanPreviewQuery,
  usePlatformResellerSubscriptionsQuery,
  usePutPlatformResellerSubscriptionMutation,
} from "@/lib/hooks/query/billing/billing";
import { useCompaniesSetupResellersQuery } from "@/lib/hooks/query/companies/hooks";
import type { ResellerSubscriptionSummary } from "@/api/billing/subscription.api";
import { pickItemsArray, toIdNameOption } from "@/app/dashboard/user-page/components/add-user-modal.utils";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { getResellerModules, putResellerModulePrices } from "@/api/companies/reseller-modules.api";

export function ResellerSubscriptionAdminPage() {
  const theme = useTheme() as AppTheme;
  const { isPlatformAdmin } = useAuth();
  const subsQuery = usePlatformResellerSubscriptionsQuery({ enabled: isPlatformAdmin });
  const resellersQuery = useCompaniesSetupResellersQuery({ enabled: isPlatformAdmin });
  const putMutation = usePutPlatformResellerSubscriptionMutation();

  const [resellerId, setResellerId] = useState("");
  const [planName, setPlanName] = useState("Standard");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [basePrice, setBasePrice] = useState("49");
  const [currency, setCurrency] = useState("USD");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState("active");
  const [modulePrices, setModulePrices] = useState<Record<string, string>>({});

  const parsedBase = Number(basePrice);
  const resellerModulesQuery = useQuery({
    queryKey: ["reseller-modules-pricing", resellerId],
    queryFn: () => getResellerModules(resellerId.trim()),
    enabled: isPlatformAdmin && Boolean(resellerId.trim()),
  });
  const previewQuery = usePlatformResellerPlanPreviewQuery(
    {
      resellerId: resellerId.trim(),
      basePrice: Number.isFinite(parsedBase) ? parsedBase : 0,
      billingCycle,
    },
    { enabled: isPlatformAdmin && Boolean(resellerId.trim()) },
  );

  useEffect(() => {
    const row = (subsQuery.data?.data ?? []).find((s) => s.resellerId === resellerId);
    if (!row) return;
    setPlanName(row.planName);
    setBillingCycle(row.billingCycle === "yearly" ? "yearly" : "monthly");
    setBasePrice(row.basePrice ?? row.price);
    setCurrency(row.currency || "USD");
    setStartDate(row.startDate);
    setStatus(row.status);
  }, [resellerId, subsQuery.data?.data]);

  useEffect(() => {
    const data = resellerModulesQuery.data?.data;
    if (!data) return;
    const next: Record<string, string> = {};
    for (const code of data.moduleCodes ?? []) {
      const value = data.modulePricesByCode?.[code];
      next[code] = typeof value === "number" ? String(value) : "";
    }
    setModulePrices(next);
  }, [resellerModulesQuery.data?.data]);

  const resellerOptions = useMemo(() => {
    const items = pickItemsArray(resellersQuery.data)
      .map((row) => toIdNameOption(row))
      .filter((o): o is { value: string; label: string } => o !== null);
    return [
      {
        value: "",
        label: resellersQuery.isLoading ? "Loading resellers…" : "Select reseller",
      },
      ...items,
    ];
  }, [resellersQuery.data, resellersQuery.isLoading]);

  const preview = previewQuery.data?.data;
  const columns = useMemo<DataTableColumn<ResellerSubscriptionSummary & Record<string, unknown>>[]>(
    () => [
      { id: "resellerName", label: "Reseller" },
      { id: "planName", label: "Plan" },
      { id: "billingCycle", label: "Cycle" },
      {
        id: "basePrice",
        label: "Base",
        render: (_v, row) => `${row.currency} ${row.basePrice ?? "0"}`,
      },
      {
        id: "modulesTotal",
        label: "Modules",
        render: (_v, row) => `${row.currency} ${row.modulesTotal ?? "0"}`,
      },
      {
        id: "price",
        label: "Total",
        render: (_v, row) => `${row.currency} ${row.price}`,
      },
      { id: "endDate", label: "End" },
      { id: "status", label: "Status" },
      {
        id: "daysRemaining",
        label: "Days left",
        render: (_v, row) => String(row.daysRemaining),
      },
    ],
    [],
  );

  if (!isPlatformAdmin) {
    return (
      <Box sx={pageWrapper}>
        <Typography sx={{ color: theme.app.dashboard.textMuted }}>
          Only Platform Admins can manage reseller subscriptions.
        </Typography>
      </Box>
    );
  }

  const handleSave = async () => {
    if (!resellerId.trim()) {
      publishAppToast({ message: "Select a reseller.", variant: "error" });
      return;
    }
    if (!Number.isFinite(parsedBase) || parsedBase < 0) {
      publishAppToast({ message: "Enter a valid base price.", variant: "error" });
      return;
    }
    const enabledCodes = resellerModulesQuery.data?.data.moduleCodes ?? [];
    const parsedModulePrices: Record<string, number> = {};
    for (const code of enabledCodes) {
      const raw = modulePrices[code]?.trim() ?? "";
      if (!raw) {
        publishAppToast({ message: `Set monthly price for module: ${code}`, variant: "error" });
        return;
      }
      const value = Number(raw);
      if (!Number.isFinite(value) || value < 0) {
        publishAppToast({ message: `Invalid monthly price for module: ${code}`, variant: "error" });
        return;
      }
      parsedModulePrices[code] = value;
    }
    try {
      await putResellerModulePrices(resellerId.trim(), parsedModulePrices);
      await putMutation.mutateAsync({
        resellerId: resellerId.trim(),
        planName: planName.trim(),
        billingCycle,
        basePrice: parsedBase,
        currency: currency.trim() || "USD",
        startDate,
        status,
        notifyReseller: true,
      });
      publishAppToast({
        message: "Reseller SaaS plan and module pricing saved. Email sent to reseller admins with module breakdown.",
        variant: "success",
      });
      void subsQuery.refetch();
      void previewQuery.refetch();
      void resellerModulesQuery.refetch();
    } catch (err) {
      publishAppToast({
        message: extractApiErrorMessageForToast(err) ?? "Could not save subscription.",
        variant: "error",
      });
    }
  };

  const rows = subsQuery.data?.data ?? [];

  return (
    <Box sx={pageWrapper}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="regularLarge" fontWeight={700} color="white">
          Reseller SaaS plans
        </Typography>
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mt: 0.75, maxWidth: 720 }}>
          Total = platform base fee + enabled module add-ons. Set each enabled module monthly rate below; yearly
          multiplies monthly rates × 12. Saving emails the plan breakdown to reseller admins.
        </Typography>
      </Box>

      <DashboardCard sx={{ p: 2.5, mb: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography fontWeight={700} color="white">
          Assign / update plan
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
          }}
        >
          <SelectField
            label="Reseller"
            value={resellerId}
            onChange={setResellerId}
            options={resellerOptions}
          />
          <InputField label="Plan name" value={planName} onChange={(e) => setPlanName(e.target.value)} />
          <SelectField
            label="Billing cycle"
            value={billingCycle}
            onChange={(v) => setBillingCycle(v as "monthly" | "yearly")}
            options={[
              { value: "monthly", label: "Monthly" },
              { value: "yearly", label: "Yearly" },
            ]}
          />
          <InputField
            label="Base platform fee (monthly)"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
          />
          <InputField label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} />
          <InputField
            label="Start date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <SelectField
            label="Status"
            value={status}
            onChange={setStatus}
            options={[
              { value: "trial", label: "Trial" },
              { value: "active", label: "Active" },
              { value: "past_due", label: "Past due" },
            ]}
          />
        </Box>

        {resellerId ? (
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              border: "1px solid rgba(255,255,255,0.12)",
              bgcolor: "rgba(255,255,255,0.03)",
            }}
          >
            <Typography fontWeight={700} color="white" sx={{ mb: 1 }}>
              Pricing preview
            </Typography>
            {previewQuery.isLoading ? (
              <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                Loading module pricing…
              </Typography>
            ) : preview ? (
              <>
                <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 0.75 }}>
                  Base: {currency} {preview.basePrice.toFixed(2)}
                  {billingCycle === "yearly" ? " × 12" : ""} · Modules: {currency}{" "}
                  {preview.modulesTotalCycle.toFixed(2)} ·{" "}
                  <strong style={{ color: "white" }}>
                    Total {currency} {preview.total.toFixed(2)}
                  </strong>
                </Typography>
                {preview.lines.length === 0 ? (
                  <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                    No modules enabled for this reseller — only base fee applies. Assign modules under Services.
                  </Typography>
                ) : (
                  <Box sx={{ display: "grid", gap: 1.25 }}>
                    {preview.lines.map((line) => (
                      <Box
                        key={line.code}
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", md: "1fr 180px" },
                          gap: 1,
                          alignItems: "end",
                        }}
                      >
                        <Typography variant="body2" component="span" sx={{ color: theme.app.dashboard.textMuted }}>
                          {line.name} ({line.code})
                        </Typography>
                        <InputField
                          label="SaaS rate (agency pays platform)"
                          value={modulePrices[line.code] ?? ""}
                          onChange={(e) =>
                            setModulePrices((prev) => ({ ...prev, [line.code]: e.target.value }))
                          }
                          placeholder="0.00"
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </>
            ) : (
              <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                Could not load pricing preview.
              </Typography>
            )}
          </Box>
        ) : null}

        <Box>
          <Button variant="primary" onClick={() => void handleSave()} disabled={putMutation.isPending}>
            Save SaaS plan
          </Button>
        </Box>
      </DashboardCard>

      <DashboardCard sx={{ p: 0 }}>
        <DataTable<ResellerSubscriptionSummary & Record<string, unknown>>
          columns={columns}
          rows={rows as (ResellerSubscriptionSummary & Record<string, unknown>)[]}
          getRowId={(row) => row.resellerId}
          isLoading={subsQuery.isLoading}
          minWidth={980}
          emptyState={{ title: "No reseller subscriptions yet" }}
        />
      </DashboardCard>
    </Box>
  );
}
