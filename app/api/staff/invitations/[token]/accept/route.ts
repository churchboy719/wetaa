import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/authorization";

function hashToken(token: string) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function POST(
  request: Request,
  context: {
    params: Promise<{ token: string }>;
  }
) {
  try {
    const user = await requireAuth();
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
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invalid invitation." },
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
        { error: "This invitation has expired." },
        { status: 410 }
      );
    }

    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return NextResponse.json(
        {
          error:
            "This invitation was issued for a different email address.",
        },
        { status: 403 }
      );
    }

    const existingMembership =
      await prisma.staffMembership.findFirst({
        where: {
          userId: user.id,
          businessId: invitation.businessId,
        },
      });

    if (existingMembership) {
      return NextResponse.json(
        {
          error:
            "You already have a staff membership for this business.",
        },
        { status: 409 }
      );
    }

    const membership = await prisma.$transaction(async (tx) => {
      const createdMembership =
        await tx.staffMembership.create({
          data: {
            userId: user.id,
            businessId: invitation.businessId,
            locationId: invitation.locationId,
            role: invitation.role,
            status: "INVITED",
            isActive: false,
          },
        });

      await tx.staffInvitation.update({
        where: {
          id: invitation.id,
        },
        data: {
          status: "ACCEPTED",
        },
      });

      return createdMembership;
    });

    return NextResponse.json(
      {
        success: true,
        membership: {
          id: membership.id,
          businessId: membership.businessId,
          locationId: membership.locationId,
          role: membership.role,
          status: membership.status,
          isActive: membership.isActive,
        },
        invitation: {
          id: invitation.id,
          status: "ACCEPTED",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json(
          { error: "Authentication required." },
          { status: 401 }
        );
      }
    }

    console.error("Invitation acceptance error:", error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}