import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireLocationPermission } from "@/lib/auth/authorization";
import { permissions } from "@/lib/auth/permissions";

async function getAuthorizedProduct(
  menuId: string,
  categoryId: string,
  productId: string
) {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    select: {
      id: true,
      categoryId: true,
      name: true,
      description: true,
      price: true,
      currency: true,
      sortOrder: true,
      active: true,
      available: true,
      createdAt: true,
      updatedAt: true,
      category: {
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
      },
    },
  });

  if (!product) {
    return null;
  }

  if (
    product.categoryId !== categoryId ||
    product.category.menuId !== menuId
  ) {
    return null;
  }

  const location = product.category.menu.location;

  if (!location) {
    return null;
  }

  await requireLocationPermission(
    location.businessId,
    location.id,
    permissions.menu.manage
  );

  return {
    product,
    location,
  };
}

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      menuId: string;
      categoryId: string;
      productId: string;
    }>;
  }
) {
  try {
    const { menuId, categoryId, productId } =
      await context.params;

    const authorized = await getAuthorizedProduct(
      menuId,
      categoryId,
      productId
    );

    if (!authorized) {
      return NextResponse.json(
        {
          error: "Product not found.",
        },
        {
          status: 404,
        }
      );
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        media: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          error: "Product not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      product,
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

    console.error("Product GET error:", error);

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

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      menuId: string;
      categoryId: string;
      productId: string;
    }>;
  }
) {
  try {
    const { menuId, categoryId, productId } =
      await context.params;

    const body = await request.json();

    const authorized = await getAuthorizedProduct(
      menuId,
      categoryId,
      productId
    );

    if (!authorized) {
      return NextResponse.json(
        {
          error: "Product not found.",
        },
        {
          status: 404,
        }
      );
    }

    const data: {
      name?: string;
      description?: string | null;
      price?: number;
      currency?: string;
      sortOrder?: number;
      active?: boolean;
      available?: boolean;
    } = {};

    if (body.name !== undefined) {
      if (
        typeof body.name !== "string" ||
        body.name.trim().length === 0
      ) {
        return NextResponse.json(
          {
            error: "Product name must be a non-empty string.",
          },
          {
            status: 400,
          }
        );
      }

      data.name = body.name.trim();
    }

    if (body.description !== undefined) {
      if (
        body.description !== null &&
        typeof body.description !== "string"
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

      data.description = body.description;
    }

    if (body.price !== undefined) {
      if (
        typeof body.price !== "number" ||
        !Number.isInteger(body.price)
      ) {
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

      if (body.price < 0) {
        return NextResponse.json(
          {
            error: "Price cannot be negative.",
          },
          {
            status: 400,
          }
        );
      }

      data.price = body.price;
    }

    if (body.currency !== undefined) {
      if (
        typeof body.currency !== "string" ||
        body.currency.trim().length !== 3
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

      data.currency = body.currency.trim().toUpperCase();
    }

    if (body.sortOrder !== undefined) {
      if (
        typeof body.sortOrder !== "number" ||
        !Number.isInteger(body.sortOrder)
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

      data.sortOrder = body.sortOrder;
    }

    if (body.active !== undefined) {
      if (typeof body.active !== "boolean") {
        return NextResponse.json(
          {
            error: "active must be a boolean.",
          },
          {
            status: 400,
          }
        );
      }

      data.active = body.active;
    }

    if (body.available !== undefined) {
      if (typeof body.available !== "boolean") {
        return NextResponse.json(
          {
            error: "available must be a boolean.",
          },
          {
            status: 400,
          }
        );
      }

      data.available = body.available;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        {
          error: "No valid product fields provided.",
        },
        {
          status: 400,
        }
      );
    }

    const product = await prisma.product.update({
      where: {
        id: productId,
      },
      data,
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
      product,
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

    console.error("Product PATCH error:", error);

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

export async function DELETE(
  request: Request,
  context: {
    params: Promise<{
      menuId: string;
      categoryId: string;
      productId: string;
    }>;
  }
) {
  try {
    const { menuId, categoryId, productId } =
      await context.params;

    const authorized = await getAuthorizedProduct(
      menuId,
      categoryId,
      productId
    );

    if (!authorized) {
      return NextResponse.json(
        {
          error: "Product not found.",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.product.delete({
      where: {
        id: productId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully.",
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

    console.error("Product DELETE error:", error);

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
