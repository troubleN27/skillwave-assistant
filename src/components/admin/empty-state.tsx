import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-ink bg-white px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center bg-ink text-sun">
        <Icon className="size-6" />
      </div>
      <div className="flex max-w-sm flex-col gap-1">
        <p className="font-medium">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
