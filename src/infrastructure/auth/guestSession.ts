import { cookies } from "next/headers";

const GUEST_SESSION_COOKIE_NAME = "ant_gravity_user_id";

export async function getOrCreateGuestUserId() {
  const cookieStore = await cookies();
  let userId = cookieStore.get(GUEST_SESSION_COOKIE_NAME)?.value;

  if (!userId) {
    userId = crypto.randomUUID();
    cookieStore.set(GUEST_SESSION_COOKIE_NAME, userId, {
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
  return cookieStore.get(GUEST_SESSION_COOKIE_NAME)?.value ?? null;
}
