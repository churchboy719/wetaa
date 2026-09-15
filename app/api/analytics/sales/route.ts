import { NextRequest, NextResponse } from "next/server";

import { requireLocationPermission } from "@/lib/auth/authorization";
import { permissions } from "@/lib/auth/permissions";
import { getSalesSummary } from "@/lib/analytics/sales-service";

function parseDate(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const businessId = searchParams.get("businessId");
    const locationId = searchParams.get("locationId");
    const from = parseDate(searchParams.get("from"));
    const to = parseDate(searchParams.get("to"));

    if (!businessId || !locationId) {
      return NextResponse.json(
        {
          error: "BUSINESS_ID_AND_LOCATION_ID_REQUIRED",
        },
        { status: 400 }
      );
    }

    if (!from || !to) {
      return NextResponse.json(
        {
          error: "VALID_FROM_AND_TO_DATES_REQUIRED",
        },
        { status: 400 }
      );
    }

    if (from >= to) {
      return NextResponse.json(
        {
          error: "INVALID_DATE_RANGE",
        },
        { status: 400 }
      );
    }

    await requireLocationPermission(
      businessId,
      locationId,
      permissions.analytics.view
    );

    const summary = await getSalesSummary({
      businessId,
      locationId,
      from,
      to,
    });

    return NextResponse.json(summary);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json(
          { error: "UNAUTHENTICATED" },
          { status: 401 }
        );
      }

      if (
        error.message === "FORBIDDEN" ||
        error.message === "LOCATION_ACCESS_DENIED"
      ) {
        return NextResponse.json(
          { error: "FORBIDDEN" },
          { status: 403 }
        );
      }
    }

    console.error("GET /api/analytics/sales failed", error);

    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
