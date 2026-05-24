import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ website?: string }>;
};

export default async function LegacyChatSettingsQaRosterPage({
  searchParams,
}: Props) {
  const sp = await searchParams;
  const website = typeof sp.website === "string" ? sp.website.trim() : "";
  const qs = website ? `?websiteId=${encodeURIComponent(website)}` : "";
  redirect(`/dashboard/qa/roster/assign${qs}`);
}
