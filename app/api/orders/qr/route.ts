import { NextResponse } from "next/server";
import {
  OrderSource,
  OrderType,
} from "@prisma/client";

import { resolveQRCode } from "@/lib/qr/qr-service";
import { createQROrder } from "@/lib/orders/order-creation";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (
      typeof body.qrToken !== "string" ||
      !body.qrToken.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "qrToken is required.",
        },
        { status: 400 }
      );
    }

    const qrCode = await resolveQRCode(
      body.qrToken
    );

    let orderType: OrderType;

    switch (qrCode.type) {
      case "TABLE":
        orderType = OrderType.DINE_IN;
        break;

      case "TAKEOUT":
        orderType = OrderType.TAKEOUT;
        break;

      case "DELIVERY":
        orderType = OrderType.DELIVERY;
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error:
              "This QR code cannot create an order.",
          },
          { status: 400 }
        );
    }

    const order = await createQROrder({
      businessId: qrCode.businessId,
      locationId: qrCode.locationId!,
      orderType,
      orderSource: OrderSource.QR,

      customerId:
        typeof body.customerId === "string"
          ? body.customerId
          : undefined,

      tableId:
        orderType === OrderType.DINE_IN
          ? qrCode.tableId!
          : undefined,

      items: body.items ?? [],

      tip:
        body.tip !== undefined
          ? body.tip
          : undefined,

      discount: 0,

      notes:
        typeof body.notes === "string"
          ? body.notes
          : undefined,

      delivery:
        orderType === OrderType.DELIVERY
          ? body.delivery
          : undefined,
    });

    return NextResponse.json(
      {
        success: true,
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "QR_CODE_NOT_FOUND"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "QR code not found.",
        },
        { status: 404 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "QR_CODE_INACTIVE"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "QR code is inactive.",
        },
        { status: 400 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "DINE_IN_REQUIRES_TABLE"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "A table is required for dine-in orders.",
        },
        { status: 400 }
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "DELIVERY_REQUIRES_DELIVERY_DETAILS"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Delivery details are required for delivery orders.",
        },
        { status: 400 }
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "ONE_OR_MORE_PRODUCTS_NOT_AVAILABLE"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "One or more requested products are unavailable.",
        },
        { status: 400 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "TIPS_NOT_ENABLED"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Tips are not enabled for this location.",
        },
        { status: 400 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "TIP_AMOUNT_NOT_ALLOWED"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "This tip amount is not allowed.",
        },
        { status: 400 }
      );
    }

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
          error: "You do not have permission to create orders.",
        },
        { status: 403 }
      );
    }

    console.error("QR order creation error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong.",
      },
      { status: 500 }
    );
  }
}
