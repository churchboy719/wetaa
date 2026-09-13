import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";

const SESSION_COOKIE = "wetaa_session";
const SESSION_DURATION_DAYS = 30;

function hashToken(token: string) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);

  const expiresAt = new Date();

  expiresAt.setDate(
    expiresAt.getDate() + SESSION_DURATION_DAYS
  );

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return token;
}

export async function getCurrentSession() {
  const cookieStore = await cookies();

  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const tokenHash = hashToken(token);

  const session = await prisma.session.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: true,
    },
  });

  if (!session) {
    return null;
  }

  if (session.status !== "ACTIVE") {
    return null;
  }

  if (session.expiresAt <= new Date()) {
    await prisma.session.update({
      where: {
        id: session.id,
      },
      data: {
        status: "REVOKED",
      },
    });

    return null;
  }

  return session;
}

export async function destroySession() {
  const cookieStore = await cookies();

  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    const tokenHash = hashToken(token);

    const session = await prisma.session.findUnique({
      where: {
        tokenHash,
      },
    });

    if (session) {
      await prisma.session.update({
        where: {
          id: session.id,
        },
        data: {
          status: "REVOKED",
        },
      });
    }
  }

  cookieStore.delete(SESSION_COOKIE);
}