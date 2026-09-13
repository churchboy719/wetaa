import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

function hashToken(token: string) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function GET(
  request: Request,
  context: {
    params: Promise<{ token: string }>;
  }
) {
  try {
    const { token } = await context.params;

    if (!token) {
      return NextResponse.json(
        { error: "Invitation token is required." },
        { status: 400 }
      );
    }

    const tokenHash = hashToken(token);

    const invitation = await prisma.staffInvitation.findUnique({
      where: {
        tokenHash,
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            city: true,
            country: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        {
          error: "Invalid invitation.",
        },
        { status: 404 }
      );
    }

    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        {
          error: "This invitation is no longer available.",
          status: invitation.status,
        },
        { status: 410 }
      );
    }

    if (invitation.expiresAt <= new Date()) {
      await prisma.staffInvitation.update({
        where: {
          id: invitation.id,
        },
        data: {
          status: "EXPIRED",
        },
      });

      return NextResponse.json(
        {
          error: "This invitation has expired.",
        },
        { status: 410 }
      );
    }

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        business: invitation.business,
        location: invitation.location,
      },
    });
  } catch (error) {
    console.error("Invitation validation error:", error);

    return NextResponse.json(
      {
        error: "Internal server error.",
      },
      { status: 500 }
    );
  }
}