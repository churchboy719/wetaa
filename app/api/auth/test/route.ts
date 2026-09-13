import { NextResponse } from "next/server";
import {
  requirePermission,
} from "@/lib/auth/authorization";
import { permissions } from "@/lib/auth/permissions";

export async function GET() {
  try {
    const businessId = "REPLACE_WITH_BUSINESS_ID";

    const access = await requirePermission(
      businessId,
      permissions.menu.manage
    );

    return NextResponse.json({
      success: true,
      message: "Authorization passed.",
      access,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return NextResponse.json(
        { error: "Permission denied." },
        { status: 403 }
      );
    }

    console.error("Authorization test error:", error);

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}