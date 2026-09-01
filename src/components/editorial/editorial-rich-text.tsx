import Link from "next/link";
import {
  PortableText,
  type PortableTextComponents,
  type PortableTextMarkComponentProps,
} from "next-sanity";

import type { EditorialRichText } from "@/lib/sanity";
import { safeLinkDestinationSchema } from "@/lib/validation/url";

type LinkMarkValue = {
  _type: "link";
  href?: unknown;
  openInNewTab?: unknown;
};

function RichTextLink({
  children,
  value,
}: PortableTextMarkComponentProps<LinkMarkValue>) {
  const href = safeLinkDestinationSchema.safeParse(value?.href);

  if (!href.success) return <>{children}</>;

  const openInNewTab = value?.openInNewTab === true;

  return (
    <Link
      href={href.data}
      className="font-medium underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
      target={openInNewTab ? "_blank" : undefined}
      rel={openInNewTab ? "noopener noreferrer" : undefined}
    >
      {children}
    </Link>
  );
}

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="leading-7 text-foreground/80">{children}</p>,
    h2: ({ children }) => (
      <h2 className="pt-5 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="pt-3 text-xl font-semibold tracking-tight text-balance sm:text-2xl">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-foreground/25 pl-5 text-lg leading-8 text-foreground/75 italic">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="ml-5 list-disc space-y-2 text-foreground/80 marker:text-muted-foreground">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="ml-5 list-decimal space-y-2 text-foreground/80 marker:font-medium marker:text-foreground">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="pl-1 leading-7">{children}</li>,
    number: ({ children }) => <li className="pl-1 leading-7">{children}</li>,
  },
  marks: {
    link: RichTextLink,
  },
};

export function EditorialRichText({ value }: { value: EditorialRichText }) {
  return (
    <div className="space-y-5">
      <PortableText value={value} components={components} />
    </div>
  );
}
