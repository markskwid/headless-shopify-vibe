import "server-only";

import { createHmac, randomBytes } from "node:crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { getSecurityConfig } from "./env";

const policies = {
  "account-write": { limit: 30, windowMs: 10 * 60_000, duration: "10 m" },
  "auth-login-account": { limit: 5, windowMs: 10 * 60_000, duration: "10 m" },
  "auth-login-ip": { limit: 10, windowMs: 10 * 60_000, duration: "10 m" },
  "auth-recover-account": { limit: 3, windowMs: 60 * 60_000, duration: "1 h" },
  "auth-recover-ip": { limit: 5, windowMs: 60 * 60_000, duration: "1 h" },
  "auth-register-account": { limit: 3, windowMs: 60 * 60_000, duration: "1 h" },
  "auth-register-ip": { limit: 5, windowMs: 60 * 60_000, duration: "1 h" },
  "cart-write": { limit: 60, windowMs: 60_000, duration: "1 m" },
  "locations-ip": { limit: 120, windowMs: 60_000, duration: "1 m" },
  "newsletter-account": { limit: 3, windowMs: 60 * 60_000, duration: "1 h" },
  "newsletter-ip": { limit: 5, windowMs: 60 * 60_000, duration: "1 h" },
  "search-ip": { limit: 60, windowMs: 60_000, duration: "1 m" },
} as const;

export type RateLimitPolicy = keyof typeof policies;

type LocalRateLimitEntry = {
  attempts: number[];
  lastSeen: number;
};

type RateLimitResult = {
  allowed: boolean;
  resetAt: number;
};

const MAX_LOCAL_IDENTIFIERS = 10_000;
const localRateLimitStore = new Map<string, LocalRateLimitEntry>();
const localSalt = randomBytes(32).toString("base64url");
const distributedLimiters = new Map<RateLimitPolicy, Ratelimit>();

function identifierDigest(policy: RateLimitPolicy, identifier: string) {
  const salt = getSecurityConfig().rateLimit?.keySalt ?? localSalt;

  return createHmac("sha256", salt)
    .update(`${policy}:${identifier}`)
    .digest("base64url");
}

function pruneLocalStore(now: number) {
  if (localRateLimitStore.size < MAX_LOCAL_IDENTIFIERS) return;

  for (const [key, entry] of localRateLimitStore) {
    const policy = key.slice(0, key.indexOf(":")) as RateLimitPolicy;
    const configuration = policies[policy];

    if (!configuration || entry.lastSeen + configuration.windowMs <= now) {
      localRateLimitStore.delete(key);
    }
  }

  if (localRateLimitStore.size < MAX_LOCAL_IDENTIFIERS) return;

  const oldest = [...localRateLimitStore.entries()].sort(
    (left, right) => left[1].lastSeen - right[1].lastSeen,
  )[0]?.[0];

  if (oldest) localRateLimitStore.delete(oldest);
}

function localLimit(policy: RateLimitPolicy, digest: string): RateLimitResult {
  const now = Date.now();
  const configuration = policies[policy];
  const key = `${policy}:${digest}`;
  const cutoff = now - configuration.windowMs;
  const previous = localRateLimitStore.get(key);
  const attempts = previous?.attempts.filter((attempt) => attempt > cutoff) ?? [];

  if (attempts.length >= configuration.limit) {
    localRateLimitStore.set(key, { attempts, lastSeen: now });
    return {
      allowed: false,
      resetAt: attempts[0] + configuration.windowMs,
    };
  }

  pruneLocalStore(now);
  attempts.push(now);
  localRateLimitStore.set(key, { attempts, lastSeen: now });

  return { allowed: true, resetAt: now + configuration.windowMs };
}

function getDistributedLimiter(policy: RateLimitPolicy) {
  const existing = distributedLimiters.get(policy);
  if (existing) return existing;

  const config = getSecurityConfig().rateLimit;
  if (!config) return null;

  const policyConfig = policies[policy];
  const limiter = new Ratelimit({
    redis: new Redis({ url: config.url, token: config.token }),
    limiter: Ratelimit.slidingWindow(
      policyConfig.limit,
      policyConfig.duration,
    ),
    analytics: false,
    prefix: `storefront-ratelimit:${policy}`,
    timeout: 1_200,
  });

  distributedLimiters.set(policy, limiter);
  return limiter;
}

export async function checkRateLimit(
  policy: RateLimitPolicy,
  identifier: string,
): Promise<RateLimitResult> {
  const digest = identifierDigest(policy, identifier);
  const limiter = getDistributedLimiter(policy);

  if (limiter) {
    try {
      const result = await limiter.limit(digest);

      if (result.reason !== "timeout") {
        return { allowed: result.success, resetAt: result.reset };
      }
    } catch {
      // Preserve abuse protection locally during a transient Redis outage.
    }
  }

  return localLimit(policy, digest);
}

export async function checkRateLimits(
  checks: Array<{ policy: RateLimitPolicy; identifier: string }>,
): Promise<RateLimitResult> {
  let latestAllowedReset = Date.now();

  for (const check of checks) {
    const result = await checkRateLimit(check.policy, check.identifier);

    if (!result.allowed) return result;
    latestAllowedReset = Math.max(latestAllowedReset, result.resetAt);
  }

  return { allowed: true, resetAt: latestAllowedReset };
}
