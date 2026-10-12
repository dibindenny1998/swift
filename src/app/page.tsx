import { ButtonLink, Eyebrow, Heading, Logo, Section } from "@/components/ui";

// Temporary landing page — the real home page is built in phase 2.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <header className="bg-grad-header px-4 py-4 text-center">
        <Logo />
      </header>
      <Section tone="hero" framed className="flex-1">
        <Eyebrow onDark>Christmas 2026</Eyebrow>
        <Heading level={1} onDark className="mt-3">
          Christmas, <br />
          wrapped in <em className="text-gold-shimmer">gold</em>
        </Heading>
        <p className="mt-4 text-[15px] text-on-red-muted">The shop opens on 10 November.</p>
        <ButtonLink href="/styleguide" className="mt-8">
          View the styleguide
        </ButtonLink>
      </Section>
    </main>
  );
}
