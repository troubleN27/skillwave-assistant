"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type StartItem = { id: string; name: string; date: string; months: string; label: string };

const FLIP_CHARS = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯABCDEFGHIJKLMNOPRSTUVWXYZ0123456789";
const CYCLE_MS = 4000;

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** One row of split-flap cells. On a new text each cell spins through random letters. */
function Flap({ text, width }: { text: string; width: number }) {
  const cells = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const target = [...text.toLocaleUpperCase().padEnd(width, " ")];
    const timers: number[] = [];
    const still = reducedMotion();
    cells.current.forEach((cell, i) => {
      if (!cell) return;
      const final = target[i] === " " ? "" : target[i];
      if (still || cell.textContent === final) {
        cell.textContent = final;
        return;
      }
      let spins = 4 + Math.floor(Math.random() * 7);
      const spin = () => {
        if (spins-- <= 0) {
          cell.textContent = final;
          return;
        }
        cell.textContent = FLIP_CHARS[Math.floor(Math.random() * FLIP_CHARS.length)];
        timers.push(window.setTimeout(spin, 50));
      };
      timers.push(window.setTimeout(spin, i * 12));
    });
    return () => timers.forEach(clearTimeout);
  }, [text, width]);

  return (
    <span className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${width}, minmax(0, 1.45rem))` }}>
      {Array.from({ length: width }, (_, i) => (
        <span
          key={i}
          ref={(el) => {
            cells.current[i] = el;
          }}
          className="relative grid aspect-[1/1.4] place-items-center bg-[#24211e] font-display text-[clamp(10px,3.1vw,22px)] leading-none font-black text-sun after:absolute after:inset-x-0 after:top-1/2 after:h-px after:bg-black"
        />
      ))}
    </span>
  );
}

/**
 * Departure-board row with the next cohorts. It switches to the next course
 * every few seconds and stops while hovered, focused, off screen or in a
 * hidden tab. Screen readers get the whole list instead of the moving row.
 */
export function StartsBoard({
  items,
  labels,
}: {
  items: StartItem[];
  labels: { title: string; profession: string; start: string; duration: string; show: string[] };
}) {
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);
  const [visible, setVisible] = useState(false);
  const board = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = board.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (held || !visible) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % items.length);
    }, CYCLE_MS);
    return () => clearInterval(timer);
  }, [held, visible, items.length]);

  const current = items[index];
  const nameWidth = Math.max(...items.map((item) => item.name.length));
  const dateWidth = Math.max(...items.map((item) => item.date.length));
  const monthsWidth = Math.max(...items.map((item) => item.months.length));

  return (
    <div
      ref={board}
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
      className="grid items-end gap-x-6 gap-y-4 bg-ink px-5 py-5 text-sun shadow-[8px_8px_0_rgba(18,17,16,0.22)] sm:px-6 md:grid-cols-[auto_1fr_auto_auto]"
    >
      <h2 id="starts-title" className="self-center font-display text-base leading-tight font-black uppercase">{labels.title}</h2>

      <ul className="sr-only">
        {items.map((item) => (
          <li key={item.id}>{item.label}</li>
        ))}
      </ul>

      <div aria-hidden className="contents">
        <div className="min-w-0">
          <p className="mb-1.5 text-[11px] font-bold text-sun/65">{labels.profession}</p>
          <Flap text={current.name} width={nameWidth} />
        </div>
        <div className="flex gap-6">
          <div>
            <p className="mb-1.5 text-[11px] font-bold text-sun/65">{labels.start}</p>
            <Flap text={current.date} width={dateWidth} />
          </div>
          <div className="md:hidden">
            <p className="mb-1.5 text-[11px] font-bold text-sun/65">{labels.duration}</p>
            <Flap text={current.months} width={monthsWidth} />
          </div>
        </div>
        <div className="hidden md:block">
          <p className="mb-1.5 text-[11px] font-bold text-sun/65">{labels.duration}</p>
          <Flap text={current.months} width={monthsWidth} />
        </div>
      </div>

      <div className="flex gap-1.5 md:col-span-4">
        {items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={labels.show[i]}
            aria-current={i === index || undefined}
            className="group py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sun"
          >
            <span className={cn("block h-1 w-6 transition-colors", i === index ? "bg-sun" : "bg-[#4a453f] group-hover:bg-sun/60")} />
          </button>
        ))}
      </div>
    </div>
  );
}
