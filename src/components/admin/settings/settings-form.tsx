"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, PlusIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";
import { useFieldArray, useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { saveSettingsAction } from "@/app/admin/[lang]/(panel)/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  settingsSchema,
  type SettingsFormValues,
  type SettingsValues,
} from "@/lib/validations/settings";

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="grid gap-4 border-2 border-ink bg-white shadow-[4px_4px_0_var(--color-ink)] p-4 sm:p-5 lg:grid-cols-[16rem_1fr] lg:gap-8">
      <div>
        <h2 className="font-display text-lg font-black uppercase">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="flex min-w-0 flex-col gap-4">{children}</div>
    </section>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function SettingsForm({ initial }: { initial: SettingsFormValues }) {
  const t = useTranslations("Admin.settings");
  const tv = useTranslations("Admin.validation");
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<SettingsFormValues, unknown, SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initial,
  });
  const courses = useFieldArray({ control, name: "courses" });

  async function onSubmit() {
    setServerError(null);
    // The action re-validates the raw form values with the same schema.
    const values = getValues();
    try {
      const result = await saveSettingsAction(values);
      if (!result.ok) {
        setServerError(result.error);
        return;
      }
    } catch {
      setServerError(t("offline"));
      return;
    }
    toast.success(t("saved"));
    reset(values);
    router.refresh();
  }

  // Schema messages are keys of Admin.validation.
  const err = (message?: string) => (message ? (tv.has(message) ? tv(message) : tv("formInvalid")) : undefined);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4 pb-20">
      <Section title={t("assistant.title")} description={t("assistant.description")}>
        <Field id="assistantName" label={t("assistant.name")} error={err(errors.assistantName?.message)}>
          <Input id="assistantName" {...register("assistantName")} />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field id="welcomeRu" label={t("assistant.welcomeRu")} error={err(errors.welcomeRu?.message)}>
            <Textarea id="welcomeRu" rows={4} {...register("welcomeRu")} />
          </Field>
          <Field id="welcomeEn" label={t("assistant.welcomeEn")} error={err(errors.welcomeEn?.message)}>
            <Textarea id="welcomeEn" rows={4} {...register("welcomeEn")} />
          </Field>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            id="quickQuestionsRu"
            label={t("assistant.quickRu")}
            hint={t("assistant.quickHint")}
            error={err(errors.quickQuestionsRu?.message)}
          >
            <Textarea id="quickQuestionsRu" rows={4} {...register("quickQuestionsRu")} />
          </Field>
          <Field
            id="quickQuestionsEn"
            label={t("assistant.quickEn")}
            hint={t("assistant.quickHint")}
            error={err(errors.quickQuestionsEn?.message)}
          >
            <Textarea id="quickQuestionsEn" rows={4} {...register("quickQuestionsEn")} />
          </Field>
        </div>
      </Section>

      <Section title={t("contacts.title")} description={t("contacts.description")}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field id="contactsRu" label={t("contacts.ru")} error={err(errors.contactsRu?.message)}>
            <Textarea id="contactsRu" rows={5} {...register("contactsRu")} />
          </Field>
          <Field id="contactsEn" label={t("contacts.en")} error={err(errors.contactsEn?.message)}>
            <Textarea id="contactsEn" rows={5} {...register("contactsEn")} />
          </Field>
        </div>
      </Section>

      <Section title={t("courses.title")} description={t("courses.description")}>
        <ul className="flex flex-col gap-3">
          {courses.fields.map((field, index) => {
            const e = errors.courses?.[index];
            return (
              <li key={field.id} className="grid gap-2 border border-ink/25 p-3 sm:grid-cols-[10rem_1fr_1fr_auto] sm:items-start">
                <div>
                  <Input aria-label={t("courses.code")} placeholder={t("courses.codePlaceholder")} {...register(`courses.${index}.id`)} />
                  {e?.id && <p className="mt-1 text-xs text-destructive">{err(e.id.message)}</p>}
                </div>
                <div>
                  <Input aria-label={t("courses.nameRu")} placeholder={t("courses.nameRu")} {...register(`courses.${index}.name_ru`)} />
                  {e?.name_ru && <p className="mt-1 text-xs text-destructive">{err(e.name_ru.message)}</p>}
                </div>
                <div>
                  <Input aria-label={t("courses.nameEn")} placeholder={t("courses.nameEn")} {...register(`courses.${index}.name_en`)} />
                  {e?.name_en && <p className="mt-1 text-xs text-destructive">{err(e.name_en.message)}</p>}
                </div>
                <Button type="button" variant="ghost" size="icon" aria-label={t("courses.remove")} onClick={() => courses.remove(index)}>
                  <Trash2Icon />
                </Button>
              </li>
            );
          })}
        </ul>
        {errors.courses?.root?.message || errors.courses?.message ? (
          <p className="text-xs text-destructive">{err(errors.courses?.root?.message ?? errors.courses?.message)}</p>
        ) : null}
        <Button
          type="button"
          variant="outline"
          className="w-fit"
          onClick={() => courses.append({ id: "", name_ru: "", name_en: "" })}
        >
          <PlusIcon /> {t("courses.add")}
        </Button>
      </Section>

      <Section title={t("embed.title")} description={t("embed.description")}>
        <Field
          id="allowedOrigins"
          label={t("embed.origins")}
          hint={t("embed.hint")}
          error={err(errors.allowedOrigins?.message)}
        >
          <Textarea id="allowedOrigins" rows={4} placeholder="https://partner.ru" {...register("allowedOrigins")} />
        </Field>
      </Section>

      <Section title={t("limits.title")} description={t("limits.description")}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            id="maxMessagesPerConversation"
            label={t("limits.perConversation")}
            error={err(errors.maxMessagesPerConversation?.message)}
          >
            <Input id="maxMessagesPerConversation" type="number" inputMode="numeric" {...register("maxMessagesPerConversation")} />
          </Field>
          <Field
            id="maxMessagesPerDay"
            label={t("limits.perDay")}
            error={err(errors.maxMessagesPerDay?.message)}
          >
            <Input id="maxMessagesPerDay" type="number" inputMode="numeric" {...register("maxMessagesPerDay")} />
          </Field>
        </div>
        <Field
          id="minSimilarity"
          label={t("limits.threshold")}
          hint={t("limits.thresholdHint")}
          error={err(errors.minSimilarity?.message)}
        >
          <Input id="minSimilarity" type="number" step="0.01" min="0.3" max="0.95" inputMode="decimal" className="w-32" {...register("minSimilarity")} />
        </Field>
      </Section>

      <Section title={t("notifications.title")} description={t("notifications.description")}>
        <Controller
          control={control}
          name="telegramNotifications"
          render={({ field }) => (
            <label className="flex w-fit cursor-pointer items-center gap-3 text-sm">
              <Switch checked={field.value} onCheckedChange={field.onChange} />
              {t("notifications.telegram")}
            </label>
          )}
        />
      </Section>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting && <Loader2Icon className="animate-spin" />}
          {t("save")}
        </Button>
        {isDirty && !isSubmitting && (
          <Button type="button" variant="ghost" onClick={() => reset(initial)}>
            {t("discard")}
          </Button>
        )}
        {serverError && (
          <p role="alert" className="text-sm text-destructive">
            {serverError}
          </p>
        )}
        {Object.keys(errors).length > 0 && !serverError && (
          <p role="alert" className="text-sm text-destructive">
            {t("checkFields")}
          </p>
        )}
      </div>
    </form>
  );
}
