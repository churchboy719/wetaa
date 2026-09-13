import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ProductMediaType } from "@prisma/client";
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
    product.category.id !== categoryId ||
    product.category.menuId !== menuId ||
    product.category.menu.id !== menuId
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

function isProductMediaType(
  value: unknown
): value is ProductMediaType {
  return value === "IMAGE" || value === "VIDEO";
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

    const media = await prisma.productMedia.findMany({
      where: {
        productId,
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      media,
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
              "You do not have permission to manage product media.",
          },
          {
            status: 403,
          }
        );
      }
    }

    console.error("Product media GET error:", error);

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

    const {
      type,
      url,
      thumbnail,
      sortOrder,
      active,
    } = body;

    if (!isProductMediaType(type)) {
      return NextResponse.json(
        {
          error: "Type must be either IMAGE or VIDEO.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof url !== "string" ||
      url.trim().length === 0
    ) {
      return NextResponse.json(
        {
          error: "Media URL is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      thumbnail !== undefined &&
      thumbnail !== null &&
      typeof thumbnail !== "string"
    ) {
      return NextResponse.json(
        {
          error: "Thumbnail must be a string or null.",
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

      if (sortOrder < 0) {
        return NextResponse.json(
          {
            error: "sortOrder cannot be negative.",
          },
          {
            status: 400,
          }
        );
      }
    }

    if (
      active !== undefined &&
      typeof active !== "boolean"
    ) {
      return NextResponse.json(
        {
          error: "active must be a boolean.",
        },
        {
          status: 400,
        }
      );
    }

    const media = await prisma.productMedia.create({
      data: {
        productId,
        type,
        url: url.trim(),
        thumbnail:
          thumbnail === undefined ? null : thumbnail,
        sortOrder: sortOrder ?? 0,
        active: active ?? true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        media,
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
              "You do not have permission to manage product media.",
          },
          {
            status: 403,
          }
        );
      }
    }

    console.error("Product media POST error:", error);

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
