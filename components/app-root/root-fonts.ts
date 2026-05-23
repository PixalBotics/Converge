import { Inter, Manrope } from "next/font/google";

export const fontInter = Inter({ subsets: ["latin"], display: "swap" });
export const fontManrope = Manrope({ subsets: ["latin"], display: "swap" });

export function rootFontFamilyCss(): string {
  return `${fontInter.style.fontFamily}, ${fontManrope.style.fontFamily}, sans-serif`;
}
