"use client";

import { CheckCircle2Icon, Loader2Icon, SearchIcon, XCircleIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import {
  runSearchTestAction,
  type SearchTestResult,
} from "@/app/admin/[lang]/(panel)/search-test/actions";
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

// Sample visitor questions in both knowledge base languages.
const EXAMPLES = [
  "Сколько стоит курс Python-разработчик?",
  "Есть ли рассрочка?",
  "Что изучают на курсе UX/UI?",
  "How much does the data analyst course cost?",
];

const percent = (value: number) => `${Math.round(value * 100)}%`;

export function SearchTestForm() {
  const t = useTranslations("Admin.searchTest");
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<SearchTestResult | null>(null);
  const [pending, startTransition] = useTransition();

  function run(value: string) {
    setQuestion(value);
    startTransition(async () => {
      try {
        setResponse(await runSearchTestAction({ question: value }));
      } catch {
        setResponse({ ok: false, error: t("offline") });
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
          aria-label={t("question")}
          placeholder={t("placeholder")}
          value={question}
          maxLength={1000}
          onChange={(event) => setQuestion(event.target.value)}
          className="h-9 bg-background"
        />
        <Button type="submit" size="lg" disabled={pending || !question.trim()}>
          {pending ? <Loader2Icon className="animate-spin" /> : <SearchIcon />}
          {t("submit")}
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
          title={t("emptyTitle")}
          description={t("emptyText")}
        />
      ) : !response.ok ? (
        <p role="alert" className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
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
  const t = useTranslations("Admin.searchTest");
  const { result, minSimilarity } = response;
  const confident = result.confident;

  return (
    <div className={cn("flex flex-col gap-4", pending && "opacity-60")}>
      <div
        className={cn(
          "flex items-start gap-3 rounded-md px-4 py-3 text-sm",
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
          {confident ? t("confident") : t("notConfident")}{" "}
          {t("summary", {
            max: percent(result.maxSimilarity),
            threshold: percent(minSimilarity),
            matches: result.textResultCount,
          })}
        </p>
      </div>

      {result.chunks.length === 0 ? (
        <EmptyState
          icon={SearchIcon}
          title={t("nothingTitle")}
          description={t("nothingText")}
        />
      ) : (
        <div className="overflow-hidden rounded-md border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 pl-4">#</TableHead>
                <TableHead>{t("columns.chunk")}</TableHead>
                <TableHead className="text-right">{t("columns.similarity")}</TableHead>
                <TableHead className="text-right">{t("columns.vector")}</TableHead>
                <TableHead className="text-right">{t("columns.text")}</TableHead>
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
