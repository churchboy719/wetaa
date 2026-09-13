import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireLocationPermission } from "@/lib/auth/authorization";
import { permissions } from "@/lib/auth/permissions";

async function getAuthorizedCategory(categoryId: string) {
  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
    select: {
      id: true,
      menuId: true,
      menu: {
        select: {
          id: true,
          locationId: true,
          location: {
            select: {
              id: true,
              businessId: true,
            },
          },
        },
      },
    },
  });

  if (!category || !category.menu || !category.menu.location) {
    return null;
  }

  const location = category.menu.location;

  await requireLocationPermission(
    location.businessId,
    location.id,
    permissions.menu.manage
  );

  return {
    category,
    location,
  };
}

export async function GET(
  request: Request,
  context: {
    params: Promise<{ categoryId: string }>;
  }
) {
  try {
    const { categoryId } = await context.params;

    const authorized = await getAuthorizedCategory(categoryId);

    if (!authorized) {
      return NextResponse.json(
        {
          error: "Category not found.",
        },
        {
          status: 404,
        }
      );
    }

    const products = await prisma.product.findMany({
      where: {
        categoryId,
      },
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
    });

    return NextResponse.json({
      success: true,
      products,
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
              "You do not have permission to manage menu products.",
          },
          {
            status: 403,
          }
        );
      }
    }

    console.error("Products GET error:", error);

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
    params: Promise<{ categoryId: string }>;
  }
) {
  try {
    const { categoryId } = await context.params;
    const body = await request.json();

    const authorized = await getAuthorizedCategory(categoryId);

    if (!authorized) {
      return NextResponse.json(
        {
          error: "Category not found.",
        },
        {
          status: 404,
        }
      );
    }

    const {
      name,
      description,
      price,
      currency,
      sortOrder,
      active,
      available,
    } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        {
          error: "Product name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (typeof price !== "number" || !Number.isInteger(price)) {
      return NextResponse.json(
        {
          error:
            "Price must be an integer representing minor currency units.",
        },
        {
          status: 400,
        }
      );
    }

    if (price < 0) {
      return NextResponse.json(
        {
          error: "Price cannot be negative.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      return NextResponse.json(
        {
          error: "Description must be a string or null.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      currency !== undefined &&
      (typeof currency !== "string" || currency.trim().length !== 3)
    ) {
      return NextResponse.json(
        {
          error: "Currency must be a 3-letter currency code.",
        },
        {
          status: 400,
        }
      );
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

    if (
      available !== undefined &&
      typeof available !== "boolean"
    ) {
      return NextResponse.json(
        {
          error: "available must be a boolean.",
        },
        {
          status: 400,
        }
      );
    }

    const product = await prisma.product.create({
      data: {
        categoryId,
        name: name.trim(),
        description:
          description === undefined ? null : description,
        price,
        currency: currency
          ? currency.trim().toUpperCase()
          : "EUR",
        sortOrder: sortOrder ?? 0,
        active: active ?? true,
        available: available ?? true,
      },
      include: {
        media: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        product,
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
              "You do not have permission to manage menu products.",
          },
          {
            status: 403,
          }
        );
      }
    }

    console.error("Products POST error:", error);

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