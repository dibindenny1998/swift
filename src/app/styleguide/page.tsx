import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  Eyebrow,
  Heading,
  IconButton,
  Input,
  Logo,
  Mascot,
  Pill,
  PriceTag,
  Section,
  StarDivider,
} from "@/components/ui";
import { DrawerDemo } from "./DrawerDemo";

export const metadata: Metadata = { title: "Styleguide", robots: { index: false } };

const swatches: { group: string; tokens: [string, string][] }[] = [
  {
    group: "Royal red",
    tokens: [
      ["red-50", "#EC3F51"],
      ["red-100", "#DA2E40"],
      ["red-200", "#C21F31"],
      ["red-300", "#9C1626"],
      ["red-400", "#740E1C"],
      ["red-500", "#4E0812"],
      ["red-sale", "#A3192B"],
    ],
  },
  {
    group: "Royal green",
    tokens: [
      ["green-50", "#19A26A"],
      ["green-100", "#13895A"],
      ["green-200", "#0F7A4E"],
      ["green-300", "#0B5E3E"],
      ["green-400", "#0A5537"],
      ["green-500", "#073D29"],
      ["green-600", "#05301F"],
      ["green-700", "#04261A"],
      ["green-heading", "#0A3D29"],
    ],
  },
  {
    group: "Gold",
    tokens: [
      ["gold-light", "#F3DC98"],
      ["gold-btn-top", "#F0D88E"],
      ["gold", "#E9C76A"],
      ["gold-line", "#D9B45A"],
      ["gold-btn-bottom", "#CFA13E"],
      ["gold-deep", "#C4952E"],
      ["gold-dark", "#A97E20"],
      ["gold-ink", "#8A6A1E"],
    ],
  },
  {
    group: "Neutrals",
    tokens: [
      ["ivory", "#FBF7EE"],
      ["card", "#FFFFFF"],
      ["border", "#ECE3CF"],
      ["divider", "#E6DCC4"],
      ["text", "#1F1B14"],
      ["muted", "#6B6352"],
    ],
  },
];

const gradients = [
  ["Header", "--grad-header"],
  ["Hero", "--grad-hero"],
  ["Announcement", "--grad-announce"],
  ["Gift box", "--grad-giftbox"],
  ["Footer", "--grad-footer"],
  ["Gold button", "--grad-gold-btn"],
];

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-t border-divider pt-8">
      <h2 className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-muted">{title}</h2>
      {children}
    </div>
  );
}

const CartIcon = () => (
  <svg aria-hidden width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
    <path d="M5 7h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 7Z" />
    <path d="M9 7V6a3 3 0 0 1 6 0v1" />
  </svg>
);

