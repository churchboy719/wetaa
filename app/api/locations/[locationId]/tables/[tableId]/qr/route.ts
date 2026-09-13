import crypto from "crypto";
import { NextResponse } from "next/server";
import { QRCodeType } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { requireLocationPermission } from "@/lib/auth/authorization";
import { permissions } from "@/lib/auth/permissions";

type RouteContext = {
  params: Promise<{
    locationId: string;
    tableId: string;
  }>;
};

export async function POST(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { locationId, tableId } = await params;

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
      permissions.tables.manage
    );

    const table = await prisma.restaurantTable.findUnique({
      where: {
        id: tableId,
      },
    });

    if (!table) {
      return NextResponse.json(
        {
          success: false,
          error: "Table not found.",
        },
        { status: 404 }
      );
    }

    if (table.locationId !== locationId) {
      return NextResponse.json(
        {
          success: false,
          error: "Table does not belong to this location.",
        },
        { status: 400 }
      );
    }

    if (table.status === "INACTIVE") {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot create a QR code for an inactive table.",
        },
        { status: 400 }
      );
    }

    // A table should have one active TABLE QR.
    const existingQRCode = await prisma.qRCode.findFirst({
      where: {
        tableId,
        type: QRCodeType.TABLE,
        active: true,
      },
    });

    if (existingQRCode) {
      return NextResponse.json({
        success: true,
        qrCode: existingQRCode,
        existing: true,
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    const qrCode = await prisma.qRCode.create({
      data: {
        businessId: location.businessId,
        locationId,
        tableId,
        type: QRCodeType.TABLE,
        token,
        target: `/menu?locationId=${locationId}&tableId=${tableId}`,
        active: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        qrCode,
        existing: false,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json(
          {
            success: false,
            error: "Authentication required.",
          },
          { status: 401 }
        );
      }

      if (error.message === "FORBIDDEN") {
        return NextResponse.json(
          {
            success: false,
            error: "You do not have permission to manage table QR codes.",
          },
          { status: 403 }
        );
      }
    }

    console.error(
      "POST /api/locations/[locationId]/tables/[tableId]/qr error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create table QR code.",
      },
      { status: 500 }
    );
  }
}