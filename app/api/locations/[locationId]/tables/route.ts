import { NextResponse } from "next/server";
import { TableStatus } from "@prisma/client";

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
  { params }: RouteContext
) {
  try {
    const { locationId } = await params;

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
      permissions.tables.view
    );

    const tables = await prisma.restaurantTable.findMany({
      where: {
        locationId,
      },
      orderBy: [
        {
          number: "asc",
        },
        {
          createdAt: "asc",
        },
      ],
    });

    return NextResponse.json({
      success: true,
      tables,
    });
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
            error: "You do not have permission to view tables.",
          },
          { status: 403 }
        );
      }
    }

    console.error("GET /api/locations/[locationId]/tables error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load tables.",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { locationId } = await params;
    const body = await request.json();

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

    if (
      typeof body.name !== "string" ||
      !body.name.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Table name is required.",
        },
        { status: 400 }
      );
    }

    if (
      body.number !== undefined &&
      body.number !== null &&
      (!Number.isInteger(body.number) || body.number <= 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Table number must be a positive integer.",
        },
        { status: 400 }
      );
    }

    if (
      body.capacity !== undefined &&
      body.capacity !== null &&
      (!Number.isInteger(body.capacity) || body.capacity <= 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Table capacity must be a positive integer.",
        },
        { status: 400 }
      );
    }

    if (
      body.status !== undefined &&
      !Object.values(TableStatus).includes(body.status)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid table status.",
        },
        { status: 400 }
      );
    }

    if (
      body.number !== undefined &&
      body.number !== null
    ) {
      const existingTable = await prisma.restaurantTable.findFirst({
        where: {
          locationId,
          number: body.number,
        },
      });

      if (existingTable) {
        return NextResponse.json(
          {
            success: false,
            error: "A table with this number already exists at this location.",
          },
          { status: 409 }
        );
      }
    }

    const table = await prisma.restaurantTable.create({
      data: {
        locationId,
        name: body.name.trim(),
        number: body.number ?? null,
        capacity: body.capacity ?? null,
        status: body.status ?? TableStatus.AVAILABLE,
      },
    });

    return NextResponse.json(
      {
        success: true,
        table,
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
            error: "You do not have permission to manage tables.",
          },
          { status: 403 }
        );
      }
    }

    console.error("POST /api/locations/[locationId]/tables error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create table.",
      },
      { status: 500 }
    );
  }
}