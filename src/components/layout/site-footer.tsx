import Image from "next/image";
import Link from "next/link";
import type { IconType } from "react-icons";
import {
  FaFacebookF,
  FaInstagram,
  FaPinterestP,
  FaTiktok,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

import { NewsletterForm } from "@/components/editorial/newsletter-form";
import {
  getFooterSettings,
  type FooterLinkColumn,
  type FooterSocialLink,
} from "@/lib/sanity";
import {
  getCustomerAccessTokenFromCookies,
  getCustomerNewsletterProfile,
  getStorefrontIdentity,
} from "@/lib/shopify";
import { getRequestSecurityContext } from "@/lib/security/request";

const defaultColumns: FooterLinkColumn[] = [
  {
    _key: "shop",
    title: "Shop",
    links: [
      {
        _key: "all-products",
        label: "All products",
        href: "/collections/all",
        openInNewTab: false,
      },
      {
        _key: "search",
        label: "Search",
        href: "/search",
        openInNewTab: false,
      },
    ],
  },
  {
    _key: "customer-care",
    title: "Customer care",
    links: [
      {
        _key: "account",
        label: "My account",
        href: "/account",
        openInNewTab: false,
      },
      {
        _key: "cart",
        label: "Cart",
        href: "/cart",
        openInNewTab: false,
      },
    ],
  },
];

const socialIcons: Record<FooterSocialLink["platform"], IconType> = {
  facebook: FaFacebookF,
  instagram: FaInstagram,
  pinterest: FaPinterestP,
  tiktok: FaTiktok,
  x: FaXTwitter,
  youtube: FaYoutube,
};

const socialLabels: Record<FooterSocialLink["platform"], string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  pinterest: "Pinterest",
  tiktok: "TikTok",
  x: "X",
  youtube: "YouTube",
};

function linkTarget(openInNewTab: boolean) {
  return openInNewTab
    ? { target: "_blank" as const, rel: "noreferrer" }
    : {};
}

export async function SiteFooter() {
  const customerAccessToken = await getCustomerAccessTokenFromCookies();
  let customerProfilePromise: ReturnType<
    typeof getCustomerNewsletterProfile
  > = Promise.resolve(null);

  if (customerAccessToken) {
    const { buyerIp } = await getRequestSecurityContext();
    customerProfilePromise = getCustomerNewsletterProfile(
      customerAccessToken,
      buyerIp,
    );
  }

  const [sanityResult, shopifyResult, customerResult] =
    await Promise.allSettled([
      getFooterSettings(),
      getStorefrontIdentity(),
      customerProfilePromise,
    ]);
  const settings =
    sanityResult.status === "fulfilled" ? sanityResult.value : null;
  const shopName =
    shopifyResult.status === "fulfilled"
      ? shopifyResult.value.shop.name
      : "Headless Vibe";
  const name = settings?.siteName || shopName;
  const footer = settings?.footer;
  const logo = footer?.logo ?? settings?.headerLogo ?? null;
  const description =
    footer?.description ||
    "Thoughtfully selected products, delivered through a modern shopping experience.";
  const columns = footer?.columns.length ? footer.columns : defaultColumns;
  const socialLinks = footer?.socialLinks ?? [];
  const newsletter = footer?.newsletter;
  const customerEmail =
    customerResult.status === "fulfilled"
      ? customerResult.value?.email || ""
      : "";

  return (
    <footer className="relative z-10 mt-auto border-t border-foreground/15 bg-foreground text-background">
      <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 sm:py-14 lg:px-8 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)_minmax(17rem,1fr)] lg:gap-10 xl:gap-16">
          <section aria-labelledby="footer-brand-heading">
            <h2 id="footer-brand-heading" className="sr-only">
              About {name}
            </h2>
            <Link
              href="/"
              aria-label={`${name} home`}
              className="inline-flex max-w-52 items-center rounded-md font-semibold tracking-[-0.025em] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-background/35"
            >
              {logo ? (
                <>
                  <Image
                    src={logo.url}
                    alt={logo.alt}
                    width={logo.width}
                    height={logo.height}
                    sizes="208px"
                    className="h-9 max-w-52 object-contain object-left"
                  />
                  <span className="sr-only">{name}</span>
                </>
              ) : (
                <span className="text-xl">{name}</span>
              )}
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-6 text-background/65">
              {description}
            </p>
            {socialLinks.length ? (
              <ul className="mt-6 flex flex-wrap gap-2" aria-label="Social media">
                {socialLinks.map((social) => {
                  const Icon = socialIcons[social.platform];
                  const label = socialLabels[social.platform];

                  return (
                    <li key={social._key}>
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${name} on ${label}`}
                        className="flex size-10 items-center justify-center rounded-full border border-background/15 text-background/70 transition-colors hover:border-background/35 hover:bg-background/10 hover:text-background focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-background/35"
                      >
                        <Icon className="size-4" aria-hidden="true" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </section>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <section key={column._key} aria-labelledby={`footer-${column._key}`}>
                <h2
                  id={`footer-${column._key}`}
                  className="text-sm font-semibold text-background"
                >
                  {column.title}
                </h2>
                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={link._key}>
                      <Link
                        href={link.href}
                        className="rounded-sm text-sm text-background/65 transition-colors hover:text-background focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-background/35"
                        {...linkTarget(link.openInNewTab)}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </nav>

          <section aria-labelledby="footer-newsletter-heading">
            <h2
              id="footer-newsletter-heading"
              className="text-lg font-semibold tracking-[-0.015em]"
            >
              {newsletter?.title || "Join our newsletter"}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-background/65">
              {newsletter?.description ||
                "Get product news, offers, and inspiration in your inbox."}
            </p>
            <NewsletterForm
              key={customerEmail || "guest"}
              initialEmail={customerEmail}
              emailPlaceholder={newsletter?.emailPlaceholder || "Email address"}
              buttonLabel={newsletter?.buttonLabel || "Subscribe"}
              consentNote={
                newsletter?.consentNote ||
                "By subscribing, you agree to receive marketing emails."
              }
            />
          </section>
        </div>

        <div className="mt-12 border-t border-background/15 pt-6 text-xs text-background/50">
          <p>
            &copy; {new Date().getFullYear()} {name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export function SiteFooterFallback() {
  return (
    <footer className="mt-auto border-t border-foreground/15 bg-foreground text-background">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-3 lg:px-8 lg:py-16">
        <div>
          <div className="h-8 w-36 animate-pulse rounded bg-background/15" />
          <div className="mt-5 h-16 max-w-sm animate-pulse rounded bg-background/10" />
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div className="h-32 animate-pulse rounded bg-background/10" />
          <div className="h-32 animate-pulse rounded bg-background/10" />
        </div>
        <div className="h-36 animate-pulse rounded bg-background/10" />
      </div>
    </footer>
  );
}
