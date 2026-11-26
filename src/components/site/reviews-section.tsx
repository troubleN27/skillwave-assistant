import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Section, SectionTitle } from "./section";

type Review = { name: string; course: string; year: number; text: string };

// Cards are taped to the page at slightly different angles.
const TILTS = ["-rotate-1", "rotate-[0.8deg]", "-rotate-[0.6deg]", "rotate-1", "-rotate-[0.9deg]", "rotate-[0.5deg]"];

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

export function ReviewsSection() {
  const t = useTranslations("Site.reviews");
  const reviews = t.raw("items") as Review[];

  return (
    <Section labelledBy="reviews-title" className="pt-4 sm:pt-8">
      <SectionTitle id="reviews-title">{t("title")}</SectionTitle>
      <ul data-anim="tape" className="mt-12 gap-6 sm:columns-2 lg:columns-3">
        {reviews.map((review, i) => (
          <li key={review.name} className="mb-8 break-inside-avoid pt-3">
            <figure className={cn("relative bg-paper p-6 shadow-[4px_4px_0_var(--color-ink)]", TILTS[i % TILTS.length])}>
              {/* A strip of tape holding the card. */}
              <span aria-hidden className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-[-3deg] bg-ink" />
              <blockquote className="leading-relaxed">{review.text}</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span
                  aria-hidden
                  className="flex size-12 shrink-0 -rotate-6 items-center justify-center rounded-full border-[3px] border-ink font-display text-base font-black"
                >
                  {initials(review.name)}
                </span>
                <span className="text-sm leading-snug">
                  <span className="block font-bold">{review.name}</span>
                  <span className="text-ink-soft">
                    {review.course}, {t("graduated", { year: review.year })}
                  </span>
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  );
}
