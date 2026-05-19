"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { publishAppBoundary } from "@/lib/app-boundaries";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

/**
 * Catches render errors in the client tree and surfaces a SaaS-style boundary modal.
 */
export class ReactErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ReactErrorBoundary]", error, info.componentStack);
    publishAppBoundary({
      kind: "unexpected",
      title: "Something went wrong",
      description:
        "This page hit an unexpected error. Try again — if it keeps happening, contact support.",
      dismissible: true,
      onRetry: () => {
        this.setState({ hasError: false });
      },
    });
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}
