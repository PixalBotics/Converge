export { PlatformMailPage } from "./pages/PlatformMailPage";
export { ResellerOwnMailPage } from "./pages/ResellerOwnMailPage";
export { PlatformMailAssignmentPage } from "./pages/PlatformMailAssignmentPage";
export { EmailDesignPage } from "./pages/EmailDesignPage";
export { EmailPlaceholderPage } from "./pages/EmailPlaceholderPage";
export { MailConnectionForm } from "./components/MailConnectionForm";
export {
  EMAIL_ROUTES,
  EMAIL_CONFIGURATION_LABEL,
  EMAIL_BREADCRUMB,
  resellerOwnMailEditPath,
} from "./email.constants";
export { useEmailResellerScope } from "./hooks/useEmailResellerScope";
export { EmailResellerScopeProvider } from "./context/EmailResellerScopeContext";
