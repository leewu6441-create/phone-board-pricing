import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "vertexglobal-hq-secret-change-me"
);

const COOKIE_NAME = "admin_session";

export interface AdminSession {
  id: number;
  email: string;
}

/**
 * Create a JWT token for the admin session.
 */
async function createToken(session: AdminSession): Promise<string> {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

/**
 * Verify a JWT token and return the session.
 */
async function verifyToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AdminSession;
  } catch {
    return null;
  }
}

/**
 * Login: verify credentials and set session cookie.
 */
export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const user = await prisma.adminUser.findUnique({
    where: { email },
  });

  if (!user) {
    return { success: false, error: "Email hoặc mật khẩu không đúng" };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { success: false, error: "Email hoặc mật khẩu không đúng" };
  }

  // Update last login
  await prisma.adminUser.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Create session token
  const token = await createToken({ id: user.id, email: user.email });

  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });

  return { success: true };
}

/**
 * Logout: clear session cookie.
 */
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Get current admin session from cookie.
 */
export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  return verifyToken(token);
}

/**
 * Create the initial admin user. Safe to call multiple times (upsert).
 */
export async function ensureAdminUser(
  email: string,
  password: string
): Promise<void> {
  const existing = await prisma.adminUser.findUnique({
    where: { email },
  });

  if (existing) return;

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.create({
    data: {
      email,
      passwordHash,
      displayName: "Admin",
    },
  });

  // Admin user created
}
