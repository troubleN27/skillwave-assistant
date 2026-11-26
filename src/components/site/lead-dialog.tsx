"use client";

import { Dialog } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { createContext, useCallback, useContext, useState, type ComponentProps, type ReactNode } from "react";
import { LeadForm } from "@/components/chat/lead-form";
import { getVisitorId } from "@/lib/chat/storage";

type Course = { id: string; name: string };
type OpenState = { visitorId: string; courseId?: string; sentName?: string } | null;

const LeadDialogContext = createContext<((courseId?: string) => void) | null>(null);

/** Lets any button on the page open the request form, optionally for a course. */
export function LeadDialogProvider({ courses, children }: { courses: Course[]; children: ReactNode }) {
  const t = useTranslations("Site.leadDialog");
  const [state, setState] = useState<OpenState>(null);

  const openLead = useCallback((courseId?: string) => {
    setState({ visitorId: getVisitorId(), courseId });
  }, []);
  const close = useCallback(() => setState(null), []);

  return (
    <LeadDialogContext.Provider value={openLead}>
      {children}
      <Dialog.Root open={state !== null} onOpenChange={(open) => !open && close()}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-ink/70 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
          <Dialog.Popup className="fixed inset-0 z-50 m-auto h-fit max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto bg-paper p-5 text-ink shadow-[8px_8px_0_var(--color-ink)] transition duration-200 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
            <div className="mb-3 flex items-start justify-between gap-3">
              <Dialog.Title className="font-display text-2xl font-black uppercase">{t("title")}</Dialog.Title>
              <Dialog.Close
                aria-label={t("close")}
                className="-mt-1 -mr-1 inline-flex size-10 shrink-0 items-center justify-center hover:bg-ink/10 focus-visible:outline-2 focus-visible:outline-ink"
              >
                <XIcon className="size-5" aria-hidden />
              </Dialog.Close>
            </div>
            {state?.sentName ? (
              <div role="status">
                <p className="text-base">{t("sent", { name: state.sentName })}</p>
                <Dialog.Close className="mt-5 inline-flex h-12 items-center bg-ink px-6 text-sm font-bold text-sun hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
                  {t("close")}
                </Dialog.Close>
              </div>
            ) : (
              state && (
                <LeadForm
                  courses={courses}
                  defaultCourseId={state.courseId}
                  visitorId={state.visitorId}
                  onSent={(name) => setState((s) => (s ? { ...s, sentName: name } : s))}
                  onCancel={close}
                  bare
                />
              )
            )}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </LeadDialogContext.Provider>
  );
}

export function useLeadDialog() {
  const openLead = useContext(LeadDialogContext);
  if (!openLead) throw new Error("useLeadDialog must be used within LeadDialogProvider");
  return openLead;
}

/** A button that opens the request form. */
export function LeadButton({
  courseId,
  ...props
}: Omit<ComponentProps<"button">, "onClick" | "type"> & { courseId?: string }) {
  const openLead = useLeadDialog();
  return <button type="button" onClick={() => openLead(courseId)} {...props} />;
}
