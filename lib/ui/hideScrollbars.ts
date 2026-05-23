/** Scrollable regions: keep scroll, hide scrollbar chrome (WebKit + Firefox). */
export const hideScrollbarsSx = {
  scrollbarWidth: "none",
  msOverflowStyle: "none",
  "&::-webkit-scrollbar": {
    display: "none",
  },
} as const;
