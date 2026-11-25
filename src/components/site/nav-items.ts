/** Page sections linked from the header and footer, in page order. */
export const NAV_ITEMS = ["courses", "learning", "teachers", "payment", "contacts"] as const;

export type NavItem = (typeof NAV_ITEMS)[number];
