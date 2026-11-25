"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useRef, type ReactNode } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

/*
 * All page motion lives here, driven by data attributes on server-rendered markup:
 *   data-hero-*        the page-load sequence of the first screen
 *   data-anim="stamp"  a heading pressed onto the page like a rubber stamp
 *   data-anim="splat"  an ink splat splashing out
 *   data-anim="deal"   children laid out one by one (tickets, cards)
 *   data-anim="tape"   children taped onto the page (reviews)
 *   data-count="12 000+"  a number that counts up to that final text
 *   data-splash        a button that spatters ink when clicked
 * Animations play once; the ticker tape runs on CSS.
 */
export function MotionRoot({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const q = gsap.utils.selector(root);
      const once = (trigger: Element, start = "top 85%") => ({ trigger, start, once: true });

      /* ---------- First screen: one orchestrated entrance ---------- */
      const title = q("[data-hero-title]")[0];
      if (title) {
        gsap.set(q("[data-hero-hidden]"), { autoAlpha: 1 });
        const split = SplitText.create(title, { type: "words" });
        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
        tl.from(split.words, {
          scale: 1.45,
          autoAlpha: 0,
          rotation: () => gsap.utils.random(-7, 7),
          duration: 0.5,
          stagger: 0.07,
        })
          .from(q("[data-hero-fade]"), { y: 18, autoAlpha: 0, duration: 0.6, stagger: 0.08 }, "-=0.2")
          .fromTo(
            q("[data-hero-photo]"),
            { clipPath: "circle(0% at 18% 22%)" },
            { clipPath: "circle(150% at 18% 22%)", duration: 1.1, ease: "power2.inOut" },
            0.25,
          )
          .from(
            q("[data-hero-splat]"),
            { scale: 0, autoAlpha: 0, duration: 0.55, ease: "back.out(2.2)", stagger: 0.12 },
            0.45,
          )
          .from(
            q("[data-hero-stamp]"),
            { scale: 1.9, rotation: -24, autoAlpha: 0, duration: 0.32, ease: "power3.in" },
            1.05,
          )
          .to(q("[data-hero-stamp]"), { x: 2, duration: 0.05, repeat: 3, yoyo: true, ease: "none" });
      }

      /* ---------- On scroll, once ---------- */
      q('[data-anim="stamp"]').forEach((el) => {
        gsap.from(el, {
          scale: 1.18,
          rotation: -2,
          autoAlpha: 0,
          duration: 0.45,
          ease: "power4.out",
          scrollTrigger: once(el),
        });
      });

      q('[data-anim="splat"]').forEach((el) => {
        gsap.from(el, {
          scale: 0,
          autoAlpha: 0,
          duration: 0.6,
          ease: "back.out(2.2)",
          scrollTrigger: once(el, "top 90%"),
        });
      });

      q('[data-anim="deal"]').forEach((list) => {
        gsap.from(list.children, {
          y: 70,
          rotation: () => gsap.utils.random(-5, 5),
          autoAlpha: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.09,
          scrollTrigger: once(list),
        });
      });

      q('[data-anim="tape"]').forEach((list) => {
        gsap.from(list.children, {
          scale: 1.12,
          rotation: () => gsap.utils.random(-8, 8),
          autoAlpha: 0,
          duration: 0.45,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: once(list),
        });
      });

      const locale = document.documentElement.lang === "ru" ? "ru-RU" : "en-US";
      q("[data-count]").forEach((el) => {
        // Read the target from the attribute: the text itself is overwritten while counting.
        const finalText = el.getAttribute("data-count") ?? "";
        const target = Number(finalText.replace(/\D/g, ""));
        const suffix = finalText.match(/[^\d\s ,]+$/)?.[0] ?? "";
        if (!target) return;
        const counter = { value: 0 };
        gsap.to(counter, {
          value: target,
          duration: 1.4,
          ease: "power2.out",
          scrollTrigger: once(el, "top 90%"),
          onUpdate: () => {
            el.textContent = `${Math.round(counter.value).toLocaleString(locale)}${suffix}`;
          },
          onComplete: () => {
            el.textContent = finalText;
          },
        });
      });

      /* ---------- Ink spatter on click ---------- */
      const spatter = contextSafe!((event: MouseEvent) => {
        const button = (event.target as Element).closest("[data-splash]");
        if (!button || !root.current) return;
        const color = getComputedStyle(button).backgroundColor;
        for (let i = 0; i < 10; i++) {
          const drop = document.createElement("span");
          const size = gsap.utils.random(4, 11);
          Object.assign(drop.style, {
            position: "fixed",
            left: `${event.clientX - size / 2}px`,
            top: `${event.clientY - size / 2}px`,
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: "50%",
            background: color === "rgba(0, 0, 0, 0)" ? "var(--color-ink)" : color,
            pointerEvents: "none",
            zIndex: "60",
          });
          document.body.appendChild(drop);
          const angle = gsap.utils.random(0, Math.PI * 2);
          const distance = gsap.utils.random(30, 80);
          gsap.to(drop, {
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance + 20,
            scale: gsap.utils.random(0.3, 0.8),
            autoAlpha: 0,
            duration: gsap.utils.random(0.45, 0.75),
            ease: "power2.out",
            onComplete: () => drop.remove(),
          });
        }
      });
      const element = root.current;
      element?.addEventListener("click", spatter);
      return () => element?.removeEventListener("click", spatter);
    },
    { scope: root },
  );

  return (
    <div ref={root} className="contents">
      {children}
    </div>
  );
}
