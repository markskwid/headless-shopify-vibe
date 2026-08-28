import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  Code2,
  PackageOpen,
  PlugZap,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { CollectionCard } from "@/components/commerce/collection-card";
import { ProductCard } from "@/components/commerce/product-card";
import { HomePageBannerCarousel } from "@/components/editorial/home-page-banner";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { StorefrontHome } from "@/lib/shopify";
import type { HomePageBannerSlide } from "@/lib/sanity";
import { cn } from "@/lib/utils";

import { Reveal } from "./reveal";

const SHOPIFY_SETUP_URL =
  "https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/getting-started";

type StorefrontShellProps = {
  children: React.ReactNode;
};

function StorefrontShell({ children }: StorefrontShellProps) {
  return (
    <div className="relative flex min-h-[calc(100svh-var(--header-height))] flex-col overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-96 bg-[radial-gradient(circle_at_top_left,oklch(0.91_0.11_151_/_0.65),transparent_42%),radial-gradient(circle_at_top_right,oklch(0.93_0.08_77_/_0.55),transparent_38%)]" />
      <main className="relative z-10 flex-1">{children}</main>
    </div>
  );
}

export function SetupStorefront({ issues }: { issues: string[] }) {
  const steps = [
    {
      icon: PlugZap,
      title: "Create a storefront",
      description:
        "Install Shopify's Headless sales channel and create Storefront API credentials.",
    },
    {
      icon: Code2,
      title: "Add environment values",
      description:
        "Copy .env.example to .env.local, then add your permanent myshopify.com domain and token.",
    },
    {
      icon: Sparkles,
      title: "Start shaping the theme",
      description:
        "Restart the dev server. This page will switch to your live store and latest products.",
    },
  ];

  return (
    <StorefrontShell>
      <section className="mx-auto grid w-full max-w-7xl gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <Reveal>
          <Badge variant="secondary" className="mb-5">
            Theme-ready starter
          </Badge>
          <h1 className="max-w-3xl text-4xl leading-[1.02] font-semibold tracking-[-0.045em] text-balance sm:text-6xl lg:text-7xl">
            Your storefront starts with three env values.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            The commerce layer is ready. Connect any Shopify store without
            changing source code, then replace this starter surface with your
            own theme.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={SHOPIFY_SETUP_URL}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ size: "lg" })}
            >
              Shopify setup guide
              <ArrowUpRight data-icon="inline-end" />
            </a>
            <a
              href="https://ui.shadcn.com/docs/components"
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Browse components
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <Card className="border-0 bg-zinc-950 text-zinc-50 shadow-2xl shadow-emerald-950/10 ring-white/10">
            <CardHeader>
              <CardDescription className="font-mono text-xs text-zinc-400">
                .env.local
              </CardDescription>
              <CardTitle className="text-zinc-50">Store connection</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto rounded-lg bg-white/5 p-4 font-mono text-xs leading-6 text-zinc-300 ring-1 ring-white/10 sm:text-sm">
                <code>{`SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN=your_private_token
SHOPIFY_STOREFRONT_API_VERSION=2026-07`}</code>
              </pre>
              <div className="mt-4 rounded-lg border border-amber-300/15 bg-amber-300/5 p-3 text-xs leading-5 text-amber-100/80">
                {issues.map((issue) => (
                  <p key={issue} className="flex gap-2">
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                    {issue}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </section>

      <section className="border-t border-foreground/10 bg-background/55">
        <div className="mx-auto grid w-full max-w-7xl gap-4 px-5 py-10 sm:px-8 lg:grid-cols-3">
          {steps.map((step, index) => (
            <Reveal key={step.title} delay={0.08 + index * 0.06}>
              <Card className="h-full bg-background/75">
                <CardHeader>
                  <span className="mb-3 grid size-9 place-items-center rounded-lg bg-secondary">
                    <step.icon className="size-4" aria-hidden="true" />
                  </span>
                  <CardTitle>
                    {index + 1}. {step.title}
                  </CardTitle>
                  <CardDescription className="leading-6">
                    {step.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>
    </StorefrontShell>
  );
}

export function ConnectedStorefront({
  banners,
  data,
}: {
  banners: HomePageBannerSlide[];
  data: StorefrontHome;
}) {
  return (
    <StorefrontShell>
      {banners.length ? (
        <HomePageBannerCarousel banners={banners} />
      ) : (
        <section className="mx-auto w-full max-w-7xl px-5 pt-16 sm:px-8 sm:pt-24">
          <Reveal>
            <div className="flex max-w-4xl flex-col items-start">
              <Badge variant="secondary" className="mb-5">
                <Check className="size-3" aria-hidden="true" />
                Live Storefront API data
              </Badge>
              <h1 className="text-4xl leading-[1.02] font-semibold tracking-[-0.045em] text-balance sm:text-6xl lg:text-7xl">
                {data.shop.name}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                {data.shop.description ||
                  "Your Shopify store is connected. Start replacing this preview with your storefront experience."}
              </p>
            </div>
          </Reveal>
        </section>
      )}

      <section
        id="products"
        className={cn(
          "mx-auto w-full max-w-7xl scroll-mt-24 px-5 pb-16 sm:px-8 sm:pb-24",
          banners.length ? "pt-16 sm:pt-24" : "pt-14",
        )}
      >
        <div className="flex items-end justify-between gap-4 border-b border-foreground/10 pb-4">
          <div>
            <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Store preview
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Latest products
            </h2>
          </div>
          <p className="hidden text-sm text-muted-foreground sm:block">
            Cached for 5 minutes
          </p>
        </div>

        {data.products.nodes.length ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {data.products.nodes.map((product, index) => (
              <Reveal key={product.id} delay={Math.min(index * 0.04, 0.2)}>
                <ProductCard product={product} eager={index < 4} />
              </Reveal>
            ))}
          </div>
        ) : (
          <Card className="mt-6 border-dashed py-12 text-center">
            <CardContent>
              <PackageOpen className="mx-auto size-7 text-muted-foreground" />
              <CardTitle className="mt-4">No published products yet</CardTitle>
              <CardDescription className="mt-1">
                Publish a product to the Headless sales channel and refresh.
              </CardDescription>
            </CardContent>
          </Card>
        )}
      </section>

      {data.collections.nodes.length ? (
        <section className="border-t border-foreground/10 bg-background/60">
          <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
            <div className="flex items-end justify-between gap-4 border-b border-foreground/10 pb-4">
              <div>
                <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                  Browse by category
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Recent collections
                </h2>
              </div>
              <p className="hidden max-w-md text-right text-sm text-muted-foreground sm:block">
                Recently updated collections from Shopify
              </p>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.collections.nodes.map((collection, index) => (
                <Reveal
                  key={collection.id}
                  delay={Math.min(index * 0.04, 0.2)}
                >
                  <CollectionCard
                    collection={collection}
                    eager={!data.products.nodes.length && index < 3}
                  />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </StorefrontShell>
  );
}

export function StorefrontError({ message }: { message: string }) {
  return (
    <StorefrontShell>
      <section className="mx-auto flex w-full max-w-3xl px-5 py-24 sm:px-8">
        <Reveal className="w-full">
          <Card>
            <CardHeader>
              <span className="mb-3 grid size-10 place-items-center rounded-lg bg-destructive/10 text-destructive">
                <AlertTriangle className="size-5" aria-hidden="true" />
              </span>
              <CardTitle>Shopify could not be reached</CardTitle>
              <CardDescription className="leading-6">
                The environment values are present, but the Storefront API
                request failed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="rounded-lg bg-muted p-4 font-mono text-xs leading-5 text-muted-foreground">
                {message}
              </p>
              <a
                href={SHOPIFY_SETUP_URL}
                target="_blank"
                rel="noreferrer"
                className={cn(buttonVariants({ variant: "outline" }), "mt-5")}
              >
                Review connection setup
                <ArrowUpRight data-icon="inline-end" />
              </a>
            </CardContent>
          </Card>
        </Reveal>
      </section>
    </StorefrontShell>
  );
}
