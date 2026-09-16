import { NextRequest, NextResponse } from "next/server";

import { requireLocationPermission } from "@/lib/auth/authorization";
import { permissions } from "@/lib/auth/permissions";
import { getReportingPeriod } from "@/lib/analytics/reporting-period";
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

    if (!businessId || !locationId) {
      return NextResponse.json(
        {
          error:
            "BUSINESS_ID_AND_LOCATION_ID_REQUIRED",
        },
        { status: 400 }
      );
    }

    await requireLocationPermission(
      businessId,
      locationId,
      permissions.analytics.view
    );

    const location =
      await import("@/lib/db/prisma").then(
        ({ prisma }) =>
          prisma.location.findFirst({
            where: {
              id: locationId,
              businessId,
            },
            select: {
              timezone: true,
            },
          })
      );

    if (!location) {
      return NextResponse.json(
        { error: "LOCATION_NOT_FOUND" },
        { status: 404 }
      );
    }

    const reportingDate =
      searchParams.get("date");

    let from: Date | null = null;
    let to: Date | null = null;

    if (reportingDate) {
      const period = getReportingPeriod(
        reportingDate,
        location.timezone
      );

      from = period.from;
      to = period.to;
    } else {
      from = parseDate(
        searchParams.get("from")
      );
      to = parseDate(
        searchParams.get("to")
      );

      if (!from || !to) {
        return NextResponse.json(
          {
            error:
              "REPORTING_DATE_OR_VALID_FROM_AND_TO_REQUIRED",
          },
          { status: 400 }
        );
      }

      if (from >= to) {
        return NextResponse.json(
          { error: "INVALID_DATE_RANGE" },
          { status: 400 }
        );
      }
    }

    const summary = await getSalesSummary({
      businessId,
      locationId,
      from,
      to,
    });

    return NextResponse.json({
      ...summary,
      period: {
        from: from.toISOString(),
        to: to.toISOString(),
        timezone: location.timezone,
        date: reportingDate ?? null,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json(
          { error: "UNAUTHORIZED" },
          { status: 401 }
        );
      }

      if (error.message === "FORBIDDEN") {
        return NextResponse.json(
          { error: "FORBIDDEN" },
          { status: 403 }
        );
      }

      if (
        error.message === "INVALID_TIMEZONE" ||
        error.message === "INVALID_REPORTING_DATE"
      ) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    console.error(
      "GET /api/analytics/sales failed",
      error
    );

    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
