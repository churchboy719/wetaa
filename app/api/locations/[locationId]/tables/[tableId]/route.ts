import { NextResponse } from "next/server";
import { TableStatus } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { requireLocationPermission } from "@/lib/auth/authorization";
import { permissions } from "@/lib/auth/permissions";

type RouteContext = {
  params: Promise<{
    locationId: string;
    tableId: string;
  }>;
};

async function getAuthorizedTable(
  locationId: string,
  tableId: string,
  permission: "tables:view" | "tables:manage"
) {
  const location = await prisma.location.findUnique({
    where: {
      id: locationId,
    },
  });

  if (!location) {
    throw new Error("LOCATION_NOT_FOUND");
  }

  await requireLocationPermission(
    location.businessId,
    locationId,
    permission
  );

  const table = await prisma.restaurantTable.findFirst({
    where: {
      id: tableId,
      locationId,
    },
  });

  if (!table) {
    throw new Error("TABLE_NOT_FOUND");
  }

  return table;
}

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { locationId, tableId } = await params;

    const table = await getAuthorizedTable(
      locationId,
      tableId,
      permissions.tables.view
    );

    return NextResponse.json({
      success: true,
      table,
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

      if (error.message === "LOCATION_NOT_FOUND") {
        return NextResponse.json(
          {
            success: false,
            error: "Location not found.",
          },
          { status: 404 }
        );
      }

      if (error.message === "TABLE_NOT_FOUND") {
        return NextResponse.json(
          {
            success: false,
            error: "Table not found.",
          },
          { status: 404 }
        );
      }
    }

    console.error(
      "GET /api/locations/[locationId]/tables/[tableId] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load table.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { locationId, tableId } = await params;
    const body = await request.json();

    const existingTable = await getAuthorizedTable(
      locationId,
      tableId,
      permissions.tables.manage
    );

    if (
      body.name !== undefined &&
      (typeof body.name !== "string" || !body.name.trim())
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Table name must be a non-empty string.",
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
      const duplicateTable =
        await prisma.restaurantTable.findFirst({
          where: {
            locationId,
            number: body.number,
            id: {
              not: existingTable.id,
            },
          },
        });

      if (duplicateTable) {
        return NextResponse.json(
          {
            success: false,
            error:
              "A table with this number already exists at this location.",
          },
          { status: 409 }
        );
      }
    }

    const table = await prisma.restaurantTable.update({
      where: {
        id: existingTable.id,
      },
      data: {
        ...(body.name !== undefined
          ? { name: body.name.trim() }
          : {}),
        ...(body.number !== undefined
          ? { number: body.number }
          : {}),
        ...(body.capacity !== undefined
          ? { capacity: body.capacity }
          : {}),
        ...(body.status !== undefined
          ? { status: body.status }
          : {}),
      },
    });

    return NextResponse.json({
      success: true,
      table,
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
            error: "You do not have permission to manage tables.",
          },
          { status: 403 }
        );
      }

      if (error.message === "LOCATION_NOT_FOUND") {
        return NextResponse.json(
          {
            success: false,
            error: "Location not found.",
          },
          { status: 404 }
        );
      }

      if (error.message === "TABLE_NOT_FOUND") {
        return NextResponse.json(
          {
            success: false,
            error: "Table not found.",
          },
          { status: 404 }
        );
      }
    }

    console.error(
      "PATCH /api/locations/[locationId]/tables/[tableId] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update table.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { locationId, tableId } = await params;

    const table = await getAuthorizedTable(
      locationId,
      tableId,
      permissions.tables.manage
    );

    const orderCount = await prisma.order.count({
      where: {
        tableId: table.id,
      },
    });

    if (orderCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This table cannot be deleted because it has associated orders.",
        },
        { status: 409 }
      );
    }

    await prisma.restaurantTable.delete({
      where: {
        id: table.id,
      },
    });

    return NextResponse.json({
      success: true,
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
            error: "You do not have permission to manage tables.",
          },
          { status: 403 }
        );
      }

      if (error.message === "LOCATION_NOT_FOUND") {
        return NextResponse.json(
          {
            success: false,
            error: "Location not found.",
          },
          { status: 404 }
        );
      }

      if (error.message === "TABLE_NOT_FOUND") {
        return NextResponse.json(
          {
            success: false,
            error: "Table not found.",
          },
          { status: 404 }
        );
      }
    }

    console.error(
      "DELETE /api/locations/[locationId]/tables/[tableId] error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete table.",
      },
      { status: 500 }
    );
  }
}