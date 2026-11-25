"use client";

import { Dialog } from "@base-ui/react/dialog";
import { MenuIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { NAV_ITEMS } from "./nav-items";

/** Header navigation for phones: a full-height black panel with large links. */
export function MobileMenu() {
  const t = useTranslations("Site");
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        aria-label={t("menu")}
        className="inline-flex size-11 items-center justify-center text-sun focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sun md:hidden"
      >
        <MenuIcon className="size-7" aria-hidden />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-ink/60 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-ink px-6 pt-5 pb-10 text-sun transition-transform duration-200 data-ending-style:translate-x-full data-starting-style:translate-x-full">
          <div className="flex items-center justify-between">
            <Dialog.Title className="font-display text-sm font-bold tracking-[0.2em] text-sun/70">
              {t("menu")}
            </Dialog.Title>
            <Dialog.Close
              aria-label={t("menuClose")}
              className="inline-flex size-11 items-center justify-center focus-visible:outline-2 focus-visible:outline-sun"
            >
              <XIcon className="size-7" aria-hidden />
            </Dialog.Close>
          </div>
          <nav aria-label={t("navLabel")} className="mt-8 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <a
                key={item}
                href={`#${item}`}
                onClick={() => setOpen(false)}
                className="py-2 font-display text-3xl font-black uppercase hover:text-paper focus-visible:outline-2 focus-visible:outline-sun"
              >
                {t(`nav.${item}`)}
              </a>
            ))}
          </nav>
          <a
            href="#courses"
            onClick={() => setOpen(false)}
            className="mt-auto inline-flex h-14 items-center justify-center bg-sun px-6 text-base font-bold text-ink hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sun"
          >
            {t("chooseCourse")}
          </a>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
