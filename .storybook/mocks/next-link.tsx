import type { AnchorHTMLAttributes, ReactNode } from "react";

export type NextLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  children?: ReactNode;
};

/** Storybook stand-in for `next/link` (plain anchor, no client navigation). */
export default function Link({ href, children, ...rest }: NextLinkProps) {
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}
