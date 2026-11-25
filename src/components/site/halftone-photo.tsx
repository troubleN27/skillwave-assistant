import Image from "next/image";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/*
 * Two-colour halftone in CSS: a grayscale photo is screened with a dot pattern,
 * a strong contrast filter turns that into solid black dots, and the result is
 * multiplied onto the yellow or paper stock. brightness() before contrast()
 * raises the ink threshold, so dark areas print with bigger dots.
 */
const printStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "#fff",
  filter: "brightness(0.74) contrast(1800%)",
  mixBlendMode: "multiply",
};
const imageStyle: CSSProperties = { filter: "grayscale(1) contrast(1.35) blur(0.4px)" };
const screenStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "radial-gradient(circle at center, #000 0, #fff 80%) 0 0 / 5px 5px",
  mixBlendMode: "screen",
};

/** A photo printed as black ink dots on yellow (or paper) stock. */
export function HalftonePhoto({
  src,
  alt,
  sizes,
  priority = false,
  stock = "sun",
  className,
  imageClassName,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  stock?: "sun" | "paper";
  className?: string;
  /** e.g. object-position tweaks for cropping. */
  imageClassName?: string;
}) {
  return (
    <div className={cn("relative isolate overflow-hidden", stock === "sun" ? "bg-sun" : "bg-paper", className)}>
      <div style={printStyle}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          style={imageStyle}
          className={cn("object-cover", imageClassName)}
        />
        <div style={screenStyle} aria-hidden />
      </div>
    </div>
  );
}
