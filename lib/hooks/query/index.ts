export { makeQueryClient, QueryProvider } from "./core";

export { authKeys } from "./auth";
export { useLoginMutation, useLogoutMutation, useMeQuery } from "./auth";
export { usersKeys } from "./users";
export { useUserFilterSuggestionsQuery, useUsersListQuery } from "./users";
export type { UsersListParams, UserFilterSuggestionsParams } from "./users";
export { accessKeys } from "./access";
export { companiesKeys } from "./companies";
export {
  useCompaniesListQuery,
  useCompaniesByResellerQuery,
} from "./companies";
export type { CompaniesListParams } from "./companies";
export { rolesKeys } from "./roles";
export { websiteAssignmentsKeys } from "./website-assignments";
export {
  useWebsiteAssignmentsWebsitesQuery,
} from "./website-assignments";
export type { WebsiteAssignmentsWebsitesParams } from "./website-assignments";
export { platformKeys } from "./platform";
export { platformThemeKeys } from "./platform-theme";
export * from "./hrms";
