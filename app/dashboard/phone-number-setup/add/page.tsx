"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import BlurOnRounded from "@mui/icons-material/BlurOnRounded";
import type { SxProps, Theme } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, DashboardCard, InputField, SelectField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { pageWrapper } from "../../companies/overview.styles";
import { rolesCard, rolesIconBox, rolesPageWrapper } from "../../roles/roles.styles";
import {
  addPhoneActionsSx,
  addPhoneCardHeaderSx,
  addPhoneFetchRowSx,
  addPhoneFormGridTwoSx,
  addPhoneHeaderSx,
  addPhoneStatusLabelSx,
  addPhoneStatusRowSx,
  addPhoneSubtextSx,
} from "./add-phone-number.styles";
import {
  useFetchWebsiteTwilioNumbersMutation,
  useUpsertWebsiteSmsConfigMutation,
  useWebsiteSmsConfigQuery,
} from "@/features/sms/hooks/useSms";
import { useResellerListScope } from "@/lib/auth";
import {
  buildWebsitesInScopeParams,
  useCompaniesSetupResellersQuery,
  useScopedCompanyTreeQuery,
  useWebsiteAssignmentsWebsitesQuery,
} from "@/lib/hooks";
import {
  extractChildCompanyOptionsForParentFromByResellerTree,
  extractParentCompaniesFromByResellerTree,
  pickItemsArray,
  toIdNameOption,
} from "@/app/dashboard/user-page/components/add-user-modal.utils";
import { websiteAssignmentItemToSelectOption } from "@/lib/websites/format-website-select-label";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { publishAppToast } from "@/lib/notify";

