import Link from "next/link";

export function BackToAccount() {
  return (
    <Link href="/account" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-muted hover:text-text">
      <span aria-hidden>←</span> My account
    </Link>
  );
}

export function whatsappLink(number: string, text: string) {
  const digits = number.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}` : null;
}
