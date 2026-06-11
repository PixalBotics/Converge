"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useMeQuery } from "@/lib/hooks/query/auth/hooks";
import { extractResellerIdFromMePayload } from "../utils/extract-reseller-id";
import {
  readEmailResellerFromStorage,
  writeEmailResellerToStorage,
} from "../email-reseller-storage";

export type EmailResellerScope = {
  resellerId: string | null;
  ready: boolean;
  isResolving: boolean;
  hasFixedResellerScope: boolean;
  needsResellerPick: boolean;
  isInternalActor: boolean;
  setResellerId: (resellerId: string) => void;
};

const EmailResellerScopeContext = createContext<EmailResellerScope | null>(null);

function readRouteResellerId(params: ReturnType<typeof useParams>): string | null {
  const raw = params?.resellerId;
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  if (Array.isArray(raw) && raw[0]?.trim()) return raw[0].trim();
  return null;
}

export function EmailResellerScopeProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();
  const { user } = useAuth();

  const routeParamId = readRouteResellerId(params);
  const queryParamId = searchParams.get("resellerId")?.trim() || null;

  const meQuery = useMeQuery({ enabled: !user?.resellerId });
  const meResellerId = useMemo(
    () => (meQuery.data ? extractResellerIdFromMePayload(meQuery.data) ?? null : null),
    [meQuery.data],
  );

  const userResellerId = user?.resellerId?.trim() || meResellerId || null;
  const isInternal = user?.userType === "Internal";

  const [pickedId, setPickedId] = useState<string | null>(null);

  useEffect(() => {
    if (userResellerId) return;
    const next = queryParamId || routeParamId || readEmailResellerFromStorage();
    if (next && next !== pickedId) {
      setPickedId(next);
    }
  }, [userResellerId, queryParamId, routeParamId, pickedId]);

  const scopeResellerId = useMemo(() => {
    if (userResellerId) return userResellerId;
    if (isInternal) {
      return queryParamId || routeParamId || pickedId || readEmailResellerFromStorage();
    }
    return queryParamId || routeParamId || pickedId || meResellerId;
  }, [userResellerId, isInternal, queryParamId, routeParamId, pickedId, meResellerId]);

  const hasFixedResellerScope = Boolean(userResellerId);
  const isResolving = !hasFixedResellerScope && !isInternal && meQuery.isLoading;
  const ready = Boolean(scopeResellerId?.trim());
  const needsResellerPick = isInternal && !ready && !isResolving;

  const setResellerId = useCallback(
    (id: string) => {
      const trimmed = id.trim();
      if (!trimmed) return;
      setPickedId(trimmed);
      writeEmailResellerToStorage(trimmed);
      const params = new URLSearchParams(searchParams.toString());
      params.set("resellerId", trimmed);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const value = useMemo<EmailResellerScope>(
    () => ({
      resellerId: scopeResellerId,
      ready,
      isResolving,
      hasFixedResellerScope,
      needsResellerPick,
      isInternalActor: isInternal,
      setResellerId,
    }),
    [scopeResellerId, ready, isResolving, hasFixedResellerScope, needsResellerPick, isInternal, setResellerId],
  );

  return (
    <EmailResellerScopeContext.Provider value={value}>{children}</EmailResellerScopeContext.Provider>
  );
}

export function useEmailResellerScope(): EmailResellerScope {
  const ctx = useContext(EmailResellerScopeContext);
  if (!ctx) {
    throw new Error("useEmailResellerScope must be used within EmailResellerScopeProvider");
  }
  return ctx;
}
