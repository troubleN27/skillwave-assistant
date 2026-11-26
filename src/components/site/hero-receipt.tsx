import type { HTMLAttributes } from "react";
import { useTranslations } from "next-intl";
import { LogoMark } from "@/components/brand/logo-mark";
import { Stamp } from "@/components/brand/stamp";

type Row = { label: string; value: string };

/* Barcode stripe widths (1–4 px), fixed so server and client markup match. */
const BARCODE = "31241321422131413212342113214231241312213142312413221341".split("").map(Number);

/* Torn zigzag bottom edge of a till receipt. */
const zigzag = "conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 50% / 14px 100%";

/** Props that keep an element hidden until the hero entrance animation runs. */
type HiddenProps = HTMLAttributes<HTMLDivElement> & { "data-hero-hidden": boolean };

/**
 * The school's key numbers printed as a till receipt, pinned to the page by
 * the round stamp. The numbers are a description list for screen readers.
 */
export function HeroReceipt({ hiddenProps }: { hiddenProps: HiddenProps }) {
  const t = useTranslations("Site.hero");
  const rows = t.raw("receipt.rows") as Row[];

  return (
    <div className="relative mx-auto w-full max-w-[380px] pt-16">
      <div data-hero-photo {...hiddenProps} className="-rotate-2 drop-shadow-[0_14px_16px_rgba(18,17,16,0.22)]">
        <div
          className="bg-white px-6 pt-20 pb-9 text-[15px] leading-snug text-ink"
          style={{ mask: zigzag, WebkitMask: zigzag }}
        >
          <div className="flex items-center justify-center gap-3">
            <LogoMark className="-my-2 size-14" />
            <div>
              <p className="font-display text-xl leading-none font-black">{t("receipt.title")}</p>
              <p className="mt-1 text-xs font-bold">{t("receipt.subtitle")}</p>
            </div>
          </div>

          <dl aria-label={t("receipt.label")} className="mt-4">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-baseline justify-between gap-3 border-b border-dashed border-ink/40 py-2"
              >
                <dt className="font-semibold">{row.label}</dt>
                <dd className="inline-block -rotate-2 font-display text-[25px] leading-none font-black whitespace-nowrap">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-3 flex flex-col items-center gap-1.5 border-t-2 border-ink pt-3">
            <span className="text-xs font-extrabold uppercase">{t("receipt.totalLabel")}</span>
            <span className="-rotate-[1.5deg] bg-ink px-3 py-1.5 font-display text-xl font-black text-sun uppercase">
              {t("receipt.total")}
            </span>
          </div>

          <div className="mt-4 flex h-10 justify-center gap-0.5" aria-hidden>
            {BARCODE.map((width, i) => (
              <span key={i} className="bg-ink" style={{ width }} />
            ))}
          </div>
          <p className="mt-3 text-center text-xs font-bold">{t("receipt.note")}</p>
        </div>
      </div>

      {/* The stamp pins the receipt to the page where tape would be. */}
      <div data-hero-stamp {...hiddenProps} className="absolute top-0 left-1/2 w-34 -translate-x-1/2 -rotate-10">
        <Stamp id="hero-stamp" top={t("stamp.top")} bottom={t("stamp.bottom")} />
      </div>
    </div>
  );
}
