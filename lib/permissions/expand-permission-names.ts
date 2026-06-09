import { isAxiosError } from "axios";
import { expandPermissionNames } from "@/api";
import {
  parsePermissionExpandPreview,
  type PermissionExpandPreview,
} from "@/lib/permissions/role-permission-payload";

function normalizeStoredNames(storedNames: readonly string[]): string[] {
  return Array.from(
    new Set(
      storedNames
        .map((name) => name.trim())
        .filter((name) => name.length > 0),
    ),
  ).sort();
}

/**
 * Preview runtime expansion for the role editor.
 * Sends the full current stored grant list — never a bundle-only subset.
 */
export async function fetchPermissionExpandPreview(
  storedNames: readonly string[],
): Promise<PermissionExpandPreview> {
  const permissionNames = normalizeStoredNames(storedNames);
  if (permissionNames.length === 0) {
    return {
      operational: [],
      page: [],
      impliedPermissionNames: [],
      equivalentPermissionNames: [],
    };
  }

  try {
    const payload = await expandPermissionNames({ permissionNames });
    return parsePermissionExpandPreview(payload);
  } catch (err) {
    if (isAxiosError(err) && (err.response?.status === 404 || err.response?.status === 501)) {
      throw new PermissionExpansionUnavailableError();
    }
    throw err;
  }
}

/** @deprecated Use {@link fetchPermissionExpandPreview} */
export async function fetchExpandedPermissionNames(
  storedNames: readonly string[],
): Promise<string[]> {
  const preview = await fetchPermissionExpandPreview(storedNames);
  return Array.from(new Set([...preview.operational, ...preview.page])).sort();
}

export class PermissionExpansionUnavailableError extends Error {
  constructor() {
    super("Permission expansion preview is not available on this server.");
    this.name = "PermissionExpansionUnavailableError";
  }
}

export type { PermissionExpandPreview };
