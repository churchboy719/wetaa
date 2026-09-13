import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        {
          authenticated: false,
          user: null,
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        firstName: session.user.firstName,
        lastName: session.user.lastName,
        phone: session.user.phone,
        image: session.user.image,
        status: session.user.status,
      },
    });
  } catch (error) {
    console.error("Auth check error:", error);

    return NextResponse.json(
      {
        authenticated: false,
        user: null,
      },
      { status: 500 }
    );
  }
}