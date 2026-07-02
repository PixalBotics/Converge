import { hasAnyHrmsPage, PAGE } from "./permission-constants";
import { OP } from "./operational-keys";
import { canViewWebsiteAssignments } from "./website-assignment-access";

/** Screens that load reseller / parent / child company filter pickers. */
export function canAccessCompanyScopeFilters(
  hasPage: (page: string) => boolean,
  hasOperational: (code: string) => boolean,
): boolean {
  return (
    hasPage("page:clients") ||
    hasPage(PAGE.USERS) ||
    hasPage(PAGE.DEPARTMENTS) ||
    hasPage(PAGE.SHIFTS) ||
    hasPage(PAGE.WEBSITE_ASSIGNMENTS) ||
    hasPage(PAGE.POOL) ||
    hasPage(PAGE.WEBSITE_DIRECTORY) ||
    hasAnyHrmsPage(hasPage) ||
    hasPage("page:licenses") ||
    hasPage("page:account-setup") ||
    hasPage("page:resellers") ||
    hasOperational(OP.user.view) ||
    hasOperational(OP.company.list) ||
    hasOperational(OP.company.view)
  );
}

/** Website directory list (`GET /companies/website-directory`). */
export function canViewWebsiteDirectory(
  hasPage: (page: string) => boolean,
  hasOperational: (code: string) => boolean,
): boolean {
  return (
    hasPage("page:clients") ||
    hasPage(PAGE.WEBSITE_DIRECTORY) ||
    canViewWebsiteAssignments(hasPage, hasOperational) ||
    hasOperational(OP.company.list) ||
    hasOperational(OP.company.view) ||
    hasOperational(OP.websiteAssignment.view)
  );
}
