import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireLocationPermission } from "@/lib/auth/authorization";
import { permissions } from "@/lib/auth/permissions";

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ membershipId: string }>;
  }
) {
  try {
    const { membershipId } = await context.params;

    const body = await request.json();

    if (typeof body.isActive !== "boolean") {
      return NextResponse.json(
        {
          error: "isActive must be a boolean.",
        },
        { status: 400 }
      );
    }

    const membership = await prisma.staffMembership.findUnique({
      where: {
        id: membershipId,
      },
    });

    if (!membership) {
      return NextResponse.json(
        {
          error: "Staff membership not found.",
        },
        { status: 404 }
      );
    }

    if (!membership.locationId) {
      return NextResponse.json(
        {
          error: "Staff membership has no location.",
        },
        { status: 400 }
      );
    }

    await requireLocationPermission(
      membership.businessId,
      membership.locationId,
      permissions.staff.activate
    );

    const updatedMembership =
      await prisma.staffMembership.update({
        where: {
          id: membership.id,
        },
        data: {
          isActive: body.isActive,
          status: body.isActive ? "ACTIVE" : "SUSPENDED",
        },
      });

    return NextResponse.json({
      success: true,
      membership: {
        id: updatedMembership.id,
        userId: updatedMembership.userId,
        businessId: updatedMembership.businessId,
        locationId: updatedMembership.locationId,
        role: updatedMembership.role,
        status: updatedMembership.status,
        isActive: updatedMembership.isActive,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json(
          { error: "Authentication required." },
          { status: 401 }
        );
      }

      if (error.message === "FORBIDDEN") {
        return NextResponse.json(
          { error: "You do not have permission to activate staff." },
          { status: 403 }
        );
      }
    }

    console.error("Staff status update error:", error);

    return NextResponse.json(
      {
        error: "Internal server error.",
      },
      { status: 500 }
    );
  }
}