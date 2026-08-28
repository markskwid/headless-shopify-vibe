import { z } from "zod";

const buyerIpSchema = z.union([z.ipv4(), z.ipv6()]);

export function parseBuyerIp(input: unknown) {
  if (typeof input !== "string") return undefined;

  const candidate = input.split(",", 1)[0]?.trim();
  const parsed = buyerIpSchema.safeParse(candidate);
  return parsed.success ? parsed.data : undefined;
}
