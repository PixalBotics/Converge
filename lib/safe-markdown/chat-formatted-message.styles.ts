import type { SxProps, Theme } from "@mui/material/styles";

/** Typography for AI/chat bubbles — paragraphs, lists, links, emphasis. */
export function chatFormattedMessageSx(linkColor?: string): SxProps<Theme> {
  const link = linkColor ?? "#2563eb";
  return {
    color: "inherit",
    fontSize: "inherit",
    lineHeight: 1.55,
    wordBreak: "break-word",
    "& p": {
      m: 0,
      "& + p": { mt: 0.75 },
    },
    "& ul, & ol": {
      m: 0,
      pl: 2.25,
      "& + p, & + ul, & + ol": { mt: 0.75 },
    },
    "& li": {
      mb: 0.35,
      "&:last-child": { mb: 0 },
    },
    "& li > p": {
      display: "inline",
      m: 0,
    },
    "& strong": { fontWeight: 700 },
    "& em": { fontStyle: "italic" },
    "& a": {
      color: link,
      fontWeight: 600,
      textDecoration: "underline",
      textUnderlineOffset: 2,
      "&:hover": { opacity: 0.88 },
    },
    "& code": {
      fontFamily: "ui-monospace, monospace",
      fontSize: "0.92em",
      px: 0.4,
      py: 0.1,
      borderRadius: 0.5,
      bgcolor: "rgba(15,23,42,0.06)",
    },
  };
}
