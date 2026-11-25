import { Inter, Manrope, Tektur } from "next/font/google";

/** Admin panel and embedded chat (until their redesign). */
export const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

/** School site: body text. */
export const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

/** School site: headings and the wordmark. Variable font with a width axis. */
export const tektur = Tektur({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
  axes: ["wdth"],
  display: "swap",
});
