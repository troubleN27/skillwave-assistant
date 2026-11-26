import Image from "next/image";
import { cn } from "@/lib/utils";

/** A photo in a thick black frame with a hard offset shadow, like a print pasted on a poster. */
export function FramedPhoto({
  src,
  alt,
  sizes,
  className,
  imageClassName,
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  imageClassName?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden border-[3px] border-ink bg-ink shadow-[8px_8px_0_var(--color-ink)]", className)}>
      <Image src={src} alt={alt} fill sizes={sizes} className={cn("object-cover", imageClassName)} />
    </div>
  );
}
