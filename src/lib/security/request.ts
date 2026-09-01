import "server-only";

import { headers } from "next/headers";

import { parseBuyerIp } from "@/lib/shopify/utils/buyer-ip";

import { getSecurityConfig } from "./env";

export type RequestSecurityContext = {
  buyerIp?: string;
  clientKey: string;
};

function boundedHeaderValue(value: string | null, maximum: number) {
  return value?.slice(0, maximum) ?? "unknown";
}

export function getRequestSecurityContextFromHeaders(
  requestHeaders: Headers,
): RequestSecurityContext {
  const { trustedProxyIpHeader } = getSecurityConfig();
  const buyerIp = parseBuyerIp(requestHeaders.get(trustedProxyIpHeader));

  return {
    buyerIp,
    clientKey:
      buyerIp ??
      [
        "unknown-ip",
        boundedHeaderValue(requestHeaders.get("user-agent"), 256),
        boundedHeaderValue(requestHeaders.get("accept-language"), 128),
      ].join(":"),
  };
}

export async function getRequestSecurityContext(): Promise<RequestSecurityContext> {
  return getRequestSecurityContextFromHeaders(await headers());
}
