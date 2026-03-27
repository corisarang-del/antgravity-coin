import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const GUEST_SESSION_COOKIE_NAME = "ant_gravity_user_id";
const fallbackSecret = randomBytes(32).toString("hex");

function getGuestSessionSecret() {
  return process.env.GUEST_SESSION_SECRET?.trim() || fallbackSecret;
}

function signGuestUserId(userId: string) {
  return createHmac("sha256", getGuestSessionSecret()).update(userId).digest("hex");
}

function encodeGuestSession(userId: string) {
  return `${userId}.${signGuestUserId(userId)}`;
}

function decodeGuestSession(rawValue: string | undefined) {
  if (!rawValue) {
    return null;
  }

  const separatorIndex = rawValue.lastIndexOf(".");
  if (separatorIndex <= 0) {
    return null;
  }

  const userId = rawValue.slice(0, separatorIndex);
  const signature = rawValue.slice(separatorIndex + 1);
  const expectedSignature = signGuestUserId(userId);

  try {
    const signatureBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    if (
      signatureBuffer.length === 0 ||
      signatureBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return null;
    }
  } catch {
    return null;
  }

  return userId;
}

export async function getOrCreateGuestUserId() {
  const cookieStore = await cookies();
  let userId = decodeGuestSession(cookieStore.get(GUEST_SESSION_COOKIE_NAME)?.value);

  if (!userId) {
    userId = crypto.randomUUID();
    cookieStore.set(GUEST_SESSION_COOKIE_NAME, encodeGuestSession(userId), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return userId;
}

export async function getGuestUserId() {
  const cookieStore = await cookies();
  return decodeGuestSession(cookieStore.get(GUEST_SESSION_COOKIE_NAME)?.value);
}
