"use client";

import { CheckCircle2Icon, Loader2Icon, SearchIcon, XCircleIcon } from "lucide-react";
import { useState, useTransition } from "react";
import {
  runSearchTestAction,
  type SearchTestResult,
} from "@/app/admin/(panel)/search-test/actions";
import { EmptyState } from "@/components/admin/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const EXAMPLES = [
  "Сколько стоит курс Python-разработчик?",
  "Есть ли рассрочка?",
  "Что изучают на курсе UX/UI?",
  "How much does the data analyst course cost?",
];

const percent = (value: number) => `${Math.round(value * 100)}%`;

export function SearchTestForm() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<SearchTestResult | null>(null);
  const [pending, startTransition] = useTransition();

  function run(value: string) {
    setQuestion(value);
    startTransition(async () => {
      try {
        setResponse(await runSearchTestAction({ question: value }));
      } catch {
        setResponse({ ok: false, error: "Нет связи с сервером. Попробуйте ещё раз" });
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          run(question);
        }}
      >
        <Input
          aria-label="Вопрос"
          placeholder="Введите вопрос так, как его задал бы посетитель"
          value={question}
          maxLength={1000}
          onChange={(event) => setQuestion(event.target.value)}
          className="h-9 bg-background"
        />
        <Button type="submit" size="lg" disabled={pending || !question.trim()}>
          {pending ? <Loader2Icon className="animate-spin" /> : <SearchIcon />}
          Найти
        </Button>
      </form>
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((example) => (
          <Button
            key={example}
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => run(example)}
          >
            {example}
          </Button>
        ))}
      </div>

      {!response ? (
        <EmptyState
          icon={SearchIcon}
          title="Задайте вопрос"
          description="Покажем фрагменты базы знаний, которые ассистент использует для ответа, и их близость к вопросу."
        />
      ) : !response.ok ? (
        <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {response.error}
        </p>
      ) : (
        <SearchResults response={response} pending={pending} />
      )}
    </div>
  );
}

function SearchResults({
  response,
  pending,
}: {
  response: Extract<SearchTestResult, { ok: true }>;
  pending: boolean;
}) {
  const { result, minSimilarity } = response;
  const confident = result.confident;

  return (
    <div className={cn("flex flex-col gap-4", pending && "opacity-60")}>
      <div
        className={cn(
          "flex items-start gap-3 rounded-xl px-4 py-3 text-sm",
          confident
            ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
            : "bg-amber-500/10 text-amber-800 dark:text-amber-300",
        )}
      >
        {confident ? (
          <CheckCircle2Icon className="mt-0.5 size-4 shrink-0" />
        ) : (
          <XCircleIcon className="mt-0.5 size-4 shrink-0" />
        )}
        <p>
          {confident
            ? "Вопрос прошёл бы порог уверенности — ассистент ответит по найденным фрагментам."
            : "Вопрос не прошёл бы порог уверенности — ассистент скажет, что не знает точного ответа, и предложит оставить заявку."}{" "}
          Максимальная близость {percent(result.maxSimilarity)}, порог {percent(minSimilarity)},
          полнотекстовых совпадений: {result.textResultCount}.
        </p>
      </div>

      {result.chunks.length === 0 ? (
        <EmptyState
          icon={SearchIcon}
          title="Ничего не найдено"
          description="В базе знаний пока нет проиндексированных документов."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 pl-4">#</TableHead>
                <TableHead>Фрагмент</TableHead>
                <TableHead className="text-right">Близость</TableHead>
                <TableHead className="text-right">Вектор</TableHead>
                <TableHead className="text-right">Текст</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.chunks.map((chunk, index) => (
                <TableRow key={chunk.id} className="align-top">
                  <TableCell className="pl-4 tabular-nums">{index + 1}</TableCell>
                  <TableCell className="max-w-xl whitespace-normal">
                    <p className="font-medium">{chunk.documentTitle}</p>
                    {chunk.heading && (
                      <p className="text-xs text-muted-foreground">{chunk.heading}</p>
                    )}
                    <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">
                      {chunk.content}
                    </p>
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right tabular-nums",
                      chunk.similarity >= minSimilarity ? "font-medium" : "text-muted-foreground",
                    )}
                  >
                    {percent(chunk.similarity)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {chunk.vectorRank ?? "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {chunk.textRank ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
