export { makeQueryClient, QueryProvider } from "./core";

export { authKeys } from "./auth";
export { useLoginAsMutation, useLoginMutation, useLogoutMutation, useMeQuery } from "./auth";
export { usersKeys } from "./users";
export {
  useCreateUserMutation,
  useSoftDeleteUserMutation,
  useUpdateUserMutation,
  useUserFilterSuggestionsQuery,
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
  useCompanySetupDraftByIdQuery,
  useCompanySetupDraftLatestQuery,
  useCreateCompanySetupDraftMutation,
  useParentCompanyQuery,
  useSubmitCompanySetupDraftMutation,
  useUpdateCompanyMutation,
  useUpdateCompanySetupDraftMutation,
  useUpdateParentCompanyMutation,
} from "./companies";
export type { CompaniesListParams } from "./companies";
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
  useWebsiteAssignmentsWebsitesQuery,
} from "./website-assignments";
export type { WebsiteAssignmentsWebsitesParams } from "./website-assignments";
export { platformKeys } from "./platform";
export { platformThemeKeys, usePlatformThemeMeQuery, useUpdatePlatformThemeMutation } from "./platform-theme";
export * from "./hrms";
