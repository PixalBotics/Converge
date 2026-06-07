"use client";

import { useCallback } from "react";
import { patchAgentVisitorProfile } from "@/services/chat/agent-inbox.api";
import {
  VisitorProfileConflictError,
  type PatchVisitorProfileResult,
  type VisitorProfileField,
} from "@/services/chat/visitor-profile.types";
import { extractApiErrorMessageForToast, publishAppToast } from "@/lib/notify";

const FIELD_LABEL: Record<VisitorProfileField, string> = {
  name: "Name",
  email: "Email",
  phone: "Phone",
};

export interface VisitorProfileCaptureSource {
  messageId?: string;
  sourceText?: string;
}

interface UseVisitorProfileCaptureParams {
  conversationId: string | null;
  token: string;
  enabled: boolean;
  onApplied?: (result: PatchVisitorProfileResult) => void;
}

export function useVisitorProfileCapture(params: UseVisitorProfileCaptureParams) {
  const captureField = useCallback(
    async (
      field: VisitorProfileField,
      value: string,
      source?: VisitorProfileCaptureSource,
    ) => {
      const trimmed = value.trim();
      if (!params.enabled || !params.conversationId?.trim() || !params.token.trim()) {
        return;
      }
      if (!trimmed) {
        publishAppToast({
          variant: "error",
          message: `${FIELD_LABEL[field]} cannot be empty.`,
        });
        return;
      }

      let confirmOverwrite = false;
      for (;;) {
        try {
          const result = await patchAgentVisitorProfile(
            params.conversationId,
            {
              field,
              value: trimmed,
              sourceMessageId: source?.messageId,
              sourceText: source?.sourceText ?? trimmed,
              confirmOverwrite,
            },
            params.token,
          );
          publishAppToast({
            variant: "success",
            message: `${FIELD_LABEL[field]} saved.`,
          });
          params.onApplied?.(result);
          return;
        } catch (err) {
          if (err instanceof VisitorProfileConflictError && !confirmOverwrite) {
            const replace = window.confirm(
              `${err.message}\n\nReplace with "${trimmed}"?`,
            );
            if (!replace) return;
            confirmOverwrite = true;
            continue;
          }
          publishAppToast({
            variant: "error",
            message:
              extractApiErrorMessageForToast(err) ??
              "Could not update visitor profile.",
          });
          return;
        }
      }
    },
    [params.conversationId, params.enabled, params.onApplied, params.token],
  );

  return { captureField, captureEnabled: params.enabled };
}
