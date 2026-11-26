"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { leadFormSchema, PREFERRED_CHANNELS, type LeadFormInput } from "@/lib/validations/lead";
import { cn } from "@/lib/utils";

type Course = { id: string; name: string };

const inputClass =
  "w-full border-2 border-ink/30 bg-white px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft/60 focus:border-ink focus:shadow-[3px_3px_0_var(--color-ink)] aria-invalid:border-red-700";

export function LeadForm({
  courses,
  defaultCourseId,
  visitorId,
  conversationId,
  onSent,
  onCancel,
  bare = false,
}: {
  courses: Course[];
  defaultCourseId?: string;
  visitorId: string;
  /** Missing when the form is opened from the site rather than from the chat. */
  conversationId?: string;
  onSent: (name: string) => void;
  onCancel: () => void;
  /** Inside a dialog that already has a title and a close button. */
  bare?: boolean;
}) {
  const t = useTranslations("LeadForm");
  const id = useId();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormInput>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      contact: "",
      courseId: courses.some((c) => c.id === defaultCourseId) ? defaultCourseId : "",
      preferredChannel: "call",
      comment: "",
      consent: false as unknown as true,
    },
  });

  const errorText = (key?: string) =>
    key ? t(`errors.${key}` as "errors.generic") : undefined;

  async function onSubmit(values: LeadFormInput) {
    setServerError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...values, visitorId, conversationId, website: honeypotValue() }),
      });
      if (res.status === 429) {
        setServerError(t("errors.rateLimited"));
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      onSent(values.name.trim());
    } catch {
      setServerError(t("errors.generic"));
    }
  }

  const honeypotId = `${id}-website`;
  const honeypotValue = () =>
    (document.getElementById(honeypotId) as HTMLInputElement | null)?.value ?? "";

  const field = (name: string) => `${id}-${name}`;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className={cn("relative", !bare && "mt-2 border-2 border-ink bg-paper p-3")}
      aria-labelledby={`${id}-title`}
    >
      <div className={cn("mb-2 flex items-start justify-between gap-2", bare && "sr-only")}>
        <p id={`${id}-title`} className="text-sm font-bold text-ink">
          {t("title")}
        </p>
        {!bare && (
          <button
            type="button"
            onClick={onCancel}
            aria-label={t("cancel")}
            className="-mt-1 -mr-1 p-1 text-ink-soft hover:bg-ink/10 hover:text-ink"
          >
            <XIcon className="size-4" aria-hidden />
          </button>
        )}
      </div>

      {/* Honeypot: hidden from people and assistive tech. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={honeypotId}>Website</label>
        <input id={honeypotId} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col gap-2.5">
        <div>
          <label htmlFor={field("name")} className="mb-1 block text-xs font-semibold text-ink">
            {t("name")} *
          </label>
          <input
            id={field("name")}
            autoComplete="name"
            aria-invalid={!!errors.name}
            className={inputClass}
            {...register("name")}
          />
          {errors.name && <p className="mt-1 text-xs text-red-700">{errorText(errors.name.message)}</p>}
        </div>

        <div>
          <label htmlFor={field("contact")} className="mb-1 block text-xs font-semibold text-ink">
            {t("contact")} *
          </label>
          <input
            id={field("contact")}
            autoComplete="tel"
            inputMode="email"
            aria-invalid={!!errors.contact}
            aria-describedby={`${field("contact")}-hint`}
            className={inputClass}
            {...register("contact")}
          />
          <p id={`${field("contact")}-hint`} className="mt-1 text-[11px] text-ink-soft">
            {t("contactHint")}
          </p>
          {errors.contact && (
            <p className="mt-0.5 text-xs text-red-700">{errorText(errors.contact.message)}</p>
          )}
        </div>

        {courses.length > 0 && (
          <div>
            <label htmlFor={field("course")} className="mb-1 block text-xs font-semibold text-ink">
              {t("course")}
            </label>
            <select id={field("course")} className={inputClass} {...register("courseId")}>
              <option value="">{t("courseNone")}</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <fieldset>
          <legend className="mb-1 text-xs font-semibold text-ink">{t("channel")}</legend>
          <div className="flex flex-wrap gap-1.5">
            {PREFERRED_CHANNELS.map((channel) => (
              <label key={channel} className="cursor-pointer">
                <input
                  type="radio"
                  value={channel}
                  className="peer sr-only"
                  {...register("preferredChannel")}
                />
                <span className="inline-block border-2 border-ink/30 bg-white px-3 py-1 text-xs font-semibold text-ink transition-colors peer-checked:border-ink peer-checked:bg-ink peer-checked:text-sun peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink">
                  {t(`channels.${channel}`)}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor={field("comment")} className="mb-1 block text-xs font-semibold text-ink">
            {t("comment")}
          </label>
          <textarea
            id={field("comment")}
            rows={2}
            placeholder={t("commentPlaceholder")}
            aria-invalid={!!errors.comment}
            className={cn(inputClass, "resize-none")}
            {...register("comment")}
          />
          {errors.comment && (
            <p className="mt-1 text-xs text-red-700">{errorText(errors.comment.message)}</p>
          )}
        </div>

        <label className="flex cursor-pointer items-start gap-2 text-xs text-ink">
          <input
            type="checkbox"
            className="mt-0.5 size-4 shrink-0 accent-ink"
            aria-invalid={!!errors.consent}
            {...register("consent")}
          />
          <span>{t("consent")} *</span>
        </label>
        {errors.consent && (
          <p className="-mt-1.5 text-xs text-red-700">{errorText(errors.consent.message)}</p>
        )}

        {serverError && (
          <p role="alert" className="border-2 border-red-700 bg-red-50 px-3 py-2 text-xs text-red-800">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          // On the site (not in the chat) the submit button splashes ink, see MotionRoot.
          data-splash={bare || undefined}
          className="inline-flex h-11 items-center justify-center gap-2 bg-ink px-4 text-sm font-bold text-sun transition-colors hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-60"
        >
          {isSubmitting && <Loader2Icon className="size-4 animate-spin" aria-hidden />}
          {isSubmitting ? t("sending") : t("submit")}
        </button>
      </div>
    </form>
  );
}