export default function AddPhoneNumberPage() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const { canFilterByResellerId, sessionResellerId } = useResellerListScope();

  const [resellerId, setResellerId] = useState("");
  const [parentCompanyId, setParentCompanyId] = useState("");
  const [childCompanyId, setChildCompanyId] = useState("");
  const [websiteId, setWebsiteId] = useState("");
  const [accountSid, setAccountSid] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [hasSavedToken, setHasSavedToken] = useState(false);
  const [fromNumber, setFromNumber] = useState("");
  const [notifyToNumber, setNotifyToNumber] = useState("");
  const [label, setLabel] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [numberOptions, setNumberOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const websiteConfigQuery = useWebsiteSmsConfigQuery(websiteId, {
    enabled: Boolean(websiteId),
  });
  const fetchNumbers = useFetchWebsiteTwilioNumbersMutation();
  const saveWebsite = useUpsertWebsiteSmsConfigMutation();

  useEffect(() => {
    if (!canFilterByResellerId && sessionResellerId) setResellerId(sessionResellerId);
  }, [canFilterByResellerId, sessionResellerId]);

  useEffect(() => {
    const cfg = websiteConfigQuery.data;
    if (!cfg || !websiteId) return;
    if (!cfg.configured) {
      setAccountSid("");
      setAuthToken("");
      setHasSavedToken(false);
      setFromNumber("");
      setNotifyToNumber("");
      setLabel("");
      setEnabled(true);
      setNumberOptions([]);
      return;
    }
    setAccountSid(cfg.accountSid);
    setHasSavedToken(cfg.hasAuthToken);
    setAuthToken("");
    setFromNumber(cfg.fromNumber);
    setNotifyToNumber(cfg.notifyToNumber);
    setLabel(cfg.label ?? "");
    setEnabled(cfg.isEnabled);
    setNumberOptions([
      {
        label: cfg.fromNumber,
        value: cfg.fromNumber,
      },
    ]);
  }, [websiteConfigQuery.data, websiteId]);

  const resellersQuery = useCompaniesSetupResellersQuery({
    enabled: canFilterByResellerId,
  });
  const companiesTreeQuery = useScopedCompanyTreeQuery(
    resellerId,
    canFilterByResellerId,
    sessionResellerId,
    { enabled: Boolean(resellerId || sessionResellerId) },
  );
  const websitesQuery = useWebsiteAssignmentsWebsitesQuery(
    buildWebsitesInScopeParams({
      canFilterByResellerId,
      resellerId: resellerId || sessionResellerId || "",
      parentCompanyId,
      childCompanyId,
      all: true,
    }),
    { enabled: Boolean(childCompanyId) },
  );

  const resellerOptions = useMemo(
    () =>
      pickItemsArray(resellersQuery.data)
        .map(toIdNameOption)
        .filter((o): o is { value: string; label: string } => o !== null),
    [resellersQuery.data],
  );
  const parentOptions = useMemo(
    () =>
      extractParentCompaniesFromByResellerTree(companiesTreeQuery.data)
        .map(toIdNameOption)
        .filter((o): o is { value: string; label: string } => o !== null),
    [companiesTreeQuery.data],
  );
  const childOptions = useMemo(
    () =>
      extractChildCompanyOptionsForParentFromByResellerTree(
        companiesTreeQuery.data,
        parentCompanyId,
      )
        .map(toIdNameOption)
        .filter((o): o is { value: string; label: string } => o !== null),
    [companiesTreeQuery.data, parentCompanyId],
  );
  const websiteOptions = useMemo(
    () =>
      (websitesQuery.data?.data?.items ?? []).map(websiteAssignmentItemToSelectOption),
    [websitesQuery.data?.data?.items],
  );

  const loadTwilioNumbers = async () => {
    if (!accountSid.trim()) {
      publishAppToast({ variant: "error", message: "Enter Twilio Account SID." });
      return;
    }
    if (!authToken.trim() && !hasSavedToken) {
      publishAppToast({ variant: "error", message: "Enter Twilio Auth Token." });
      return;
    }
    try {
      const numbers = await fetchNumbers.mutateAsync({
        websiteId: websiteId.trim() || undefined,
        accountSid: accountSid.trim(),
        authToken: authToken.trim() || undefined,
      });
      if (!numbers.length) {
        publishAppToast({ variant: "error", message: "No Twilio numbers found on this account." });
        return;
      }
      const opts = numbers.map((n) => ({
        label: n.friendlyName ? `${n.phoneNumber} (${n.friendlyName})` : n.phoneNumber,
        value: n.phoneNumber,
      }));
      setNumberOptions(opts);
      if (!fromNumber) setFromNumber(numbers[0]!.phoneNumber);
      publishAppToast({ variant: "success", message: `Loaded ${numbers.length} number(s).` });
    } catch (e) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(e) ?? "Could not fetch Twilio numbers.",
      });
    }
  };

  const saveAssignment = async () => {
    if (!websiteId.trim()) {
      publishAppToast({ variant: "error", message: "Select a website." });
      return;
    }
    if (!accountSid.trim()) {
      publishAppToast({ variant: "error", message: "Twilio Account SID is required." });
      return;
    }
    if (!authToken.trim() && !hasSavedToken) {
      publishAppToast({ variant: "error", message: "Twilio Auth Token is required." });
      return;
    }
    if (!fromNumber.trim() || !notifyToNumber.trim()) {
      publishAppToast({ variant: "error", message: "From and Notify To numbers are required." });
      return;
    }
    try {
      await saveWebsite.mutateAsync({
        websiteId: websiteId.trim(),
        accountSid: accountSid.trim(),
        authToken: authToken.trim() || undefined,
        fromNumber: fromNumber.trim(),
        notifyToNumber: notifyToNumber.trim(),
        label: label.trim() || undefined,
        isEnabled: enabled,
      });
      publishAppToast({ variant: "success", message: "Website phone configuration saved." });
      router.push("/dashboard/phone-number-setup");
    } catch (e) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(e) ?? "Could not save website configuration.",
      });
    }
  };

  return (
    <Box sx={[pageWrapper, rolesPageWrapper] as SxProps<Theme>}>
      <Box sx={addPhoneHeaderSx}>
        <Typography variant="regularLarge" fontWeight={700} color="white">
          Add Phone Number
        </Typography>
        <Typography variant="body2" sx={addPhoneSubtextSx}>
          Each website uses its own Twilio account and numbers for Text Us SMS
        </Typography>
      </Box>

      <DashboardCard sx={rolesCard}>
        <Box sx={addPhoneCardHeaderSx}>
          <Box sx={rolesIconBox}>
            <BlurOnRounded sx={{ fontSize: 18, color: theme.app.dashboard.white95 }} />
          </Box>
          <Typography variant="mediumLarge" color="white" fontWeight={600}>
            Website & Twilio account
          </Typography>
        </Box>
        <Box sx={addPhoneFormGridTwoSx}>
          {canFilterByResellerId ? (
            <SelectField
              label="Reseller"
              value={resellerId}
              onChange={(v) => {
                setResellerId(v);
                setParentCompanyId("");
                setChildCompanyId("");
                setWebsiteId("");
              }}
              options={resellerOptions}
            />
          ) : null}
          <SelectField
            label="Parent Company"
            value={parentCompanyId}
            onChange={(v) => {
              setParentCompanyId(v);
              setChildCompanyId("");
              setWebsiteId("");
            }}
            options={parentOptions}
          />
          <SelectField
            label="Child Company"
            value={childCompanyId}
            onChange={(v) => {
              setChildCompanyId(v);
              setWebsiteId("");
            }}
            options={childOptions}
            disabled={!parentCompanyId}
          />
          <SelectField
            label="Website"
            value={websiteId}
            onChange={setWebsiteId}
            options={websiteOptions}
            disabled={!childCompanyId}
          />
        </Box>

        <Box sx={addPhoneFormGridTwoSx}>
          <InputField
            label="Twilio Account SID"
            value={accountSid}
            onChange={(e) => setAccountSid(e.target.value)}
          />
          <InputField
            label="Twilio Auth Token"
            type="password"
            value={authToken}
            onChange={(e) => setAuthToken(e.target.value)}
            helperText={
              hasSavedToken && !authToken
                ? "Leave blank to keep existing token"
                : "This website's own Twilio credentials"
            }
          />
        </Box>

        <Box sx={addPhoneActionsSx}>
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            disabled={fetchNumbers.isPending}
            onClick={() => void loadTwilioNumbers()}
          >
            {fetchNumbers.isPending ? "Fetching…" : "Fetch Numbers"}
          </Button>
        </Box>

        <Box sx={addPhoneFetchRowSx}>
          {numberOptions.length > 0 ? (
            <SelectField
              label="From number (Twilio)"
              value={fromNumber}
              onChange={setFromNumber}
              options={numberOptions}
            />
          ) : (
            <InputField
              label="From number (Twilio, E.164)"
              value={fromNumber}
              onChange={(e) => setFromNumber(e.target.value)}
              placeholder="+14155551234"
            />
          )}
        </Box>
        <Box sx={addPhoneFormGridTwoSx}>
          <InputField
            label="Notify To (E.164)"
            value={notifyToNumber}
            onChange={(e) => setNotifyToNumber(e.target.value)}
            placeholder="+14155559999"
            helperText="Where Text Us alerts are delivered"
          />
          <InputField
            label="Label (optional)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </Box>
      </DashboardCard>

      <DashboardCard sx={rolesCard}>
        <Box sx={addPhoneStatusRowSx}>
          <Box>
            <Typography variant="medium" color="white">
              Active
            </Typography>
            <Typography variant="small" sx={addPhoneStatusLabelSx}>
              Enable SMS for this website
            </Typography>
          </Box>
          <Switch checked={enabled} onChange={(e) => setEnabled(e.target.checked)} color="primary" />
        </Box>
        <Box sx={addPhoneActionsSx}>
          <Button type="button" variant="secondary" onClick={() => router.push("/dashboard/phone-number-setup")}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            disabled={saveWebsite.isPending}
            onClick={() => void saveAssignment()}
          >
            {saveWebsite.isPending ? "Saving…" : "Save configuration"}
          </Button>
        </Box>
      </DashboardCard>
    </Box>
  );
}
