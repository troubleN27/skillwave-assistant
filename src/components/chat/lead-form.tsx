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
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 aria-invalid:border-red-400";

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
      className={cn("relative", !bare && "mt-2 rounded-2xl border border-indigo-100 bg-white p-3 shadow-sm")}
      aria-labelledby={`${id}-title`}
    >
      <div className={cn("mb-2 flex items-start justify-between gap-2", bare && "sr-only")}>
        <p id={`${id}-title`} className="text-sm font-semibold text-slate-900">
          {t("title")}
        </p>
        {!bare && (
          <button
            type="button"
            onClick={onCancel}
            aria-label={t("cancel")}
            className="-mt-1 -mr-1 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
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
          <label htmlFor={field("name")} className="mb-1 block text-xs font-medium text-slate-700">
            {t("name")} *
          </label>
          <input
            id={field("name")}
            autoComplete="name"
            aria-invalid={!!errors.name}
            className={inputClass}
            {...register("name")}
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errorText(errors.name.message)}</p>}
        </div>

        <div>
          <label htmlFor={field("contact")} className="mb-1 block text-xs font-medium text-slate-700">
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
          <p id={`${field("contact")}-hint`} className="mt-1 text-[11px] text-slate-500">
            {t("contactHint")}
          </p>
          {errors.contact && (
            <p className="mt-0.5 text-xs text-red-600">{errorText(errors.contact.message)}</p>
          )}
        </div>

        {courses.length > 0 && (
          <div>
            <label htmlFor={field("course")} className="mb-1 block text-xs font-medium text-slate-700">
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
          <legend className="mb-1 text-xs font-medium text-slate-700">{t("channel")}</legend>
          <div className="flex flex-wrap gap-1.5">
            {PREFERRED_CHANNELS.map((channel) => (
              <label key={channel} className="cursor-pointer">
                <input
                  type="radio"
                  value={channel}
                  className="peer sr-only"
                  {...register("preferredChannel")}
                />
                <span className="inline-block rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 transition-colors peer-checked:border-indigo-600 peer-checked:bg-indigo-600 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500/40">
                  {t(`channels.${channel}`)}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor={field("comment")} className="mb-1 block text-xs font-medium text-slate-700">
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
            <p className="mt-1 text-xs text-red-600">{errorText(errors.comment.message)}</p>
          )}
        </div>

        <label className="flex cursor-pointer items-start gap-2 text-xs text-slate-700">
          <input
            type="checkbox"
            className="mt-0.5 size-4 shrink-0 accent-indigo-600"
            aria-invalid={!!errors.consent}
            {...register("consent")}
          />
          <span>{t("consent")} *</span>
        </label>
        {errors.consent && (
          <p className="-mt-1.5 text-xs text-red-600">{errorText(errors.consent.message)}</p>
        )}

        {serverError && (
          <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60"
        >
          {isSubmitting && <Loader2Icon className="size-4 animate-spin" aria-hidden />}
          {isSubmitting ? t("sending") : t("submit")}
        </button>
      </div>
    </form>
  );
}
