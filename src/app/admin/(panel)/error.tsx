"use client";

import { TriangleAlertIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/** Admin section failed to load (e.g. database unavailable). */
export default function AdminError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-4 rounded-2xl border bg-background px-6 py-16 text-center"
    >
      <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <TriangleAlertIcon className="size-6" aria-hidden />
      </div>
      <div className="max-w-md">
        <p className="font-medium">Не удалось загрузить раздел</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Возможно, временно недоступна база данных или пропало подключение к интернету.
          Попробуйте ещё раз через несколько секунд.
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => retry()}>Попробовать снова</Button>
        <Button variant="outline" nativeButton={false} render={<Link href="/admin" />}>
          На главную
        </Button>
      </div>
    </div>
  );
}
