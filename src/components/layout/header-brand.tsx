import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

type HeaderLogo = {
  url: string;
  alt: string;
  width: number;
  height: number;
};

type HeaderBrandProps = {
  className?: string;
  logo: HeaderLogo | null;
  name: string;
};

export function HeaderBrand({ className, logo, name }: HeaderBrandProps) {
  return (
    <Link
      href="/"
      aria-label={`${name} home`}
      className={cn(
        "inline-flex min-w-0 items-center font-semibold tracking-[-0.025em] text-foreground focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      {logo ? (
        <>
          <Image
            src={logo.url}
            alt={logo.alt}
            width={logo.width}
            height={logo.height}
            sizes="(max-width: 1024px) 144px, 176px"
            className="h-8 max-w-36 object-contain object-left sm:max-w-44"
            loading="eager"
          />
          <span className="sr-only">{name}</span>
        </>
      ) : (
        <span className="truncate text-base sm:text-lg">{name}</span>
      )}
    </Link>
  );
}
