import Link from "next/link";
import { Mascot } from "@/components/mascot/Mascot";

export function NotFoundContent() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <Mascot width={140} greeting="Oops! Lost in the snow?" />
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-ink">Page not found</p>
      <h1 className="font-display text-[30px] font-medium leading-[1.15] text-green-heading">This one slipped off the sleigh</h1>
      <p className="text-[15px] text-muted">The page you&apos;re looking for has moved or never existed. Let&apos;s get you back to the good stuff.</p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Link href="/" className="flex h-12 items-center rounded-full bg-green-300 px-7 text-[15px] font-semibold text-ivory active:scale-[0.98]">
          Back home
        </Link>
        <Link href="/shop" className="flex h-12 items-center rounded-full border border-green-300 px-7 text-[15px] font-semibold text-green-300 active:scale-[0.98]">
          Shop the collection
        </Link>
      </div>
    </div>
  );
}
