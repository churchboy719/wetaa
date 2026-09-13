import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireLocationPermission } from "@/lib/auth/authorization";
import { permissions } from "@/lib/auth/permissions";

type RouteContext = {
  params: Promise<{
    locationId: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const { locationId } = await context.params;

    const location = await prisma.location.findUnique({
      where: {
        id: locationId,
      },
    });

    if (!location) {
      return NextResponse.json(
        {
          success: false,
          error: "Location not found.",
        },
        { status: 404 }
      );
    }

    await requireLocationPermission(
      location.businessId,
      locationId,
      permissions.locations.view
    );

    return NextResponse.json({
      success: true,
      tips: {
        enabled: location.tipsEnabled,
        suggestedAmounts: location.suggestedTipAmounts,
        allowCustomTip: location.allowCustomTip,
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          success: false,
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
          success: false,
          error: "You do not have access to this location.",
        },
        { status: 403 }
      );
    }

    console.error("Tips retrieval error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const { locationId } = await context.params;

    const location = await prisma.location.findUnique({
      where: {
        id: locationId,
      },
    });

    if (!location) {
      return NextResponse.json(
        {
          success: false,
          error: "Location not found.",
        },
        { status: 404 }
      );
    }

    await requireLocationPermission(
      location.businessId,
      locationId,
      permissions.locations.manage
    );

    const body = await request.json();

    const data: {
      tipsEnabled?: boolean;
      suggestedTipAmounts?: number[];
      allowCustomTip?: boolean;
    } = {};

    if (body.tipsEnabled !== undefined) {
      if (typeof body.tipsEnabled !== "boolean") {
        return NextResponse.json(
          {
            success: false,
            error: "tipsEnabled must be a boolean.",
          },
          { status: 400 }
        );
      }

      data.tipsEnabled = body.tipsEnabled;
    }

    if (body.suggestedTipAmounts !== undefined) {
      if (!Array.isArray(body.suggestedTipAmounts)) {
        return NextResponse.json(
          {
            success: false,
            error: "suggestedTipAmounts must be an array.",
          },
          { status: 400 }
        );
      }

      const validAmounts = body.suggestedTipAmounts.every(
        (amount: unknown) =>
          typeof amount === "number" &&
          Number.isInteger(amount) &&
          amount >= 0
      );

      if (!validAmounts) {
        return NextResponse.json(
          {
            success: false,
            error:
              "suggestedTipAmounts must contain non-negative integers in minor units.",
          },
          { status: 400 }
        );
      }

      data.suggestedTipAmounts =
        body.suggestedTipAmounts;
    }

    if (body.allowCustomTip !== undefined) {
      if (typeof body.allowCustomTip !== "boolean") {
        return NextResponse.json(
          {
            success: false,
            error: "allowCustomTip must be a boolean.",
          },
          { status: 400 }
        );
      }

      data.allowCustomTip = body.allowCustomTip;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid settings provided.",
        },
        { status: 400 }
      );
    }

    const updatedLocation =
      await prisma.location.update({
        where: {
          id: locationId,
        },
        data,
      });

    return NextResponse.json({
      success: true,
      tips: {
        enabled: updatedLocation.tipsEnabled,
        suggestedAmounts:
          updatedLocation.suggestedTipAmounts,
        allowCustomTip:
          updatedLocation.allowCustomTip,
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          success: false,
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
          success: false,
          error: "You do not have permission to manage tips.",
        },
        { status: 403 }
      );
    }

    console.error("Tips update error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong.",
      },
      { status: 500 }
    );
  }
}