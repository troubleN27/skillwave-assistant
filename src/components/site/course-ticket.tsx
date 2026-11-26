"use client";

import { Dialog } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useChatOpen } from "@/components/chat/chat-context";
import { button } from "./buttons";
import { useLeadDialog } from "./lead-dialog";

export type CourseTicketData = {
  id: string;
  name: string;
  description: string;
  audience: string;
  schedule: string;
  workload: string;
  modules: string[];
  projectList: string[];
  duration: string;
  projects: string;
  start: string;
  monthly: string;
  fullPrice: string;
  payNowPrice: string;
  askPrompt: string;
};

type Labels = Record<
  | "details"
  | "close"
  | "audience"
  | "program"
  | "portfolio"
  | "schedule"
  | "workload"
  | "price"
  | "fullPrice"
  | "payNow"
  | "installments"
  | "leaveRequest"
  | "askAssistant",
  string
>;

/** A course as a paper ticket with a tear-off stub; opens full details in a side panel. */
export function CourseTicket({ course, labels }: { course: CourseTicketData; labels: Labels }) {
  const [open, setOpen] = useState(false);
  const { openChat } = useChatOpen();
  const openLead = useLeadDialog();
  const titleId = `course-${course.id}`;

  return (
    <article
      aria-labelledby={titleId}
      className="relative flex h-full flex-col bg-paper text-ink transition-transform duration-300 ease-out hover:-translate-y-1 hover:-rotate-1"
    >
      <div className="flex flex-1 flex-col p-6">
        <h3 id={titleId} className="font-display text-[1.7rem] leading-none font-black uppercase">
          {course.name}
        </h3>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{course.description}</p>
        <ul className="mt-auto flex flex-wrap gap-2 pt-5 text-sm font-semibold">
          <li className="border-2 border-ink px-2 py-0.5">{course.duration}</li>
          <li className="border-2 border-ink px-2 py-0.5">{course.projects}</li>
        </ul>
      </div>

      {/* Perforation: punched notches and a dashed tear line. */}
      <div className="relative" aria-hidden>
        <span className="absolute top-1/2 -left-3 size-6 -translate-y-1/2 rounded-full bg-ink" />
        <span className="absolute top-1/2 -right-3 size-6 -translate-y-1/2 rounded-full bg-ink" />
        <div className="mx-5 border-t-2 border-dashed border-ink/35" />
      </div>

      <div className="p-6 pt-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="text-sm font-semibold text-ink-soft">{course.start}</p>
          <p className="font-display text-2xl font-black whitespace-nowrap">{course.monthly}</p>
        </div>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger className={`${button.ink} mt-4 w-full`}>{labels.details}</Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Backdrop className="fixed inset-0 z-50 bg-ink/70 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
            <Dialog.Popup className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-paper text-ink transition-transform duration-300 data-ending-style:translate-x-full data-starting-style:translate-x-full">
              <div className="flex items-start justify-between gap-4 bg-ink px-6 py-5 text-sun">
                <div>
                  <Dialog.Title className="font-display text-3xl leading-none font-black uppercase">
                    {course.name}
                  </Dialog.Title>
                  <Dialog.Description className="mt-2 text-sm text-sun/80">
                    {course.duration} · {course.start}
                  </Dialog.Description>
                </div>
                <Dialog.Close
                  aria-label={labels.close}
                  className="-mt-1 -mr-2 inline-flex size-11 shrink-0 items-center justify-center hover:bg-sun/15 focus-visible:outline-2 focus-visible:outline-sun"
                >
                  <XIcon className="size-6" aria-hidden />
                </Dialog.Close>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6">
                <DetailBlock title={labels.audience}>
                  <p className="leading-relaxed">{course.audience}</p>
                </DetailBlock>

                <DetailBlock title={labels.program}>
                  <ol className="grid gap-2">
                    {course.modules.map((module, i) => (
                      <li key={module} className="flex gap-3">
                        <span className="font-display w-6 shrink-0 font-black">{i + 1}</span>
                        <span>{module}</span>
                      </li>
                    ))}
                  </ol>
                </DetailBlock>

                <DetailBlock title={labels.portfolio}>
                  <ul className="grid gap-2">
                    {course.projectList.map((project) => (
                      <li key={project} className="flex gap-3">
                        <span aria-hidden className="mt-2 size-2 shrink-0 bg-ink" />
                        <span>{project}</span>
                      </li>
                    ))}
                  </ul>
                </DetailBlock>

                <DetailBlock title={labels.schedule}>
                  <p>{course.schedule}</p>
                  <p className="mt-1 text-ink-soft">
                    {labels.workload}: {course.workload}
                  </p>
                </DetailBlock>

                <DetailBlock title={labels.price}>
                  <dl className="grid gap-2">
                    <PriceRow label={labels.fullPrice} value={course.fullPrice} />
                    <PriceRow label={labels.payNow} value={course.payNowPrice} />
                    <PriceRow label={labels.installments} value={course.monthly} strong />
                  </dl>
                </DetailBlock>
              </div>

              <div className="flex flex-wrap gap-3 border-t-2 border-ink px-6 py-4">
                <button
                  type="button"
                  className={button.ink}
                  onClick={() => {
                    setOpen(false);
                    openLead(course.id);
                  }}
                >
                  {labels.leaveRequest}
                </button>
                <button
                  type="button"
                  className={button.inkOutline}
                  onClick={() => {
                    setOpen(false);
                    openChat(course.askPrompt);
                  }}
                >
                  {labels.askAssistant}
                </button>
              </div>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </article>
  );
}

function DetailBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t-2 border-ink py-5 first:border-t-0 first:pt-0">
      <h3 className="mb-3 font-display text-lg font-black uppercase">{title}</h3>
      {children}
    </section>
  );
}

function PriceRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-dashed border-ink/30 pb-2">
      <dt className="text-ink-soft">{label}</dt>
      <dd className={strong ? "font-display text-xl font-black" : "font-semibold"}>{value}</dd>
    </div>
  );
}
