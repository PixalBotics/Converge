export { AuthProvider, useAuth } from "./AuthContext";
export { validateCredentials, createSession, isSessionValid, MOCK_LOGIN_HINT } from "./mockAuth";
export type { User, LoginCredentials, AuthSession } from "./types";
export { AUTH_PATHS, APP_PATHS, shouldSkipRemoteAuthHydration } from "./auth-paths";
export type { AuthPathValue } from "./auth-paths";
export { getAuthEmailRules, AUTH_EMAIL_REGEX, AUTH_EMAIL_MESSAGES } from "./auth-form-validation";
export { isForgotPasswordOtpApiEnabled } from "./feature-flags";
export {
  extractIsPlatformAdmin,
  extractPermissionsByType,
  hasOperationalPermission,
  hasPagePermission,
  isRbacActive,
  mergePermissionsByType,
  PAGE_ACCESS_ALL,
  PAGE_PERMISSION_DASHBOARD,
  PERMISSION_BUCKET_OPERATIONAL,
  PERMISSION_BUCKET_PAGE,
  toPermissionSet,
} from "./permissions-model";
export type { PermissionsByType } from "./permissions-model";
export {
  getAccessibleDashboardHref,
  getDashboardPathPageRequirements,
  getRequiredPagePermission,
} from "./route-page-permissions";
