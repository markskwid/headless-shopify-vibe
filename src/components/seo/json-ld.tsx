import { headers } from "next/headers";

type JsonLdProps = {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
};

export async function JsonLd({ data }: JsonLdProps) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      nonce={nonce}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
