import Image from "next/image";
import Link from "next/link";
import { Clock3, Mail, MapPin, Phone } from "lucide-react";

import { EditorialRichText } from "@/components/editorial/editorial-rich-text";
import { buttonVariants } from "@/components/ui/button";
import type { EditorialPage, EditorialPageBlock } from "@/lib/sanity";
import { cn } from "@/lib/utils";

function linkTarget(openInNewTab: boolean) {
  return openInNewTab
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {};
}

function PageHero({ block }: { block: Extract<EditorialPageBlock, { _type: "pageHero" }> }) {
  return (
    <section className="border-b bg-muted/35">
      <div
        className={cn(
          "mx-auto grid min-h-[25rem] max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 lg:px-10",
          block.image && "lg:grid-cols-[minmax(0,0.9fr)_minmax(24rem,1.1fr)]",
        )}
      >
        <div className="max-w-3xl">
          {block.eyebrow ? (
            <p className="mb-4 text-sm font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              {block.eyebrow}
            </p>
          ) : null}
          <h1 className="text-4xl leading-[1.04] font-semibold tracking-[-0.04em] text-balance sm:text-5xl lg:text-6xl">
            {block.heading}
          </h1>
          {block.description ? (
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              {block.description}
            </p>
          ) : null}
          {block.cta ? (
            <Link
              href={block.cta.href}
              className={cn(buttonVariants({ size: "lg" }), "mt-7 h-11 px-5")}
              {...linkTarget(block.cta.openInNewTab)}
            >
              {block.cta.label}
            </Link>
          ) : null}
        </div>
        {block.image ? (
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-secondary shadow-sm">
            <Image
              src={block.image.url}
              alt={block.image.alt}
              fill
              loading="eager"
              fetchPriority="high"
              placeholder={block.image.lqip ? "blur" : "empty"}
              blurDataURL={block.image.lqip ?? undefined}
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function RichTextSection({
  block,
}: {
  block: Extract<EditorialPageBlock, { _type: "richTextSection" }>;
}) {
  return (
    <section className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      {block.heading ? (
        <h2 className="mb-7 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {block.heading}
        </h2>
      ) : null}
      <EditorialRichText value={block.body} />
    </section>
  );
}

function FaqSection({ block }: { block: Extract<EditorialPageBlock, { _type: "faqSection" }> }) {
  return (
    <section className="border-y bg-muted/25">
      <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {block.heading}
          </h2>
          {block.description ? (
            <p className="mt-4 leading-7 text-muted-foreground">{block.description}</p>
          ) : null}
        </div>
        <div className="mt-8 divide-y rounded-2xl border bg-background px-5 sm:px-7">
          {block.items.map((item) => (
            <details key={item._key} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-medium marker:hidden">
                <span>{item.question}</span>
                <span
                  className="text-xl leading-none text-muted-foreground transition-transform group-open:rotate-45 motion-reduce:transition-none"
                  aria-hidden="true"
                >
                  +
                </span>
              </summary>
              <div className="pt-4 pr-8">
                <EditorialRichText value={item.answer} />
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection({
  block,
}: {
  block: Extract<EditorialPageBlock, { _type: "contactSection" }>;
}) {
  const phoneHref = block.phone?.replace(/[^+\d]/g, "");
  const details = [
    block.email
      ? { label: "Email", value: block.email, href: `mailto:${block.email}`, icon: Mail }
      : null,
    block.phone && phoneHref
      ? { label: "Phone", value: block.phone, href: `tel:${phoneHref}`, icon: Phone }
      : null,
    block.address
      ? { label: "Address", value: block.address, href: null, icon: MapPin }
      : null,
    block.businessHours
      ? { label: "Business hours", value: block.businessHours, href: null, icon: Clock3 }
      : null,
  ].filter((detail) => detail !== null);

  return (
    <section id="contact" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-12 sm:px-8 sm:py-16">
      <div className="grid gap-9 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {block.heading}
          </h2>
          {block.description ? (
            <p className="mt-4 max-w-xl leading-7 text-muted-foreground">{block.description}</p>
          ) : null}
        </div>
        <dl className="grid gap-4 sm:grid-cols-2">
          {details.map((detail) => {
            const Icon = detail.icon;
            const content = <span className="whitespace-pre-line">{detail.value}</span>;

            return (
              <div key={detail.label} className="rounded-2xl border bg-card p-5">
                <dt className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Icon className="size-4" aria-hidden="true" />
                  {detail.label}
                </dt>
                <dd className="mt-3 leading-7">
                  {detail.href ? (
                    <a className="underline-offset-4 hover:underline" href={detail.href}>
                      {content}
                    </a>
                  ) : (
                    content
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}

function CalloutSection({
  block,
}: {
  block: Extract<EditorialPageBlock, { _type: "calloutSection" }>;
}) {
  return (
    <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="rounded-3xl bg-primary px-6 py-10 text-primary-foreground sm:px-10 sm:py-12">
        <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {block.heading}
        </h2>
        <p className="mt-4 max-w-2xl leading-7 text-primary-foreground/75">
          {block.description}
        </p>
        {block.cta ? (
          <Link
            href={block.cta.href}
            className={cn(
              buttonVariants({ variant: "secondary", size: "lg" }),
              "mt-7 h-11 px-5",
            )}
            {...linkTarget(block.cta.openInNewTab)}
          >
            {block.cta.label}
          </Link>
        ) : null}
      </div>
    </section>
  );
}

export function EditorialPageBuilder({ page }: { page: EditorialPage }) {
  const hasHero = page.pageBuilder[0]?._type === "pageHero";

  return (
    <main>
      {!hasHero ? (
        <header className="border-b bg-muted/25">
          <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl">
              {page.title}
            </h1>
          </div>
        </header>
      ) : null}
      {page.pageBuilder.map((block) => {
        switch (block._type) {
          case "pageHero":
            return <PageHero key={block._key} block={block} />;
          case "richTextSection":
            return <RichTextSection key={block._key} block={block} />;
          case "faqSection":
            return <FaqSection key={block._key} block={block} />;
          case "contactSection":
            return <ContactSection key={block._key} block={block} />;
          case "calloutSection":
            return <CalloutSection key={block._key} block={block} />;
        }
      })}
    </main>
  );
}