export default function StyleguidePage() {
  return (
    <main className="pb-24">
      <header className="bg-grad-header px-4 py-4 text-center">
        <Logo />
      </header>

      <Section>
        <Eyebrow>Design system</Eyebrow>
        <Heading level={1} className="mt-2">
          Styleguide
        </Heading>
        <p className="mt-3 max-w-xl text-[15px] text-muted">
          Every base component and token used across swift.in. Gold is an accent (~5%); gradients stay within one
          colour family.
        </p>

        <div className="mt-10 flex flex-col gap-12">
          <Block title="Colour tokens">
            <div className="flex flex-col gap-6">
              {swatches.map((s) => (
                <div key={s.group}>
                  <p className="mb-2 text-[13px] font-semibold">{s.group}</p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
                    {s.tokens.map(([name, hex]) => (
                      <div key={name} className="overflow-hidden rounded-sm border border-border bg-card">
                        <div className="h-12" style={{ background: hex }} />
                        <div className="px-2 py-1.5">
                          <p className="text-xs font-semibold">{name}</p>
                          <p className="text-xs text-muted">{hex}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Block>

          <Block title="Gradients">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {gradients.map(([name, v]) => (
                <div key={v} className="flex h-24 items-end rounded-sm p-3" style={{ background: `var(${v})` }}>
                  <span className="rounded-full bg-black/35 px-2 py-0.5 text-xs font-semibold text-white">{name}</span>
                </div>
              ))}
            </div>
          </Block>

          <Block title="Typography">
            <div className="flex flex-col gap-4">
              <Eyebrow>Christmas 2026 — eyebrow on ivory</Eyebrow>
              <Heading level={1}>
                Christmas, wrapped in <em className="text-gold-shimmer">gold</em>
              </Heading>
              <Heading level={2}>
                Signature <em>kits</em>
              </Heading>
              <Heading level={3}>The Classic Kit</Heading>
              <p className="text-base">Body 16 — Manrope regular. Delivered before Christmas, wrapped by hand.</p>
              <p className="text-[15px] text-muted">Body 15 muted — free shipping over ₹999.</p>
              <p className="text-xs text-muted">Caption 12 — the smallest size used anywhere.</p>
            </div>
          </Block>

          <Block title="Buttons">
            <div className="flex flex-wrap items-center gap-3">
              <Button>Shop the collection</Button>
              <Button variant="green">Add</Button>
              <Button variant="green" size="sm">
                View cart
              </Button>
              <ButtonLink href="/styleguide" variant="outline">
                View all products
              </ButtonLink>
              <Button variant="ghost">Build a gift box →</Button>
              <Button disabled>Disabled</Button>
              <IconButton aria-label="Open cart" className="text-green-heading hover:bg-black/5">
                <CartIcon />
                <span className="absolute right-0.5 top-0.5 flex size-[18px] items-center justify-center rounded-full bg-gold text-xs font-bold text-gold-on">
                  2
                </span>
              </IconButton>
            </div>
          </Block>

          <Block title="Pills & badges">
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone="sale">Save 15%</Pill>
              <Pill tone="gold">Gift wrapped</Pill>
              <Pill tone="green">In stock</Pill>
              <Pill tone="neutral">All</Pill>
              <Badge kind="LOW_STOCK" stock={4} />
              <Badge kind="NEW" />
              <Badge kind="BESTSELLER" />
            </div>
          </Block>

          <Block title="Price tags">
            <div className="flex flex-col gap-2">
              <PriceTag price={499900} mrp={599900} />
              <PriceTag price={499900} mrp={599900} showPercent size="lg" />
              <PriceTag price={12499900} />
            </div>
          </Block>

          <Block title="Cards">
            <div className="grid grid-cols-2 gap-3 sm:max-w-md">
              {[
                { title: "Nordic Pine Tree", price: 349900, mrp: 429900, img: "trees", badge: <Badge kind="LOW_STOCK" stock={4} /> },
                { title: "Royal Bauble Set", price: 69900, mrp: 89900, img: "ornaments", badge: <Badge kind="NEW" /> },
              ].map((p) => (
                <Card key={p.title} interactive className="p-2">
                  <div className="relative aspect-square overflow-hidden rounded-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/placeholders/${p.img}.svg`} alt="" className="size-full object-cover" />
                    <span className="absolute left-2 top-2">{p.badge}</span>
                  </div>
                  <div className="px-1 pb-1 pt-3">
                    <p className="text-[15px] font-semibold leading-snug">{p.title}</p>
                    <PriceTag className="mt-1" price={p.price} mrp={p.mrp} />
                  </div>
                </Card>
              ))}
            </div>
          </Block>

          <Block title="Inputs">
            <div className="grid max-w-md gap-4">
              <Input label="Phone number" prefix="+91" inputMode="numeric" placeholder="98765 43210" />
              <Input label="Pincode" hint="We'll show delivery dates for your area." inputMode="numeric" />
              <Input label="Email" type="email" defaultValue="hello@" error="Enter a valid email address." />
            </div>
          </Block>

          <Block title="Drawer">
            <DrawerDemo />
          </Block>

          <Block title="Divider & mascot">
            <StarDivider className="max-w-sm" />
            <Mascot width={120} className="mt-6" />
          </Block>
        </div>
      </Section>

      <Section tone="hero" framed>
        <Eyebrow onDark>Section · hero (framed)</Eyebrow>
        <Heading level={2} onDark className="mt-2">
          Christmas, wrapped in <em className="text-gold-shimmer">gold</em>
        </Heading>
        <p className="mt-3 text-[15px] text-on-red-muted">Red velvet hero with the thin gold frame inset 12px.</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button>Shop the collection</Button>
          <Button variant="outline-light">Build a gift box →</Button>
        </div>
      </Section>

      <Section tone="giftbox" framed>
        <Eyebrow onDark>Section · gift box (framed)</Eyebrow>
        <Heading level={2} onDark className="mt-2">
          Build your own <em>gift box</em>
        </Heading>
        <p className="mt-3 text-[15px] text-on-green-muted">Royal green feature section.</p>
        <Pill tone="on-dark" className="mt-4">
          Add one more to unlock 10% off
        </Pill>
      </Section>

      <Section tone="footer">
        <Eyebrow onDark>Section · footer</Eyebrow>
        <p className="mt-2 font-display text-[22px]">
          Last order for Christmas delivery is <em className="text-gold">December 18</em>
        </p>
        <StarDivider className="mt-6" />
        <div className="mt-6 flex items-center justify-between">
          <Logo />
          <p className="text-xs text-on-green-muted">© 2026 swift.in</p>
        </div>
      </Section>

      <div className="bg-grad-announce px-4 py-2.5 text-center text-xs font-semibold tracking-wide text-white">
        Complimentary gold gift wrap ✦ Free shipping over ₹999
      </div>
    </main>
  );
}
