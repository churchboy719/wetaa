import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireLocationPermission } from "@/lib/auth/authorization";
import { permissions } from "@/lib/auth/permissions";

async function getAuthorizedMenu(menuId: string) {
  const menu = await prisma.menu.findUnique({
    where: {
      id: menuId,
    },
  });

  if (!menu) {
    return null;
  }

  const location = await prisma.location.findUnique({
    where: {
      id: menu.locationId,
    },
    select: {
      id: true,
      businessId: true,
    },
  });

  if (!location) {
    return null;
  }

  await requireLocationPermission(
    location.businessId,
    location.id,
    permissions.menu.manage
  );

  return {
    menu,
    location,
  };
}

export async function GET(
  request: Request,
  context: {
    params: Promise<{ menuId: string }>;
  }
) {
  try {
    const { menuId } = await context.params;

    const authorized = await getAuthorizedMenu(menuId);

    if (!authorized) {
      return NextResponse.json(
        {
          error: "Menu not found.",
        },
        {
          status: 404,
        }
      );
    }

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
          {
            error: "Authentication required.",
          },
          {
            status: 401,
          }
        );
      }

      if (error.message === "FORBIDDEN") {
        return NextResponse.json(
          {
            error:
              "You do not have permission to manage menu categories.",
          },
          {
            status: 403,
          }
        );
      }
    }

    console.error("Menu categories GET error:", error);

    return NextResponse.json(
      {
        error: "Internal server error.",
      },
      {
        status: 500,
      }
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

    const authorized = await getAuthorizedMenu(menuId);

    if (!authorized) {
      return NextResponse.json(
        {
          error: "Menu not found.",
        },
        {
          status: 404,
        }
      );
    }

    const { name, description, image, sortOrder, active } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        {
          error: "Category name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (description !== undefined && description !== null) {
      if (typeof description !== "string") {
        return NextResponse.json(
          {
            error: "Description must be a string or null.",
          },
          {
            status: 400,
          }
        );
      }
    }

    if (image !== undefined && image !== null) {
      if (typeof image !== "string") {
        return NextResponse.json(
          {
            error: "Image must be a string or null.",
          },
          {
            status: 400,
          }
        );
      }
    }

    if (sortOrder !== undefined) {
      if (
        typeof sortOrder !== "number" ||
        !Number.isInteger(sortOrder)
      ) {
        return NextResponse.json(
          {
            error: "sortOrder must be an integer.",
          },
          {
            status: 400,
          }
        );
      }
    }

    if (active !== undefined && typeof active !== "boolean") {
      return NextResponse.json(
        {
          error: "active must be a boolean.",
        },
        {
          status: 400,
        }
      );
    }

    const category = await prisma.category.create({
      data: {
        menuId,
        name: name.trim(),
        description:
          description === undefined ? null : description,
        image: image === undefined ? null : image,
        sortOrder: sortOrder ?? 0,
        active: active ?? true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        category,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json(
          {
            error: "Authentication required.",
          },
          {
            status: 401,
          }
        );
      }

      if (error.message === "FORBIDDEN") {
        return NextResponse.json(
          {
            error:
              "You do not have permission to manage menu categories.",
          },
          {
            status: 403,
          }
        );
      }
    }

    console.error("Menu categories POST error:", error);

    return NextResponse.json(
      {
        error: "Internal server error.",
      },
      {
        status: 500,
      }
    );
  }
}