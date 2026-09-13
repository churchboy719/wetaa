import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/authorization";

function createSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();

    const body = await request.json();

    const businessName =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    if (!businessName) {
      return NextResponse.json(
        {
          error: "Business name is required.",
        },
        { status: 400 }
      );
    }

    const locationName =
      typeof body.location?.name === "string"
        ? body.location.name.trim()
        : "";

    if (!locationName) {
      return NextResponse.json(
        {
          error: "Location name is required.",
        },
        { status: 400 }
      );
    }

    const baseSlug = createSlug(businessName);

    if (!baseSlug) {
      return NextResponse.json(
        {
          error: "Business name cannot create a valid slug.",
        },
        { status: 400 }
      );
    }

    // Make the slug unique.
    let slug = baseSlug;

    const existingBusiness =
      await prisma.business.findUnique({
        where: {
          slug,
        },
      });

    if (existingBusiness) {
      slug = `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`;
    }

    const business = await prisma.business.create({
      data: {
        ownerId: user.id,
        name: businessName,
        slug,
        description:
          typeof body.description === "string"
            ? body.description.trim() || null
            : null,
        logo:
          typeof body.logo === "string"
            ? body.logo.trim() || null
            : null,
        phone:
          typeof body.phone === "string"
            ? body.phone.trim() || null
            : null,
        email:
          typeof body.email === "string"
            ? body.email.trim() || null
            : null,
        website:
          typeof body.website === "string"
            ? body.website.trim() || null
            : null,

        locations: {
          create: {
            name: locationName,
            address:
              typeof body.location.address === "string"
                ? body.location.address.trim() || null
                : null,
            city:
              typeof body.location.city === "string"
                ? body.location.city.trim() || null
                : null,
            postalCode:
              typeof body.location.postalCode === "string"
                ? body.location.postalCode.trim() || null
                : null,
            country:
              typeof body.location.country === "string"
                ? body.location.country.trim() || null
                : null,
            latitude:
              typeof body.location.latitude === "number"
                ? body.location.latitude
                : null,
            longitude:
              typeof body.location.longitude === "number"
                ? body.location.longitude
                : null,
            phone:
              typeof body.location.phone === "string"
                ? body.location.phone.trim() || null
                : null,
            timezone:
              typeof body.location.timezone === "string" &&
              body.location.timezone.trim()
                ? body.location.timezone.trim()
                : "Europe/Berlin",
          },
        },
      },

      include: {
        locations: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        business,
      },
      { status: 201 }
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          error: "Authentication required.",
        },
        { status: 401 }
      );
    }

    console.error(
      "Business creation error:",
      error
    );

    return NextResponse.json(
      {
        error: "Something went wrong.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await requireAuth();

    const ownedBusinesses = await prisma.business.findMany({
      where: {
        ownerId: user.id,
      },
      include: {
        locations: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const memberships =
      await prisma.staffMembership.findMany({
        where: {
          userId: user.id,
          status: "ACTIVE",
        },
        include: {
          business: {
            include: {
              locations: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    const businesses = new Map<
      string,
      (typeof ownedBusinesses)[number]
    >();

    // Add businesses owned by the user.
    for (const business of ownedBusinesses) {
      businesses.set(business.id, business);
    }

    // Add businesses where the user is active staff.
    for (const membership of memberships) {
      if (!businesses.has(membership.business.id)) {
        businesses.set(
          membership.business.id,
          membership.business
        );
      }
    }

    return NextResponse.json({
      success: true,
      businesses: Array.from(businesses.values()),
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          error: "Authentication required.",
        },
        { status: 401 }
      );
    }

    console.error(
      "Business retrieval error:",
      error
    );

    return NextResponse.json(
      {
        error: "Something went wrong.",
      },
      { status: 500 }
    );
  }
}