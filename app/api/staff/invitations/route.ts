import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  requireLocationPermission,
} from "@/lib/auth/authorization";
import { permissions } from "@/lib/auth/permissions";

const INVITATION_DURATION_DAYS = 7;

const allowedRoles = [
  "MANAGER",
  "CASHIER",
  "WAITER",
  "KITCHEN",
] as const;

type StaffRole = (typeof allowedRoles)[number];

function hashToken(token: string) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const businessId =
      typeof body.businessId === "string"
        ? body.businessId.trim()
        : "";

    const locationId =
      typeof body.locationId === "string"
        ? body.locationId.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const role = body.role as StaffRole;

    if (!businessId) {
      return NextResponse.json(
        { error: "Business ID is required." },
        { status: 400 }
      );
    }

    if (!locationId) {
      return NextResponse.json(
        { error: "Location ID is required." },
        { status: 400 }
      );
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "A valid email is required." },
        { status: 400 }
      );
    }

    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid staff role." },
        { status: 400 }
      );
    }

    const access = await requireLocationPermission(
      businessId,
      locationId,
      permissions.staff.manage
    );

    const existingInvitation =
      await prisma.staffInvitation.findFirst({
        where: {
          businessId,
          locationId,
          email,
          status: "PENDING",
          expiresAt: {
            gt: new Date(),
          },
        },
      });

    if (existingInvitation) {
      return NextResponse.json(
        {
          error:
            "A pending invitation already exists for this email.",
        },
        { status: 409 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      const existingMembership =
        await prisma.staffMembership.findFirst({
          where: {
            userId: existingUser.id,
            businessId,
          },
        });

      if (existingMembership) {
        return NextResponse.json(
          {
            error:
              "This user is already associated with this business.",
          },
          { status: 409 }
        );
      }
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);

    const expiresAt = new Date();

    expiresAt.setDate(
      expiresAt.getDate() + INVITATION_DURATION_DAYS
    );

    const invitation =
      await prisma.staffInvitation.create({
        data: {
          businessId,
          locationId,
          invitedById: access.userId,
          email,
          role,
          tokenHash,
          expiresAt,
        },
      });

    return NextResponse.json(
      {
        success: true,
        invitation: {
          id: invitation.id,
          businessId: invitation.businessId,
          locationId: invitation.locationId,
          email: invitation.email,
          role: invitation.role,
          status: invitation.status,
          expiresAt: invitation.expiresAt,
        },

        // Temporary development value.
        // We will remove this when email delivery is added.
        invitationToken: token,
      },
      { status: 201 }
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          error: "Authentication required.",
        },
        { status: 401 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to invite staff.",
        },
        { status: 403 }
      );
    }

    console.error(
      "Staff invitation creation error:",
      error
    );

    return NextResponse.json(
      {
        error: "Something went wrong.",
      },
      { status: 500 }
    );
  }
}