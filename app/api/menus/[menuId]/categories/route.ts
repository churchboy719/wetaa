import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireLocationPermission } from "@/lib/auth/authorization";
import { permissions } from "@/lib/auth/permissions";

export async function GET(
  request: Request,
  context: {
    params: Promise<{ menuId: string }>;
  }
) {
  try {
    const { menuId } = await context.params;

    const menu = await prisma.menu.findUnique({
      where: {
        id: menuId,
      },
    });

    if (!menu) {
      return NextResponse.json(
        { error: "Menu not found." },
        { status: 404 }
      );
    }

    const location = await prisma.location.findUnique({
  where: {
    id: menu.locationId,
  },
  select: {
    businessId: true,
  },
});

if (!location) {
  return NextResponse.json(
    { error: "Menu location not found." },
    { status: 404 }
  );
}

await requireLocationPermission(
  location.businessId,
  menu.locationId,
  permissions.menu.view
);

    const categories = await prisma.category.findMany({
      where: {
        menuId,
      },
      orderBy: {
        sortOrder: "asc",
      },
      include: {
        products: {
          orderBy: {
            sortOrder: "asc",
          },
          include: {
            media: {
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
      categories,
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
          { error: "You do not have permission to view this menu." },
          { status: 403 }
        );
      }
    }

    console.error("Category list error:", error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  context: {
    params: Promise<{ menuId: string }>;
  }
) {
  try {
    const { menuId } = await context.params;
    const body = await request.json();

    const {
      name,
      description,
      image,
      sortOrder,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required." },
        { status: 400 }
      );
    }

    const menu = await prisma.menu.findUnique({
      where: {
        id: menuId,
      },
    });

    if (!menu) {
      return NextResponse.json(
        { error: "Menu not found." },
        { status: 404 }
      );
    }

    const location = await prisma.location.findUnique({
      where: {
        id: menu.locationId,
      },
      select: {
        businessId: true,
      },
    });

    if (!location) {
      return NextResponse.json(
        { error: "Menu location not found." },
        { status: 404 }
      );
    }

    await requireLocationPermission(
      location.businessId,
      menu.locationId,
      permissions.menu.manage
    );

    const category = await prisma.category.create({
      data: {
        menuId,
        name: name.trim(),
        description: description?.trim() || null,
        image: image?.trim() || null,
        sortOrder:
          typeof sortOrder === "number"
            ? sortOrder
            : 0,
      },
    });

    return NextResponse.json(
      {
        success: true,
        category,
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
          { error: "You do not have permission to manage this menu." },
          { status: 403 }
        );
      }
    }

    console.error("Category creation error:", error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}