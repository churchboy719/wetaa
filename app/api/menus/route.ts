import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireLocationPermission } from "@/lib/auth/authorization";
import { permissions } from "@/lib/auth/permissions";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const locationId = searchParams.get("locationId");

    if (!locationId) {
      return NextResponse.json(
        {
          error: "locationId is required.",
        },
        { status: 400 }
      );
    }

    const location = await prisma.location.findUnique({
      where: {
        id: locationId,
      },
    });

    if (!location) {
      return NextResponse.json(
        {
          error: "Location not found.",
        },
        { status: 404 }
      );
    }

    await requireLocationPermission(
      location.businessId,
      locationId,
      permissions.menu.view
    );

    const menus = await prisma.menu.findMany({
      where: {
        locationId,
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        categories: {
          orderBy: {
            sortOrder: "asc",
          },
          include: {
            products: {
              orderBy: {
                sortOrder: "asc",
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      menus,
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
          { error: "You do not have permission to view menus." },
          { status: 403 }
        );
      }
    }

    console.error("Menu list error:", error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      locationId,
      name,
      description,
    } = body;

    if (!locationId || !name) {
      return NextResponse.json(
        {
          error: "locationId and name are required.",
        },
        { status: 400 }
      );
    }

    const location = await prisma.location.findUnique({
      where: {
        id: locationId,
      },
    });

    if (!location) {
      return NextResponse.json(
        {
          error: "Location not found.",
        },
        { status: 404 }
      );
    }

    await requireLocationPermission(
      location.businessId,
      locationId,
      permissions.menu.manage
    );

    const menu = await prisma.menu.create({
      data: {
        locationId,
        name: name.trim(),
        description: description?.trim() || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        menu,
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

      if (error.message === "FORBIDDEN") {
        return NextResponse.json(
          { error: "You do not have permission to manage menus." },
          { status: 403 }
        );
      }
    }

    console.error("Menu creation error:", error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}