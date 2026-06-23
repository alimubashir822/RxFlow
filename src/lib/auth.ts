import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { db } from "./db";

// Use next/headers for cookies in App Router
import { cookies as getCookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "rxflow-ai-super-secret-key-change-me-in-production-12345"
);

const COOKIE_NAME = "rxflow_session";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signToken(payload: { userId: string; role: string; email: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string; role: string; email: string };
  } catch (error) {
    return null;
  }
}

export async function getAuthUser() {
  const cookieStore = await getCookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  try {
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      include: {
        patient: true,
        doctor: true,
        pharmacy: true,
        caregiver: true,
      },
    });

    if (!user) return null;

    // Remove password hash from returned user object for safety
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  } catch (error) {
    return null;
  }
}

export async function logoutUser() {
  const cookieStore = await getCookies();
  cookieStore.delete(COOKIE_NAME);
}
