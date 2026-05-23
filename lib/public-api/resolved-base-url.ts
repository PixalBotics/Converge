/** Browser-safe resolved API origin for public widget/embed calls. */
export function getResolvedPublicApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!raw || typeof raw !== "string") {
    throw new Error("NEXT_PUBLIC_API_BASE_URL must be configured.");
  }
  return raw.replace(/\/+$/, "");
}
