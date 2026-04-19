import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import {
  extractApiErrorMessageForToast,
  extractApiSuccessMessageForToast,
  publishAppToast,
} from "@/lib/notify";

function shouldSkipGlobalToast(meta: unknown): boolean {
  if (!meta || typeof meta !== "object") return false;
  return Boolean((meta as { skipGlobalToast?: boolean }).skipGlobalToast);
}

function shouldSkipSuccessToast(meta: unknown): boolean {
  if (!meta || typeof meta !== "object") return false;
  return Boolean((meta as { skipSuccessToast?: boolean }).skipSuccessToast);
}

const DEFAULT_SUCCESS_TOAST = "Saved successfully";

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (shouldSkipGlobalToast(query.meta)) return;
        const msg = extractApiErrorMessageForToast(error);
        if (msg) publishAppToast({ variant: "error", message: msg });
      },
    }),
    mutationCache: new MutationCache({
      onSuccess: (data, _vars, _ctx, mutation) => {
        if (shouldSkipGlobalToast(mutation.meta)) return;
        if (shouldSkipSuccessToast(mutation.meta)) return;
        const extracted = extractApiSuccessMessageForToast(data);
        const msg = extracted ?? DEFAULT_SUCCESS_TOAST;
        publishAppToast({ variant: "success", message: msg });
      },
      onError: (error, _vars, _ctx, mutation) => {
        if (shouldSkipGlobalToast(mutation.meta)) return;
        const msg = extractApiErrorMessageForToast(error);
        if (msg) publishAppToast({ variant: "error", message: msg });
      },
    }),
  });
}
