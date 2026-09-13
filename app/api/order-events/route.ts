import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireLocationPermission } from "@/lib/auth/authorization";
import { permissions } from "@/lib/auth/permissions";
import { OrderEventType } from "@prisma/client";

function errorResponse(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (
      error.message === "FORBIDDEN" ||
      error.message === "STAFF_NOT_ACTIVE"
    ) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }
  }

  console.error(error);

  return NextResponse.json(
    { success: false, error: "Internal server error" },
    { status: 500 }
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const locationId = searchParams.get("locationId");
    const businessId = searchParams.get("businessId");

    if (!businessId || !locationId) {
      return NextResponse.json(
        {
          success: false,
          error: "businessId and locationId are required",
        },
        { status: 400 }
      );
    }

    await requireLocationPermission(
      businessId,
      locationId,
      permissions.orders.view
    );

    const events = await prisma.orderEvent.findMany({
      where: {
        businessId,
        locationId,
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            orderType: true,
            status: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      events,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      businessId,
      locationId,
      orderId,
      type,
      message,
      metadata,
    } = body;

    if (!businessId || !locationId) {
      return NextResponse.json(
        {
          success: false,
          error: "businessId and locationId are required",
        },
        { status: 400 }
      );
    }

    if (type !== OrderEventType.MESSAGE) {
      return NextResponse.json(
        {
          success: false,
          error: "Only MESSAGE events can be created through this endpoint",
        },
        { status: 400 }
      );
    }

    if (
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "message is required",
        },
        { status: 400 }
      );
    }

    const access = await requireLocationPermission(
      businessId,
      locationId,
      permissions.orders.update
    );

    if (orderId) {
      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          businessId,
          locationId,
        },
      });

      if (!order) {
        return NextResponse.json(
          {
            success: false,
            error: "Order not found",
          },
          { status: 404 }
        );
      }
    }

    const event = await prisma.orderEvent.create({
      data: {
        businessId,
        locationId,
        orderId: orderId || null,
        type: OrderEventType.MESSAGE,
        message: message.trim(),
        createdById: access.userId,
        metadata: metadata ?? undefined,
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            orderType: true,
            status: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        event,
      },
      { status: 201 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}