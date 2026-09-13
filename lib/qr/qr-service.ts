import { QRCodeType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function resolveQRCode(token: string) {
  if (!token || !token.trim()) {
    throw new Error("QR_TOKEN_REQUIRED");
  }

  const qrCode = await prisma.qRCode.findUnique({
    where: {
      token: token.trim(),
    },
    include: {
      business: true,
      location: true,
      table: true,
    },
  });

  if (!qrCode) {
    throw new Error("QR_CODE_NOT_FOUND");
  }

  if (!qrCode.active) {
    throw new Error("QR_CODE_INACTIVE");
  }

  // Every order-creating QR must belong to a location.
  if (
    qrCode.type === QRCodeType.TABLE ||
    qrCode.type === QRCodeType.TAKEOUT ||
    qrCode.type === QRCodeType.DELIVERY
  ) {
    if (!qrCode.locationId || !qrCode.location) {
      throw new Error("QR_LOCATION_NOT_FOUND");
    }

    if (qrCode.location.businessId !== qrCode.businessId) {
      throw new Error("QR_LOCATION_BUSINESS_MISMATCH");
    }
  }

  // TABLE QR must point to exactly one valid table
  // belonging to the same location.
  if (qrCode.type === QRCodeType.TABLE) {
    if (!qrCode.locationId || !qrCode.tableId || !qrCode.table) {
      throw new Error("INVALID_TABLE_QR");
    }

    if (qrCode.table.locationId !== qrCode.locationId) {
      throw new Error("QR_TABLE_LOCATION_MISMATCH");
    }
  }

  // Takeout and delivery QR codes must never be tied
  // to a physical table.
  if (
    qrCode.type === QRCodeType.TAKEOUT ||
    qrCode.type === QRCodeType.DELIVERY
  ) {
    if (qrCode.tableId || qrCode.table) {
      throw new Error("NON_TABLE_QR_CANNOT_HAVE_TABLE");
    }
  }

  return qrCode;
}