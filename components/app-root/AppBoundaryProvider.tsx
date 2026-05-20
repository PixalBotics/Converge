"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  dismissAppBoundary,
  publishAppBoundary,
  sessionExpiredBoundary,
  subscribeAppBoundary,
  type AppBoundaryAction,
  type AppBoundaryState,
} from "@/lib/app-boundaries";
import { AUTH_PATHS, useAuth } from "@/lib/auth";
import { shouldSkipRemoteAuthHydration } from "@/lib/auth/auth-paths";
import { retrySessionHydration } from "@/lib/auth/session-hydration-retry";
import { AppBoundaryModal } from "@/components/common/AppBoundaryModal";

function defaultActionsForBoundary(
  state: AppBoundaryState,
  handlers: {
    signInAgain: () => Promise<void>;
    retry: () => void;
    goHome: () => void;
    dismiss: () => void;
  },
): AppBoundaryAction[] {
  if (state.actions?.length) return state.actions;

  switch (state.kind) {
    case "session_expired":
      return [
        {
          id: "sign-in",
          label: "Sign in again",
          variant: "primary",
          onClick: handlers.signInAgain,
        },
      ];
    case "network":
      return [
        {
          id: "retry",
          label: "Try again",
          variant: "primary",
          onClick: () => {
            if (state.onRetry) {
              void Promise.resolve(state.onRetry());
            } else {
              handlers.retry();
            }
          },
        },
        {
          id: "dismiss",
          label: "Dismiss",
          variant: "secondary",
          onClick: handlers.dismiss,
        },
      ];
    case "permission_denied":
      return [
        {
          id: "home",
          label: "Go to home",
          variant: "primary",
          onClick: handlers.goHome,
        },
        {
          id: "dismiss",
          label: "Close",
          variant: "secondary",
          onClick: handlers.dismiss,
        },
      ];
    case "server_error":
    case "unexpected":
    default:
      return [
        {
          id: "retry",
          label: "Try again",
          variant: "primary",
          onClick: () => {
            if (state.onRetry) {
              state.onRetry();
            } else {
              handlers.retry();
            }
          },
        },
        {
          id: "dismiss",
          label: "Close",
          variant: "secondary",
          onClick: handlers.dismiss,
        },
      ];
  }
}

export function AppBoundaryProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { logout } = useAuth();
  const [boundary, setBoundary] = useState<AppBoundaryState | null>(null);

  useEffect(() => subscribeAppBoundary(setBoundary), []);

  const dismiss = useCallback(() => {
    dismissAppBoundary();
  }, []);

  const signInAgain = useCallback(async () => {
    await logout();
    router.replace(AUTH_PATHS.login);
  }, [logout, router]);

  const retry = useCallback(() => {
    if (boundary?.onRetry) {
      void Promise.resolve(boundary.onRetry());
      return;
    }
    void retrySessionHydration().then(() => {
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    });
  }, [boundary]);

  const goHome = useCallback(() => {
    router.push("/dashboard");
  }, [router]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onOffline = () => {
      if (shouldSkipRemoteAuthHydration(window.location.pathname)) return;
      publishAppBoundary({
        kind: "network",
        title: "You're offline",
        description:
          "Check your internet connection. Your work stays on this page — reconnect and tap Try again.",
        dismissible: true,
      });
    };

    const onOnline = () => {
      dismissAppBoundary("network");
    };

    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  const actions = useMemo(
    () =>
      boundary
        ? defaultActionsForBoundary(boundary, {
            signInAgain,
            retry,
            goHome,
            dismiss,
          })
        : [],
    [boundary, signInAgain, retry, goHome, dismiss],
  );

  const dismissible =
    boundary?.dismissible ?? (boundary?.kind !== "session_expired" && boundary?.kind !== undefined);

  return (
    <>
      {children}
      {boundary ? (
        <AppBoundaryModal
          open
          kind={boundary.kind}
          title={boundary.title}
          description={boundary.description}
          dismissible={dismissible}
          actions={actions}
          onDismiss={dismissible ? dismiss : undefined}
        />
      ) : null}
    </>
  );
}

/** Imperative session modal — e.g. after refresh token failure. */
export function notifySessionExpired(): void {
  publishAppBoundary(sessionExpiredBoundary());
}
