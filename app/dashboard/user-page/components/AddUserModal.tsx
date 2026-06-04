"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { alpha } from "@mui/material/styles";
import { Typography, InputField, SelectField, FormModal } from "@/components/common";
import type { JsonRecord } from "@/api";
import type { AppTheme } from "@/theme/theme";
import {
  useCompaniesByResellerQuery,
  useCompaniesSetupResellersQuery,
  useCreateUserMutation,
  useDepartmentsListQuery,
  useDesignationsListQuery,
  useRolesListQuery,
  useUpdateUserMutation,
  useUserQuery,
} from "@/lib/hooks";
import {
  extractParentCompaniesFromByResellerTree,
  extractUserRecordFromDetailPayload,
  pickItemsArray,
  toIdNameOption,
} from "./add-user-modal.utils";
import { publishAppToast } from "@/lib/notify";
import {
  useAuth,
  sessionMayAssignWideResellerScope,
  sessionMayPickInternalUserScope,
  sessionIsNarrowClientRootScope,
  resolveSessionParentCompanyId,
  resolveSessionResellerId,
} from "@/lib/auth";
import {
  externalScopeUsesWideReseller,
  findDefaultStandardExternalRoleId,
  findPlatformAdminRoleId,
  isExternalAdminRoleName,
  isExternalAdminScope,
  isPlatformAdminRoleName,
  PARENT_COMPANY_ADMIN_ROLE_NAME,
  RESELLER_ADMIN_ROLE_NAME,
  resolveInternalAdminScope,
  resolveRoleIdForExternalAdminScope,
  type ExternalAdminScope,
  type InternalAdminScope,
} from "@/lib/users/user-admin-scope";
import { SelectableOptionCard, SelectableOptionsSection } from "./SelectableOptionCard";
import { UserAdminScopeFields } from "./UserAdminScopeFields";

