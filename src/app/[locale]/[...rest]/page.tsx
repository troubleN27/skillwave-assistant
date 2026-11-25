import { notFound } from "next/navigation";

// This route exists only to render the localized 404, so there is nothing
// for instant-navigation validation to check.
export const instant = false;

/** Any unknown path under /ru or /en renders the localized not-found page. */
export default function CatchAllPage() {
  notFound();
}
