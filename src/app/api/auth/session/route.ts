import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "ant_gravity_user_id";

export async function GET() {
  const cookieStore = await cookies();
  let userId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!userId) {
    userId = crypto.randomUUID();
    cookieStore.set(SESSION_COOKIE_NAME, userId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return NextResponse.json({
    userId,
  });
}
