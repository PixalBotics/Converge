"use client";

import { usePathname, useRouter } from "next/navigation";
import type { SxProps, Theme } from "@mui/material/styles";
import { SegmentedControl } from "@/components/common";

export function EmailRouteSegmented({
  tabs,
  ariaLabel,
  sx,
}: {
  tabs: readonly {
    href: string;
    label: string;
    isActive?: (pathname: string) => boolean;
  }[];
  ariaLabel: string;
  sx?: SxProps<Theme>;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const active =
    tabs.find((t) =>
      t.isActive ? t.isActive(pathname) : pathname === t.href || pathname.startsWith(`${t.href}/`),
    )?.href ?? tabs[0]?.href ?? "";

  if (tabs.length === 0) return null;

  return (
    <SegmentedControl
      options={tabs.map((t) => ({ label: t.label, value: t.href }))}
      value={active}
      onChange={(href) => {
        if (href && href !== pathname) router.push(href);
      }}
      sx={[{ flexWrap: "wrap", maxWidth: "100%" }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
    />
  );
}
