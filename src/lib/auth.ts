import { cookies } from "next/headers";
import { prisma } from "./db";
import bcrypt from "bcryptjs";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "USER" | "STORE_OWNER" | "ADMIN";
}

const SESSION_COOKIE_NAME = "hive_session_user_id";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Returns current authenticated session user from cookie, or null if guest
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) return null;
    return user as SessionUser;
  } catch (error) {
    console.error("Error reading session:", error);
    return null;
  }
}

/**
 * Sets session cookie for a logged in user
 */
export async function setSessionCookie(userId: string) {
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Clears session cookie
 */
export async function clearSessionCookie() {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
