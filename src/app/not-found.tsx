import { NotFoundContent } from "@/components/layout/NotFoundContent";

// Unmatched URLs render outside the store layout, so this keeps a minimal brand header.
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="bg-grad-header py-3 text-center font-display text-[27px] font-semibold text-gold-light">
        swift<em className="font-medium text-ivory">.in</em>
      </header>
      <NotFoundContent />
    </main>
  );
}
