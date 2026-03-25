interface RateLimitWindow {
  count: number;
  resetAt: number;
}

interface RateLimitInput {
  bucket: string;
  key: string;
  max: number;
  windowMs: number;
  now?: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
  resetAt: number;
}

interface SharedRateLimitInput extends RateLimitInput {
  supabase?: {
    rpc: (
      fn: string,
      args: Record<string, string | number>,
    ) => PromiseLike<{
      data: unknown;
      error: { message: string } | null;
    }>;
  } | null;
}

const windows = new Map<string, RateLimitWindow>();

function cleanupExpiredWindows(now: number) {
  for (const [key, window] of windows.entries()) {
    if (window.resetAt <= now) {
      windows.delete(key);
    }
  }
}

export function getRequestRateLimitKey(
  request: Request,
  bucket: string,
  subject: string,
) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const connectingIp = request.headers.get("cf-connecting-ip")?.trim();
  const clientIp = forwardedFor || realIp || connectingIp || "unknown-ip";

  return `${bucket}:${subject}:${clientIp}`;
}

export function consumeRequestRateLimit(input: RateLimitInput): RateLimitResult {
  const now = input.now ?? Date.now();
  cleanupExpiredWindows(now);

  const storeKey = `${input.bucket}:${input.key}`;
  const current = windows.get(storeKey);

  if (!current || current.resetAt <= now) {
    const nextWindow = {
      count: 1,
      resetAt: now + input.windowMs,
    };
    windows.set(storeKey, nextWindow);

    return {
      allowed: true,
      remaining: Math.max(0, input.max - nextWindow.count),
      retryAfterSeconds: Math.ceil(input.windowMs / 1000),
      resetAt: nextWindow.resetAt,
    };
  }

  current.count += 1;
  windows.set(storeKey, current);

  const allowed = current.count <= input.max;
  return {
    allowed,
    remaining: Math.max(0, input.max - current.count),
    retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    resetAt: current.resetAt,
  };
}

export async function consumeSharedRequestRateLimit(
  input: SharedRateLimitInput,
): Promise<RateLimitResult> {
  if (process.env.NODE_ENV === "test" || !input.supabase || typeof input.supabase.rpc !== "function") {
    return consumeRequestRateLimit(input);
  }

  const response = await input.supabase.rpc("consume_request_rate_limit", {
    p_bucket: input.bucket,
    p_key: input.key,
    p_max_count: input.max,
    p_window_ms: input.windowMs,
  });

  if (response.error) {
    throw new Error(`shared_rate_limit_failed:${response.error.message}`);
  }

  const row = Array.isArray(response.data) ? response.data[0] : response.data;
  const parsedRow = row as
    | {
        allowed: boolean;
        remaining: number;
        retry_after_seconds: number;
        reset_at: string;
      }
    | undefined;

  if (!parsedRow) {
    throw new Error("shared_rate_limit_empty");
  }

  return {
    allowed: parsedRow.allowed,
    remaining: parsedRow.remaining,
    retryAfterSeconds: parsedRow.retry_after_seconds,
    resetAt: Date.parse(parsedRow.reset_at),
  };
}

export function clearRequestRateLimitStore() {
  windows.clear();
}
