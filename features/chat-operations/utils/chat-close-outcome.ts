export const CHAT_CLOSE_OUTCOMES = {
  COMPLETED: "completed",
  SPAM: "spam",
  AUTO: "auto",
  SUPERVISOR: "supervisor",
} as const;

export const CLOSED_CHAT_BUCKETS = {
  PENDING: "pending",
  COMPLETED: "completed",
  SPAM: "spam",
} as const;

export type ClosedChatBucket =
  (typeof CLOSED_CHAT_BUCKETS)[keyof typeof CLOSED_CHAT_BUCKETS];

export const SPAM_CATEGORIES = [
  { value: "promotional", label: "Promotional / marketing" },
  { value: "bot", label: "Bot / automated" },
  { value: "abusive", label: "Abusive / harassment" },
  { value: "wrong_number", label: "Wrong person / wrong site" },
  { value: "no_intent", label: "No real inquiry" },
  { value: "duplicate", label: "Duplicate / repeat spam" },
  { value: "other", label: "Other" },
] as const;

export type SpamCategoryValue = (typeof SPAM_CATEGORIES)[number]["value"];

export function isSpamCloseOutcome(
  closeOutcome: string | null | undefined,
): boolean {
  return closeOutcome === CHAT_CLOSE_OUTCOMES.SPAM;
}

export function resolveClosedChatBucket(row: {
  closeBucket?: string | null;
  closeOutcome?: string | null;
  requiresDistributionForm?: boolean;
  distributionSubmitted?: boolean;
  [key: string]: unknown;
}): ClosedChatBucket {
  if (row.closeBucket === CLOSED_CHAT_BUCKETS.PENDING) {
    return CLOSED_CHAT_BUCKETS.PENDING;
  }
  if (row.closeBucket === CLOSED_CHAT_BUCKETS.COMPLETED) {
    return CLOSED_CHAT_BUCKETS.COMPLETED;
  }
  if (row.closeBucket === CLOSED_CHAT_BUCKETS.SPAM) {
    return CLOSED_CHAT_BUCKETS.SPAM;
  }
  if (isSpamCloseOutcome(row.closeOutcome)) {
    return CLOSED_CHAT_BUCKETS.SPAM;
  }
  if (row.requiresDistributionForm && !row.distributionSubmitted) {
    return CLOSED_CHAT_BUCKETS.PENDING;
  }
  return CLOSED_CHAT_BUCKETS.COMPLETED;
}

export function spamCategoryLabel(value: string | null | undefined): string {
  const hit = SPAM_CATEGORIES.find((c) => c.value === value);
  return hit?.label ?? value?.trim() ?? "Spam";
}
