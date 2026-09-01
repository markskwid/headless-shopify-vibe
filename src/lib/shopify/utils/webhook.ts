import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyShopifyWebhookSignature({
  body,
  secret,
  signature,
}: {
  body: Uint8Array;
  secret: string;
  signature: string;
}) {
  if (!/^[A-Za-z0-9+/]{43}=$/.test(signature)) return false;

  const provided = Buffer.from(signature, "base64");
  const expected = createHmac("sha256", secret).update(body).digest();

  return (
    provided.byteLength === expected.byteLength &&
    timingSafeEqual(provided, expected)
  );
}
