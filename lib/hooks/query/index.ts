export { makeQueryClient, QueryProvider } from "./core";

export { authKeys } from "./auth";
export { useLoginAsMutation, useLoginMutation, useLogoutMutation, useMeQuery } from "./auth";
export { usersKeys } from "./users";
export {
  useCreateUserMutation,
  useReplaceUserPermissionOverridesMutation,
  useSoftDeleteUserMutation,
  useUpdateUserMutation,
  useUserFilterSuggestionsQuery,
  useUserPermissionsQuery,
  useUserQuery,
  useUsersListQuery,
} from "./users";
export type { UsersListParams, UserFilterSuggestionsParams } from "./users";
export { accessKeys } from "./access";
export { usePermissionsCatalogQuery } from "./access";
export { companiesKeys } from "./companies";
export {
  useCompaniesByResellerQuery,
  useCompaniesListQuery,
  useCompaniesSetupResellersQuery,
  useScopedCompanyTreeQuery,
  useCompanySetupDraftByIdQuery,
  useCompanySetupDraftLatestQuery,
  useAbandonAllCompanySetupDraftsMutation,
  useCompanySetupDraftsListQuery,
  useCompanyPocDirectoryQuery,
  useWebsiteDirectoryQuery,
  useCreateCompanySetupDraftMutation,
  useParentCompanyQuery,
  useSubmitCompanySetupDraftMutation,
  useUpdateCompanyMutation,
  useUpdateCompanySetupDraftMutation,
  useUpdateParentCompanyMutation,
} from "./companies";
export type { CompaniesListParams, WebsiteDirectoryParams } from "./companies";
export { rolesKeys } from "./roles";
export {
  useCreateRoleMutation,
  useReplaceRolePermissionsMutation,
  useRoleQuery,
  useRolePermissionsQuery,
  useRolesListQuery,
  useSoftDeleteRoleMutation,
  useUpdateRoleMutation,
} from "./roles";
export { websiteAssignmentsKeys } from "./website-assignments";
export {
  buildWebsitesInScopeParams,
  useAssignWebsiteTierMutation,
  useDepartmentRosterCoverageQuery,
  useDepartmentRosterHrmsContextQuery,
  usePutDepartmentRosterCoverageMutation,
  usePutDepartmentRosterMutation,
  useRemoveWebsiteSlotMutation,
  useWebsiteAssignmentDetailQuery,
  useWebsiteAssignmentsUserWebsitesQuery,
  useWebsiteAssignmentsWebsitesQuery,
} from "./website-assignments";
export type {
  WebsiteAssignmentsUserWebsitesParams,
  WebsiteAssignmentsWebsitesParams,
} from "./website-assignments";
export { platformKeys } from "./platform";
export { useGeneratePlatformLicenseKeyMutation, usePlatformLicenseKeysQuery, useSendPlatformLicenseKeyMutation } from "./platform";
export { dashboardKeys, usePlatformOverviewQuery } from "./dashboard";
export { platformThemeKeys, usePlatformThemeMeQuery, useUpdatePlatformThemeMutation } from "./platform-theme";
export * from "./ai-knowledge";
export * from "./hrms";