export function AddUserModal({
  open,
  onClose,
  theme,
  editUserId,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  theme: AppTheme;
  /** When set, modal loads this user and saves with `PATCH /users/:id`. */
  editUserId?: string;
  onSaved?: () => void;
}) {
  const mode = editUserId?.trim() ? "edit" : "create";
  const trimmedEditId = editUserId?.trim() ?? "";
  const { isPlatformAdmin, user: authUser } = useAuth();
  const mayPickInternalSessionScope = useMemo(
    () => sessionMayPickInternalUserScope(isPlatformAdmin, authUser?.userType),
    [isPlatformAdmin, authUser?.userType],
  );
  const mayAssignWideResellerScope = useMemo(
    () =>
      sessionMayAssignWideResellerScope(
        isPlatformAdmin,
        authUser?.userType,
        authUser?.wideResellerScope,
        authUser?.resellerId,
      ),
    [
      isPlatformAdmin,
      authUser?.userType,
      authUser?.wideResellerScope,
      authUser?.resellerId,
    ],
  );
  const isNarrowClientScope = useMemo(
    () => sessionIsNarrowClientRootScope(isPlatformAdmin, authUser),
    [isPlatformAdmin, authUser],
  );
  const sessionResellerId = resolveSessionResellerId(authUser?.resellerId);
  const sessionParentCompanyId = resolveSessionParentCompanyId(authUser?.parentCompanyId);

  const [userType, setUserType] = useState<"Internal" | "External">("Internal");
  const [resellerId, setResellerId] = useState("");
  const [parentCompanyId, setParentCompanyId] = useState("");
  const [roleValue, setRoleValue] = useState("");
  const [departmentValue, setDepartmentValue] = useState("");
  const [designationValue, setDesignationValue] = useState("");
  const [designationLabelHint, setDesignationLabelHint] = useState("");
  const [roleLabelHint, setRoleLabelHint] = useState("");
  const [departmentLabelHint, setDepartmentLabelHint] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [internalAdminScope, setInternalAdminScope] = useState<InternalAdminScope>("standard");
  const [externalAdminScope, setExternalAdminScope] = useState<ExternalAdminScope>("standard");
  const [editFormHydrated, setEditFormHydrated] = useState(false);
  const hydratedEditUserIdRef = useRef<string | null>(null);

  /** Match user overview util; keep both type cards visible while edit detail is loading. */
  const showInternalUserTypeCard =
    mayPickInternalSessionScope ||
    (mode === "edit" && !editFormHydrated) ||
    (mode === "edit" && editFormHydrated && userType === "Internal");

  useEffect(() => {
    if (!open || mode !== "create") return;
    if (showInternalUserTypeCard) return;
    setUserType("External");
  }, [open, mode, showInternalUserTypeCard]);

  /** Pre-fill tenant scope when creating external users from a reseller session. */
  useEffect(() => {
    if (!open || mode !== "create" || userType !== "External") return;
    const rid = sessionResellerId.trim();
    if (rid) setResellerId((prev) => prev.trim() || rid);
    if (isNarrowClientScope) {
      const pid = sessionParentCompanyId.trim();
      if (pid) setParentCompanyId((prev) => prev.trim() || pid);
    }
  }, [
    open,
    mode,
    userType,
    sessionResellerId,
    sessionParentCompanyId,
    isNarrowClientScope,
  ]);

  const userDetailQuery = useUserQuery(trimmedEditId, {
    enabled: open && mode === "edit",
  });
  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();

  const isEditLoading = mode === "edit" && (userDetailQuery.isLoading || userDetailQuery.isFetching);

  const resellersQuery = useCompaniesSetupResellersQuery({
    enabled: open && userType === "External",
  });
  const companiesByResellerQuery = useCompaniesByResellerQuery(
    resellerId,
    { view: "tree", sortBy: "name", sortOrder: "asc", all: true },
    {
      enabled: open && userType === "External" && resellerId.trim().length > 0,
    },
  );
  const rolesQuery = useRolesListQuery(undefined, { enabled: open });

  const parentCompanyOptions = useMemo(
    () => extractParentCompaniesFromByResellerTree(companiesByResellerQuery.data),
    [companiesByResellerQuery.data],
  );

  const departmentQueryParams = useMemo(() => {
    if (userType === "Internal") {
      return {};
    }
    if (
      userType === "External" &&
      resellerId.trim().length > 0 &&
      parentCompanyId.trim().length > 0
    ) {
      return {
        all: true,
        type: "External",
        resellerId: resellerId.trim(),
        parentCompanyId: parentCompanyId.trim(),
      } as const;
    }
    return {};
  }, [userType, resellerId, parentCompanyId]);

  const departmentsEnabledInternal = open && userType === "Internal";
  const departmentsEnabledExternal =
    open &&
    userType === "External" &&
    resellerId.trim().length > 0 &&
    parentCompanyId.trim().length > 0;

  const internalDepartmentsQuery = useDepartmentsListQuery(
    { type: "Internal", all: true },
    {
      enabled: departmentsEnabledInternal,
      scope: "add-user-internal",
    },
  );
  const externalDepartmentsQuery = useDepartmentsListQuery(departmentQueryParams, {
    enabled: departmentsEnabledExternal,
    scope: "add-user-external",
  });

  const departmentsQuery =
    userType === "Internal" ? internalDepartmentsQuery : externalDepartmentsQuery;

  const designationQueryParams = useMemo(() => {
    const departmentId = departmentValue.trim();
    if (!departmentId) return undefined;
    if (userType === "External" && resellerId.trim()) {
      return {
        departmentId,
        resellerId: resellerId.trim(),
      };
    }
    return { departmentId };
  }, [departmentValue, userType, resellerId]);

  const designationsQuery = useDesignationsListQuery(
    designationQueryParams,
    {
      enabled:
        open &&
        !!designationQueryParams?.departmentId &&
        (mode === "create" || editFormHydrated),
      scope: "add-user-modal",
    },
  );

  const resellerOptions = useMemo(() => {
    return pickItemsArray(resellersQuery.data)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => !!o);
  }, [resellersQuery.data]);

  const roleOptions = useMemo(() => {
    const base = pickItemsArray(rolesQuery.data)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => !!o);
    if (mode === "edit" && roleValue.trim() && !base.some((o) => o.value === roleValue.trim())) {
      const label = roleLabelHint.trim() || roleValue.trim();
      return [{ value: roleValue.trim(), label }, ...base];
    }
    return base;
  }, [rolesQuery.data, mode, roleValue, roleLabelHint]);

  const departmentOptions = useMemo(() => {
    const base = pickItemsArray(departmentsQuery.data)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => !!o);
    if (
      mode === "edit" &&
      departmentValue.trim() &&
      !base.some((o) => o.value === departmentValue.trim())
    ) {
      const label = departmentLabelHint.trim() || departmentValue.trim();
      return [{ value: departmentValue.trim(), label }, ...base];
    }
    return base;
  }, [departmentsQuery.data, mode, departmentValue, departmentLabelHint]);

  const designationOptions = useMemo(() => {
    const base = pickItemsArray(designationsQuery.data)
      .map(toIdNameOption)
      .filter((o): o is { value: string; label: string } => !!o);
    if (
      designationValue.trim() &&
      !base.some((o) => o.value === designationValue.trim())
    ) {
      return [
        {
          value: designationValue.trim(),
          label: designationLabelHint.trim() || designationValue.trim(),
        },
        ...base,
      ];
    }
    return base;
  }, [designationsQuery.data, designationValue, designationLabelHint]);

  useEffect(() => {
    setEditFormHydrated(false);
    hydratedEditUserIdRef.current = null;
    setRoleLabelHint("");
    setDepartmentLabelHint("");
    setPhone("");
  }, [trimmedEditId]);

  useEffect(() => {
    if (open) return;
    const defaultUserType: "Internal" | "External" = mayPickInternalSessionScope ? "Internal" : "External";
    setUserType(defaultUserType);
    setResellerId("");
    setParentCompanyId("");
    setRoleValue("");
    setDepartmentValue("");
    setDesignationValue("");
    setDesignationLabelHint("");
    setRoleLabelHint("");
    setDepartmentLabelHint("");
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setInternalAdminScope("standard");
    setExternalAdminScope("standard");
    setEditFormHydrated(false);
    hydratedEditUserIdRef.current = null;
  }, [open, mayPickInternalSessionScope]);

  useEffect(() => {
    if (!open || mode !== "edit" || !userDetailQuery.isSuccess || !trimmedEditId) return;
    if (hydratedEditUserIdRef.current === trimmedEditId) return;
    const u = extractUserRecordFromDetailPayload(userDetailQuery.data);
    if (!u) return;

    const roleObj = u.role as Record<string, unknown> | undefined;
    const deptObj = u.department as Record<string, unknown> | undefined;
    const desObj = u.designation as Record<string, unknown> | undefined;
    const resellerObj = u.reseller as Record<string, unknown> | undefined;
    const companyObj = u.company as Record<string, unknown> | undefined;
    const parentCompanyObj = u.parentCompany as Record<string, unknown> | undefined;

    setFirstName(String(u.firstName ?? u.first_name ?? "").trim());
    setLastName(String(u.lastName ?? u.last_name ?? "").trim());
    setEmail(String(u.email ?? "").trim());
    setPhone(
      String(
        u.phoneNo
          ?? u.phone_no
          ?? u.phone
          ?? u.phoneNumber
          ?? u.mobile
          ?? u.phone_number
          ?? "",
      ).trim(),
    );

    const wrRaw = u.wideResellerScope ?? u.wide_reseller_scope;
    const wide =
      wrRaw === true || wrRaw === "true" || wrRaw === 1 || wrRaw === "1";

    const typeRaw = u.userType ?? u.user_type;
    const nextType = String(typeRaw ?? "Internal") === "External" ? "External" : "Internal";
    setUserType(nextType);

    setResellerId(
      String(u.resellerId ?? u.reseller_id ?? resellerObj?.id ?? "").trim(),
    );
    setParentCompanyId(
      String(
        u.companyId
          ?? u.company_id
          ?? companyObj?.id
          ?? u.parentCompanyId
          ?? u.parent_company_id
          ?? parentCompanyObj?.id
          ?? "",
      ).trim(),
    );

    const roleId = String(u.roleId ?? u.role_id ?? roleObj?.id ?? "").trim();
    setRoleValue(roleId);
    const roleNameHydrated = String(roleObj?.name ?? u.roleName ?? u.role_name ?? "").trim();
    setRoleLabelHint(roleNameHydrated);
    if (nextType === "External") {
      if (roleNameHydrated === RESELLER_ADMIN_ROLE_NAME) {
        setExternalAdminScope("wide_reseller");
      } else if (roleNameHydrated === PARENT_COMPANY_ADMIN_ROLE_NAME) {
        setExternalAdminScope("parent_company");
      } else {
        setExternalAdminScope(wide ? "wide_reseller" : "standard");
      }
    }

    const deptId = String(u.departmentId ?? u.department_id ?? deptObj?.id ?? "").trim();
    setDepartmentValue(deptId);
    setDepartmentLabelHint(
      String(deptObj?.name ?? u.departmentName ?? u.department_name ?? "").trim(),
    );

    const desId = String(u.designationId ?? u.designation_id ?? desObj?.id ?? "").trim();
    setDesignationValue(desId);
    setDesignationLabelHint(
      String(desObj?.name ?? u.designationName ?? u.designation_name ?? "").trim(),
    );
    setEditFormHydrated(true);
    hydratedEditUserIdRef.current = trimmedEditId;
  }, [open, mode, userDetailQuery.isSuccess, userDetailQuery.data, trimmedEditId]);

  useEffect(() => {
    if (!open || !roleOptions.length) return;
    if (userType !== "Internal") return;
    setInternalAdminScope(resolveInternalAdminScope(roleValue, roleOptions));
  }, [open, userType, roleValue, roleOptions]);

  useEffect(() => {
    if (!open || !roleOptions.length || userType !== "Internal") return;
    if (internalAdminScope !== "platform_admin") return;
    const platformRoleId = findPlatformAdminRoleId(roleOptions);
    if (platformRoleId && roleValue !== platformRoleId) {
      setRoleValue(platformRoleId);
    }
  }, [open, internalAdminScope, roleOptions, roleValue, userType]);

  const handleInternalAdminScopeChange = (scope: InternalAdminScope) => {
    setInternalAdminScope(scope);
    if (scope === "platform_admin") {
      const platformRoleId = findPlatformAdminRoleId(roleOptions);
      if (platformRoleId) setRoleValue(platformRoleId);
    } else if (roleOptions.length) {
      const platformRoleId = findPlatformAdminRoleId(roleOptions);
      if (platformRoleId && roleValue === platformRoleId) {
        const fallback = roleOptions.find((r) => r.value !== platformRoleId);
        if (fallback) setRoleValue(fallback.value);
      }
    }
  };

  const handleExternalAdminScopeChange = (scope: ExternalAdminScope) => {
    setExternalAdminScope(scope);
    if (isExternalAdminScope(scope)) {
      const adminRoleId = resolveRoleIdForExternalAdminScope(scope, roleOptions);
      if (adminRoleId) setRoleValue(adminRoleId);
      return;
    }
    const standardRoleId = findDefaultStandardExternalRoleId(roleOptions);
    if (standardRoleId) setRoleValue(standardRoleId);
  };

  const wideResellerScope = externalScopeUsesWideReseller(externalAdminScope);

  useEffect(() => {
    if (!open || userType !== "External" || mayAssignWideResellerScope) return;
    if (externalAdminScope !== "wide_reseller") return;
    setExternalAdminScope("standard");
  }, [open, userType, mayAssignWideResellerScope, externalAdminScope]);

  useEffect(() => {
    if (!open || !roleOptions.length || userType !== "External") return;
    if (!isExternalAdminScope(externalAdminScope)) return;
    const adminRoleId = resolveRoleIdForExternalAdminScope(externalAdminScope, roleOptions);
    if (adminRoleId && roleValue !== adminRoleId) {
      setRoleValue(adminRoleId);
    }
  }, [open, externalAdminScope, roleOptions, roleValue, userType]);

  useEffect(() => {
    if (!open || !roleOptions.length || userType !== "External") return;
    if (externalAdminScope !== "standard") return;
    if (mode === "edit" && !editFormHydrated) return;
    const current = roleOptions.find((r) => r.value === roleValue);
    if (
      current &&
      !isExternalAdminRoleName(current.label) &&
      !isPlatformAdminRoleName(current.label)
    ) {
      return;
    }
    const standardRoleId = findDefaultStandardExternalRoleId(roleOptions);
    if (standardRoleId && roleValue !== standardRoleId) {
      setRoleValue(standardRoleId);
    }
  }, [
    open,
    externalAdminScope,
    roleOptions,
    roleValue,
    userType,
    mode,
    editFormHydrated,
  ]);

  useEffect(() => {
    if (mode === "edit" && !editFormHydrated) return;
    if (!roleOptions.length) return;
    if (userType === "External") return;
    const inList = roleOptions.some((o) => o.value === roleValue);
    if (!roleValue) {
      setRoleValue(roleOptions[0].value);
    } else if (!inList && mode === "create") {
      setRoleValue(roleOptions[0].value);
    }
  }, [roleOptions, roleValue, mode, editFormHydrated, userType]);

  useEffect(() => {
    if (mode === "edit" && !editFormHydrated) return;
    if (!departmentOptions.length) return;
    const inList = departmentOptions.some((o) => o.value === departmentValue);
    if (!departmentValue) {
      setDepartmentValue(departmentOptions[0].value);
    } else if (!inList && mode === "create") {
      setDepartmentValue(departmentOptions[0].value);
    }
  }, [departmentOptions, departmentValue, mode, editFormHydrated]);

  useEffect(() => {
    if (mode === "edit" && !editFormHydrated) return;
    if (!designationOptions.length) return;
    const inList = designationOptions.some((o) => o.value === designationValue);
    if (!designationValue) {
      setDesignationValue(designationOptions[0].value);
    } else if (!inList && mode === "create") {
      setDesignationValue(designationOptions[0].value);
    }
  }, [designationOptions, designationValue, mode, editFormHydrated]);

  const emptySelect = [{ label: "—", value: "" }];

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSave = () => {
    const fn = firstName.trim();
    const ln = lastName.trim();
    const em = email.trim();
    const ph = phone.trim();
    if (!fn || !em) {
      publishAppToast({
        variant: "error",
        message: "Please enter first name and email.",
      });
      return;
    }
    if (!roleValue.trim() || !departmentValue.trim() || !designationValue.trim()) {
      publishAppToast({
        variant: "error",
        message: "Please select role, department, and designation.",
      });
      return;
    }
    if (userType === "Internal" && internalAdminScope === "platform_admin") {
      if (!findPlatformAdminRoleId(roleOptions)) {
        publishAppToast({
          variant: "error",
          message: "Platform Admin role is missing. Seed roles or pick standard internal staff.",
        });
        return;
      }
    }
    if (userType === "External") {
      if (!resellerId.trim() || !parentCompanyId.trim()) {
        publishAppToast({
          variant: "error",
          message: "Please select reseller and parent company for an external user.",
        });
        return;
      }
      if (isExternalAdminScope(externalAdminScope)) {
        const externalRoleId = resolveRoleIdForExternalAdminScope(
          externalAdminScope,
          roleOptions,
        );
        if (!externalRoleId) {
          publishAppToast({
            variant: "error",
            message:
              externalAdminScope === "wide_reseller"
                ? `"${RESELLER_ADMIN_ROLE_NAME}" role is missing. Run API seed.`
                : `"${PARENT_COMPANY_ADMIN_ROLE_NAME}" role is missing. Run API seed.`,
          });
          return;
        }
      }
    }

    const body: JsonRecord = {
      firstName: fn,
      ...(mode === "edit"
        ? { lastName: ln || null }
        : ln
          ? { lastName: ln }
          : {}),
      email: em,
      ...(mode === "edit" || ph ? { phoneNo: ph || null } : {}),
      userType,
      roleId: roleValue.trim(),
      departmentId: departmentValue.trim(),
      designationId: designationValue.trim(),
    };
    if (userType === "External") {
      body.resellerId = resellerId.trim();
      body.companyId = parentCompanyId.trim();
      body.wideResellerScope = wideResellerScope;
    }

    if (mode === "create") {
      createMutation.mutate(body, {
        onSuccess: () => {
          onClose();
          onSaved?.();
        },
      });
    } else {
      updateMutation.mutate(
        { id: trimmedEditId, body },
        {
          onSuccess: () => {
            onClose();
            onSaved?.();
          },
        },
      );
    }
  };

  return (
    <FormModal
      open={open}
      title={mode === "edit" ? "Edit User" : "Add New User"}
      description={
        mode === "edit"
          ? "Update this user’s profile and access."
          : "Create a new user account with appropriate access levels."
      }
      onClose={onClose}
      onSave={handleSave}
      primaryButtonLabel={mode === "edit" ? "Save changes" : "Create user"}
      primaryButtonDisabled={isSaving || (mode === "edit" && isEditLoading)}
      fitContent
    >
      {mode === "edit" && isEditLoading && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1 }}>
          <CircularProgress size={22} />
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
            Loading user…
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2,
          mb: 3,
        }}
      >
        <InputField
          label="First Name"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          disabled={mode === "edit" && isEditLoading}
        />
        <InputField
          label="Last Name (optional)"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          disabled={mode === "edit" && isEditLoading}
        />
        <InputField
          label="Email Address"
          placeholder="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={mode === "edit" && isEditLoading}
        />
        <InputField
          label="Phone Number"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={mode === "edit" && isEditLoading}
        />
      </Box>

      <SelectableOptionsSection
        theme={theme}
        title="User category"
        lockedHint={mode === "edit" ? "Cannot change after creation." : undefined}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: showInternalUserTypeCard
              ? { xs: "1fr", sm: "1fr 1fr" }
              : { xs: "1fr", sm: "1fr" },
            gap: { xs: 1.5, sm: 2 },
            alignItems: "stretch",
          }}
        >
          {showInternalUserTypeCard ? (
            <SelectableOptionCard
              theme={theme}
              title="Internal"
              subtitle="Your organization"
              accent="indigo"
              value="Internal"
              selected={userType === "Internal"}
              disabled={mode === "edit" && isEditLoading}
              selectionLocked={mode === "edit"}
              onSelect={() => {
                setUserType("Internal");
                setResellerId("");
                setParentCompanyId("");
                setInternalAdminScope("standard");
                setExternalAdminScope("standard");
                setDepartmentValue("");
                setDesignationValue("");
                setDesignationLabelHint("");
              }}
            />
          ) : null}

          <SelectableOptionCard
            theme={theme}
            title="External"
            subtitle="Reseller client"
            accent="green"
            value="External"
            selected={userType === "External"}
            disabled={mode === "edit" && isEditLoading}
            selectionLocked={mode === "edit"}
            onSelect={() => {
              setUserType("External");
              setExternalAdminScope("standard");
              setDepartmentValue("");
              setDesignationValue("");
              setDesignationLabelHint("");
            }}
          />
        </Box>
      </SelectableOptionsSection>

      {userType === "External" && (
        <>
          <Box sx={{ mb: 2 }}>
            <SelectField
              label="Reseller"
              value={resellerId}
              onChange={(v) => {
                setResellerId(v);
                setParentCompanyId("");
                setDepartmentValue("");
                setDesignationValue("");
                setDesignationLabelHint("");
              }}
              options={resellerOptions.length ? resellerOptions : emptySelect}
              menuMaxRows={3}
              disabled={isNarrowClientScope && mode === "create"}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <SelectField
              label="Parent Company"
              value={parentCompanyId}
              onChange={(v) => {
                setParentCompanyId(v);
                setDepartmentValue("");
                setDesignationValue("");
                setDesignationLabelHint("");
              }}
              options={parentCompanyOptions.length ? parentCompanyOptions : emptySelect}
              menuMaxRows={3}
              disabled={
                (isNarrowClientScope && mode === "create") ||
                !resellerId.trim()
              }
            />
          </Box>

          <UserAdminScopeFields
            theme={theme}
            userType="External"
            internalScope={internalAdminScope}
            externalScope={externalAdminScope}
            onInternalScopeChange={handleInternalAdminScopeChange}
            onExternalScopeChange={handleExternalAdminScopeChange}
            disabled={isSaving || (mode === "edit" && isEditLoading)}
            showInternal={false}
            allowWideResellerScope={mayAssignWideResellerScope}
          />
        </>
      )}

      {userType === "Internal" && showInternalUserTypeCard ? (
        <UserAdminScopeFields
          theme={theme}
          userType="Internal"
          internalScope={internalAdminScope}
          externalScope={externalAdminScope}
          onInternalScopeChange={handleInternalAdminScopeChange}
          onExternalScopeChange={handleExternalAdminScopeChange}
          disabled={isSaving || (mode === "edit" && isEditLoading)}
          allowWideResellerScope={mayAssignWideResellerScope}
        />
      ) : null}

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 2 }}>
        <Box>
          <SelectField
            label="Role"
            value={roleValue}
            onChange={setRoleValue}
            options={roleOptions.length ? roleOptions : emptySelect}
            menuMaxRows={3}
            disabled={
              isSaving ||
              (mode === "edit" && isEditLoading) ||
              (userType === "Internal" && internalAdminScope === "platform_admin") ||
              (userType === "External" && isExternalAdminScope(externalAdminScope))
            }
          />
          {(userType === "Internal" && internalAdminScope === "platform_admin") ||
          (userType === "External" && isExternalAdminScope(externalAdminScope)) ? (
            <Typography
              variant="caption"
              sx={{
                color: alpha(theme.app.dashboard.accentBlue, 0.95),
                display: "block",
                mt: 0.75,
                lineHeight: 1.45,
              }}
            >
              Role is set automatically.
            </Typography>
          ) : null}
        </Box>
        <SelectField
          label="Department"
          value={departmentValue}
          onChange={(v) => {
            setDepartmentValue(v);
            setDesignationValue("");
            setDesignationLabelHint("");
          }}
          options={departmentOptions.length ? departmentOptions : emptySelect}
          menuMaxRows={3}
          disabled={
            userType === "External" &&
            (!resellerId.trim() || !parentCompanyId.trim())
          }
        />
      </Box>

      <Box sx={{ mb: 0 }}>
        <SelectField
          label="Designation"
          value={designationValue}
          onChange={setDesignationValue}
          options={designationOptions.length ? designationOptions : emptySelect}
          menuMaxRows={3}
          disabled={!departmentValue.trim()}
        />
      </Box>
    </FormModal>
  );
}
