import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  MenuLayout,
  ProductCardStyle,
  CategoryStyle,
  ImageAspectRatio,
} from "@prisma/client";
import { requireLocationPermission } from "@/lib/auth/authorization";
import { permissions } from "@/lib/auth/permissions";

type AppearanceUpdate = {
  layout?: MenuLayout;
  productCard?: ProductCardStyle;
  categoryStyle?: CategoryStyle;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  backgroundColor?: string | null;
  textColor?: string | null;
  headingFont?: string | null;
  bodyFont?: string | null;
  imageAspectRatio?: ImageAspectRatio;
  showImages?: boolean;
  showDescriptions?: boolean;
  showPrices?: boolean;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
};

function isMenuLayout(value: unknown): value is MenuLayout {
  return (
    value === "GRID" ||
    value === "LIST" ||
    value === "COMPACT" ||
    value === "EDITORIAL" ||
    value === "FULL_IMAGE"
  );
}

function isProductCardStyle(
  value: unknown
): value is ProductCardStyle {
  return (
    value === "STANDARD" ||
    value === "MINIMAL" ||
    value === "IMAGE_FOCUSED" ||
    value === "COMPACT"
  );
}

function isCategoryStyle(
  value: unknown
): value is CategoryStyle {
  return (
    value === "TABS" ||
    value === "HORIZONTAL" ||
    value === "SIDEBAR" ||
    value === "DROPDOWN"
  );
}

function isImageAspectRatio(
  value: unknown
): value is ImageAspectRatio {
  return (
    value === "SQUARE" ||
    value === "PORTRAIT" ||
    value === "LANDSCAPE" ||
    value === "AUTO"
  );
}

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

    let appearance = await prisma.menuAppearance.findUnique({
      where: {
        menuId,
      },
    });

    if (!appearance) {
      appearance = await prisma.menuAppearance.create({
        data: {
          menuId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      appearance,
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
              "You do not have permission to manage menu appearance.",
          },
          {
            status: 403,
          }
        );
      }
    }

    console.error("Menu appearance GET error:", error);

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

    const data: AppearanceUpdate = {};

    if (body.layout !== undefined) {
      if (!isMenuLayout(body.layout)) {
        return NextResponse.json(
          {
            error: "Invalid layout.",
          },
          {
            status: 400,
          }
        );
      }

      data.layout = body.layout;
    }

    if (body.productCard !== undefined) {
      if (!isProductCardStyle(body.productCard)) {
        return NextResponse.json(
          {
            error: "Invalid productCard style.",
          },
          {
            status: 400,
          }
        );
      }

      data.productCard = body.productCard;
    }

    if (body.categoryStyle !== undefined) {
      if (!isCategoryStyle(body.categoryStyle)) {
        return NextResponse.json(
          {
            error: "Invalid categoryStyle.",
          },
          {
            status: 400,
          }
        );
      }

      data.categoryStyle = body.categoryStyle;
    }

    if (body.imageAspectRatio !== undefined) {
      if (!isImageAspectRatio(body.imageAspectRatio)) {
        return NextResponse.json(
          {
            error: "Invalid imageAspectRatio.",
          },
          {
            status: 400,
          }
        );
      }

      data.imageAspectRatio = body.imageAspectRatio;
    }

    const stringFields = [
      "primaryColor",
      "secondaryColor",
      "backgroundColor",
      "textColor",
      "headingFont",
      "bodyFont",
      "logoUrl",
      "coverImageUrl",
    ] as const;

    for (const field of stringFields) {
      if (body[field] !== undefined) {
        if (
          body[field] !== null &&
          typeof body[field] !== "string"
        ) {
          return NextResponse.json(
            {
              error: `${field} must be a string or null.`,
            },
            {
              status: 400,
            }
          );
        }

        data[field] = body[field];
      }
    }

    const booleanFields = [
      "showImages",
      "showDescriptions",
      "showPrices",
    ] as const;

    for (const field of booleanFields) {
      if (body[field] !== undefined) {
        if (typeof body[field] !== "boolean") {
          return NextResponse.json(
            {
              error: `${field} must be a boolean.`,
            },
            {
              status: 400,
            }
          );
        }

        data[field] = body[field];
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        {
          error: "No valid appearance fields provided.",
        },
        {
          status: 400,
        }
      );
    }

    const appearance = await prisma.menuAppearance.upsert({
      where: {
        menuId,
      },
      create: {
        menuId,
        ...data,
      },
      update: data,
    });

    return NextResponse.json({
      success: true,
      appearance,
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
              "You do not have permission to manage menu appearance.",
          },
          {
            status: 403,
          }
        );
      }
    }

    console.error("Menu appearance PATCH error:", error);

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