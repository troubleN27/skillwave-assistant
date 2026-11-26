import { useTranslations } from "next-intl";
import { LogoMark } from "@/components/brand/logo-mark";
import { Stamp } from "@/components/brand/stamp";

/* A pen signature, drawn once. */
function Signature({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 60" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 44 C 16 10, 26 8, 24 34 C 22 52, 34 20, 44 18 C 52 16, 46 44, 56 40 C 66 36, 64 22, 74 24 C 84 26, 78 46, 90 42 C 104 38, 106 20, 118 22 C 128 24, 120 44, 134 40 C 150 35, 160 26, 194 20" />
      <path d="M40 52 C 80 46, 130 46, 170 40" />
    </svg>
  );
}

/**
 * A sample graduate certificate: black paper, yellow print, signed and stamped,
 * lying on top of the graduate's CV. Decorative — screen readers get a caption.
 */
export function Certificate() {
  const t = useTranslations("Site");
  const meta = t.raw("career.sample.meta") as string[];

  return (
    <figure className="relative mx-auto w-full max-w-[560px] py-6">
      <figcaption className="sr-only">{t("career.sample.label")}</figcaption>

      <div aria-hidden>
        {/* The CV peeking out from under the certificate. */}
        <div className="absolute top-0 -right-1.5 h-[86%] w-[62%] rotate-6 bg-white px-5 py-5 shadow-[0_10px_20px_rgba(18,17,16,0.15)]">
          <p className="font-display text-[15px] leading-none font-black">{t("career.sample.name")}</p>
          <p className="mt-1 text-[11px] font-bold text-ink-soft">{t("courses.items.frontend.name")}</p>
          {["w-2/5 h-2.5 bg-ink mt-5", "mt-2.5", "mt-2.5", "mt-2.5 w-3/5", "w-2/5 h-2.5 bg-ink mt-5", "mt-2.5", "mt-2.5 w-3/5"].map((bar, i) => (
            <span key={i} className={`block h-[7px] bg-[#e6e2d6] ${bar}`} />
          ))}
        </div>

        <div className="relative aspect-[1.414] -rotate-2 bg-ink p-[4.2%] text-sun shadow-[0_16px_26px_rgba(18,17,16,0.25)]">
          <div className="pointer-events-none absolute inset-[3%] border-[3px] border-sun outline-1 -outline-offset-8 outline-sun" />
          <div className="relative flex h-full flex-col px-[5%] py-[3%]">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 font-display text-[clamp(10px,1.6vw,14px)] font-black tracking-wide">
                <LogoMark inverted className="-my-1 size-[clamp(24px,4vw,34px)]" />
                SKILLWAVE ACADEMY
              </span>
              <span className="text-right text-[clamp(9px,1.3vw,11.5px)] font-bold text-white">{t("career.sample.number")}</span>
            </div>

            <p className="mt-[5%] font-display text-[clamp(26px,6vw,50px)] leading-[0.9] font-black uppercase">
              {t("career.sample.title")}
            </p>
            <p className="mt-[3%] text-[clamp(10px,1.5vw,13px)] font-semibold text-[#d8d4c4]">{t("career.sample.issued")}</p>
            <p className="mt-[1.5%]">
              <span className="bg-sun px-2 py-0.5 font-display text-[clamp(17px,3.4vw,28px)] leading-tight font-black text-ink">
                {t("career.sample.name")}
              </span>
            </p>
            <p className="mt-[2.5%] text-[clamp(10.5px,1.6vw,14px)] leading-snug font-bold text-white">
              {t("career.sample.course", { course: t("courses.items.frontend.name") })}
            </p>
            <p className="mt-[1%] text-[clamp(9px,1.35vw,11.5px)] leading-snug font-semibold text-[#d8d4c4]">
              {meta.map((item, i) => (
                // The last detail is dropped on narrow screens to keep clear of the signature.
                <span key={item} className={i === meta.length - 1 ? "max-sm:hidden" : undefined}>
                  {i > 0 && " · "}
                  {item}
                </span>
              ))}
            </p>

            <div className="mt-auto flex items-end justify-between gap-3">
              <div className="relative min-w-[42%]">
                <Signature className="absolute bottom-[62%] left-[4%] w-[70%] text-white" />
                <p className="border-t-[1.5px] border-sun pt-1 text-[clamp(9px,1.35vw,11.5px)] leading-snug font-bold text-white">
                  {t("career.sample.signName")}
                  <span className="block font-semibold text-[#d8d4c4]">{t("career.sample.signRole")}</span>
                </p>
              </div>
              <p className="text-right text-[clamp(9px,1.35vw,11.5px)] leading-snug font-bold text-white">
                {t("career.sample.date")}
                <span className="block font-semibold text-[#d8d4c4]">{t("career.sample.dateLabel")}</span>
              </p>
            </div>

            <Stamp
              id="certificate-stamp"
              inverted
              top={t("hero.stamp.top")}
              bottom={t("hero.stamp.bottom")}
              className="absolute right-[26%] -bottom-[12%] w-[25%] -rotate-12 max-sm:right-[30%] max-sm:-bottom-[13%] max-sm:w-[22%]"
            />
          </div>
        </div>
      </div>
    </figure>
  );
}
