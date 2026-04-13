export { apiClient } from "./http/axios-instance";
export {
  getApiBaseUrl,
  ACCESS_TOKEN_COOKIE_MAX_AGE_SEC,
  REFRESH_TOKEN_COOKIE_MAX_AGE_SEC,
} from "./config";
export * from "./auth";
export * from "./users";
export * from "./access";
export * from "./companies";
export * from "./roles";
export * from "./hrms";
export * from "./website-assignments";
export * from "./platform";
export * from "./platform-theme";
export * from "./types/auth.types";
export type { JsonRecord } from "./types/common.types";
export {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setTokenPair,
} from "./storage/auth-cookies";
export {
  synchronizeAuthSession,
  attachAuthSessionLifecycleListeners,
} from "./session/auth-session.sync";
export { refreshSessionWithStoredRefresh } from "./session/refresh-access-token";
