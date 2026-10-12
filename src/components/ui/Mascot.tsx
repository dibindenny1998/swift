import Image from "next/image";
import { cn } from "@/lib/cn";

/** Static brand snowman. Animated footer scene comes in phase 2. */
export function Mascot({ size = 160, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/mascot.svg"
      alt=""
      width={size}
      height={Math.round(size * 1.25)}
      className={cn("select-none", className)}
      unoptimized
    />
  );
}
