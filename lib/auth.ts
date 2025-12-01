import { cookies } from "next/headers";

const SESSION_COOKIE = "ps-shop-session";

export async function createSession(userId: string, username: string) {
  const sessionData = JSON.stringify({ userId, username, timestamp: Date.now() });
  (await cookies()).set(SESSION_COOKIE, sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);
  
  if (!sessionCookie) return null;
  
  try {
    const session = JSON.parse(sessionCookie.value);
    return session;
  } catch {
    return null;
  }
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function isAuthenticated() {
  const session = await getSession();
  return !!session;
}
