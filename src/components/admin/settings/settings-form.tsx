"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, PlusIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useFieldArray, useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { saveSettingsAction } from "@/app/admin/(panel)/settings/actions";
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
    <section className="grid gap-4 rounded-2xl border bg-background p-4 sm:p-5 lg:grid-cols-[16rem_1fr] lg:gap-8">
      <div>
        <h2 className="font-semibold">{title}</h2>
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
      setServerError("Не удалось сохранить. Проверьте подключение");
      return;
    }
    toast.success("Настройки сохранены и уже действуют");
    reset(values);
    router.refresh();
  }

  const err = (message?: string) => message;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4 pb-20">
      <Section title="Ассистент" description="Как ассистент представляется посетителям.">
        <Field id="assistantName" label="Имя ассистента" error={err(errors.assistantName?.message)}>
          <Input id="assistantName" {...register("assistantName")} />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field id="welcomeRu" label="Приветствие (русский)" error={err(errors.welcomeRu?.message)}>
            <Textarea id="welcomeRu" rows={4} {...register("welcomeRu")} />
          </Field>
          <Field id="welcomeEn" label="Приветствие (английский)" error={err(errors.welcomeEn?.message)}>
            <Textarea id="welcomeEn" rows={4} {...register("welcomeEn")} />
          </Field>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            id="quickQuestionsRu"
            label="Быстрые вопросы (русский)"
            hint="По одному на строку, не больше 4"
            error={err(errors.quickQuestionsRu?.message)}
          >
            <Textarea id="quickQuestionsRu" rows={4} {...register("quickQuestionsRu")} />
          </Field>
          <Field
            id="quickQuestionsEn"
            label="Быстрые вопросы (английский)"
            hint="One per line, up to 4"
            error={err(errors.quickQuestionsEn?.message)}
          >
            <Textarea id="quickQuestionsEn" rows={4} {...register("quickQuestionsEn")} />
          </Field>
        </div>
      </Section>

      <Section title="Контакты школы" description="Ассистент сообщает их, когда посетитель хочет связаться со школой.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field id="contactsRu" label="Контакты (русский)" error={err(errors.contactsRu?.message)}>
            <Textarea id="contactsRu" rows={5} {...register("contactsRu")} />
          </Field>
          <Field id="contactsEn" label="Контакты (английский)" error={err(errors.contactsEn?.message)}>
            <Textarea id="contactsEn" rows={5} {...register("contactsEn")} />
          </Field>
        </div>
      </Section>

      <Section title="Курсы в форме заявки" description="Список, из которого посетитель выбирает курс. Код используется ассистентом и в заявках — меняйте его осторожно.">
        <ul className="flex flex-col gap-3">
          {courses.fields.map((field, index) => {
            const e = errors.courses?.[index];
            return (
              <li key={field.id} className="grid gap-2 rounded-xl border p-3 sm:grid-cols-[10rem_1fr_1fr_auto] sm:items-start">
                <div>
                  <Input aria-label="Код курса" placeholder="код, напр. python" {...register(`courses.${index}.id`)} />
                  {e?.id && <p className="mt-1 text-xs text-destructive">{e.id.message}</p>}
                </div>
                <div>
                  <Input aria-label="Название на русском" placeholder="Название на русском" {...register(`courses.${index}.name_ru`)} />
                  {e?.name_ru && <p className="mt-1 text-xs text-destructive">{e.name_ru.message}</p>}
                </div>
                <div>
                  <Input aria-label="Название на английском" placeholder="Name in English" {...register(`courses.${index}.name_en`)} />
                  {e?.name_en && <p className="mt-1 text-xs text-destructive">{e.name_en.message}</p>}
                </div>
                <Button type="button" variant="ghost" size="icon" aria-label="Удалить курс" onClick={() => courses.remove(index)}>
                  <Trash2Icon />
                </Button>
              </li>
            );
          })}
        </ul>
        {errors.courses?.root?.message || errors.courses?.message ? (
          <p className="text-xs text-destructive">{errors.courses?.root?.message ?? errors.courses?.message}</p>
        ) : null}
        <Button
          type="button"
          variant="outline"
          className="w-fit"
          onClick={() => courses.append({ id: "", name_ru: "", name_en: "" })}
        >
          <PlusIcon /> Добавить курс
        </Button>
      </Section>

      <Section title="Встраивание на сайты" description="Сайты, на которых разрешено показывать виджет. Сайт школы разрешён всегда.">
        <Field
          id="allowedOrigins"
          label="Разрешённые сайты"
          hint="По одному адресу на строку, например https://partner.ru. Изменения вступают в силу в течение минуты."
          error={err(errors.allowedOrigins?.message)}
        >
          <Textarea id="allowedOrigins" rows={4} placeholder="https://partner.ru" {...register("allowedOrigins")} />
        </Field>
      </Section>

      <Section title="Лимиты и поиск" description="Защищают квоту Gemini API и качество ответов.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            id="maxMessagesPerConversation"
            label="Сообщений в одном диалоге"
            error={err(errors.maxMessagesPerConversation?.message)}
          >
            <Input id="maxMessagesPerConversation" type="number" inputMode="numeric" {...register("maxMessagesPerConversation")} />
          </Field>
          <Field
            id="maxMessagesPerDay"
            label="Сообщений в сутки на весь сайт"
            error={err(errors.maxMessagesPerDay?.message)}
          >
            <Input id="maxMessagesPerDay" type="number" inputMode="numeric" {...register("maxMessagesPerDay")} />
          </Field>
        </div>
        <Field
          id="minSimilarity"
          label="Порог уверенности поиска"
          hint="От 0.3 до 0.95. Если самый близкий фрагмент базы знаний похож на вопрос меньше, чем на порог, ассистент не отвечает сам, а предлагает заявку. Выше порог — меньше ответов не по теме, но больше «не знаю». Рекомендуемое значение 0.69 подобрано командой npm run eval."
          error={err(errors.minSimilarity?.message)}
        >
          <Input id="minSimilarity" type="number" step="0.01" min="0.3" max="0.95" inputMode="decimal" className="w-32" {...register("minSimilarity")} />
        </Field>
      </Section>

      <Section title="Уведомления" description="Сообщения о новых заявках в Telegram менеджеру.">
        <Controller
          control={control}
          name="telegramNotifications"
          render={({ field }) => (
            <label className="flex w-fit cursor-pointer items-center gap-3 text-sm">
              <Switch checked={field.value} onCheckedChange={field.onChange} />
              Отправлять заявки в Telegram
            </label>
          )}
        />
      </Section>

      <div className="sticky bottom-0 z-10 -mx-4 flex items-center gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting && <Loader2Icon className="animate-spin" />}
          Сохранить
        </Button>
        {isDirty && !isSubmitting && (
          <Button type="button" variant="ghost" onClick={() => reset(initial)}>
            Отменить изменения
          </Button>
        )}
        {serverError && (
          <p role="alert" className="text-sm text-destructive">
            {serverError}
          </p>
        )}
        {Object.keys(errors).length > 0 && !serverError && (
          <p role="alert" className="text-sm text-destructive">
            Проверьте отмеченные поля
          </p>
        )}
      </div>
    </form>
  );
}
